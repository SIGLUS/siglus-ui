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
     * @name referencedata-user.currentUserService
     *
     * @description
     * Responsible for fetching and caching currently logged user.
     */
    angular
        .module('referencedata-user')
        .service('currentUserService', currentUserInfo);

    currentUserInfo.$inject = [
        '$q', 'UserRepository', 'localStorageService', 'authorizationService', 'User',
        // SIGLUS-REFACTOR: starts here
        'InitialInventoryResource'
        // SIGLUS-REFACTOR: starts here
    ];

    function currentUserInfo($q, UserRepository, localStorageService, authorizationService, User,
                             InitialInventoryResource) {

        var CURRENT_USER = 'currentUser',
            promise;

        this.getUserInfo = getUserInfo;
        this.clearCache = clearCache;

        /**
         * @ngdoc method
         * @methodOf referencedata-user.currentUserService
         * @name getUserInfo
         *
         * @description
         * Gets current user details from the
         * referencedata service, which is then stored and only retrieved from
         * the user's browser.
         *
         * @return {Promise}    promise that resolves with user info
         */
        function getUserInfo() {
            if (promise) {
                return promise;
            }

            var authUser = authorizationService.getUser();
            if (!authUser) {
                return $q.reject();
            }

            var cachedUserAsJson = localStorageService.get(CURRENT_USER);
            if (cachedUserAsJson) {
                promise = $q.resolve(new User(angular.fromJson(cachedUserAsJson), new UserRepository()));
            } else {
                promise = new UserRepository().get(authUser.user_id)
                    .then(function(refUser) {
                        // SIGLUS-REFACTOR: starts here
                        if (refUser.homeFacilityId) {
                            new InitialInventoryResource().query({
                                facility: refUser.homeFacilityId
                            })
                                .then(function(initialStatus) {
                                    refUser.canInitialInventory = initialStatus.canInitialInventory;
                                    localStorageService.add(CURRENT_USER, refUser.toJson());
                                });
                        } else {
                            refUser.canInitialInventory = false;
                            localStorageService.add(CURRENT_USER, refUser.toJson());
                        }
                        // SIGLUS-REFACTOR: ends here
                        return refUser;
                    });
            }

            return promise;
        }

        /**
         * @ngdoc method
         * @methodOf referencedata-user.currentUserService
         * @name clearCache
         *
         * @description
         * Deletes users stored in the browser cache.
         */
        function clearCache() {
            promise = undefined;
            localStorageService.remove(CURRENT_USER);
        }
    }

})();
