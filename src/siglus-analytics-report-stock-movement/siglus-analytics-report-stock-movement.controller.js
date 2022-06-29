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

    controller.$inject = ['$stateParams', 'stockMovements', 'facility'];

    function controller($stateParams, stockMovements, facility) {
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

        function formatStockMovements(stockMovement) {
            var arr = [];
            angular.forEach(stockMovement, function(item) {
                var blankArr = [];
                blankArr.push(item.dateOfMovement);
                blankArr.push(item.reason);
                blankArr.push(item.documentNumber);
                switch (item.type) {
                case 'PHYSICAL_INVENTORY':
                    blankArr.push(null);
                    blankArr.push(null);
                    blankArr.push(null);
                    blankArr.push(null);
                    break;
                case 'ISSUE':
                    blankArr.push(null);
                    blankArr.push(null);
                    blankArr.push(null);
                    blankArr.push(item.movementQuantity);
                    break;
                case 'RECEIVE':
                    blankArr.push(item.movementQuantity);
                    blankArr.push(null);
                    blankArr.push(null);
                    blankArr.push(null);
                    break;
                case 'ADJUSTMENT':
                    if (item.movementQuantity > 0) {
                        blankArr.push(null);
                        blankArr.push(null);
                        blankArr.push(item.movementQuantity);
                        blankArr.push(null);

                    } else {
                        blankArr.push(null);
                        blankArr.push(item.movementQuantity);
                        blankArr.push(null);
                        blankArr.push(null);
                    }
                    break;
                }
                blankArr.push(item.productSoh);
                blankArr.push(item.requested);
                blankArr.push(item.signature);
                arr.push(blankArr);
            });
            return arr;
        }
        function exportExcel() {
            // eslint-disable-next-line no-undef
            var filename = 'stock-movement-report_' +  moment().utc()
                .format('YYYY-MM-DD_at_HH.mm.SSS') + '.xlsx';
            var header = [
                [vm.productCode, vm.productName, vm.facilityName, vm.district, vm.province],
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
