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
   * @name referencedata-facility.facilityService
   *
   * @description
   * Responsible for retrieving all facility information from server.
   */
    angular
        .module('referencedata-facility')
        .service('facilityService', service);

    service.$inject = [
        '$q', '$resource', 'referencedataUrlFactory', 'offlineService',
        'localStorageFactory', 'permissionService', 'FacilityResource',
        'localStorageService'
    ];

    function service($q, $resource, referencedataUrlFactory, offlineService,
                     localStorageFactory, permissionService, FacilityResource,
                     localStorageService) {

        var facilitiesOffline = localStorageFactory('facilities'),
            facilitiesPromise,
            resource = $resource(
                referencedataUrlFactory('/api/siglusapi/facilities/:id'),
                {},
                {
                    query: {
                        url: referencedataUrlFactory('/api/siglusapi/facilities/'),
                        method: 'GET'
                    },
                    getAllMinimal: {
                        url: referencedataUrlFactory('/api/facilities/minimal'),
                        method: 'GET'
                    },
                    getFulfillmentFacilities: {
                        url: referencedataUrlFactory(
                            '/api/users/:userId/fulfillmentFacilities'
                        ),
                        method: 'GET',
                        isArray: true
                    },
                    search: {
                        url: referencedataUrlFactory(
                            '/api/siglusapi/facilities'
                        ),
                        method: 'POST'
                    },
                    update: {
                        method: 'PUT'
                    },
                    // SIGLUS-REFACTOR: starts here
                    eraseDeviceInfo: {
                        url: referencedataUrlFactory(
                            '/api/siglusapi/facilities/:facilityCode/deviceInfo'
                        ),
                        method: 'DELETE'
                    }
                    // SIGLUS-REFACTOR: ends here
                }
            );

        this.get = get;
        this.query = query;
        this.getAllMinimal = getAllMinimal;
        this.getUserFacilitiesForRight = getUserFacilitiesForRight;
        this.getFulfillmentFacilities = getFulfillmentFacilities;
        this.search = search;
        this.clearFacilitiesCache = clearFacilitiesCache;
        this.eraseDeviceInfo = eraseDeviceInfo;

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name get
     *
     * @description
     * Retrieves facility by id. When user is offline it gets facility from offline storage.
     * If user is online it stores facility into offline storage.
     *
     * @param  {String}  facilityId Facility UUID
     * @return {Promise}            facility promise
     */
        function get(facilityId) {
            var cachedFacility = facilitiesOffline.getBy('id', facilityId);

            if (cachedFacility) {
                facilitiesPromise = $q.resolve(
                    angular.fromJson(cachedFacility)
                );
            } else {
                facilitiesPromise = new FacilityResource().get(facilityId)
                    .then(function(facility) {
                        facilitiesOffline.put(facility);
                        return $q.resolve(facility);
                    });
            }
            return facilitiesPromise;

        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name query
     *
     * @description
     * Retrieves all facilities that match given params or all facilities when no params provided.
     * When user is offline it gets facilities from offline storage.
     * If user is online it stores all facilities into offline storage.
     *
     * @param  {String}  queryParams      the pagination parameters
     * @param  {String}  queryParams      the search parameters
     * @return {Promise} Array of facilities
     */
        function query(paginationParams, queryParams) {
            if (offlineService.isOffline()) {
                return $q.resolve(facilitiesOffline.getAll());
            }
            return resource.query(
                _.extend({}, queryParams, paginationParams)
            ).$promise
                .then(function(page) {
                    page.content.forEach(function(facility) {
                        facilitiesOffline.put(facility);
                    });
                    return page;
                });
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name search
     *
     * @description
     * Searches facilities using given parameters.
     *
     * @param  {Object}  paginationParams the pagination parameters
     * @param  {Object}  queryParams      the search parameters
     * @return {Promise}                  the requested page of filtered facilities.
     */
        function search(paginationParams, queryParams) {
            return resource.search(paginationParams, queryParams).$promise;
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name getFulfillmentFacilities
     *
     * @description
     * Returns user fulfillment facilities.
     *
     * @param  {Object}  params the request params with userId and right id
     * @return {Promise}        fulfillment facilities for given user and right
     */
        function getFulfillmentFacilities(params) {
            return resource.getFulfillmentFacilities(params).$promise;
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name getUserFacilitiesForRight
     *
     * @description
     * Returns all facilities that a user has a permission with the given
     * right for.
     *
     * @param  {String}  userId The user's id that we are checking
     * @param  {String}  right  The right name that we are checking
     * @return {Promise}        An array of matching facilities.
     */
        function getUserFacilitiesForRight(userId, right) {
            if (!userId || !right) {
                return $q.reject();
            }
            return $q.all({
                permissions: permissionService.load(userId),
                minimalFacilities: this.getAllMinimal()
            })
                .then(function(results) {
                    var permissions = results.permissions,
                        minimalFacilities = results.minimalFacilities,
                        facilityHash = {};

                    permissions.forEach(function(permission) {
                        if (permission.right === right) {
                            if (!facilityHash[permission.facilityId]) {
                                facilityHash[permission.facilityId] = {
                                    id: permission.facilityId,
                                    supportedPrograms: []
                                };
                            }

                            if (permission.programId) {
                                facilityHash[permission.facilityId].supportedPrograms.push(
                                    {
                                        id: permission.programId
                                    }
                                );
                            }
                        }
                    });

                    minimalFacilities.forEach(function(facility) {
                        if (facilityHash[facility.id]) {
                            _.extend(facilityHash[facility.id], facility);
                        }
                    });
                    return facilityHash;
                })
                .then(function(facilityHash) {
                    var facilities = [];
                    Object.keys(facilityHash).forEach(function(id) {
                        facilities.push(facilityHash[id]);
                    });

                    return _.sortBy(facilities, 'name');
                });
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name getAllMinimal
     *
     * @description
     * Retrieves all facilities with id and name fields.
     *
     * @param  {Object}  paginationParams the pagination params: page, size, sort
     * @return {Promise} Array of facilities with minimal representation
     */
        function getAllMinimal(paginationParams) {
            var params = (paginationParams) ? paginationParams : {};
            if (!params.hasOwnProperty('sort')) {
                params.sort = 'name';
            }
            return resource.getAllMinimal(params).$promise.then(
                function(response) {
                    return response.content;
                }
            );
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name clearFacilitiesCache
     *
     * @description
     * Deletes facilities stored in the browser cache.
     */
        function clearFacilitiesCache() {
            facilitiesPromise = undefined;
            localStorageService.remove('facilities');
        }

        // SIGLUS-REFACTOR: starts here
        /**
     * @ngdoc method
     * @methodOf referencedata-facility.facilityService
     * @name eraseDeviceInfo
     *
     * @description
     * Deletes android device info by facility code.
     *
     * @param  {String}  facilityCode  The code of facility
     */
        function eraseDeviceInfo(facilityCode) {
            return resource.eraseDeviceInfo({
                facilityCode: facilityCode
            }).$promise;
        }

    // SIGLUS-REFACTOR: ends here
    }
})();
