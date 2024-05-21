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

    function config($stateProvider, FULFILLMENT_RIGHTS, selectProductsModalStateProvider) {
        selectProductsModalStateProvider.stateWithAddOrderablesChildState(
            'openlmis.orders.locationShipmentView', {
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
                    displayTableLineItems: undefined,
                    locations: undefined,
                    keyword: undefined
                },
                areAllRightsRequired: false,
                resolve: {
                    facility: function(facilityFactory) {
                        return facilityFactory.getUserHomeFacility();
                    },
                    order: function(orderRepository, $stateParams) {
                        if (!$stateParams.order) {
                            return orderRepository.get($stateParams.id).then(function(data) {
                                return _.omit(data, ['$promise', '$resolved']);
                            });
                        }
                        return $stateParams.order;
                    },
                    summaryRequestBody: function(order) {
                        var orderableIds = order.availableProducts.map(function(orderable) {
                            return orderable.id;
                        });
                        return {
                            programId: order.program.id,
                            facilityId: order.supplyingFacility.id,
                            orderableId: orderableIds,
                            orderId: order.id
                        };
                    },
                    stockCardSummaries: function($stateParams, StockCardSummaryRepositoryImpl, summaryRequestBody) {
                        if ($stateParams.stockCardSummaries === undefined || $stateParams.stockCardSummaries === null) {
                            return new StockCardSummaryRepositoryImpl()
                                .queryWithStockCardsForLocation(summaryRequestBody)
                                .then(function(page) {
                                    return page;
                                });
                        }
                        return $stateParams.stockCardSummaries;
                    },
                    locations: function(siglusLocationCommonApiService, order, $stateParams) {
                        if ($stateParams.locations) {
                            return $stateParams.locations;
                        }
                        var orderableIds = _.map(order.orderLineItems, function(lineItem) {
                            return lineItem.orderable.id;
                        });
                        return siglusLocationCommonApiService.getOrderableLocationLotsInfo({
                            isAdjustment: false,
                            extraData: true
                        }, orderableIds);
                    },
                    shipment: function(SiglusLocationViewService, order, stockCardSummaries,
                        $stateParams, ORDER_STATUS) {
                        if (!$stateParams.shipment) {
                            var orderWithoutAvailableProducts = angular.copy(order);
                            delete orderWithoutAvailableProducts.availableProducts;

                            if (_.includes([ORDER_STATUS.ORDERED, ORDER_STATUS.PARTIALLY_FULFILLED], order.status)) {
                                return SiglusLocationViewService.createDraft(order, stockCardSummaries);
                            }

                            if (order.status === ORDER_STATUS.FULFILLING) {
                                return SiglusLocationViewService.getDraftByOrderId(order, stockCardSummaries);
                            }
                        }
                        return $stateParams.shipment;
                    },
                    suggestedQuatity: function(shipmentViewService, $stateParams) {
                        var id = $stateParams.id;
                        return shipmentViewService.getSuggestedQuantity(id);
                    },
                    displayTableLineItems: function($stateParams, shipment, order, locations, prepareRowDataService) {
                        return $stateParams.displayTableLineItems
                            ? $stateParams.displayTableLineItems
                            : prepareRowDataService.prepareGroupLineItems(shipment, locations, order);
                    },
                    filterDisplayTableLineItems: function(paginationService, displayTableLineItems, $stateParams,
                        siglusLocationCommonFilterService) {
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
                            return siglusLocationCommonFilterService
                                .filterList($stateParams.keyword, displayTableLineItems);
                        });
                    },

                    updatedOrder: function(shipment, order, stockCardSummaries, loadingModalService) {
                        var shipmentOrder = order;
                        shipmentOrder.availableProducts = order.availableProducts.map(function(orderable) {
                            var stockCard = stockCardSummaries.find(function(stockCard) {
                                return stockCard.orderable.id === orderable.id;
                            });
                            return stockCard.orderable;
                        });
                        loadingModalService.close();
                        return shipmentOrder;
                    }
                }
            }
        );
    }
})();
