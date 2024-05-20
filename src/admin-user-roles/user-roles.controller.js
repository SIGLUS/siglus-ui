/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name admin-user-roles.controller:UserRolesController
     *
     * @description
     * Exposes method for saving user roles.
     */
    angular
        .module('admin-user-roles')
        .controller('UserRolesController', controller);

    controller.$inject = [
        'user', 'loadingModalService', '$state', 'notificationService', 'ROLE_TYPES', 'UserRolesReportService'
    ];

    function controller(user, loadingModalService, $state, notificationService, ROLE_TYPES, UserRolesReportService) {

        var vm = this;

        var REPORT_VIEW_ROLE_ID = 'a598b9b4-1dd8-11ed-84e1-acde48001122';

        vm.$onInit = onInit;
        vm.goToUserList = goToUserList;
        vm.saveUserRoles = saveUserRoles;
        vm.getRoleTypeLabel = getRoleTypeLabel;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesController
         * @name user
         * @type {Object}
         *
         * @description
         * User object to be created/updated.
         */
        vm.user = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesController
         * @name roleTypes
         * @type {Array}
         *
         * @description
         * List of all role types.
         */
        vm.roleTypes = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesController
         * @name $onInit
         *
         * @description
         * Initialization method of the UserFormModalController.
         */
        function onInit() {
            vm.user = user;
            vm.user.enabled = true;

            vm.roleTypes = ROLE_TYPES.getRoleTypes();
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesController
         * @name saveUserRoles
         *
         * @description
         * Updates user roles.
         */
        function saveUserRoles() {
            if (vm.user.homeFacilityId && vm.user.roleAssignments.some(function(role) {
                return role.roleId === REPORT_VIEW_ROLE_ID;
            })) {
                notificationService.error('adminUserRoles.roleReportViewerInvalid');
                return;
            }

            var loadingPromise = loadingModalService.open(true);
            return vm.user.save()
                .then(function() {
                    return UserRolesReportService.saveUserReportViewRoles(vm.user);
                })
                .then(function() {
                    loadingPromise.then(function() {
                        notificationService.success('adminUserRoles.updateSuccessful');
                        goToUserList();
                    });
                })
                .catch(function() {
                    notificationService.error('adminUserRoles.updateFailed');
                })
                .finally(loadingModalService.close);
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesController
         * @name goToUserList
         *
         * @description
         * Redirects to user list.
         */
        function goToUserList() {
            $state.go('openlmis.administration.users', {}, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesController
         * @name goToUserList
         *
         * @description
         * Redirects to user list.
         *
         * @param  {String} type the role type name
         * @return {String}      the message key for given role type
         */
        function getRoleTypeLabel(type) {
            return ROLE_TYPES.getLabel(type);
        }
    }
})();
