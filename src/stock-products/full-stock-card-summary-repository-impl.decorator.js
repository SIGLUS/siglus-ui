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
     * Decorator FullStockCardSummaryRepositoryImpl.
     */
    angular.module('stock-products')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('FullStockCardSummaryRepositoryImpl', decorator);
    }

    decorator.$inject = ['$delegate', 'LotResource', 'OrderableResource', 'OrderableFulfillsResource',
        'SiglusStockCardSummaryResource'];

    function decorator($delegate,  LotResource, OrderableResource, OrderableFulfillsResource,
                       SiglusStockCardSummaryResource) {

        FullStockCardSummaryRepositoryImpl.prototype = $delegate.prototype;

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
        function FullStockCardSummaryRepositoryImpl() {
            this.LotResource = new LotResource();
            this.OrderableResource = new OrderableResource();
            this.orderableFulfillsResource = new OrderableFulfillsResource();

            // SIGLUS-REFACTOR: starts here
            this.resource = new SiglusStockCardSummaryResource();
            // SIGLUS-REFACTOR: ends here

        }

    }
})();
