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
     * @name stock-physical-inventory.physicalInventoryService
     *
     * @description
     * Decorator physicalInventoryService .
     */
    angular.module('stock-physical-inventory')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('physicalInventoryService', decorator);
    }

    decorator.$inject = ['$delegate', '$resource', 'stockmanagementUrlFactory'];
    function decorator($delegate, $resource, stockmanagementUrlFactory) {
        var resource = $resource(stockmanagementUrlFactory('/api/siglusintegration/physicalInventories')),
            physicalInventoryService = $delegate;

        physicalInventoryService.getInitialDraft = getInitialDraft;

        return physicalInventoryService;

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name getInitialDraft
         *
         * @description
         * Retrieves Initial inventory by facility and program from server.
         *
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          physical inventory promise
         */
        function getInitialDraft(program, facility) {
            return resource.query({
                program: program,
                facility: facility,
                isDraft: true,
                canInitialInventory: true
            }).$promise;
        }
    }
})();
