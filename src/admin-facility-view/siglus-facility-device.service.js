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
   * @name admin-facility-view.siglus-admin-device
   *
   * @description
   * Responsible for retrieving Ideal Stock Amounts from the server.
   */
    angular
        .module('admin-facility-view')
        .factory('adminFacilityDeviceService', service);

    service.$inject = ['$resource', 'referencedataUrlFactory'];

    function service($resource, referencedataUrlFactory) {
        var resource = $resource(
            referencedataUrlFactory('/api/siglusapi/facilities/:id/facilityDevice'),
            {},
            {
                get: {
                    method: 'GET',
                    transformResponse: transformResponse
                },
                upgrade: {
                    url: referencedataUrlFactory(
                        '/api/siglusapi/facilities/:id/to'
                    ),
                    method: 'PUT'
                },
                erase: {
                    url: referencedataUrlFactory(
                        '/api/siglusapi/facilities/:id/facilityDevice'
                    ),
                    method: 'DELETE',
                    hasBody: true,
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    }
                }
            }
        );

        return {
            get: get,
            upgrade: upgrade,
            erase: erase
        };
        function get(id) {
            return resource.get({
                id: id
            }).$promise;
        }

        function upgrade(id, facilityDeviceType) {
            return resource.upgrade({
                id: id
            }, {
                facilityDeviceType: facilityDeviceType
            })
                .$promise;
        }

        function erase(id, facilityDeviceType) {
            return resource.erase({
                id: id
            }, {
                facilityDeviceType: facilityDeviceType
            })
                .$promise;
        }
        function transformResponse(data, headers, status) {
            if (status === 200) {
                return angular.fromJson(data);
            }
            return data;
        }
    }
})();
