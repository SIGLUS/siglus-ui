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
     * @name ExpiredProductsViewController
     *
     * @description
     * Controller for expired products view.
     */
    angular
        .module('siglus-expired-products')
        .controller('ExpiredProductsViewController', controller);

    controller.$inject = ['$state', '$stateParams', '$window', '$q', 'facility', 'orderablesPrice',
        'expiredProducts', 'displayItems',
        'siglusSignatureWithDateModalService', 'expiredProductsViewService', 'loadingModalService',
        'stockIssueCreationService', 'openlmisDateFilter'];

    function controller($state, $stateParams, $window, $q, facility, orderablesPrice,
                        expiredProducts, displayItems,
                        siglusSignatureWithDateModalService, expiredProductsViewService, loadingModalService,
                        stockIssueCreationService, openlmisDateFilter) {
        var vm = this;

        vm.keyword = '';
        vm.facility = undefined;
        vm.expiredProducts = [];
        vm.displayItems = [];
        vm.enableLocation = false;
        vm.$onInit = onInit;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;

        function onInit() {
            vm.keyword = $stateParams.keyword;
            vm.facility = facility;
            vm.expiredProducts = expiredProducts;
            vm.displayItems = displayItems;
            vm.enableLocation = angular.copy(
                facility.enableLocationManagement
            );
        }

        function reloadPage() {
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
            $stateParams.pageNumber = 0;
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        vm.search = function() {
            reloadPage();
        };

        vm.cancelFilter = function() {
            vm.keyword = null;
            reloadPage();
        };

        vm.print = function() {
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'stockmanagement/expiredProductsPrint';
            $window.open(PRINT_URL, '_blank');
        };

        function skipAllLineItems() {
            vm.displayItems.forEach(function(tableLineItem) {
                tableLineItem.skipped = true;
            });
        }

        function unskipAllLineItems() {
            vm.displayItems.forEach(function(tableLineItem) {
                tableLineItem.skipped = false;
            });
        }

        vm.viewDetail = function(lineItem) {
            if (vm.enableLocation) {
                switch (lineItem.itemType) {
                case 'Product':
                    $state.go('openlmis.locationManagement.stockOnHand.productDetail', {
                        orderable: lineItem.orderableId,
                        program: lineItem.programId,
                        facilityId: vm.facility.id
                    });
                    break;
                case 'Lot':
                    $state.go('openlmis.locationManagement.stockOnHand.lotDetail', {
                        stockCardId: lineItem.stockCardId,
                        program: lineItem.programId,
                        facility: vm.facility.id
                    });
                    break;
                case 'Location':
                    $state.go('openlmis.locationManagement.stockOnHand.locationDetail', {
                        stockCardId: lineItem.stockCardId,
                        locationCode: lineItem.locationCode,
                        program: lineItem.programId,
                        facility: vm.facility.id
                    });
                    break;
                }
            } else {
                switch (lineItem.itemType) {
                case 'Product':
                    $state.go('openlmis.stockmanagement.stockCardSummaries.productCard', {
                        orderable: lineItem.orderableId,
                        program: lineItem.programId,
                        facility: vm.facility.id
                    });
                    break;
                case 'Lot':
                    $state.go('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                        stockCardId: lineItem.stockCardId,
                        program: lineItem.programId,
                        facility: vm.facility.id
                    });
                    break;
                }
            }
        };

        function selectedLots() {
            var selectedLots = [];
            vm.displayItems.forEach(function(product) {
                if (product.lots) {
                    product.lots.forEach(function(lot) {
                        if (!lot.skipped) {
                            selectedLots.push(lot);
                        }
                    });
                }
            });
            return selectedLots;
        }

        vm.generatePickPackList = function() {
            expiredProductsViewService.savePickPackDatas(vm.facility, selectedLots());
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'stockmanagement/expiredProductsPickPack';
            $window.open(PRINT_URL, '_blank');
        };

        vm.confirmRemove = function() {
            siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature', null, null, true)
                .then(function(data) {
                    vm.type = 'issue';
                    vm.supplier = vm.facility.name;
                    vm.client = undefined;
                    vm.initialDraftInfo = {
                        documentNumber: vm.facility.code + '_todo_timestamp'
                    };
                    vm.issueVoucherDate = openlmisDateFilter(data.occurredDate, 'yyyy-MM-dd');
                    vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
                    vm.signature = data.signature;
                    var removeDatas = selectedLots();
                    vm.addedLineItems = removeDatas.map(function(item) {
                        item.quantity = item.soh;
                        item.price = orderablesPrice.data[item.orderableId];
                        return item;
                    });
                    vm.totalPriceValue = _.reduce(vm.addedLineItems, function(r, c) {
                        if (c.price) {
                            var price = c.price * 100;
                            r = r + c.quantity * price;
                        }
                        return r;
                    }, 0);
                    var deferred = $q.defer();
                    stockIssueCreationService.downloadPdf(vm.supplier);
                    deferred.promise.then(function() {
                        // loadingModalService.open();
                        // expiredProductsViewService.removeSelectedLots(vm.facility.id, removeDatas)
                        //     .finally(function() {
                        //         loadingModalService.close();
                        //     });
                    });
                });
        };
    }
})();
