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
     * @name shipment-view.ShipmentFactory
     *
     * @description
     * Creates an object representing a Shipment, which can then be used for creating new shipment
     * on the OpenLMIS server.
     */
    angular
        .module('shipment-view')
        .factory('ShipmentFactory', ShipmentFactory);

    // #372: delete StockCardSummaryRepositoryImpl
    ShipmentFactory.$inject = [];
    // #372: ends here

    function ShipmentFactory() {

        ShipmentFactory.prototype.buildFromOrder = buildFromOrder;

        return ShipmentFactory;

        function ShipmentFactory() {}

        /**
         * @ngdoc method
         * @methodOf shipment-view.ShipmentFactory
         * @name buildFromOrder
         *
         * @description
         * Creates a new Shipment for the given Order.
         *
         * @param  {Object}  order order that we want to create shipment for
         * @param  {Array}  stockCardSummaries stockCardSummaries of all products from api
         * @return {Promise}       the promise resolving to a shipment
         */
        // #372: Improving Fulfilling Order performance
        function buildFromOrder(order, stockCardSummaries) {
            var orderableIds = order.orderLineItems.map(function(lineItem) {
                return lineItem.orderable.id;
            });
            var shipmentViewLineItems = stockCardSummaries.reduce(function(shipmentViewLineItems, summary) {
                // #372: ends here
                return shipmentViewLineItems.concat(
                    summary.canFulfillForMe.map(function(canFulfillForMe) {
                        return {
                            orderable: {
                                id: canFulfillForMe.orderable.id,
                                versionNumber: canFulfillForMe.orderable.meta.versionNumber
                            },
                            lot: canFulfillForMe.lot,
                            quantityShipped: 0
                        };
                    })
                );
                // #374: confirm shipment effect soh
            }, []).filter(function(shipmentLineItem) {
                return orderableIds.includes(shipmentLineItem.orderable.id);
            });
            // #374: ends here
            return {
                order: order,
                lineItems: shipmentViewLineItems
            };
        }
    }

})();
