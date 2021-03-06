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

    stockCardDataService.$inject = [];

    function stockCardDataService() {
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
            var totalElements = this.summariesHolder.summary.totalElements;
            var totalPages = Math.ceil(totalElements / size);
            return {
                size: size,
                number: page,
                content: this.summariesHolder.summary.content.slice(page * size, (page + 1) * size),
                totalElements: totalElements,
                totalPages: totalPages
            };
        };

        this.clear = function() {
            this.stockCardHolder = {};
            this.summariesHolder = {};
        };
    }

})();
