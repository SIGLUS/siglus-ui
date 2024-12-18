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

    angular
        .module('siglus-physical-inventory-history-detail')
        .controller('PhysicalInventoryHistoryDetailController', controller);

    controller.$inject = [
        '$state', 'facility', 'program', '$window', 'historyId', 'historyData', 'moment', 'messageService',
        'localStorageService', 'SiglusPhysicalInventoryHistoryDetailService'
    ];

    function controller(
        $state, facility, program, $window, historyId, historyData, moment, messageService,
        localStorageService, SiglusPhysicalInventoryHistoryDetailService
    ) {
        var vm = this;
        vm.facility = facility;
        vm.program = program;
        vm.historyData = historyData;
        vm.inventoryByProduct = vm.historyData.withLocation && vm.historyData.isByProduct;
        vm.inventoryByLocation = vm.historyData.withLocation && !vm.historyData.isByProduct;
        vm.service = SiglusPhysicalInventoryHistoryDetailService;
        vm.calculateTotalValue = calculateTotalValue;

        vm.print = print;
        vm.formatDate = formatDate;

        function formatDate(dateString) {
            return dateString ? moment(dateString).format('DD/MM/YYYY') : '';
        }

        function print() {
            localStorageService.add('historyData', JSON.stringify(historyData));
            $window.open('#!/stockmanagement/physicalInventory/history/detail/print/' + historyId, '_blank');
        }

        function calculateTotalValue(lineItem) {
            return _.get(lineItem, ['price']) ?
                (lineItem.stockOnHand * (lineItem.price * 100).toFixed(2)) / 100 + ' MZM' : '';
        }
    }
})();
