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
            this.isLot = !config.isKit;
            this.skipped = config.skipped;
        }

    }
})();
