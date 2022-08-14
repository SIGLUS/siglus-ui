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
                            orderablesId: orderableIds,
                            extraData: true
                        }).then(function() {
                            var locations = [
                                {
                                    locationId: '4954457b-4331-491b-98f5-76d903a5b481',
                                    locationCode: 'AA25A',
                                    lots: [
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                                            expirationDate: '2022-08-25',
                                            stockOnHand: 1000
                                        },
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5c',
                                            lotCode: 'SEM-LOTE-07A03-09082022-2',
                                            expirationDate: '2022-08-09',
                                            stockOnHand: 1000
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cd8',
                                    locationCode: 'AA25B',
                                    lots: [
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                                            expirationDate: '2022-08-25',
                                            stockOnHand: 678
                                        },
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e89',
                                            lotCode: 'SEM-LOTE-07A03-17082022-4',
                                            expirationDate: '2022-08-17',
                                            stockOnHand: 8000
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cd0',
                                    locationCode: 'AA28B',
                                    lots: [
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                                            lotCode: 'SEM-LOTE-07A03-2508022-1',
                                            expirationDate: '2022-08-25',
                                            stockOnHand: 256
                                        },
                                        {
                                            orderablesId: 'e5fd8d7d-c27a-4984-bbac-a63919a5d1fa',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e67',
                                            lotCode: 'SEM-LOTE-07A03-17082023-4',
                                            expirationDate: '2023-08-17',
                                            stockOnHand: 8000
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cd0',
                                    locationCode: 'AA28B',
                                    lots: [
                                        {
                                            orderablesId: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                                            stockOnHand: 333
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cdc',
                                    locationCode: 'AA23C',
                                    lots: [
                                        {
                                            orderablesId: '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a',
                                            stockOnHand: 567
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cdc',
                                    locationCode: 'AA23C',
                                    lots: [
                                        {
                                            orderablesId: '51d0e915-0b39-49b1-bb14-8999e9d90dad',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                                            lotCode: 'SEM-LOTE-08R01-052023-3',
                                            expirationDate: '2023-06-26',
                                            stockOnHand: 356
                                        }
                                    ]
                                },
                                {
                                    locationId: 'a7195103-2abc-4ebb-863b-893ac3ab0cdc',
                                    locationCode: 'AA35C',
                                    lots: [
                                        {
                                            orderablesId: '51d0e915-0b39-49b1-bb14-8999e9d90dad',
                                            lotId: '83e4bbcf-4d7f-4ca2-a25a-9ab3d7062e5a',
                                            lotCode: 'SEM-LOTE-08R01-072023-3',
                                            expirationDate: '2023-07-18',
                                            stockOnHand: 232
                                        }
                                    ]
                                }
                            ];
                            return locations;
                        });
                    },

                    orderableLocationLotsMap: function(locations, SiglusLocationCommonUtilsService) {
                        return SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
                    },

                    orderableLotsLocationMap: function(SiglusLocationCommonUtilsService, locations) {
                        return SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations);
                    },

                    lotOptions: function(stockCardSummaries) {
                        var options = _.reduce(stockCardSummaries, function(result, summary) {
                            var lotOption = [];
                            _.forEach(summary.stockCardDetails, function(stockCardDetail) {
                                if (stockCardDetail.lot) {
                                    lotOption.push(stockCardDetail.lot);
                                    var newLot = _.clone(stockCardDetail.lot);
                                    newLot.lotCode = 'test lot code';
                                    newLot.expirationDate = '2022-08-26';
                                    newLot.id = '123123';
                                    lotOption.push(newLot);
                                }
                            });
                            var orderableId = summary.orderable.id;
                            if (orderableId) {
                                result[orderableId] = lotOption;
                            }
                            return result;

                        }, {});
                        return options;
                    },
                    // #372: Improving Fulfilling Order performance
                    shipment: function(siglusLocationShipmentViewService, order, stockCardSummaries, $stateParams) {
                        if (!$stateParams.shipment) {
                            var orderWithoutAvailableProducts = angular.copy(order);
                            delete orderWithoutAvailableProducts.availableProducts;
                            return siglusLocationShipmentViewService
                                .getShipmentForOrder(orderWithoutAvailableProducts, stockCardSummaries);
                        }
                        return $stateParams.shipment;

                    },
                    displayTableLineItems: function(paginationService, $stateParams,
                        SiglusLocationShipmentViewLineItemFactory, shipment) {
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
                                : new SiglusLocationShipmentViewLineItemFactory().prepareGroupLineItems(shipment);
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
