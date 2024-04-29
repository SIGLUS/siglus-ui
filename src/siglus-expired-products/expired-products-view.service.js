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
     * @name siglus-expired-products.ExpiredProductsViewService
     *
     * @description
     * Application layer service that prepares domain objects to be used on the view.
     */
    angular
        .module('siglus-expired-products')
        .service('expiredProductsViewService', ExpiredProductsViewService);

    ExpiredProductsViewService.inject = ['$filter', '$resource', 'stockmanagementUrlFactory'];

    function ExpiredProductsViewService($resource, stockmanagementUrlFactory) {
        var resource = $resource(stockmanagementUrlFactory(), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/facility/:id/lots'),
                isArray: true
            }
        });

        this.getExpiredProducts = getExpiredProducts;
        function getExpiredProducts(facilityId) {
            return resource.get({
                id: facilityId,
                expired: true
            }).$promise.then(function(expiredProducts) {
                expiredProducts.forEach(function(product) {
                    product.skipped = false;
                });
                return expiredProducts;
            });
        }
    }

})();
