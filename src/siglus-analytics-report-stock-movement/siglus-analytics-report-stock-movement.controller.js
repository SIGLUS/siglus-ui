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
     * @ngdoc controller
     * @name siglus-analytics-report-stock-movement.controller:siglusAnalyticsReportStockMovementController
     *
     * @description
     * second-tier detail page Controller for SOH by product Report
     */
    angular
        .module('siglus-analytics-report-stock-movement')
        .controller('siglusAnalyticsReportStockMovementController', controller);

    controller.$inject = ['$stateParams', 'stockMovements', 'facility', 'messageService'];

    function controller($stateParams, stockMovements, facility, messageService) {
        var vm = this;
        vm.$onInit = onInit;
        vm.exportExcel = exportExcel;
        vm.productName = undefined;
        vm.productCode = undefined;
        vm.facilityName = undefined;
        vm.district = undefined;
        vm.province = undefined;
        vm.stockMovements = undefined;
        function onInit() {
            vm.stockMovements = formatStockMovements(stockMovements);
            vm.productName = $stateParams.productName;
            vm.productCode = $stateParams.productCode;
            vm.facilityName = facility.name;
            vm.district = facility.geographicZone.name;
            vm.province = facility.geographicZone.parent.name;
        }

        function getOriginOrDestination(stockMovement) {
            switch (stockMovement.type) {
            case 'ISSUE':
                return stockMovement.destinationFreeText ?
                    stockMovement.destinationName + ' - ' + stockMovement.destinationFreeText
                    : stockMovement.destinationName;
            case 'RECEIVE':
                return stockMovement.sourceFreeText ?
                    stockMovement.sourceName + ' - ' + stockMovement.sourceFreeText
                    : stockMovement.sourceName;
            default:
                return messageService.get(stockMovement.reason);
            }
        }

        function formatStockMovements(stockMovement) {
            var stockMovementArr = [];
            angular.forEach(stockMovement, function(item) {
                var stockMovementItemArr = [];
                stockMovementItemArr.push(item.dateOfMovement);
                stockMovementItemArr.push(getOriginOrDestination(item));
                stockMovementItemArr.push(item.documentNumber);
                var result = vm.concatStockMovementItemArrByType(item);
                stockMovementItemArr =  stockMovementItemArr.concat(result);
                stockMovementItemArr.push(item.productSoh);
                stockMovementItemArr.push(item.requested);
                stockMovementItemArr.push(item.signature);
                stockMovementArr.push(stockMovementItemArr);
            });

            return stockMovementArr;
        }

        vm.concatStockMovementItemArrByType = function(item) {
            var result = [];
            switch (item.type) {
            case 'PHYSICAL_INVENTORY':
            case 'ADJUSTMENT':
                if (item.movementQuantity > 0) {
                    result = [null, null, Math.abs(item.movementQuantity), null ];
                } else if (item.movementQuantity < 0) {
                    result = [null, Math.abs(item.movementQuantity), null, null ];
                } else {
                    result = [null, null, null, null];
                }
                break;
            case 'ISSUE':
                result = [null, null, null, Math.abs(item.movementQuantity)];
                break;
            case 'RECEIVE':
                result = [Math.abs(item.movementQuantity), null, null, null ];
                break;
            }
            return result;
        };

        function exportExcel() {
            // eslint-disable-next-line no-undef
            var filename = 'Stock Movements Report_' + vm.facilityName + '_' + moment().utc()
                .format('YYYY-MM-DD') + '.xlsx';
            var header = [
                ['Código do Produto: ' + vm.productCode,
                    'Nome do Produto: ' + vm.productName,
                    'Nome da instalação: ' + vm.facilityName,
                    'Distrito: ' + vm.district,
                    'Província: ' + vm.province],
                ['Data do movimento',
                    'Origem/destino do movimento',
                    'Número de Documento',
                    'Entradas',
                    'Ajuste Negativo',
                    'Ajuste Positivo',
                    'Saídas',
                    'Estoque Existente',
                    'Pedidos',
                    'Assinatura']
            ];
            var data = header.concat(formatStockMovements(stockMovements));
            var wsName = 'Query result';

            // eslint-disable-next-line no-undef
            var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(data);

            /* add worksheet to workbook */
            // eslint-disable-next-line no-undef
            XLSX.utils.book_append_sheet(wb, ws, wsName);

            /* write workbook */
            // eslint-disable-next-line no-undef
            XLSX.writeFile(wb, filename);
        }
    }
})();
