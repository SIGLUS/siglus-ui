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

    // #332: save shipment draft
    ShipmentFactory.$inject = ['StockCardSummaryRepositoryImpl', 'programService', 'STOCKMANAGEMENT_RIGHTS'];
    // #332: ends here

    function ShipmentFactory(StockCardSummaryRepositoryImpl, programService, STOCKMANAGEMENT_RIGHTS) {

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
         * @return {Promise}       the promise resolving to a shipment
         */
        function buildFromOrder(order) {
            var orderableIds = order.orderLineItems.map(function(lineItem) {
                return lineItem.orderable.id;
            });

            // #332: save shipment draft
            return programService.getAllProductsProgram()
                .then(function(programs) {
                    return new StockCardSummaryRepositoryImpl().query({
                        programId: programs[0].id,
                        facilityId: order.supplyingFacility.id,
                        orderableId: orderableIds,
                        rightName: STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW
                    });
                })
            // #332: ends here
                .then(function(page) {
                    var summaries = page.content,
                        shipmentViewLineItems = summaries.reduce(function(shipmentViewLineItems, summary) {
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
                });
        }
    }

})();