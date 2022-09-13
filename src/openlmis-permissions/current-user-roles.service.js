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
     * @ngdoc service
     * @name openlmis-permissions.currentUserRolesService
     * 
     * @description
     * Fetches and caches information about roles assigned to the current user.
     */
    angular
        .module('openlmis-permissions')
        .service('currentUserRolesService', currentUserRolesService);

    currentUserRolesService.$inject = ['currentUserService', 'RoleResource', '$q', 'localStorageService'];

    function currentUserRolesService(currentUserService, RoleResource, $q, localStorageService) {

        var rolesPromise,
            CURRENT_USER_ROLES = 'currentUserRoles';

        this.getUserRoles = getUserRoles;
        this.clearCachedRoles = clearCachedRoles;

        /**
         * @ngdoc method
         * @methodOf openlmis-permissions.currentUserRolesService
         * @name getUserRoles
         *
         * @description
         * Fetches user roles either from the server, local storage or in memory cache. It will only update the stored
         * data after calling clearCachedRoles method.
         * 
         * @return {Promise}  the promise resolved once the user roles are downloaded, rejects if fetching user or roles
         *                    fails
         */
        function getUserRoles() {
            if (rolesPromise) {
                return rolesPromise;
            }

            // var cachedUserRoles = localStorageService.get(CURRENT_USER_ROLES);

            rolesPromise = $q
                .all([
                    currentUserService.getUserInfo(),
                    new RoleResource().query()
                ])
                .then(getRolesAssignedToUser)
                .then(cacheUserRoles);
            // if (cachedUserRoles) {
            //     rolesPromise = $q.resolve(angular.fromJson(cachedUserRoles));
            // } else {
            //     rolesPromise = $q
            //         .all([
            //             currentUserService.getUserInfo(),
            //             new RoleResource().query()
            //         ])
            //         .then(getRolesAssignedToUser)
            //         .then(cacheUserRoles);
            // }

            return rolesPromise;
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-permissions.currentUserRolesService
         * @name clearCachedRoles
         * 
         * @description
         * Removes the stored roles from the local storage and in memory cache.
         */
        function clearCachedRoles() {
            rolesPromise = undefined;
            localStorageService.remove(CURRENT_USER_ROLES);
        }

        function getRolesAssignedToUser(responses) {
            var user = responses[0],
                roles = responses[1];

            return roles.filter(isAssignedToUser(user));
        }

        function isAssignedToUser(user) {
            var userRoleIds = user.roleAssignments
                .map(function(roleAssignment) {
                    return roleAssignment.roleId;
                });

            return function(role) {
                return userRoleIds.indexOf(role.id) > -1;
            };
        }

        function cacheUserRoles(userRoles) {
            localStorageService.add(CURRENT_USER_ROLES, angular.toJson(userRoles));
            return userRoles;
        }

    }

})();