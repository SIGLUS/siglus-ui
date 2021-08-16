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

    angular
        .module('stock-card')
        .service('stockCardDataService', stockCardDataService);

    stockCardDataService.$inject = ['openlmisDateFilter'];

    function stockCardDataService(openlmisDateFilter) {
        // only save one stock card
        this.stockCardHolder = {};
        this.summariesHolder = {};
        this.setStockCard = function(stateParams, stockCard) {
            this.stockCardHolder = {
                isViewProductCard: stateParams.isViewProductCard,
                facility: stateParams.facility,
                orderable: stateParams.orderable,
                stockCardId: stateParams.stockCardId,
                stockCard: stockCard
            };

        };
        this.getStockCard = function(stateParams) {
            var result = _.isMatch(this.stockCardHolder, {
                isViewProductCard: stateParams.isViewProductCard,
                facility: stateParams.facility,
                orderable: stateParams.orderable,
                stockCardId: stateParams.stockCardId
            });

            return result ? this.stockCardHolder.stockCard : undefined;
        };

        this.setSummary = function(stateParams, summary) {
            this.summariesHolder = {
                facilityId: stateParams.facilityId,
                programId: stateParams.programId,
                summary: summary
            };

        };
        this.getSummary = function(stateParams) {
            var result = _.isMatch(this.summariesHolder, {
                facilityId: stateParams.facilityId,
                programId: stateParams.programId
            });

            if (result) {
                return this.getDisplaySummary(stateParams);
            }
            return undefined;
        };
        this.getDisplaySummary = function(stateParams) {
            var page = parseInt(stateParams.page);
            var size = parseInt(stateParams.size);
            var content = this.summariesHolder.summary.content.slice(page * size, (page + 1) * size);
            var totalElements = this.summariesHolder.summary.totalElements;
            if (stateParams.keyword) {
                stateParams.keyword =  stateParams.keyword.trim();
                var filterContent = this.filterSummaryByKeyword(this.summariesHolder.summary.content,
                    stateParams.keyword);
                totalElements = filterContent.length;
                if ((page + 1) > Math.ceil(totalElements / size)) {
                    page = 0;
                }
                content = filterContent.slice(page * size, (page + 1) * size);
            }
            var totalPages = Math.ceil(totalElements / size);
            return {
                size: size,
                number: page,
                content: content,
                totalElements: totalElements,
                totalPages: totalPages
            };
        };
        this.filterSummaryByKeyword = function(stockCardSummarys, keyword) {
            var filterResult = [];
            _.forEach(stockCardSummarys, function(stockCardSummary) {
                var searchableFields = [
                    stockCardSummary.orderable.productCode,
                    stockCardSummary.orderable.fullProductName,
                    stockCardSummary.stockOnHand ? stockCardSummary.stockOnHand.toString() : ''
                ];
                var search = _.any(searchableFields, function(field) {
                    return field.toLowerCase().contains(keyword.toLowerCase());
                });
                if (search) {
                    filterResult.push(stockCardSummary);
                } else {
                    var fulfills = filterFulfill(stockCardSummary.canFulfillForMe, keyword);
                    if (fulfills && fulfills.length > 0) {
                        var copyStockCardSummary = angular.copy(stockCardSummary);
                        copyStockCardSummary.canFulfillForMe = fulfills;
                        filterResult.push(copyStockCardSummary);
                    }
                }
            });
            return filterResult;
        };

        this.clear = function() {
            this.stockCardHolder = {};
            this.summariesHolder = {};
        };

        function filterFulfill(fulfills, keyword) {
            return _.filter(fulfills, function(fulfill) {
                var fulfillSearchableFields = [
                    fulfill.lot && fulfill.lot.expirationDate ? openlmisDateFilter(fulfill.lot.expirationDate) : '',
                    fulfill.lot && fulfill.lot.lotCode ? fulfill.lot.lotCode : '',
                    fulfill.lot && fulfill.stockOnHand ? fulfill.stockOnHand.toString() : ''
                ];
                return _.any(fulfillSearchableFields, function(field) {
                    return field.toLowerCase().contains(keyword.toLowerCase());
                });
            });
        }
    }

})();
