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
     * Responsible for fetching single stock card with line items.
     */
    angular
        .module('stock-card')
        .service('stockCardService', service);

    service.$inject = ['$resource', '$window', 'stockmanagementUrlFactory', 'accessTokenFactory', 'dateUtils'];

    function service($resource, $window, stockmanagementUrlFactory, accessTokenFactory, dateUtils) {
        // SIGLUS-REFACTOR: starts here
        var resource = $resource(
            stockmanagementUrlFactory('/api/siglusintegration/stockCards/:stockCardId'), {}, {
                get: {
                    method: 'GET',
                    transformResponse: transformResponse
                },
                getProductStockCard: {
                    url: stockmanagementUrlFactory('/api/siglusintegration/stockCards/orderable'),
                    method: 'GET'
                },
                archiveProduct: {
                    url: stockmanagementUrlFactory('/api/siglusintegration/archiveProduct/:orderableId'),
                    method: 'POST'
                },
                activateProduct: {
                    url: stockmanagementUrlFactory('/api/siglusintegration/activateProduct/:orderableId'),
                    method: 'POST'
                }
            }
        );

        this.getProductStockCard = getProductStockCard;
        this.archiveProduct = archiveProduct;
        this.activateProduct = activateProduct;
        // SIGLUS-REFACTOR: ends here
        this.getStockCard = getStockCard;
        this.print = print;

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name getStockCard
         *
         * @description
         * Get stock card by id.
         *
         * @param {String} stockCardId stock card UUID
         * @return {Promise} stock card promise.
         */
        function getStockCard(stockCardId) {
            return resource.get({
                stockCardId: stockCardId
            }).$promise;
        }

        function print(stockCardId) {
            var url = stockmanagementUrlFactory('/api/stockCards/' + stockCardId + '/print');
            $window.open(accessTokenFactory.addAccessToken(url), '_blank');
        }

        function transformResponse(data, headers, status) {
            if (status === 200) {
                var stockCard = angular.fromJson(data);
                if (stockCard.lot && stockCard.lot.expirationDate) {
                    stockCard.lot.expirationDate = dateUtils.toDate(stockCard.lot.expirationDate);
                }
                return stockCard;
            }
            return data;
        }

        // SIGLUS-REFACTOR: starts here
        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name getProductStockCard
         *
         * @description
         * Get product stock card by id.
         *
         * @param {String} id orderable id
         * @return {Promise} stock card promise.
         */
        function getProductStockCard(orderableId) {
            return resource.getProductStockCard({
                id: orderableId
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name archiveProduct
         *
         * @description
         * Archive product by id.
         *
         * @param {String} orderableId orderable id
         * @return {Promise} orderable promise.
         */
        function archiveProduct(orderableId) {
            return resource.archiveProduct({
                orderableId: orderableId
            }, {}).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card.stockCardService
         * @name activateProduct
         *
         * @description
         * Activate product by id.
         *
         * @param {String} orderableId orderable id
         * @return {Promise} orderable promise.
         */
        function activateProduct(orderableId) {
            return resource.activateProduct({
                orderableId: orderableId
            }, {}).$promise;
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
