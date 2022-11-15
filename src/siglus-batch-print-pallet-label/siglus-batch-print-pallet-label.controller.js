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
        .module('siglus-batch-print-pallet-label')
        .controller('siglusBatchPrintPalletLabelController', controller);

    controller.$inject = ['$scope', '$timeout', '$q', 'moment', 'siglusDownloadProcessModalService',
        'loadingModalService'];

    function controller($scope, $timeout, $q, moment, siglusDownloadProcessModalService, loadingModalService) {

        var vm = this;
        vm.lineItems = [];
        vm.$onInit = onInit;
        vm.currentIndex = 1;
        vm.totoalIndex = 0;
        vm.printLineItems = [];
        vm.getFS = function(data) {
            var fontMap = {
                font1: 96,
                font2: 96,
                font3: 96,
                font4: 96,
                font5: 70,
                font6: 58,
                font7: 50,
                font8: 44,
                font9: 39,
                font10: 35
            };
            var palletLength = data.toString().length;
            return fontMap['font' + palletLength] ? fontMap['font' + palletLength] + 'px' : '24px';
        };

        function promiseQueue(promiseFun) {
            var splitNumber = vm.splitNumber || 100;
            promiseFun().then(function() {
                siglusDownloadProcessModalService.currentIndex = vm.currentIndex + 1;
                if (vm.currentIndex < vm.totoalIndex) {
                    vm.printLineItems = angular.copy(vm.lineItems).splice(vm.currentIndex * splitNumber, splitNumber);
                    $timeout(function() {
                        vm.currentIndex = vm.currentIndex + 1;
                        doBatchPrint(vm.printLineItems);
                    }, 100);
                } else {
                    vm.currentIndex = 1;
                    vm.totoalIndex = 0;
                    loadingModalService.close();
                }

            });
        }

        function doBatchPrint(lineItems) {
            function deferredPromise() {
                return $q(function(resolve) {
                    var printPalletLabels = document.getElementsByClassName('siglus-print-pallet-rect');
                    var renderPrintList = lineItems.map(function(item, index) {
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
                        return domtoimage.toPng(printPalletLabels[index], {}).then(function(data) {
                            return $q.resolve({
                                offsetHeight: printPalletLabels[index].offsetHeight,
                                data: data
                            });
                        });
                    });

                    $q.all(renderPrintList).then(function(result) {
                        // eslint-disable-next-line no-undef
                        var PDF = new jsPDF({
                            orientation: 'p',
                            unit: 'pt',
                            format: [ 662.00, Number(result[0].offsetHeight).toFixed(2)]
                        });
                        angular.forEach(result, function(item, index) {
                            PDF.addImage(item.data, 'PNG', 0,
                                0, 662, Number(item.offsetHeight));
                            if (index !== result.length - 1) {
                                PDF.addPage([662.00, Number(item.offsetHeight)
                                    .toFixed(2)], 'p');
                            }
                        });

                        var fileName = getFileName();
                        PDF.save(fileName);
                        resolve(true);
                    });
                });
            }
            promiseQueue(deferredPromise, 0);
        }

        function onInit() {
            var splitNumber = vm.splitNumber || 100;
            $scope.$watch(function() {
                return vm.lineItems;
            }, function(newValue) {
                if (newValue && newValue.length > 0) {
                    vm.lineItems = newValue;
                    vm.printLineItems = angular.copy(vm.lineItems).splice(0, splitNumber);
                    vm.totoalIndex = Math.ceil(newValue.length / splitNumber);
                    loadingModalService.open();
                    siglusDownloadProcessModalService.open({
                        totalCount: vm.totoalIndex,
                        currentIndex: vm.currentIndex,
                        title: 'siglusPrintPalletComfirmModal.title',
                        message: 'siglusPrintPallet.downloadProcessMessage'
                    });
                    $timeout(function() {
                        doBatchPrint(vm.printLineItems);
                    }, 100);
                }
            }, true);

        }

        function getFileName() {
            var part = vm.totoalIndex > 1 ? '_part' + vm.currentIndex : '';
            return 'Pallet_' + vm.printType + '_' + vm.facilityName + '_'
              + moment().format('YYYY-MM-DD') + '_' + moment().format('HH') + 'h' + moment().format('mm') + 'min'
              + part + '.pdf';
        }
    }
})();
