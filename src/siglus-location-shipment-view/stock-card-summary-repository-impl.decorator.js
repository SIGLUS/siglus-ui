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
     * @name shipment-view.StockCardSummaryRepositoryImpl
     *
     * @description
     * Extends stock card summary repository implementation with the ability to query for them with
     * the stock cards.
     */
    angular
        .module('siglus-location-shipment-view')
        .config(function($provide) {
            $provide.decorator('StockCardSummaryRepositoryImpl', decorator);
        });

    decorator.$inject = ['$delegate', 'StockCardResource', 'siglusProductOrderableGroupService',
        'STOCKMANAGEMENT_RIGHTS'];

    function decorator($delegate, StockCardResource, siglusProductOrderableGroupService,
                       STOCKMANAGEMENT_RIGHTS) {
        var StockCardSummaryRepositoryImpl = $delegate;

        StockCardSummaryRepositoryImpl.prototype.queryWithStockCards = queryWithStockCards;

        StockCardSummaryRepositoryImpl.prototype.queryWithStockCardsForLocation = queryWithStockCardsForLocation;

        return StockCardSummaryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf shipment-view.StockCardSummaryRepositoryImpl
         * @name queryWithStockCards
         *
         * @description
         * Queries OpenLMIS server and fetches a list of matching stock card summaries extended with
         * the stock cards
         *
         * @param {Object} params the search parameters
         */
        function queryWithStockCardsForLocation(params) {
            var paramsCopy = {};
            paramsCopy.facilityId = params.facilityId;
            paramsCopy.programId = '00000000-0000-0000-0000-000000000000';
            paramsCopy.nonEmptyOnly = true;
            paramsCopy.excludeArchived = true;
            paramsCopy.rightName = STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW;
            paramsCopy.page = 0;
            paramsCopy.size = 2147483647;
            return siglusProductOrderableGroupService.queryStockOnHandsInfo(paramsCopy).then(function(page) {
                var stockCardIds = new Set();
                _.forEach(page, function(summary) {
                    summary.stockCardDetails.forEach(function(stockCardDetail) {
                        stockCardIds.add(stockCardDetail.stockCard.id);
                    });
                });

                return new StockCardResource().query({
                    id: Array.from(stockCardIds)
                })
                    .then(function(response) {
                        var stockCardsMap = response.content.reduce(function(stockCardsMap, stockCard) {
                            stockCardsMap[stockCard.id] = stockCard;
                            return stockCardsMap;
                        }, {});

                        _.forEach(page, function(summary) {
                            _.forEach(summary.stockCardDetails, function(stockCardDetail) {
                                stockCardDetail.stockCard = stockCardsMap[stockCardDetail.stockCard.id];
                            });
                        });

                        return page;
                    });
            });
        }

        function queryWithStockCards(params) {
            var paramsCopy = {};
            paramsCopy.facilityId = params.facilityId;
            paramsCopy.programId = '00000000-0000-0000-0000-000000000000';
            paramsCopy.nonEmptyOnly = true;
            paramsCopy.excludeArchived = true;
            paramsCopy.rightName = STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW;
            paramsCopy.page = 0;
            paramsCopy.size = 2147483647;
            return siglusProductOrderableGroupService.queryStockOnHandsInfo(paramsCopy)
                .then(function(page) {
                    var stockCardIds = new Set();
                    page.forEach(function(summary) {
                        summary.canFulfillForMe = summary.stockCardDetails;
                        summary.stockCardDetails = [];
                        summary.canFulfillForMe.forEach(function(canFulfillForMe) {
                            stockCardIds.add(canFulfillForMe.stockCard.id);
                        });
                    });

                    return new StockCardResource().query({
                        id: Array.from(stockCardIds)
                    })
                        .then(function(response) {
                            var stockCardsMap = response.content.reduce(function(stockCardsMap, stockCard) {
                                stockCardsMap[stockCard.id] = stockCard;
                                return stockCardsMap;
                            }, {});

                            page.forEach(function(summary) {
                                summary.canFulfillForMe.forEach(function(canFulfillForMe) {
                                    canFulfillForMe.stockCard = stockCardsMap[canFulfillForMe.stockCard.id];
                                });
                            });

                            return page;
                        });
                });
        }
    }

})();
