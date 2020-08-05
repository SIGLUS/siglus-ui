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
     * @name stock-card-summary.StockCardSummaryRepositoryImpl
     *
     * @description
     * Decorator StockCardSummaryRepositoryImpl.
     */
    angular.module('stock-card-summary')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('StockCardSummaryRepositoryImpl', decorator);
    }

    decorator.$inject = ['$delegate', 'LotResource', 'SiglusOrderableResource', 'SiglusStockCardSummaryResource',
        '$window', 'accessTokenFactory', 'stockmanagementUrlFactory'];

    function decorator($delegate,  LotResource, SiglusOrderableResource, SiglusStockCardSummaryResource, $window,
                       accessTokenFactory, stockmanagementUrlFactory) {

        StockCardSummaryRepositoryImpl.prototype = $delegate.prototype;
        StockCardSummaryRepositoryImpl.prototype.print = print;

        return StockCardSummaryRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepositoryImpl
         * @name StockCardSummaryRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an instance of the StockCardSummaryRepositoryImpl class.
         */
        function StockCardSummaryRepositoryImpl() {
            this.LotResource = new LotResource();
            this.orderableResource = new SiglusOrderableResource();
            this.resource = new SiglusStockCardSummaryResource();
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary.StockCardSummaryRepositoryImpl
         * @name print
         *
         * @description
         * Opens window with Stock Card Summaries.
         *
         * @param {string} program  the program UUID the stock cards will be retrieved
         * @param {string} facility the facility UUID the stock cards will be retrieved
         */
        function print(program, facility) {
            var sohPrintUrl = '/api/siglusapi/stockCardSummaries/print',
                params = 'program=' + program + '&' + 'facility=' + facility;
            $window.open(accessTokenFactory.addAccessToken(
                stockmanagementUrlFactory(sohPrintUrl + '?' + params)
            ), '_blank');
        }

    }
})();
