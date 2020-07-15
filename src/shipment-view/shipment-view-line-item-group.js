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
     * @name shipment-view.ShipmentViewLineItemGroup
     *
     * @description
     * Represents a group of line items or line item groups.
     */
    angular
        .module('shipment-view')
        .factory('ShipmentViewLineItemGroup', ShipmentViewLineItemGroup);

    ShipmentViewLineItemGroup.inject = ['ShipmentViewLineItem', 'classExtender'];

    function ShipmentViewLineItemGroup(ShipmentViewLineItem, classExtender) {

        classExtender.extend(ShipmentViewLineItemGroup, ShipmentViewLineItem);

        ShipmentViewLineItemGroup.prototype.getAvailableSoh = getAvailableSoh;
        ShipmentViewLineItemGroup.prototype.getFillQuantity = getFillQuantity;
        ShipmentViewLineItemGroup.prototype.getOrderQuantity = getOrderQuantity;
        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        ShipmentViewLineItemGroup.prototype.getPartialFulfilledQuantity = getPartialFulfilledQuantity;
        // #400: ends here

        return ShipmentViewLineItemGroup;

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name ShipmentViewLineItemGroup
         * @constructor
         *
         * @description
         * Creates an instance of the ShipmentViewLineItemGroup.
         *
         * @param {Object} config configuration object used when creating new instance of the class
         */
        function ShipmentViewLineItemGroup(config) {
            this.super(config);
            this.orderQuantity = config.orderQuantity;
            this.lineItems = config.lineItems;
            this.isMainGroup = config.isMainGroup;
            this.noStockAvailable = this.getAvailableSoh() === 0;
            this.isLot = false;
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            this.partialFulfilledQuantity = config.partialFulfilledQuantity;
            // #400: ends here
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getAvailableSoh
         *
         * @description
         * Returns a sum of all stock available for the children line items/line item groups.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the sum of all available stock on hand for the whole group
         */
        function getAvailableSoh(inDoses) {
            return this.lineItems.reduce(function(availableSoh, lineItem) {
                return availableSoh + lineItem.getAvailableSoh(inDoses);
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getFillQuantity
         *
         * @description
         * Returns a sum of all fill quantities for the children line items/line item groups.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the sum of all fill quantities for the whole group
         */
        function getFillQuantity() {
            return this.lineItems.reduce(function(fillQuantity, lineItem) {
                return fillQuantity + lineItem.getFillQuantity();
            }, 0);
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getOrderQuantity
         *
         * @description
         * Returns an ordered quantity for the commodity type related with the line item.
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the ordered quantity for the commodity type related with the
         *                           line item
         */
        function getOrderQuantity(inDoses) {
            if (this.orderQuantity === undefined || this.orderQuantity === null) {
                return;
            }
            return this.recalculateQuantity(this.orderQuantity, inDoses);
        }

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItemGroup
         * @name getPartialFulfilledQuantity
         *
         * @description
         * Returns an partial fulfilled quantity for the commodity type related with the line item.
         *
         * @return {number}          the partial fulfilled quantity for the commodity type related with the
         *                           line item
         */
        function getPartialFulfilledQuantity() {
            return this.partialFulfilledQuantity;
        }
        // #400: ends here
    }

})();