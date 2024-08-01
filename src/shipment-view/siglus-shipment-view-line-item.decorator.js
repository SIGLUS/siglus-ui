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
     * @name shipment-view.ShipmentViewLineItem
     *
     * @description
     * Decorator ShipmentViewLineItem.
     */
    angular.module('shipment-view')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('ShipmentViewLineItem', decorator);
    }

    decorator.$inject = ['$delegate'];

    function decorator($delegate) {

        ShipmentViewLineItem.prototype = $delegate.prototype;
        ShipmentViewLineItem.prototype.getReservedQuantity = getReservedQuantity;
        ShipmentViewLineItem.prototype.getItemRemainingSoh = getItemRemainingSoh;
        ShipmentViewLineItem.prototype.isInvalid = isInvalid;

        return ShipmentViewLineItem;

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name ShipmentViewLineItem
         * @constructor
         *
         * @description
         * Creates an instance of the ShipmentViewLineItem.
         *
         * @param {Object} config configuration object used when creating new instance of the class
         */
        function ShipmentViewLineItem(config) {
            this.productCode = config.productCode;
            this.productName = config.productName;
            this.lot = config.lot;
            this.vvmStatus = config.vvmStatus;
            this.shipmentLineItem = config.shipmentLineItem;
            this.netContent = config.netContent;
            this.isLot = config.isLot || !config.isKit;
            this.skipped = config.skipped;
            this.reservedStock = config.reservedStock;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getReservedQuantity
         *
         * @description
         * Returns the reservedStock of the shipment-line-item.
         * Using method to be consistent with shipment-line-item-group.
         * this.getFillQuantity() is in old code repo (openlmis-fulfillment-ui)
         *
         * @return {number}         reservedStock of the current shipment-line-item.
         */
        function getReservedQuantity() {
            return this.reservedStock + this.getFillQuantity() || 0;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentViewLineItem
         * @name getItemRemainingSoh
         *
         * @description
         * Returns the remaining stock after fulfilling the order.
         * to see old repo: openlmis-fulfillment-ui
         *
         * @param  {boolean} inDoses flag defining whether the returned value should be returned in
         *                           doses or in packs
         * @return {number}          the remaining stock after fulfilling the order
         */
        function getItemRemainingSoh(inDoses) {
            var remainingQuantityInPacks = this.getAvailableSoh() - this.getReservedQuantity();
            return this.recalculateQuantity(remainingQuantityInPacks, inDoses);
        }

        function isInvalid() {
            var errors = this.shipmentLineItem.isInvalid();
            if (!errors &&
                this.reservedStock + this.shipmentLineItem.quantityShipped > this.shipmentLineItem.stockOnHand) {
                errors = {};
                errors.quantityShipped = 'shipment.fillQuantityCannotExceedStockOnHand';
            }
            return errors;
        }
    }
})();
