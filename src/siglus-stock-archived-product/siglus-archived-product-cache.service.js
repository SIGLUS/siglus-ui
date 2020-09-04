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
     * @name siglus-stock-archived-product.siglusArchivedProductCacheService
     *
     * @description
     * Stores archived products locally.
     */
    angular
        .module('siglus-stock-archived-product')
        .service('siglusArchivedProductCacheService', siglusArchivedProductCacheService);

    siglusArchivedProductCacheService.$inject = ['localStorageFactory'];

    function siglusArchivedProductCacheService(localStorageFactory) {

        var offlineArchivedProducts = localStorageFactory('archivedProducts');

        this.cacheArchivedOrderables = cacheArchivedOrderables;
        this.getArchivedOrderables = getArchivedOrderables;

        /**
         * @ngdoc method
         * @methodOf siglus-stock-archived-product.siglusArchivedProductCacheService
         * @name cacheArchivedOrderables
         *
         * @description
         * Caches given archived products in the local storage.
         *
         * @param {string} facilityId  the ID of the request facility
         * @param {Object} archivedProducts the archived products to be cached
         */
        function cacheArchivedOrderables(facilityId, archivedProducts) {
            offlineArchivedProducts.put({
                id: facilityId,
                archivedProducts: archivedProducts
            });
        }

        /**
         * @ngdoc method
         * @methodOf siglus-stock-archived-product.siglusArchivedProductCacheService
         * @name getArchivedOrderables
         *
         * @description
         * Fetches the archived products with the given ID.
         *
         * @param {string} facilityId  the ID of the request facility
         * @return {Object} the matching archived products
         */
        function getArchivedOrderables(facilityId) {
            return offlineArchivedProducts.getBy('id', facilityId).archivedProducts;
        }
    }
})();
