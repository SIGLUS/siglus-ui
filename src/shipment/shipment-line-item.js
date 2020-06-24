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
     * @name shipment.ShipmentLineItem
     *
     * @description
     * Represents a single shipment line item extended by the available stock on hand it can be
     * fulfilled with.
     */
    angular
        .module('shipment')
        .factory('ShipmentLineItem', ShipmentLineItem);

    function ShipmentLineItem() {

        ShipmentLineItem.prototype.isInvalid = isInvalid;

        return ShipmentLineItem;

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentLineItem
         * @name ShipmentLineItem
         *
         * @description
         * Creates instance of the ShipmentLineItem class.
         *
         * @param {Object} json the json representation of the shipment line item
         */
        function ShipmentLineItem(json) {
            this.id = json.id;
            this.orderable = json.orderable;
            this.lot = json.lot;
            this.quantityShipped = json.quantityShipped;
            this.stockOnHand = calculateAvailableStockOnHandInPacks(json.canFulfillForMe);
            this.skipped = json.skipped;
        }

        /**
         * @ngdoc methodOf
         * @methodOf shipment.ShipmentLineItem
         * @name isInvalid
         *
         * @description
         * Validates the shipment line item and returns a map of errors. If the line item is valid,
         * undefined is returned. The line item is invalid if its quantity shipped is undefined or
         * if the quantity shipped exceeds available stock on hand.
         *
         * @returns {Object} the errors map if line item is invalid, undefined otherwise
         */
        function isInvalid() {
            var errors = {};

            // #287: Warehouse clerk can skip some products in order
            if (!this.quantityShipped && this.quantityShipped !== 0 && !this.skipped) {
                errors.quantityShipped = 'shipment.required';
            }
            // #287: ends here

            if (this.quantityShipped > this.stockOnHand) {
                errors.quantityShipped = 'shipment.fillQuantityCannotExceedStockOnHand';
            }

            return angular.equals(errors, {}) ? undefined : errors;
        }

        function calculateAvailableStockOnHandInPacks(canFulfillForMe) {
            return Math.floor(canFulfillForMe.stockOnHand / canFulfillForMe.orderable.netContent);
        }
    }
})();
