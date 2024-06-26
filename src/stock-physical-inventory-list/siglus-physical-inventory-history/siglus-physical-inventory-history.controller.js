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
        .module('stock-physical-inventory-list')
        .controller('SiglusPhysicalInventoryHistoryController', SiglusPhysicalInventoryHistoryController);

    SiglusPhysicalInventoryHistoryController.$inject = [
        '$state', 'filteredHistoryList', 'program', 'facility', 'loadingModalService'
    ];

    function SiglusPhysicalInventoryHistoryController(
        $state, filteredHistoryList, program, facility, loadingModalService
    ) {
        var vm = this;

        var ALL_PROGRAM_NAME = 'ALL';
        var DISPLAY_ALL_PROGRAM_NAME = 'Todos os produtos';

        vm.filteredHistoryList = filteredHistoryList;
        vm.program = program;

        vm.viewHistoryDetail = viewHistoryDetail;
        vm.getProgramName = getProgramName;

        function viewHistoryDetail(historyItem) {
            loadingModalService.open();
            $state.go('openlmis.stockmanagement.history', {
                program: vm.program,
                facility: facility,
                historyId: historyItem.id
            });
        }

        function getProgramName(historyItem) {
            return historyItem.programName === ALL_PROGRAM_NAME ? DISPLAY_ALL_PROGRAM_NAME : historyItem.programName;
        }
    }
})();

