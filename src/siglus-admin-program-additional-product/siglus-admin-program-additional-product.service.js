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
     * @name siglus-admin-program-additional-product.siglusAdminProgramAdditionalProductService
     *
     * @description
     * Responsible for RESTful communication with the Orders endpoint from the OpenLMIS server. Uses
     * URL set in the configuration file that points to the fulfillment service.
     */
    angular
        .module('siglus-admin-program-additional-product')
        .service('siglusAdminProgramAdditionalProductService', service);

    service.$inject = ['$resource', 'requisitionUrlFactory'];

    function service($resource, requisitionUrlFactory) {
        var resource = $resource(requisitionUrlFactory('/api/siglusapi/programadditionalorderables'), {}, {
            search: {
                method: 'GET'
            },
            addAdditionalProducts: {
                method: 'POST'
            },
            delete: {
                method: 'DELETE',
                url: requisitionUrlFactory('api/siglusapi/programadditionalorderables/:id')
            }
        });

        this.search = search;
        this.addAdditionalProducts = addAdditionalProducts;
        this.remove = remove;

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.siglusAdminProgramAdditionalProductService
         * @name search
         *
         * @description
         * Retrieves a list of additional products from the OpenLMIS server based on the given parameters.
         * Parameters that are not supported by the server will be ignored. "programId" is
         * the only required parameter.
         *
         * @param  {Object} params the key-value map of parameters
         * @return {Promise}       the list of all matching orders
         */
        function search(params) {
            return resource.search(params).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.siglusAdminProgramAdditionalProductService
         * @name addAdditionalProducts
         *
         * @description
         * Retrieves a list of additional products from the OpenLMIS server based on the given parameters.
         * Parameters that are not supported by the server will be ignored. "programId" is
         * the only required parameter.
         *
         * @param  {Object} additionalProducts the key-value map of parameters
         * @return {Promise}       the list of all matching orders
         */
        function addAdditionalProducts(additionalProducts) {
            return resource.addAdditionalProducts(additionalProducts).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.siglusAdminProgramAdditionalProductService
         * @name remove
         *
         * @description
         * remove a additional product from list of additional products
         *
         * @param  {Object} additionalProductId
         */
        function remove(additionalProductId) {
            return resource.delete({
                id: additionalProductId
            }).$promise;
        }

    }

})();
