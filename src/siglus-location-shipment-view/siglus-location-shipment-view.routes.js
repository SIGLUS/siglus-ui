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
        .module('siglus-location-shipment-view')
        .config(config);

    config.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS', 'selectProductsModalStateProvider'];

    // #264: warehouse clerk can add product to orders
    function config($stateProvider, FULFILLMENT_RIGHTS, selectProductsModalStateProvider) {
        selectProductsModalStateProvider.stateWithAddOrderablesChildState(
            'openlmis.locationManagement.locationShipmentView', {
                label: 'shipmentView.viewShipment',
                showInNavigation: false,
                url: '/:id/location-shipment?page&size',
                accessRights: [
                    FULFILLMENT_RIGHTS.SHIPMENTS_VIEW,
                    FULFILLMENT_RIGHTS.ORDERS_VIEW
                ],
                views: {
                    '@openlmis': {
                        controller: 'SiglusLocationShipmentViewController',
                        controllerAs: 'vm',
                        templateUrl: 'siglus-location-shipment-view/siglus-location-shipment-view.html'
                    }
                },
                params: {
                    page: '0',
                    size: '10',
                    stockCardSummaries: undefined,
                    shipment: undefined,
                    order: undefined,
                    displayTableLineItems: undefined
                },
                areAllRightsRequired: false,
                resolve: {
                    order: function(orderRepository, $stateParams) {
                        if (!$stateParams.order) {
                            return orderRepository.get($stateParams.id).then(function(data) {
                                return _.omit(data, ['$promise', '$resolved']);
                            });
                        }
                        return $stateParams.order;

                    },
                    stockCardSummaries: function($stateParams, StockCardSummaryRepositoryImpl, order) {
                    // #264: warehouse clerk can add product to orders
                        if ($stateParams.stockCardSummaries) {
                            return $stateParams.stockCardSummaries;
                        }
                        var orderableIds = order.availableProducts.map(function(orderable) {
                            return orderable.id;
                        });

                        return new StockCardSummaryRepositoryImpl().queryWithStockCardsForLocation({
                            programId: order.program.id,
                            facilityId: order.supplyingFacility.id,
                            orderableId: orderableIds
                        })
                            .then(function(page) {
                                return page;
                            });

                    },
                    locations: function(SiglusLocationViewService, order) {
                        var orderableIds = order.availableProducts.map(function(orderable) {
                            return orderable.id;
                        });
                        return SiglusLocationViewService.getOrderableLocationLotsInfo({
                            orderableIds: orderableIds,
                            extraData: true
                        });
                    },

                    orderableLocationLotsMap: function(locations, SiglusLocationCommonUtilsService) {
                        return SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                    },

                    orderableLotsLocationMap: function(SiglusLocationCommonUtilsService, locations) {
                        return SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations);
                    },

                    // #372: Improving Fulfilling Order performance
                    shipment: function(SiglusLocationViewService, order, stockCardSummaries, $stateParams) {
                        if (!$stateParams.shipment) {
                            var orderWithoutAvailableProducts = angular.copy(order);
                            delete orderWithoutAvailableProducts.availableProducts;

                            return SiglusLocationViewService.getDraftByOrderId(order, stockCardSummaries);
                        }
                        return $stateParams.shipment;

                    },
                    displayTableLineItems: function(paginationService, $stateParams,
                        SiglusLocationShipmentViewLineItemFactory, shipment,
                        orderableLocationLotsMap, orderableLotsLocationMap) {
                        var validator = function(group) {
                            return _.every(group, function(lineItem) {
                                return _.chain(lineItem.$error).keys()
                                    .all(function(key) {
                                        return _.isEmpty(lineItem.$error[key]);
                                    })
                                    .value();
                            });
                        };

                        return paginationService.registerList(validator, angular.copy($stateParams), function() {
                            return $stateParams.displayTableLineItems
                                ? $stateParams.displayTableLineItems
                                : new SiglusLocationShipmentViewLineItemFactory().prepareGroupLineItems(shipment,
                                    orderableLocationLotsMap, orderableLotsLocationMap);
                        });
                    },
                    // #264: warehouse clerk can add product to orders
                    updatedOrder: function(shipment, order, stockCardSummaries) {
                        var shipmentOrder = shipment.order;

                        shipmentOrder.availableProducts = order.availableProducts.map(function(orderable) {
                            var stockCard = stockCardSummaries.find(function(stockCard) {
                                return stockCard.orderable.id === orderable.id;
                            });
                            return stockCard.orderable;
                        });
                        return shipmentOrder;
                    }
                // #264: ends here
                }
            }
        );
    }
})();
