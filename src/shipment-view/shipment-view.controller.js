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
        'shipment', 'loadingModalService', '$state', '$window', 'fulfillmentUrlFactory',
        'messageService', 'accessTokenFactory', 'updatedOrder', 'QUANTITY_UNIT', 'tableLineItems',
        'VVM_STATUS',
        // #264: warehouse clerk can add product to orders
        'selectProductsModalService', 'OpenlmisArrayDecorator', 'alertService', '$q',
        'stockCardSummaries', 'ShipmentViewLineItemFactory', 'orderService', 'ShipmentLineItem',
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        'ShipmentViewLineItemGroup', 'siglusGoBackService'
        // #287: ends here
    ];

    function ShipmentViewController(shipment, loadingModalService, $state, $window,
                                    fulfillmentUrlFactory, messageService, accessTokenFactory,
                                    updatedOrder, QUANTITY_UNIT, tableLineItems, VVM_STATUS,
                                    selectProductsModalService, OpenlmisArrayDecorator, alertService, $q,
                                    stockCardSummaries, ShipmentViewLineItemFactory, orderService,
                                    ShipmentLineItem, ShipmentViewLineItemGroup, siglusGoBackService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.getVvmStatusLabel = VVM_STATUS.$getDisplayName;
        vm.printShipment = printShipment;
        // #264: warehouse clerk can add product to orders
        vm.addProducts = addProducts;
        // #264: ends here
        // #287: Warehouse clerk can skip some products in order
        vm.changeSkipStatus = changeSkipStatus;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        vm.canSkip = canSkip;
        vm.backToPrevious = siglusGoBackService.goBack;
        // #287: ends here

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
            vm.order = updatedOrder;
            vm.shipment = shipment;
            vm.tableLineItems = tableLineItems;
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

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name printShipment
         *
         * @description
         * Prints the shipment.
         *
         * @return {Promise} the promise resolved when print is successful, rejected otherwise
         */
        function printShipment() {
            var popup = $window.open('', '_blank');
            popup.document.write(messageService.get('shipmentView.saveDraftPending'));

            return shipment.save()
                .then(function(response) {
                    popup.location.href = accessTokenFactory.addAccessToken(getPrintUrl(response.id));
                });
        }

        function getPrintUrl(shipmentId) {
            return fulfillmentUrlFactory(
                '/api/reports/templates/common/583ccc35-88b7-48a8-9193-6c4857d3ff60/pdf?shipmentDraftId=' + shipmentId
            );
        }

        // #264: warehouse clerk can add product to orders
        function addProducts() {
            var availableProducts = getAvailableProducts();
            selectProducts({
                products: availableProducts
            })
                .then(function(selectedProducts) {
                    var addedShipmentLineItems = prepareShipmentLineItems(selectedProducts);
                    var addedOrderLineItems = prepareOrderLineItems(selectedProducts);
                    var addedOrderLineItemsShipment = Object.assign({}, shipment, {
                        lineItems: addedShipmentLineItems,
                        order: {
                            orderLineItems: addedOrderLineItems
                        }
                    });
                    var addedTableLineItems = new ShipmentViewLineItemFactory()
                        .createFrom(addedOrderLineItemsShipment, stockCardSummaries);
                    addedShipmentLineItems.forEach(function(shipmentLineItem) {
                        shipment.lineItems.push(shipmentLineItem);
                    });
                    vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
                    vm.tableLineItems = vm.tableLineItems.concat(addedTableLineItems);
                });
        }

        function selectProducts(availableProducts) {
            var decoratedAvailableProducts = new OpenlmisArrayDecorator(availableProducts.products);
            decoratedAvailableProducts.sortBy('fullProductName');

            if (!availableProducts.products.length) {
                alertService.error(
                    'shipmentView.noProductsToAdd.label',
                    'shipmentView.noProductsToAdd.message'
                );
                return $q.reject();
            }

            return selectProductsModalService.show({
                products: decoratedAvailableProducts,
                limit: vm.order.emergency ? {
                    max: 10 - vm.order.orderLineItems.length,
                    errorMsg: 'shipmentView.selectTooMany'
                } : undefined
            });
        }

        function getAvailableProducts() {
            var existedOrderableMap = {};
            vm.order.orderLineItems.forEach(function(lineItem) {
                existedOrderableMap[lineItem.orderable.id] = lineItem.orderable;
            });
            return vm.order.availableProducts.filter(function(orderable) {
                return !(orderable.id in existedOrderableMap);
            });
        }

        function prepareOrderLineItems(selectedProducts) {
            return selectedProducts.map(function(orderable) {
                return {
                    orderedQuantity: 0,
                    orderable: orderable,
                    partialFulfilledQuantity: 0
                };
            });
        }
        // #264: ends here

        // #374: confirm shipment effect soh
        function prepareShipmentLineItems(selectedProducts) {
            var addedShipmentLineItems = [];
            var canFulfillForMeMap = mapCanFulfillForMe(stockCardSummaries);
            selectedProducts.forEach(function(orderable) {
                var canFulfillForMeByOrderable = canFulfillForMeMap[orderable.id];
                orderable.versionNumber = orderable.meta.versionNumber;
                Object.values(canFulfillForMeByOrderable).forEach(function(canFulfillForMe) {
                    addedShipmentLineItems.push(new ShipmentLineItem({
                        lot: canFulfillForMe.lot,
                        orderable: orderable,
                        quantityShipped: 0,
                        canFulfillForMe: canFulfillForMe
                    }));
                });
            });
            return addedShipmentLineItems;
        }

        function mapCanFulfillForMe(summaries) {
            var canFulfillForMeMap = {};
            summaries.forEach(function(summary) {
                summary.canFulfillForMe.forEach(function(canFulfillForMe) {
                    var orderableId = canFulfillForMe.orderable.id,
                        lotId = canFulfillForMe.lot ? canFulfillForMe.lot.id : undefined;
                    if (!canFulfillForMeMap[orderableId]) {
                        canFulfillForMeMap[orderableId] = {};
                    }
                    canFulfillForMeMap[orderableId][lotId] = canFulfillForMe;
                });
            });
            return canFulfillForMeMap;
        }
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
            tableLineItem.lineItems.forEach(function(lineItem) {
                lineItem.skipped = tableLineItem.skipped;
                if (lineItem instanceof ShipmentViewLineItemGroup) {
                    changeSkipStatus(lineItem);
                } else {
                    lineItem.shipmentLineItem.skipped = tableLineItem.skipped;
                }
            });
            vm.shipment.order.orderLineItems.forEach(function(orderLineItem) {
                if (orderLineItem.orderable.productCode === tableLineItem.productCode) {
                    orderLineItem.skipped = tableLineItem.skipped;
                }
            });
        }

        function canSkip(tableLineItem) {
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

        function isEmpty(value) {
            return !value || !value.toString().trim();
        }
        // #287: ends here
    }
})();
