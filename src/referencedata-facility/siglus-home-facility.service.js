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
        .service('siglusHomeFacilityService', siglusHomeFacilityService);

    siglusHomeFacilityService.$inject = ['facilityFactory', '$q'];

    function siglusHomeFacilityService(facilityFactory, $q) {
        this.facility = null;

        this.getLocationEnableStatus = function() {
            var $this = this;
            var defered = $q.defer();
            if ($this.facility) {
                defered.resolve(this.facility.enableLocationManagement);
            } else {
                facilityFactory.getUserHomeFacility().then(function(res) {
                    $this.facility = res;
                    defered.resolve(res.enableLocationManagement);
                })
                    .catch(function() {
                        defered.resolve(false);
                    });
            }
            return defered.promise;
        };
    }
})();
