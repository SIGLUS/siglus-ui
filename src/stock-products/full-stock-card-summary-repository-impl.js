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
     * @ngdoc service
     * @name stock-products.FullStockCardSummaryRepositoryImpl
     *
     * @description
     * Implementation of the StockCardSummary interface. Communicates with the REST API of the OpenLMIS server.
     * Adds stock-less trade items and lots to the response.
     */
    angular
        .module('stock-products')
        .factory('FullStockCardSummaryRepositoryImpl', FullStockCardSummaryRepositoryImpl);

    // SIGLUS-REFACTOR: starts here
    FullStockCardSummaryRepositoryImpl.$inject = ['$resource', 'stockmanagementUrlFactory', 'LotResource',
        'OrderableResource', '$q', 'SiglusStockCardSummaryResource', 'siglusArchivedProductService',
        'siglusOrderableLotService'];
    // SIGLUS-REFACTOR: ends here

    function FullStockCardSummaryRepositoryImpl($resource, stockmanagementUrlFactory, LotResource,
                                                OrderableResource, $q, SiglusStockCardSummaryResource,
                                                siglusArchivedProductService, siglusOrderableLotService) {

        FullStockCardSummaryRepositoryImpl.prototype.query = query;

        return FullStockCardSummaryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-products.FullStockCardSummaryRepositoryImpl
         * @name FullStockCardSummaryRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the FullStockCardSummaryRepositoryImpl class.
         */
        function FullStockCardSummaryRepositoryImpl(locationManagementOption) {
            this.LotResource = new LotResource();
            this.OrderableResource = new OrderableResource();
            // SIGLUS-REFACTOR: starts here
            // this.orderableFulfillsResource = new OrderableFulfillsResource();

            this.resource = new SiglusStockCardSummaryResource(locationManagementOption);
        }

        /**
         * @ngdoc method
         * @methodOf stock-products.FullStockCardSummaryRepositoryImpl
         * @name query
         *
         * @description
         * Retrieves a page of stock card summaries from the OpenLMIS server.
         * Communicates with the endpoint of the Stock Cards Summaries V2 REST API.
         * Adds stock-less trade items and lots to the response.
         *
         * @param  {Object}  params request query params
         * @return {Promise}        page of stock card summaries
         */
        function query(params) {
            console.log('FullStockCardSummaryRepositoryImpl query');
            var LotResource = this.LotResource,
                OrderableResource = this.OrderableResource;
                // orderableFulfillsResource = this.orderableFulfillsResource;
            var givenOrderableIds = params.orderableIds;
            delete params.orderableIds;
            return this.resource.query(params)
                .then(function(stockCardSummariesPage) {
                    return addMissingStocklessProducts(stockCardSummariesPage,
                        LotResource, OrderableResource, params.facilityId, givenOrderableIds);
                });
        }

        function handleMissingStocklessProducts(facilityId, summaries, orderablePage, lotPage) {
            return siglusArchivedProductService.getArchivedOrderables(facilityId)
                .then(function(archivedOrderables) {
                    var lotMap = mapLotsByTradeItems(lotPage.content, orderablePage);
                    var orderableMap = mapOrderablesById(orderablePage, archivedOrderables);
                    summaries.content.forEach(function(summary) {
                        addOrderableAndLotInfo(summary, orderableMap, lotPage.content);
                        var orderableId = summary.orderable.id;
                        lotMap[orderableId].forEach(function(lot) {
                            if (!hasOrderableWithLot(summary, orderableId, lot.id)) {
                                summary.canFulfillForMe.push(createCanFulfillForMeEntry(
                                    orderableMap[orderableId], lot
                                ));
                            }
                        });

                        if (!hasOrderableWithLot(summary, orderableId, null)) {
                            summary.canFulfillForMe.push(
                                createCanFulfillForMeEntry(orderableMap[orderableId], null)
                            );
                        }
                    });
                    return summaries;
                });
        }

        function addMissingStocklessProducts(summaries, LotResource,
                                             OrderableResource, facilityId, givenOrderableIds) {
            // var commodityTypeIds = summaries.content.map(function(summary) {
            //     return summary.orderable.id;
            // });
            var identities = summaries.content.map(function(summary) {
                return summary.orderable;
            });
            return OrderableResource.getByVersionIdentities(identities)
                .then(function(orderablePage) {
                    siglusOrderableLotService.setOrderables(orderablePage);
                    if (_.isEmpty(givenOrderableIds)) {
                        return handleMissingStocklessProducts(facilityId, summaries, orderablePage, {
                            content: []
                        });
                    }
                    var tradeItemIds = getTradeItemIdsSet(orderablePage, givenOrderableIds);
                    var deferred = $q.defer();
                    deferred.resolve({
                        content: []
                    });
                    var promise = deferred.promise;
                    if (tradeItemIds.length > 0) {
                        console.log('givenOrderableIds', givenOrderableIds);
                        return siglusOrderableLotService.getFacilityLotsByOrderableIds(facilityId, givenOrderableIds)
                            .then(function(response) {
                                console.log('getFacilityLotsByOrderableIds response', response);
                                return handleMissingStocklessProducts(facilityId, summaries, orderablePage, {
                                    content: response.data
                                });
                            });
                    }
                    return promise.then(function(lotPage) {
                        return handleMissingStocklessProducts(facilityId, summaries, orderablePage, lotPage);
                    });
                });
        }

        // function addGenericOrderables(orderableFulfills, summaries) {
        //     summaries.content.forEach(function(summary) {
        //         if (!orderableFulfills[summary.orderable.id]) {
        //             orderableFulfills[summary.orderable.id] = {
        //                 canFulfillForMe: []
        //             };
        //         }
        //     });
        //
        //     Object.keys(orderableFulfills).forEach(function(commodityTypeId) {
        //         if (orderableFulfills[commodityTypeId].canFulfillForMe) {
        //             orderableFulfills[commodityTypeId].canFulfillForMe.push(commodityTypeId);
        //         }
        //     });
        // }

        // function reduceToOrderableIds(orderableFulfills) {
        //     return Object.keys(orderableFulfills).reduce(function(ids, commodityTypeId) {
        //         if (orderableFulfills[commodityTypeId].canFulfillForMe) {
        //             orderableFulfills[commodityTypeId].canFulfillForMe.forEach(function(tradeItemId) {
        //                 addIfNotExist(ids, tradeItemId);
        //             });
        //             addIfNotExist(ids, commodityTypeId);
        //         }
        //         return ids;
        //     }, []);
        // }
        // SIGLUS-REFACTOR: ends here

        function addIfNotExist(array, item) {
            if (array.indexOf(item) === -1) {
                array.push(item);
            }
        }

        function mapLotsByTradeItems(lots, orderables) {
            return orderables.reduce(function(map, orderable) {
                map[orderable.id] = [];
                if (orderable.identifiers.tradeItem) {
                    lots.forEach(function(lot) {
                        if (lot.tradeItemId.toLowerCase() === orderable.identifiers.tradeItem.toLowerCase()) {
                            map[orderable.id].push(lot);
                        }
                    });
                }
                return map;
            }, {});
        }

        function mapOrderablesById(orderables, archivedOrderables) {
            return orderables.reduce(function(map, orderable) {
                // SIGLUS-REFACTOR: starts here
                orderable.archived = archivedOrderables.includes(orderable.id);
                orderable.isKit = orderable.children.length > 0
                    || _.contains(['26A02', '26B02'], orderable.productCode);
                // SIGLUS-REFACTOR: ends here
                map[orderable.id] = orderable;
                return map;
            }, {});
        }

        function createCanFulfillForMeEntry(orderable, lot) {
            return {
                lot: lot,
                occurredDate: null,
                orderable: orderable,
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            };
        }

        function hasOrderableWithLot(summary, orderableId, lotId) {
            return summary.canFulfillForMe
                .filter(function(summaryEntry) {
                    if (!lotId) {
                        return !summaryEntry.lot && summaryEntry.orderable.id === orderableId;
                    }
                    return summaryEntry.lot &&
                        summaryEntry.lot.id === lotId &&
                        summaryEntry.orderable.id === orderableId;

                }).length > 0;
        }

        function addOrderableAndLotInfo(summary, orderableMap, lots) {
            summary.orderable = orderableMap[summary.orderable.id];

            summary.canFulfillForMe.forEach(function(fulfill) {
                fulfill.orderable = orderableMap[fulfill.orderable.id];

                if (fulfill.lot) {
                    var matched = lots.filter(function(lot) {
                        return lot.id === fulfill.lot.id;
                    })[0];
                    // keep original value if no lot found
                    if (matched) {
                        fulfill.lot = matched;
                    }
                }
            });
        }

        function getTradeItemIdsSet(orderables, givenOrderableIds) {
            return orderables.filter(function(orderable) {
                if (givenOrderableIds) {
                    return _.contains(givenOrderableIds, orderable.id);
                }
                return true;
            }).reduce(function(ids, orderable) {
                if (orderable.identifiers.tradeItem) {
                    addIfNotExist(ids, orderable.identifiers.tradeItem);
                }
                return ids;
            }, []);
        }
    }
})();
