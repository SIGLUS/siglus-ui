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
     * @name admin-user-form.controller:UserFormController
     *
     * @description
     * Exposes method for creating/updating user to the modal view.
     */
    angular
        .module('admin-user-form')
        .controller('UserFormController', controller);

    controller.$inject = [
        'user', 'facilities', 'pendingVerificationEmail', 'loadingModalService', 'UserRepository',
        'confirmService', '$filter', '$state', 'notificationService',
        'userPasswordModalFactory', 'authUserService'
    ];

    function controller(user, facilities, pendingVerificationEmail, loadingModalService, UserRepository,
                        confirmService, $filter, $state, notificationService,
                        userPasswordModalFactory, authUserService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.saveUser = saveUser;
        vm.sendVerificationEmail = sendVerificationEmail;
        vm.validHomeFacilityWithRoles = validHomeFacilityWithRoles;
        var reportViewerRoleId = 'a598b9b4-1dd8-11ed-84e1-acde48001122';

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name user
         * @type {Object}
         *
         * @description
         * User object to be created/updated.
         */
        vm.user = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name facilities
         * @type {Array}
         *
         * @description
         * List of all possible facilities.
         */
        vm.facilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name updateMode
         * @type {Boolean}
         *
         * @description
         * True if screen is in user update mode, false when create mode.
         */
        vm.updateMode = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name initialHomeFacility
         * @type {String}
         *
         * @description
         * Initial home facility of user, used to determine it's change.
         */
        vm.initialHomeFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name initialUsername
         * @type {String}
         *
         * @description
         * Username of user to update.
         */
        vm.initialUsername = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-form.controller:UserFormController
         * @name pendingEmailVerificationToken
         * @type {Object}
         *
         * @description
         * Represents pending email verification.
         */
        vm.pendingVerificationEmail = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-user-form.controller:UserFormController
         * @name $onInit
         *
         * @description
         * Initialization method of the UserFormModalController.
         */
        function onInit() {
            vm.user = user;
            vm.updateMode = !!user.id;
            vm.initialUsername = vm.user.username;
            vm.homeFacility = getHomeFacility();
            vm.initialHomeFacility = vm.homeFacility;
            vm.facilities = facilities;
            vm.pendingVerificationEmail = pendingVerificationEmail;
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-form.controller:UserFormController
         * @name saveUser
         *
         * @description
         * Creates or updates the user. If home facility has changed, a confirmation modal
         * is shown for deleting user's roles for old home facility, and deletes them if accepted.
         *
         * @return {Promise} the promise resolving to the created/updated user
         */
        function saveUser() {
            vm.user.homeFacilityId = vm.homeFacility ? vm.homeFacility.id : undefined;

            if (hasHomeFacilityChanged()) {
                return removeHomeFacilityRightsConfirmation()
                    .then(function() {
                        vm.user.removeHomeFacilityRights();
                    })
                    .finally(function() {
                        return vm.user.save();
                    });
            }
            return vm.user.save();

        }

        /**
         * @ngdoc method
         * @methodOf admin-user-form.controller:UserFormController
         * @name removeHomeFacilityRightsConfirmation
         *
         * @description
         * Displays a confirmation modal for removing user home facility rights.
         *
         * @return {Promise} the promise resolving on confirmation modal action.
         */
        function removeHomeFacilityRightsConfirmation() {
            var message = {
                messageKey: 'adminUserForm.removeHomeFacility.confirmation',
                messageParams: {
                    facility: vm.initialHomeFacility.name,
                    username: vm.user.username
                }
            };

            return confirmService.confirmDestroy(message,
                'adminUserForm.removeHomeFacility.removeRoles',
                'adminUserForm.removeHomeFacility.keepRoles');
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-form.controller:UserFormController
         * @name sendVerificationEmail
         *
         * @description
         * Send a verification email to a user.
         */
        function sendVerificationEmail() {
            return authUserService.sendVerificationEmail(vm.user.id)
                .then(function() {
                    notificationService.success('adminUserForm.sendVerificationEmail.success');
                });
        }

        <!-- SIGLUS-REFACTOR: starts here -->
        function validHomeFacilityWithRoles() {
            var roles = [];
            for (var i = 0; i < vm.user.roleAssignments.length; i++) {
                roles[i] = vm.user.roleAssignments[i].roleId;
            }
            if (_.contains(roles, reportViewerRoleId) && vm.homeFacility !== undefined) {
                vm.homeFacility = undefined;
                notificationService.error('adminUserForm.homeFacilityInvalid');
            }
        }
        <!-- SIGLUS-REFACTOR: ends here -->

        function getHomeFacility() {
            var filtered = facilities.filter(function(facility) {
                return facility.id === vm.user.homeFacilityId;
            });

            return filtered.length ? filtered[0] : undefined;
        }

        function hasHomeFacilityChanged() {
            return vm.initialHomeFacility && vm.initialHomeFacility !== vm.homeFacility;
        }
    }
})();
