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
     * @name order.Order
     *
     * @description
     * Represents a single order.
     */
    angular
        .module('order')
        .factory('Order', Order);

    Order.$inject = ['ORDER_STATUS'];

    function Order(ORDER_STATUS) {

        Order.prototype.isFulfilling = isFulfilling;
        Order.prototype.isOrdered = isOrdered;
        Order.prototype.isShipped = isShipped;
        Order.prototype.transferFailed = transferFailed;
        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        Order.prototype.isPartiallyFulfilled = isPartiallyFulfilled;
        // #400: ends here

        return Order;

        function Order(order) {
            angular.copy(order, this);
        }

        /**
         * @ngdoc method
         * @methodOf order.Order
         * @name isFulfilling
         *
         * @description
         * Checks whether an order has FULFILLING status.
         *
         * @param  {Object} order   the order status
         * @return {boolean}        true if status is FULFILLING
         */
        function isFulfilling() {
            return this.status === ORDER_STATUS.FULFILLING;
        }

        function isOrdered() {
            return this.status === ORDER_STATUS.ORDERED;
        }

        function isShipped() {
            return this.status === ORDER_STATUS.SHIPPED;
        }

        function transferFailed() {
            return this.status === ORDER_STATUS.TRANSFER_FAILED;
        }

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        function isPartiallyFulfilled() {
            return this.status === ORDER_STATUS.PARTIALLY_FULFILLED;
        }
        // #400: ends here
    }

})();
