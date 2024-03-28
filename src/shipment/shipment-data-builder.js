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

    angular
        .module('shipment')
        .factory('ShipmentDataBuilder', ShipmentDataBuilder);

    ShipmentDataBuilder.$inject = [
        'ObjectReferenceDataBuilder', 'ShipmentLineItemDataBuilder', 'OrderDataBuilder', 'Shipment'
    ];

    function ShipmentDataBuilder(ObjectReferenceDataBuilder, ShipmentLineItemDataBuilder,
                                 OrderDataBuilder, Shipment) {

        ShipmentDataBuilder.prototype.build = build;
        ShipmentDataBuilder.prototype.buildResponse = buildResponse;
        ShipmentDataBuilder.prototype.buildJson = buildJson;

        ShipmentDataBuilder.prototype.withOrder = withOrder;
        ShipmentDataBuilder.prototype.withLineItems = withLineItems;
        ShipmentDataBuilder.prototype.withoutId = withoutId;
        ShipmentDataBuilder.prototype.withId = withId;
        ShipmentDataBuilder.prototype.withoutLineItems = withoutLineItems;
        ShipmentDataBuilder.prototype.buildWithoutId = buildWithoutId;
        ShipmentDataBuilder.prototype.buildWithoutLineItems = buildWithoutLineItems;

        return ShipmentDataBuilder;

        function ShipmentDataBuilder() {
            ShipmentDataBuilder.instanceNumber = (ShipmentDataBuilder.instanceNumber || 0) + 1;

            this.repository = jasmine.createSpyObj('shipmentRepository', [
                'create', 'updateDraft', 'deleteDraft'
            ]);
            this.id = 'shipment-' + ShipmentDataBuilder.instanceNumber;
            this.order = new OrderDataBuilder().build();
            this.shippedBy = 'Shipper ' + ShipmentDataBuilder.instanceNumber;
            this.shippedDate = '2018-01-16T18:34:57.915007Z';
            this.notes = 'Some notes about shipment';
            this.lineItems = [
                new ShipmentLineItemDataBuilder().buildJson(),
                new ShipmentLineItemDataBuilder().buildJson()
            ];
            this.extraData = {};
        }

        function build() {
            return new Shipment(this.buildJson(), this.repository);
        }

        function buildJson() {
            return {
                id: this.id,
                order: this.order,
                shippedBy: this.shippedBy,
                shippedDate: this.shippedDate,
                notes: this.notes,
                lineItems: this.lineItems,
                extraData: this.extraData
            };
        }

        function buildResponse() {
            return {
                id: this.id,
                order: new ObjectReferenceDataBuilder()
                    .withId(this.order.id)
                    .withResource('order')
                    .build(),
                shippedBy: this.shippedBy,
                shippedDate: this.shippedDate,
                notes: this.notes,
                lineItems: this.lineItems,
                extraData: this.extraData
            };
        }

        function buildWithoutId() {
            return this.withoutId().build();
        }

        function buildWithoutLineItems() {
            return this.withoutLineItems().build();
        }

        function withOrder(order) {
            this.order = order;
            return this;
        }

        function withLineItems(lineItems) {
            this.lineItems = lineItems;
            return this;
        }

        function withId(id) {
            this.id = id;
            return this;
        }

        function withoutId() {
            return this.withId(null);
        }

        function withoutLineItems() {
            return this.withLineItems([]);
        }
    }
})();
