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
     * @name shipment-view.controller:ShipmentViewController
     *
     * @description
     * Responsible for managing shipment view screen.
     */
    angular
        .module('shipment-view')
        .controller('ShipmentViewController', ShipmentViewController);

    ShipmentViewController.$inject = [
        'shipment', 'loadingModalService', '$state', '$window', '$stateParams', 'order',
        'QUANTITY_UNIT', 'tableLineItems', 'displayTableLineItems', 'selectProductsModalService',
        'OpenlmisArrayDecorator', 'alertService', '$q', 'ShipmentViewLineItemFactory',
        'ShipmentLineItem', 'ShipmentViewLineItemGroup', 'suggestedQuantity', 'localStorageService',
        'shipmentViewService', 'StockCardSummaryRepositoryImpl', 'SiglusShipmentDraftService',
        'notificationService'
    ];

    function ShipmentViewController(
        shipment, loadingModalService, $state, $window, $stateParams, order,
        QUANTITY_UNIT, tableLineItems, displayTableLineItems, selectProductsModalService,
        OpenlmisArrayDecorator, alertService, $q, ShipmentViewLineItemFactory,
        ShipmentLineItem, ShipmentViewLineItemGroup, suggestedQuantity, localStorageService,
        shipmentViewService, StockCardSummaryRepositoryImpl, SiglusShipmentDraftService,
        notificationService
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.save = save;
        vm.confirm = confirm;
        vm.printShipment = printShipment;
        vm.saveAndPrintShipment = saveAndPrintShipment;
        // #264: warehouse clerk can add product to orders
        vm.addProducts = addProducts;
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        vm.changeSkipStatus = changeSkipStatus;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        vm.canSkip = canSkip;
        // #287: ends here
        vm.getLineItemQuantityInvalidMessage = getLineItemQuantityInvalidMessage;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name order
         * @type {Object}
         *
         * @description
         * Holds order that will be displayed on the screen.
         */
        vm.order = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name shipment
         * @type {Object}
         *
         * @description
         * Holds shipment that will be displayed on the screen.
         */
        vm.shipment = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name tableLineItems
         * @type {Array}
         *
         * @description
         * Holds line items to be displayed on the grid.
         */
        vm.tableLineItems = undefined;

        /**
         * @ngdoc property
         * @propertyOf shipment-view.controller:ShipmentViewController
         * @name quantityUnit
         * @type {Object}
         *
         * @description
         * Holds quantity unit.
         */
        vm.quantityUnit = undefined;

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            vm.order = order;
            vm.facility = _.get(vm.order, 'facility');
            vm.program = _.get(vm.order, 'program');
            vm.shipment = shipment;
            vm.tableLineItems = suggestedQuantity.orderableIdToSuggestedQuantity ?
                setSuggestedQuantity(tableLineItems) :
                tableLineItems;
            vm.isShowSuggestedQuantity = suggestedQuantity.showSuggestedQuantity;
            vm.orderableIdToSuggestedQuantity = suggestedQuantity.orderableIdToSuggestedQuantity;
            vm.displayTableLineItems = displayTableLineItems;
            shipmentViewService.addRefreshListener(updateLineItemsReservedAndTotalStock);
        }

        function updateLineItemsReservedAndTotalStock() {
            loadingModalService.open();

            new StockCardSummaryRepositoryImpl()
                .queryWithStockCards($stateParams.summaryRequestBody)
                .then(function(summaries) {
                    vm.tableLineItems.forEach(function(lineItem) {
                        if (lineItem instanceof ShipmentViewLineItemGroup) {
                            return;
                        }
                        var currentItemOrderableId = lineItem.shipmentLineItem.orderable.id;
                        var currentItemLotId = lineItem.lot.id;

                        var summary = summaries.find(function(summary) {
                            return summary.orderable.id === currentItemOrderableId;
                        });
                        var lineItemCardDetail = summary.canFulfillForMe.find(function(stockCardDetail) {
                            return stockCardDetail.lot.id === currentItemLotId;
                        });

                        lineItem.shipmentLineItem.stockOnHand = lineItemCardDetail.stockOnHand;
                        lineItem.reservedStock = lineItemCardDetail.reservedStock;
                    });
                    vm.cancelFilter();
                })
                .catch(function(error) {
                    throw new Error(error);
                })
                .finally(function() {
                    loadingModalService.close();
                });
        }

        function setSuggestedQuantity(items) {
            var suggestedQuantityMap = suggestedQuantity.orderableIdToSuggestedQuantity;
            _.forEach(items, function(item) {
                item.suggestedQuantity =
                    _.includes([null, undefined], suggestedQuantityMap[item.id]) ?
                        '' :
                        suggestedQuantityMap[item.id];
            });
            return items;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name showInDoses
         *
         * @description
         * Returns whether the screen is showing quantities in doses.
         *
         * @return {boolean} true if the quantities are in doses, false otherwise
         */
        function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name getSelectedQuantityUnitKey
         *
         * @description
         * Returns message key for selected quantity unit.
         */
        function getSelectedQuantityUnitKey() {
            return QUANTITY_UNIT.$getDisplayName(vm.quantityUnit);
        }

        function generateTableLineItemsForPrint() {
            return _.chain(vm.tableLineItems)
                .filter(function(tableLineItem) {
                    return tableLineItem.isMainGroup;
                })
                .filter(function(tableLineItem) {
                    return tableLineItem.getFillQuantity() > 0;
                })
                .map(function(tableLineItem) {
                    return Object.assign(tableLineItem, {
                        quantityShipped: tableLineItem.getFillQuantity(),
                        stockOnHand: tableLineItem.getAvailableSoh()
                    });
                })
                .reduce(function(tableLineItems, item) {
                    // flatten table line items for print
                    tableLineItems.push(item);
                    item.lineItems.forEach(function(lineItem) {
                        if (lineItem instanceof ShipmentViewLineItemGroup) {
                            lineItem.lineItems.forEach(function(innerLineItem) {
                                tableLineItems.push(innerLineItem);
                            });
                        } else {
                            tableLineItems.push(lineItem);
                        }
                    });
                    return tableLineItems;
                }, [])
                .value();
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name printShipment
         *
         * @description
         * Prints the shipment.
         *
         */
        function printShipment() {
            localStorageService.add('dataForPrint', angular.toJson({
                order: vm.order,
                tableLineItems: generateTableLineItemsForPrint()
            }));
            var PRINT_URL = $window.location.href.split('!/')[0] + '!/orders/pickPackListPrint';
            $window.open(PRINT_URL, '_blank');
        }

        function save() {
            if (isFormInvalid()) {
                alertService.error('shipmentView.invalidForm');
                return $q.reject();
            }
            loadingModalService.open();
            return SiglusShipmentDraftService.saveShipmentDraft(vm.shipment)
                .then(function() {
                    loadingModalService.close();
                    notificationService.success('shipmentView.draftHasBeenSaved');
                })
                .catch(function(error) {
                    loadingModalService.close();
                    notificationService.error(error);
                });
        }

        function saveAndPrintShipment() {
            save().then(function() {
                printShipment();
            });
        }

        function confirm() {
            if (isFormInvalid()) {
                alertService.error('shipmentView.failedToSaveDraft');
                return;
            }
            return vm.shipment.confirm();
        }

        vm.getErrorMsg = function() {
            return 'shipmentView.invalidForm';
        };

        // #264: warehouse clerk can add product to orders
        function addProducts() {
            console.log('addProducts');
            // var availableProducts = getAvailableProducts();
            // selectProducts({
            //     products: availableProducts
            // })
            //     .then(function(selectedProducts) {
            //         var addedShipmentLineItems = prepareShipmentLineItems(selectedProducts);
            //         var addedOrderLineItems = prepareOrderLineItems(selectedProducts);
            //         var addedOrderLineItemsShipment = Object.assign({}, shipment, {
            //             lineItems: addedShipmentLineItems,
            //             order: {
            //                 orderLineItems: addedOrderLineItems
            //             }
            //         });
            //         var addedTableLineItems = new ShipmentViewLineItemFactory()
            //             .createFrom(addedOrderLineItemsShipment, stockCardSummaries);
            //         addedShipmentLineItems.forEach(function(shipmentLineItem) {
            //             shipment.lineItems.push(shipmentLineItem);
            //         });
            //         vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
            //         vm.tableLineItems = vm.tableLineItems.concat(addedTableLineItems);
            //         vm.displayTableLineItems = vm.displayTableLineItems.concat(addedTableLineItems);
            //     });
        }
        //
        // function selectProducts(availableProducts) {
        //     var decoratedAvailableProducts = new OpenlmisArrayDecorator(availableProducts.products);
        //     decoratedAvailableProducts.sortBy('fullProductName');
        //
        //     if (!availableProducts.products.length) {
        //         alertService.error(
        //             'shipmentView.noProductsToAdd.label',
        //             'shipmentView.noProductsToAdd.message'
        //         );
        //         return $q.reject();
        //     }
        //
        //     return selectProductsModalService.show({
        //         products: decoratedAvailableProducts,
        //         limit: vm.order.emergency ? {
        //             max: 10 - vm.order.orderLineItems.length,
        //             errorMsg: 'shipmentView.selectTooMany'
        //         } : undefined
        //     });
        // }
        //
        // function getAvailableProducts() {
        //     var existedOrderableMap = {};
        //     vm.order.orderLineItems.forEach(function(lineItem) {
        //         existedOrderableMap[lineItem.orderable.id] = lineItem.orderable;
        //     });
        //     return vm.order.availableProducts.filter(function(orderable) {
        //         return !(orderable.id in existedOrderableMap);
        //     });
        // }
        //
        // function prepareOrderLineItems(selectedProducts) {
        //     return selectedProducts.map(function(orderable) {
        //         return {
        //             orderedQuantity: 0,
        //             orderable: orderable,
        //             partialFulfilledQuantity: 0
        //         };
        //     });
        // }
        // #264: ends here

        // #374: confirm shipment effect soh
        // function prepareShipmentLineItems(selectedProducts) {
        //     var addedShipmentLineItems = [];
        //     var canFulfillForMeMap = mapCanFulfillForMe(stockCardSummaries);
        //     selectedProducts.forEach(function(orderable) {
        //         var canFulfillForMeByOrderable = canFulfillForMeMap[orderable.id];
        //         orderable.versionNumber = orderable.meta.versionNumber;
        //         Object.values(canFulfillForMeByOrderable).forEach(function(canFulfillForMe) {
        //             addedShipmentLineItems.push(new ShipmentLineItem({
        //                 lot: canFulfillForMe.lot,
        //                 orderable: orderable,
        //                 quantityShipped: 0,
        //                 canFulfillForMe: canFulfillForMe
        //             }));
        //         });
        //     });
        //     return addedShipmentLineItems;
        // }

        // function mapCanFulfillForMe(summaries) {
        //     var canFulfillForMeMap = {};
        //     summaries.forEach(function(summary) {
        //         summary.canFulfillForMe.forEach(function(canFulfillForMe) {
        //             var orderableId = canFulfillForMe.orderable.id,
        //                 lotId = canFulfillForMe.lot ? canFulfillForMe.lot.id : undefined;
        //             if (!canFulfillForMeMap[orderableId]) {
        //                 canFulfillForMeMap[orderableId] = {};
        //             }
        //             canFulfillForMeMap[orderableId][lotId] = canFulfillForMe;
        //         });
        //     });
        //     return canFulfillForMeMap;
        // }
        // #374: ends here

        // #287: Warehouse clerk can skip some products in order
        function skipAllLineItems() {
            vm.tableLineItems.forEach(function(tableLineItem) {
                if (tableLineItem.isMainGroup && !tableLineItem.skipped && canSkip(tableLineItem)) {
                    tableLineItem.skipped = true;
                    changeSkipStatus(tableLineItem);
                }
            });
        }

        function unskipAllLineItems() {
            vm.tableLineItems.forEach(function(tableLineItem) {
                if (tableLineItem.isMainGroup && tableLineItem.skipped && canSkip(tableLineItem)) {
                    tableLineItem.skipped = false;
                    changeSkipStatus(tableLineItem);
                }
            });
        }

        function changeSkipStatus(tableLineItem) {
            if (tableLineItem.lineItems) {
                tableLineItem.lineItems.forEach(function(lineItem) {
                    lineItem.skipped = tableLineItem.skipped;
                    if (lineItem instanceof ShipmentViewLineItemGroup) {
                        changeSkipStatus(lineItem);
                    } else {
                        lineItem.shipmentLineItem.skipped = tableLineItem.skipped;
                    }
                });
            }
            vm.shipment.order.orderLineItems.forEach(function(orderLineItem) {
                if (orderLineItem.orderable.productCode === tableLineItem.productCode) {
                    orderLineItem.skipped = tableLineItem.skipped;
                }
            });
        }

        function canSkip(tableLineItem) {
            if (!tableLineItem.lineItems || tableLineItem.lineItems.length === 0) {
                return true;
            }
            var result = true;
            tableLineItem.lineItems.forEach(function(lineItem) {
                if (lineItem instanceof ShipmentViewLineItemGroup) {
                    result = canSkip(lineItem);
                } else if (!isEmpty(lineItem.shipmentLineItem.quantityShipped)) {
                    result = false;
                }
            });
            return result;
        }

        function searchTable() {
            if (!vm.keyword) {
                return vm.tableLineItems;
            }
            var displayItems = [];
            var show = false;
            vm.tableLineItems.forEach(function(lineItem) {
                if (lineItem instanceof ShipmentViewLineItemGroup) {
                    show = lineItem.hasKeyword(vm.keyword);
                }
                if (show) {
                    displayItems.push(lineItem);
                }
            });
            return displayItems;
        }

        vm.search = function() {
            vm.displayTableLineItems = searchTable();
        };

        vm.cancelFilter = function() {
            vm.keyword = null;
            vm.displayTableLineItems = searchTable();
        };

        function isFormInvalid() {
            return vm.tableLineItems.some(function(lineItem) {
                if (lineItem instanceof ShipmentViewLineItemGroup) {
                    return false;
                }
                var quantityError = getLineItemQuantityInvalidMessage(lineItem);
                return !isEmpty(quantityError);
            });
        }

        function getLineItemQuantityInvalidMessage(tableLineItem) {
            if (tableLineItem.isSkipped) {
                return '';
            }
            var quantityShipped = _.get(tableLineItem, ['shipmentLineItem', 'quantityShipped']);
            var stockOnHand = _.get(tableLineItem, ['shipmentLineItem', 'stockOnHand'], 0);
            var reservedStock = _.get(tableLineItem, ['shipmentLineItem', 'reservedStock'], 0);
            // check required
            if (quantityShipped === undefined || quantityShipped === null) {
                return 'shipment.required';
            }
            // check input number valid
            if (quantityShipped + reservedStock > stockOnHand) {
                return 'shipment.fillQuantityCannotExceedStockOnHand';
            }
            return '';
        }

        function isEmpty(data) {
            return data === undefined || data === null || data.toString().trim() === '';
        }
    }
})();
