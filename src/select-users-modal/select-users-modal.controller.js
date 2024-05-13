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
     * @name select-users-modal.controller:SelectUsersModalController
     *
     * @description
     * Manages Select Users Modal.
     */
    angular
        .module('select-users-modal')
        .controller('SelectUsersModalController', SelectUsersModalController);

    SelectUsersModalController.$inject = ['users', 'userUpdated', '$state', '$stateParams',
        'userRoleAssignmentFactory', '$q', 'notificationService', 'rolesUpdated',
        'programsUpdated', 'supervisoryNodesUpdated', 'warehousesUpdated', 'loadingModalService'];

    function SelectUsersModalController(users, userUpdated, $state, $stateParams, userRoleAssignmentFactory,
                                        $q, notificationService, rolesUpdated, programsUpdated,
                                        supervisoryNodesUpdated, warehousesUpdated, loadingModalService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.close = reject;
        vm.search = search;
        vm.selectedUserId = undefined;
        vm.selectUser = selectUser;

        /**
         * @ngdoc method
         * @methodOf select-users-modal.controller:SelectUsersModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SelectUsersModalController.
         */
        function onInit() {
            vm.users = users;
            vm.searchText = $stateParams.rolesUsername;
            vm.filteredUsers = filterUsers(users, $stateParams.rolesUsername);
        }

        /**
         * @ngdoc method
         * @methodOf select-users-modal.controller:SelectUsersModalController
         * @name search
         *
         * @description
         * Adds selected user's role assignments to the current user.
         */
        function selectUser() {
            loadingModalService.open();
            return userRoleAssignmentFactory.getUser(vm.selectedUserId, rolesUpdated, programsUpdated,
                supervisoryNodesUpdated, warehousesUpdated)
                .then(function(rolesToImport) {
                    try {
                        userUpdated.addRoleAssignments(userUpdated.roleAssignments, rolesToImport.roleAssignments);
                        reloadState();
                        return $q.resolve();
                    } catch (error) {
                        loadingModalService.close();
                        notificationService.error(error.message);
                        return $q.reject();
                    }
                });
        }

        /**
         * @ngdoc method
         * @methodOf select-users-modal.controller:SelectUsersModalController
         * @name search
         *
         * @description
         * Refreshes the users list so the import users dialog box shows only relevant users
         * without reloading parent state.
         */
        function search() {
            $state.go('.', _.extend({}, $stateParams, {
                rolesUsername: vm.searchText
            }));
        }

        /**
         * @ngdoc method
         * @methodOf select-users-modal.controller:SelectUsersModalController
         * @name reject
         *
         * @description
         * Rejects changes. Returns to the parent state without reloading it.
         */
        function reject() {
            $state.go('^', {}, {
                notify: false
            });
        }

        function filterUsers(users, searchText) {
            if (searchText) {
                return users.filter(searchByUsername);
            }
            return users;
        }

        function searchByUsername(user) {
            var searchText = vm.searchText.toLowerCase();
            var foundInUsername;

            if (user.username !== undefined) {
                foundInUsername = user.username.toLowerCase().contains(searchText);
            }

            return foundInUsername;
        }

        function reloadState(user) {
            $stateParams.user = user;
            $state.go('openlmis.administration.users.roles.SUPERVISION', $stateParams, {
                reload: 'openlmis.administration.users.roles.SUPERVISION'
            });
        }

    }

})();
