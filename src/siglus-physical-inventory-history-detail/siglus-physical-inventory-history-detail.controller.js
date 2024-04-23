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
        '$state', 'facility', 'program', '$window', 'historyData', 'moment', 'messageService'
    ];

    function controller($state, facility, program, $window, historyData, moment, messageService) {
        var vm = this;
        vm.facility = facility;
        vm.program = program;
        vm.historyData = historyData;

        vm.print = print;
        vm.formatDate = formatDate;
        vm.buildDiffReasonMessage = buildDiffReasonMessage;

        function formatDate(dateString) {
            return moment(dateString).format('DD/MM/YYYY');
        }

        function buildDiffReasonMessage(lineItem) {
            var diff = lineItem.currentStock - lineItem.stockOnHand;
            if (!lineItem.reasons || diff === 0) {
                return '';
            }
            if (diff > 0) {
                return messageService.get(
                    'stockPhysicalInventoryHistory.PositiveAdjustmentMessage', {
                        diffQuantity: Math.abs(diff).toString()
                    }
                );
            }
            return messageService.get(
                'stockPhysicalInventoryHistory.NegativeAdjustmentMessage', {
                    diffQuantity: Math.abs(diff).toString()
                }
            );

        }

        function print() {
            $window.open('#!/stockmanagement/history/print', '_blank');
        }
    }
})();
