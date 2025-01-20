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
        'StockCardSummaryRepositoryImpl', 'SiglusShipmentDraftService',
        'notificationService', 'confirmService', 'stateTrackerService', 'orderService', 'messageService',
        'siglusShipmentConfirmModalService', 'alertConfirmModalService', 'siglusOrderableLotListService'
    ];

    function ShipmentViewController(
        shipment, loadingModalService, $state, $window, $stateParams, order,
        QUANTITY_UNIT, tableLineItems, displayTableLineItems, selectProductsModalService,
        OpenlmisArrayDecorator, alertService, $q, ShipmentViewLineItemFactory,
        ShipmentLineItem, ShipmentViewLineItemGroup, suggestedQuantity, localStorageService,
        StockCardSummaryRepositoryImpl, SiglusShipmentDraftService,
        notificationService, confirmService, stateTrackerService, orderService, messageService,
        siglusShipmentConfirmModalService, alertConfirmModalService, siglusOrderableLotListService
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.save = save;
        vm.deleteShipmentDraft = deleteShipmentDraft;
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
        vm.search = search;
        vm.cancelFilter = cancelFilter;
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
            vm.facility = _.get(vm.order, 'supplyingFacility');
            vm.program = _.get(vm.order, 'program');
            vm.shipment = shipment;
            var lineItemsWithSuggestedQuantity = suggestedQuantity.orderableIdToSuggestedQuantity ?
                setSuggestedQuantity(tableLineItems) :
                tableLineItems;
            vm.tableLineItems = sortLineItemLotsByExpirationDate(lineItemsWithSuggestedQuantity);
            vm.isShowSuggestedQuantity = suggestedQuantity.showSuggestedQuantity;
            vm.orderableIdToSuggestedQuantity = suggestedQuantity.orderableIdToSuggestedQuantity;
            vm.displayTableLineItems = sortLineItemLotsByExpirationDate(displayTableLineItems);
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

        function sortLineItemLotsByExpirationDate(displayLineItems) {
            var sortedLineItems = [];
            var lineItemsMapByProductCode = _.groupBy(displayLineItems, function(lineItem) {
                return lineItem.productCode;
            });

            for (var key in lineItemsMapByProductCode) {
                if (lineItemsMapByProductCode[key].length === 1) {
                    sortedLineItems = sortedLineItems.concat(lineItemsMapByProductCode[key]);
                    continue;
                }
                var sortedLotLineItems = lineItemsMapByProductCode[key].slice(1).sort(function(item1, item2) {
                    var item1Date = _.get(item1, ['lot', 'expirationDate'], 0);
                    var item2Date = _.get(item2, ['lot', 'expirationDate'], 0);
                    return new Date(item1Date) - new Date(item2Date);
                });
                sortedLineItems.push(lineItemsMapByProductCode[key][0]);
                sortedLineItems = sortedLineItems.concat(sortedLotLineItems);
            }
            return sortedLineItems;
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
                    if (_.get(error, ['data', 'messageKey']) ===
                        'siglusapi.error.shipment.order.line items.invalid') {
                        stockErrorAndRefreshReservedAndSoh();
                    } else {
                        notificationService.error('shipmentView.failedToSaveDraft');
                    }
                    return $q.reject(error);
                });
        }

        function deleteShipmentDraft() {
            return confirmService.confirmDestroy(
                'shipmentView.deleteDraftConfirmation',
                'shipmentView.deleteDraft'
            ).then(function() {
                loadingModalService.open();
                return SiglusShipmentDraftService.deleteShipmentDraft(vm.shipment)
                    .then(function() {
                        notificationService.success('shipmentView.draftHasBeenDeleted');
                        stateTrackerService.goToPreviousState('openlmis.orders.view');
                    })
                    .catch(function() {
                        notificationService.error('shipmentView.failedToDeleteDraft');
                        loadingModalService.close();
                    });
            });
        }

        function saveAndPrintShipment() {
            save().then(function() {
                printShipment();
            });
        }

        function confirm() {
            if (isFormInvalid()) {
                alertService.error('shipmentView.failedToConfirmShipment');
                return $q.reject();
            }

            loadingModalService.open();
            return orderService.getStatus(vm.order.id)
                .then(function(orderStatus) {
                    if (orderStatus.suborder && orderStatus.closed) {
                        return alertService.error('shipmentView.closed');
                    }

                    var partiallyFulfilledProductCount = countPartiallyFulfilledProduct();
                    var isPartialFulfilled = !orderStatus.closed && partiallyFulfilledProductCount > 0;
                    var confirmModalContent =  isPartialFulfilled ?
                        messageService.get('shipmentView.confirmPartialFulfilled.message', {
                            totalPartialLineItems: partiallyFulfilledProductCount
                        }) : 'shipmentView.confirmShipment.question';
                    var confirmModalButtonText = isPartialFulfilled ?
                        'shipmentView.confirmPartialFulfilled.createSuborder' : 'shipmentView.confirmShipment';

                    return siglusShipmentConfirmModalService.confirm(confirmModalContent, confirmModalButtonText)
                        .then(function(signature) {
                            return SiglusShipmentDraftService.confirmShipmentDraft(
                                vm.shipment, signature, isPartialFulfilled
                            )
                                .then(function() {
                                    loadingModalService.close();
                                    var notificationText = isPartialFulfilled ?
                                        'shipmentView.suborderHasBeenConfirmed' :
                                        'shipmentView.shipmentHasBeenConfirmed';
                                    notificationService.success(notificationText);
                                    stateTrackerService.goToPreviousState('openlmis.orders.view');
                                })
                                .catch(function(err) {
                                    loadingModalService.close();
                                    if (_.get(err, ['data', 'messageKey']) === 'siglusapi.error.order.expired') {
                                        alertConfirmModalService.error(
                                            'orderFulfillment.expiredMessage', '',
                                            ['adminFacilityList.close', 'adminFacilityList.confirm']
                                        )
                                            .then(function() {
                                                $state.go('openlmis.orders.fulfillment', $stateParams, {
                                                    reload: true
                                                });
                                            });
                                    } else if (_.get(err, ['data', 'messageKey']) ===
                                    'siglusapi.error.shipment.order.line items.invalid') {
                                        stockErrorAndRefreshReservedAndSoh();
                                    } else {
                                        var notificationErrorText = isPartialFulfilled ?
                                            'shipmentView.failedToCreateSuborder' :
                                            'shipmentView.failedToConfirmShipment';
                                        notificationService.error(notificationErrorText);
                                    }
                                });
                        });
                })
                .catch(loadingModalService.close);
        }

        function countPartiallyFulfilledProduct() {
            var unSkippedMainGroupLineItems = vm.tableLineItems.filter(function(lineItem) {
                return lineItem.isMainGroup && !lineItem.skipped;
            });
            var partiallyFulfilledProducts = unSkippedMainGroupLineItems.filter(function(mainGroupItem) {
                var fillQuantity = mainGroupItem.getFillQuantity();
                var shippedQuantity = fillQuantity + _.get(mainGroupItem, 'partialFulfilledQuantity', 0);
                return shippedQuantity < _.get(mainGroupItem, 'orderQuantity', 0);
            });
            return partiallyFulfilledProducts.length;
        }

        vm.getErrorMsg = function() {
            return 'shipmentView.invalidForm';
        };

        function stockErrorAndRefreshReservedAndSoh() {
            alertService.error('shipmentView.saveDraftError.label', '', 'OK')
                .then(function() {
                    loadingModalService.open();
                    SiglusShipmentDraftService.getShipmentDraftByOrderId(vm.order)
                        .then(function(latestShipment) {
                            var latestLineItems = latestShipment.lineItems;
                            updateShipmentLineItemsWithLatestLineItems(latestLineItems);
                            updateTableLineItemsWithLatestLineItems(latestLineItems);
                            loadingModalService.close();
                        })
                        .catch(loadingModalService.close);
                });
        }

        function updateShipmentLineItemsWithLatestLineItems(latestLineItems) {
            latestLineItems.forEach(function(latestLineItem) {
                var lineItemId = latestLineItem.id;
                var oldLineItemIndex = _.findIndex(vm.shipment.lineItems, function(lineItem) {
                    return lineItem.id === lineItemId;
                });
                if (oldLineItemIndex !== -1) {
                    vm.shipment.lineItems[oldLineItemIndex] = latestLineItem;
                }
            });
        }

        function updateTableLineItemsWithLatestLineItems(latestLineItems) {
            latestLineItems.forEach(function(latestLineItem) {
                var lineItemId = latestLineItem.id;
                var latestReservedStock = latestLineItem.reservedStock;
                var latestStockOnHand = latestLineItem.stockOnHand;
                var oldTableLineItem = _.find(vm.tableLineItems, function(tableLineItem) {
                    return !(tableLineItem instanceof ShipmentViewLineItemGroup)
                            && _.get(tableLineItem, ['shipmentLineItem', 'id']) === lineItemId;
                });
                if (oldTableLineItem) {
                    oldTableLineItem.reservedStock = latestReservedStock;
                    oldTableLineItem.shipmentLineItem.reservedStock = latestReservedStock;
                    oldTableLineItem.shipmentLineItem.stockOnHand = latestStockOnHand;
                }
            });
        }

        // #264: warehouse clerk can add product to orders
        function addProducts() {
            var productsInOrderIdList = _.map(vm.order.orderLineItems, function(lineItem) {
                return _.get(lineItem, ['orderable', 'id']);
            });
            var availableProductsCanAdd = _.sortBy(
                _.filter(vm.order.availableProducts, function(product) {
                    return !productsInOrderIdList.includes(product.id);
                }),
                function(product) {
                    return _.get(product, ['productCode'], '');
                }
            );

            if (availableProductsCanAdd.length === 0) {
                alertService.error(
                    'shipmentView.noProductsToAdd.label',
                    'shipmentView.noProductsToAdd.message'
                );
                return;
            }

            selectProductsModalService.show({
                products: availableProductsCanAdd,
                limit: vm.order.emergency ? {
                    max: 10 - vm.order.orderLineItems.length,
                    errorMsg: 'shipmentView.selectTooMany'
                } : undefined
            }).then(function(selectedProducts) {
                var orderableIds = selectedProducts.map(function(product) {
                    return product.id;
                });
                loadingModalService.open();
                siglusOrderableLotListService.getOrderableLots(vm.facility.id, orderableIds)
                    .then(function(lotList) {
                        var withSohLotList = lotList.filter(function(lot) {
                            return _.get(lot, 'soh', 0) > 0;
                        });
                        var lotsMapByOrderableId =
                            siglusOrderableLotListService.getLotsMapByOrderableId(withSohLotList);

                        updateOrderLineItemsWithAddedProducts(selectedProducts);
                        updateShipmentLineItemsWithAddedProducts(selectedProducts, lotsMapByOrderableId);
                        updateTableLineItemsWithAddedProducts();
                        loadingModalService.close();
                    })
                    .catch(loadingModalService.close);
            });
        }

        function updateOrderLineItemsWithAddedProducts(addedProducts) {
            var addedOrderLineItems = addedProducts.map(function(product) {
                return {
                    added: true,
                    id: null,
                    orderable: _.assign({}, product, {
                        meta: {
                            versionNumber: product.versionNumber
                        }
                    }),
                    orderedQuantity: 0,
                    partialFulfilledQuantity: 0,
                    totalDispensingUnites: 0,
                    skipped: false
                };
            });
            vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
        }

        function updateShipmentLineItemsWithAddedProducts(addedProducts, lotsMapByOrderableId) {
            var addedShipmentLineItems = [];
            Object.keys(lotsMapByOrderableId).forEach(function(orderableId) {
                var orderable = addedProducts.find(function(product) {
                    return product.id === orderableId;
                });
                var lots = lotsMapByOrderableId[orderableId] || [];
                lots.forEach(function(lot) {
                    lot.id = lot.lotId;
                    addedShipmentLineItems.push({
                        id: null,
                        stockCardId: null,
                        extraData: null,
                        location: null,
                        lot: lot,
                        orderable: orderable || null,
                        quantityShipped: 0,
                        reservedStock: lot.reserved,
                        stockOnHand: lot.soh
                    });
                });
            });
            vm.shipment.lineItems = vm.shipment.lineItems.concat(addedShipmentLineItems);

        }

        function updateTableLineItemsWithAddedProducts() {
            vm.tableLineItems = new ShipmentViewLineItemFactory()
                .buildLineItemsWithMainGroup(vm.order.orderLineItems, vm.shipment.lineItems);
            cancelFilter();
        }

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

        function search() {
            vm.displayTableLineItems = searchTable();
        }

        function cancelFilter() {
            vm.keyword = null;
            vm.displayTableLineItems = searchTable();
        }

        function isFormInvalid() {
            var totalLineItemQuantity = vm.tableLineItems.filter(function(lineItem) {
                return lineItem instanceof ShipmentViewLineItemGroup;
            }).reduce(function(sumQuantity, mainGroupLineItem) {
                return sumQuantity + mainGroupLineItem.getFillQuantity();
            }, 0);
            // total quantity is invalid
            if (totalLineItemQuantity <= 0) {
                return true;
            }

            var isLineItemsQuantityInvalid = vm.tableLineItems.some(function(lineItem) {
                if (lineItem instanceof ShipmentViewLineItemGroup) {
                    return false;
                }
                var quantityError = getLineItemQuantityInvalidMessage(lineItem);
                return !isEmpty(quantityError);
            });
            if (isLineItemsQuantityInvalid) {
                return true;
            }

            return false;
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
