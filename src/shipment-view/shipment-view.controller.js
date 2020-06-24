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
        'stockCardSummaries', 'ShipmentViewLineItemFactory', 'orderService', 'ShipmentLineItem'
        // #264: ends here
    ];

    function ShipmentViewController(shipment, loadingModalService, $state, $window,
                                    fulfillmentUrlFactory, messageService, accessTokenFactory,
                                    updatedOrder, QUANTITY_UNIT, tableLineItems, VVM_STATUS,
                                    selectProductsModalService, OpenlmisArrayDecorator, alertService, $q,
                                    stockCardSummaries, ShipmentViewLineItemFactory, orderService,
                                    ShipmentLineItem) {
        var vm = this;

        vm.$onInit = onInit;
        vm.showInDoses = showInDoses;
        vm.getSelectedQuantityUnitKey = getSelectedQuantityUnitKey;
        vm.getVvmStatusLabel = VVM_STATUS.$getDisplayName;
        vm.printShipment = printShipment;
        // #264: warehouse clerk can add product to orders
        vm.addProducts = addProducts;
        // #264: ends here

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
                    loadingModalService.open();
                    var orderableIds = selectedProducts.map(function(orderable) {
                        return orderable.id;
                    });
                    return orderService.getOrderableLineItem(vm.order.id, orderableIds);
                })
                .then(extendResponse(availableProducts))
                .then(function(result) {
                    var addedShipmentLineItems = prepareShipmentLineItems(result);
                    var addedOrderLineItems = result.map(function(item) {
                        return item.orderLineItem;
                    });
                    var addedOrderLineItemsShipment = Object.assign({}, shipment, {
                        lineItems: addedShipmentLineItems,
                        order: {
                            orderLineItems: addedOrderLineItems
                        }
                    });
                    var addedTableLineItems = new ShipmentViewLineItemFactory()
                        .createFrom(addedOrderLineItemsShipment, stockCardSummaries);
                    shipment.lineItems = shipment.lineItems.concat(addedShipmentLineItems);
                    vm.order.orderLineItems = vm.order.orderLineItems.concat(addedOrderLineItems);
                    vm.tableLineItems = vm.tableLineItems.concat(addedTableLineItems);
                    loadingModalService.close();
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

        function prepareShipmentLineItems(createLineItemResponse) {
            var addedShipmentLineItems = [];
            var canFulfillForMeMap = mapCanFulfillForMe(stockCardSummaries);
            createLineItemResponse.forEach(function(item) {
                item.lots.forEach(function(lot) {
                    addedShipmentLineItems.push(new ShipmentLineItem({
                        lot: lot,
                        orderable: item.orderLineItem.orderable,
                        quantityShipped: 0,
                        canFulfillForMe: canFulfillForMeMap[item.orderLineItem.orderable.id][lot.id]
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

        function extendResponse(availableProducts) {
            return function(response) {
                response.forEach(function(item) {
                    var addedOrderable = availableProducts.find(function(orderable) {
                        return orderable.id === item.orderLineItem.orderable.id;
                    });
                    angular.extend(item.orderLineItem.orderable, addedOrderable);
                });
                return response;
            };
        }
        // #264: ends here
    }
})();
