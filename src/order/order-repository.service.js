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
     * @name order.orderRepository
     *
     * @description
     * Manages orders and serves as an abstraction layer between orderService and controllers.
     */
    angular
        .module('order')
        .service('orderRepository', orderRepository);

    orderRepository.$inject = ['orderService', 'orderFactory', 'basicOrderFactory'];

    function orderRepository(orderService, orderFactory, basicOrderFactory) {
        var orderRepository = this;

        orderRepository.get = get;
        orderRepository.search = search;
        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
        orderRepository.searchFulfill = searchFulfill;
        // #447: ends here

        /**
         * @ngdoc method
         * @methodOf order.orderService
         * @name get
         *
         * @description
         * Retrieves an Order.
         *
         * @param  {String} orderId the ID of the given order
         * @return {Promise}        the order
         */
        function get(orderId) {
            if (!orderId) {
                throw 'Order ID must be defined';
            }

            return orderService.get(orderId)
                .then(orderFactory.buildFromResponse);
        }

        /**
         * @ngdoc method
         * @methodOf order.orderRepository
         * @name search
         *
         * @description
         * Gets orders from the server using orderService and prepares them to be used in controller.
         *
         * @param {Object}   searchParams parameters for searching orders, i.e.
         * {
         *      program: 'programID',
         *      supplyingFacility: 'facilityID',
         *      requestingFacility: 'facilityID'
         * }
         * @return {Promise}              the promise resolving to a list of all matching orders
         */
        function search(searchParams) {
            return orderService.search(searchParams)
                .then(function(response) {
                    response.content = basicOrderFactory.buildFromResponseArray(response.content);
                    return response;
                });
        }

        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
        /**
         * @ngdoc method
         * @methodOf order.orderRepository
         * @name searchFulfill
         *
         * @description
         * Gets orders from the server using orderService and prepares them to be used in controller.
         *
         * @param {Object}   searchParams parameters for searching orders, i.e.
         * {
         *      program: 'programID',
         *      supplyingFacility: 'facilityID',
         *      requestingFacility: 'facilityID'
         * }
         * @return {Promise}              the promise resolving to a list of all matching orders
         */
        function searchFulfill(searchParams) {
            return orderService.searchFulfill(searchParams)
                .then(function(response) {
                    response.content = basicOrderFactory.buildFromResponseArray(response.content);
                    return response;
                });
        }
        // #447: ends here
    }

})();
