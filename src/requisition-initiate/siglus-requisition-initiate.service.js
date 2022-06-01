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
     * @name requisition.siglusRequisitionInitiateService
     *
     * @description
     * Responsible for retrieving all information from server.
     */
    angular
        .module('requisition-initiate')
        .service('siglusRequisitionInitiateService', service);

    service.$inject = [
        'requisitionUrlFactory', '$resource'
    ];

    function service(requisitionUrlFactory, $resource) {
        this.getLatestPhysicalInventory = getLatestPhysicalInventory;
        this.getPhysicalInventoryDates = getPhysicalInventoryDates;

        function getLatestPhysicalInventory(facilityId) {
            var resource = $resource(requisitionUrlFactory('/api/siglusapi/physicalInventories/latest'));
            return resource.get({
                facilityId: facilityId
            }).$promise;
        }

        <!-- SIGLUS-REFACTOR: starts here -->
        function getPhysicalInventoryDates(programId, facilityId,  startDate, endDate) {
            <!-- SIGLUS-REFACTOR: ends here -->
            var resource = $resource(requisitionUrlFactory('/api/siglusapi/physicalInventories/dates'));
            return resource.query({
                <!-- SIGLUS-REFACTOR: starts here -->
                programId: programId,
                <!-- SIGLUS-REFACTOR: ends here -->
                facilityId: facilityId,
                startDate: startDate,
                endDate: endDate
            }).$promise;
        }
    }
})();
