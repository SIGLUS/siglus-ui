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
     * @ngdoc object
     * @name order.ORDER_STATUS
     *
     * @description
     * Contains all possible order statuses.
     */
    angular
        .module('order')
        .constant('ORDER_STATUS', status());

    function status() {

        return {
            ORDERED: 'ORDERED',
            FULFILLING: 'FULFILLING',
            SHIPPED: 'SHIPPED',
            RECEIVED: 'RECEIVED',
            TRANSFER_FAILED: 'TRANSFER_FAILED',
            IN_ROUTE: 'IN_ROUTE',
            READY_TO_PACK: 'READY_TO_PACK',
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            PARTIALLY_FULFILLED: 'PARTIALLY_FULFILLED',
            // #400: ends here
            // #401: limitation of creating sub-order
            CLOSED: 'CLOSED',
            $getDisplayName: getDisplayName
            // #401: ends here
        };
    }

    // SIGLUS-REFACTOR: starts here
    /**
     * @ngdoc method
     * @methodOf requisition-constants.REQUISITION_STATUS
     * @name getDisplayName
     *
     * @description
     * Retrieves display name for the given requisition status.
     */
    function getDisplayName(status) {
        if (status === this.ORDERED) {
            return 'orderStatus.ORDERED';
        } else if (status === this.FULFILLING) {
            return 'orderStatus.FULFILLING';
        } else if (status === this.SHIPPED) {
            return 'orderStatus.SHIPPED';
        } else if (status === this.RECEIVED) {
            return 'orderStatus.RECEIVED';
        } else if (status === this.TRANSFER_FAILED) {
            return 'orderStatus.TRANSFER_FAILED';
        } else if (status === this.READY_TO_PACK) {
            return 'orderStatus.READY_TO_PACK';
        } else if (status === this.PARTIALLY_FULFILLED) {
            return 'orderStatus.PARTIALLY_FULFILLED';
        } else if (status === this.CLOSED) {
            return 'orderStatus.CLOSED';
        }
        return status;
    }
    // SIGLUS-REFACTOR: ends here

})();
