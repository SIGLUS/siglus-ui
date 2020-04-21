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
     * @name requisition.requisitionInitiateService
     *
     * @description
     * Responsible for retrieving all information from server.
     */
    angular
        .module('requisition-initiate')
        .service('requisitionInitiateService', service);

    service.$inject = [
        'requisitionUrlFactory', '$resource'
    ];

    function service(requisitionUrlFactory, $resource) {
        this.getLatestPhysicalInventory = getLatestPhysicalInventory;
        this.getPhysicalInventoryDates = getPhysicalInventoryDates;

        function getLatestPhysicalInventory(facilityId) {
            var resource = $resource(requisitionUrlFactory('/api/physicalInventories/latest'));
            return resource.get({
                facilityId: facilityId
            }).$promise;
        }

        function getPhysicalInventoryDates(facilityId, startDate, endDate) {
            var resource = $resource(requisitionUrlFactory('/api/physicalInventories/dates'));
            return resource.query({
                facilityId: facilityId,
                startDate: startDate,
                endDate: endDate
            }).$promise;
        }
    }
})();
