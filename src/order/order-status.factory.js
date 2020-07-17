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
     * @name order.orderStatusFactory
     *
     * @description
     * Translates different order statuses for display in dropdowns.
     */
    angular
        .module('order')
        .factory('orderStatusFactory', factory);

    factory.$inject = ['messageService', 'ORDER_STATUS'];

    function factory(messageService, ORDER_STATUS) {
        var factory = {
            getAll: getAll
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf order.orderStatusFactory
         * @name getAll
         *
         * @description
         * Returns list of order statuses.
         */
        function getAll() {
            return [
                {
                    name: messageService.get('orderStatus.ORDERED'),
                    value: ORDER_STATUS.ORDERED
                },
                {
                    name: messageService.get('orderStatus.FULFILLING'),
                    value: ORDER_STATUS.FULFILLING
                },
                {
                    name: messageService.get('orderStatus.SHIPPED'),
                    value: ORDER_STATUS.SHIPPED
                },
                {
                    name: messageService.get('orderStatus.RECEIVED'),
                    value: ORDER_STATUS.RECEIVED
                },
                {
                    name: messageService.get('orderStatus.TRANSFER_FAILED'),
                    value: ORDER_STATUS.TRANSFER_FAILED
                },
                {
                    name: messageService.get('orderStatus.IN_ROUTE'),
                    value: ORDER_STATUS.IN_ROUTE
                },
                {
                    name: messageService.get('orderStatus.READY_TO_PACK'),
                    value: ORDER_STATUS.READY_TO_PACK
                },
                // #400: Facility user partially fulfill an order and create sub-order for an requisition
                {
                    name: messageService.get('orderStatus.PARTIALLY_FULFILLED'),
                    value: ORDER_STATUS.PARTIALLY_FULFILLED
                }
                // #400: ends here
            ];
        }
    }

})();
