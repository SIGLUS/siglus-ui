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
     * @name shipment.ShipmentRepositoryImpl
     *
     * @description
     * Default implementation of the ShipmentRepository interface. Responsible for combining server
     * responses into single object to be passed to the Shipment class constructor.
     */
    angular
        .module('shipment')
        .factory('ShipmentRepositoryImpl', ShipmentRepositoryImpl);

    // #287: add SiglusShipmentResource, SiglusShipmentDraftResource, SiglusOrderResource
    // programService, STOCKMANAGEMENT_RIGHTS
    ShipmentRepositoryImpl.$inject = [
        'ShipmentResource', 'ShipmentDraftResource', 'OrderResource', 'StockCardSummaryRepositoryImpl',
        'SiglusShipmentResource', 'SiglusShipmentDraftResource', 'SiglusOrderResource', 'programService',
        'STOCKMANAGEMENT_RIGHTS'
    ];
    // #287: ends here

    function ShipmentRepositoryImpl(ShipmentResource, ShipmentDraftResource, OrderResource,
                                    StockCardSummaryRepositoryImpl, SiglusShipmentResource, SiglusShipmentDraftResource,
                                    SiglusOrderResource, programService, STOCKMANAGEMENT_RIGHTS) {

        ShipmentRepositoryImpl.prototype.create = create;
        ShipmentRepositoryImpl.prototype.createDraft = createDraft;
        ShipmentRepositoryImpl.prototype.updateDraft = updateDraft;
        ShipmentRepositoryImpl.prototype.getByOrderId = getByOrderId;
        ShipmentRepositoryImpl.prototype.getDraftByOrderId = getDraftByOrderId;
        ShipmentRepositoryImpl.prototype.deleteDraft = deleteDraft;

        return ShipmentRepositoryImpl;

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name ShipmentRepositoryImpl
         * @constructor
         *
         * @description
         * Creates an object of the ShipmentRepositoryImpl class and initiates all required
         * dependencies.
         */
        function ShipmentRepositoryImpl() {
            this.shipmentResource = new ShipmentResource();
            this.shipmentDraftResource = new ShipmentDraftResource();
            this.stockCardSummaryRepositoryImpl = new StockCardSummaryRepositoryImpl();
            // #332: save shipment draft
            this.orderResource = new SiglusOrderResource();
            // #332: ends here
            // #287: Warehouse clerk can skip some products in order
            this.siglusShipmentResource = new SiglusShipmentResource();
            this.siglusShipmentDraftResource = new SiglusShipmentDraftResource();
            // #287: ends here
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name create
         *
         * @description
         * Creates a new shipment on the OpenLMIS server.
         *
         * @param  {Object}  json the JSON representation of the shipment
         * @return {Promise}      the promise resolving to combined JSON which can be used for
         *                        creating instance of the Shipment class
         */
        function create(json) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            // #287: Warehouse clerk can skip some products in order
            return this.siglusShipmentResource.create(json)
                .then(function(shipmentJson) {
                    return extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl);
                });
            // #287: ends here
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name createDraft
         *
         * @description
         * Creates a new shipment draft on the OpenLMIS server.
         *
         * @param  {Object}  json the JSON representation of the shipment draft
         * @return {Promise}      the promise resolving to combined JSON which can be used for
         *                        creating instance of the Shipment class
         */
        function createDraft(json) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentDraftResource.create(json)
                .then(function(shipmentJson) {
                    return extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name updateDraft
         *
         * @description
         * Updates the given shipment draft on the OpenLMIS server.
         *
         * @param  {Object}  draft the shipment draft
         * @return {Promise}       returns a promise resolving when the update was successful,
         *                         rejects if anything goes wrong
         */
        // #287: Warehouse clerk can skip some products in order
        function updateDraft(draft) {
            return this.siglusShipmentDraftResource.update(draft);
        }

        function deleteDraft(draft) {
            return this.siglusShipmentDraftResource.delete(draft);
        }
        // #287: ends here

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name getByOrderId
         *
         * @description
         * Retrieves a shipment for order with given ID from the OpenLMIS server.
         *
         * @param  {Object}  orderId the order ID
         * @return {Promise}         the promise resolving to combined JSON which can be used for
         *                           creating instance of the Shipment class
         */
        function getByOrderId(orderId) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentResource.query({
                orderId: orderId
            })
                .then(function(page) {
                    return extendResponse(page.content[0], orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepositoryImpl
         * @name getDraftByOrderId
         *
         * @description
         * Retrieves a shipment draft for order with given ID from the OpenLMIS server.
         *
         * @param  {Object}  orderId the order ID
         * @return {Promise}         the promise resolving to combined JSON which can be used for
         *                           creating instance of the Shipment class
         */
        function getDraftByOrderId(orderId) {
            var orderResource = this.orderResource,
                stockCardSummaryRepositoryImpl = this.stockCardSummaryRepositoryImpl;

            return this.shipmentDraftResource.query({
                orderId: orderId
            })
                .then(function(page) {
                    return extendResponse(page.content[0], orderResource, stockCardSummaryRepositoryImpl);
                });
        }

        function extendResponse(shipmentJson, orderResource, stockCardSummaryRepositoryImpl) {
            return orderResource.get(shipmentJson.order.id)
                .then(function(orderJson) {
                    // #332: save shipment draft
                    var orderableIds = orderJson.availableProducts.map(function(orderable) {
                        return orderable.id;
                    });

                    return programService.getAllProductsProgram()
                        .then(function(programs) {
                            return stockCardSummaryRepositoryImpl.query({
                                programId: programs[0].id,
                                facilityId: orderJson.order.supplyingFacility.id,
                                orderableId: orderableIds,
                                rightName: STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW
                            });
                        })
                    // #332: ends here
                        .then(function(page) {
                            return page.content;
                        })
                        .then(mapCanFulfillForMe)
                        .then(function(canFulfillForMeMap) {
                            // #332: save shipment draft
                            return combineResponses(shipmentJson, orderJson.order, canFulfillForMeMap);
                            // #332: ends here
                        });
                });
        }

        function combineResponses(shipment, order, canFulfillForMeMap) {
            shipment.order = order;

            shipment.lineItems.forEach(function(lineItem) {
                lineItem.canFulfillForMe = canFulfillForMeMap[lineItem.orderable.id][getId(lineItem.lot)];
            });

            return shipment;
        }

        function mapCanFulfillForMe(summaries) {
            var canFulfillForMeMap = {};

            summaries.forEach(function(summary) {
                summary.canFulfillForMe.forEach(function(canFulfillForMe) {
                    var orderableId = canFulfillForMe.orderable.id,
                        lotId = canFulfillForMe.lot ? canFulfillForMe.lot.id : undefined;

                    if (!canFulfillForMeMap[orderableId]) {
                        canFulfillForMeMap[orderableId] = {};
                    }

                    canFulfillForMeMap[orderableId][lotId] = canFulfillForMe;
                });
            });

            return canFulfillForMeMap;
        }

        function getId(object) {
            return object ? object.id : undefined;
        }
    }
})();
