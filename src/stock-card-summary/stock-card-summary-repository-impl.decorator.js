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

    decorator.$inject = ['$delegate', 'LotResource', 'OrderableResource', 'StockCardSummaryResource'];

    function decorator($delegate,  LotResource, OrderableResource, StockCardSummaryResource) {

        StockCardSummaryRepositoryImpl.prototype = $delegate.prototype;

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
        function StockCardSummaryRepositoryImpl(resource) {
            this.LotResource = new LotResource();
            this.orderableResource = new OrderableResource();

            // SIGLUS-REFACTOR: starts here
            if (resource) {
                this.resource = resource;
            } else {
                this.resource = new StockCardSummaryResource();
            }
            // SIGLUS-REFACTOR: ends here
        }

    }
})();
