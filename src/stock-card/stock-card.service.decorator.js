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
     * @name stock-card.stockCardService
     *
     * @description
     * Decorator stockCardService
     */
    angular.module('stock-card')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('stockCardService', decorator);
    }

    decorator.$inject = ['$delegate', '$resource', 'stockmanagementUrlFactory'];
    function decorator($delegate, $resource, stockmanagementUrlFactory) {
        var resource = $resource(stockmanagementUrlFactory('/api/stockCards/orderable'), {}, {
            get: {
                method: 'GET'
            }
        });
        var stockCardService = $delegate;

        stockCardService.getProductStockCard = getProductStockCard;

        return stockCardService;

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name getProductStockCard
         *
         * @description
         * Get product stock card.
         */
        function getProductStockCard(productId, programId) {
            return resource.get({
                id: productId,
                programId: programId
            }).$promise;
        }
    }
})();
