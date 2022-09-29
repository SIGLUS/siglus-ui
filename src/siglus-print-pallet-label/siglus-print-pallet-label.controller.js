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
        .module('siglus-print-pallet-label')
        .controller('siglusPrintPalletLabelController', controller);

    controller.$inject = ['$scope', '$timeout', '$q', 'moment'];

    function controller($scope, $timeout, $q, moment) {

        var vm = this;
        vm.lineItems = [];
        vm.$onInit = onInit;

        vm.getFS = function(data) {
            var font;
            switch (data.toString().length) {
            case 1:
            case 2:
            case 3:
            case 4:
                font = 96;
                break;
            case 5:
                font = 70;
                break;
            case 6:
                font = 58;
                break;
            case 7:
                font = 50;
                break;
            case 8:
                font = 44;
                break;
            case 9:
                font = 39;
                break;
            default:
                font = 24;
                break;
            }
            return font + 'px';
        };

        function onInit() {
            $scope.$watch(function() {
                return vm.lineItems;
            }, function(newValue) {
                if (newValue && newValue.length > 0) {
                    $timeout(function() {
                        var printPalletLabel = document.getElementsByClassName('siglus-print-pallet-rect');
                        var renderPrintList = newValue.map(function(item, index) {
                            return $q(function(resolve) {
                                // eslint-disable-next-line no-undef
                                JsBarcode('#barcode_' + item.productCode
                                    , item.productCode
                                    , {
                                        height: 56,
                                        displayValue: false,
                                        marginTop: 10,
                                        marginBottom: 2
                                    });
                                // eslint-disable-next-line no-undef
                                domtoimage.toPng(printPalletLabel[index]).then(function(dataUrl) {
                                    resolve(dataUrl);
                                });
                            });
                        });

                        $q.all(renderPrintList).then(function(result) {
                            // eslint-disable-next-line no-undef
                            var PDF = new jsPDF({
                                orientation: 'l',
                                unit: 'pt',
                                format: [ 662.00, Number(printPalletLabel[0].offsetHeight).toFixed(2)]
                            });
                            angular.forEach(result, function(item, index) {
                                PDF.addImage(item, 'PNG', 0,
                                    0, 662, Number(printPalletLabel[index].offsetHeight));
                                if (index !== result.length - 1) {
                                    PDF.addPage([662.00, Number(printPalletLabel[index + 1].offsetHeight).toFixed(2)]
                                        , 'l');
                                }
                            });

                            var fileName = getFileName();
                            PDF.save(fileName);
                            vm.lineItems = [];
                        });
                    }, 100);
                }
            }, true);

        }

        function getFileName() {
            return 'Pallet_'
        + vm.printType + '_'
        + vm.facilityName + '_'
        + moment().format('YYYY-MM-DD') + '_'
        + moment().format('HH') + 'h'
        + moment().format('mm') + 'min'
        + '.pdf';
        }
    }
})();
