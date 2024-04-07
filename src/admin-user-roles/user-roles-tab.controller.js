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
     * @name admin-user-roles.controller:UserRolesTabController
     *
     * @description
     * Exposes method for adding/removing user roles.
     */
    angular
        .module('admin-user-roles')
        .controller('UserRolesTabController', controller);

    controller.$inject = [
        'user', 'supervisoryNodes', 'programs', 'warehouses', '$stateParams', '$q', 'tab', '$state', '$filter',
        'notificationService', 'confirmService', 'roleAssignments', 'filteredRoles', 'roleRightsMap'
    ];

    function controller(user, supervisoryNodes, programs, warehouses, $stateParams, $q, tab, $state, $filter,
                        notificationService, confirmService, roleAssignments, filteredRoles, roleRightsMap) {

        var vm = this;

        vm.$onInit = onInit;
        vm.removeRole = removeRole;
        vm.addRole = addRole;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name roles
         * @type {Array}
         *
         * @description
         * List of roles for given type.
         */
        vm.filteredRoles = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name supervisoryNodes
         * @type {Array}
         *
         * @description
         * List of all supervisory nodes.
         */
        vm.supervisoryNodes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name warehouses
         * @type {Array}
         *
         * @description
         * List of all warehouses.
         */
        vm.warehouses = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name programs
         * @type {Array}
         *

         * @description
         * List of all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name selectedType
         * @type {String}
         *
         * @description
         * Currently selected role type.
         */
        vm.selectedType = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name selectedRole
         * @type {Object}
         *
         * @description
         * Contains selected role.
         */
        vm.selectedRole = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name selectedSupervisoryNode
         * @type {Object}
         *
         * @description
         * Contains selected supervisory node.
         */
        vm.selectedSupervisoryNode = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name selectedProgram
         * @type {Object}
         *
         * @description
         * Contains selected program.
         */
        vm.selectedProgram = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name selectedWarehouse
         * @type {Object}
         *
         * @description
         * Contains selected warehouse.
         */
        vm.selectedWarehouse = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-user-roles.controller:UserRolesTabController
         * @name editable
         * @type {boolean}
         *
         * @description
         * Flag defining whether the roles can be edited.
         */
        vm.editable = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesTabController
         * @name $onInit
         *
         * @description
         * Initialization method of the UserFormModalController.
         */
        function onInit() {
            vm.supervisoryNodes = supervisoryNodes;
            vm.warehouses = warehouses;
            vm.programs = programs;
            vm.selectedType = tab;
            vm.roleAssignments = roleAssignments;
            vm.filteredRoles = filteredRoles;
            vm.editable = true;
            vm.showErrorColumn = roleAssignments.filter(function(role) {
                return role.errors && role.errors.length;
            }).length > 0;
            vm.roleRightsMap = roleRightsMap;
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesTabController
         * @name addRole
         *
         * @description
         * Adds new role assignment to user object.
         *
         * @return {Promise} resolves if new role is valid
         */
        function addRole() {
            try {
                user.addRoleAssignment(vm.selectedRole.id, vm.selectedRole.name, tab,
                    vm.selectedProgram ? vm.selectedProgram.id : undefined,
                    vm.selectedProgram ? vm.selectedProgram.name : undefined,
                    vm.selectedSupervisoryNode ? vm.selectedSupervisoryNode.id : undefined,
                    vm.selectedSupervisoryNode ? $filter('supervisoryNode')(vm.selectedSupervisoryNode) : undefined,
                    vm.selectedWarehouse ? vm.selectedWarehouse.id : undefined,
                    vm.selectedWarehouse ? vm.selectedWarehouse.name : undefined);
                reloadState();
                return $q.resolve();
            } catch (error) {
                notificationService.error(error.message);
                return $q.reject();
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-user-roles.controller:UserRolesTabController
         * @name removeRole
         *
         * @description
         * Removes role from user object.
         *
         * @param {Object} roleAssignment the role assignment to be removed
         */
        function removeRole(roleAssignment) {
            confirmService.confirmDestroy('adminUserRoles.removeRole.question', 'adminUserRoles.removeRole.label')
                .then(function() {
                    user.removeRoleAssignment(roleAssignment);
                    reloadState();
                });
        }

        function reloadState() {
            $state.go('openlmis.administration.users.roles.' + tab, $stateParams, {
                reload: 'openlmis.administration.users.roles.' + tab
            });
        }
    }
})();
