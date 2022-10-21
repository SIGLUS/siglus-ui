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
     * @name openlmis-server-error-handler.serverErrorHandler
     *
     * @description Displays alert modal when server response status has 4xx(excluding 401) or 5xx
     * code.
     */
    angular
        .module('openlmis-main-state')
        .factory('SiglusOpenlmisMainStateFactory', handler);

    handler.$inject = ['$q', '$injector'];

    function handler($q, $injector) {
        return {
            getFacilityDevice: getFacilityDevice
        };

        function getFacilityDevice() {
            var currentUserHomeFacilityService = $injector.get('currentUserHomeFacilityService');
            var adminFacilityDeviceService = $injector.get('adminFacilityDeviceService');
            var localStorageService = $injector.get('localStorageService');
            return $q(function(resolve) {
                currentUserHomeFacilityService.getHomeFacility().then(function(res) {
                    var facilityId = res.id;
                    return adminFacilityDeviceService.get(facilityId).then(function(facilityDeviceInfo) {
                        localStorageService.add('facilityDeviceInfo', facilityDeviceInfo.deviceType);
                        resolve(facilityDeviceInfo.deviceType === 'LOCAL_MACHINE');
                    });
                });
            });
        }

    }
})();
