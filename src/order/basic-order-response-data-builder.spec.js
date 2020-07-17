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
        .module('order')
        .factory('BasicOrderResponseDataBuilder', BasicOrderResponseDataBuilder);

    BasicOrderResponseDataBuilder.$inject = [
        'ProgramDataBuilder', 'FacilityDataBuilder', 'PeriodDataBuilder', 'ORDER_STATUS'
    ];

    function BasicOrderResponseDataBuilder(ProgramDataBuilder, FacilityDataBuilder,
                                           PeriodDataBuilder, ORDER_STATUS) {

        BasicOrderResponseDataBuilder.prototype.build = build;
        BasicOrderResponseDataBuilder.prototype.buildOrdered = buildOrdered;
        BasicOrderResponseDataBuilder.prototype.buildFulfilling = buildFulfilling;
        BasicOrderResponseDataBuilder.prototype.buildShipped = buildShipped;
        BasicOrderResponseDataBuilder.prototype.buildReceived = buildReceived;
        BasicOrderResponseDataBuilder.prototype.buildTransferFailed = buildTransferFailed;
        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        BasicOrderResponseDataBuilder.prototype.buildPartiallyFulfilled = buildPartiallyFulfilled;
        // #400: ends here

        BasicOrderResponseDataBuilder.prototype.withId = withId;
        BasicOrderResponseDataBuilder.prototype.withCreatedDate = withCreatedDate;
        BasicOrderResponseDataBuilder.prototype.withLastUpdatedDate = withLastUpdatedDate;
        BasicOrderResponseDataBuilder.prototype.withProcessingPeriod = withProcessingPeriod;
        BasicOrderResponseDataBuilder.prototype.withOrderLineItem = withOrderLineItem;
        BasicOrderResponseDataBuilder.prototype.withStatus = withStatus;

        return BasicOrderResponseDataBuilder;

        function BasicOrderResponseDataBuilder() {
            BasicOrderResponseDataBuilder.instanceNumber = (BasicOrderResponseDataBuilder.instanceNumber || 0) + 1;

            this.id = 'order-id' + BasicOrderResponseDataBuilder.instanceNumber;
            this.emergency = true;
            this.createdDate = '2017-11-10T17:17:17Z';
            this.lastUpdatedDate = '2017-11-10T17:17:17Z';
            this.processingPeriod = new PeriodDataBuilder()
                .withStartDate('2017-11-10T17:17:17Z')
                .withEndDate('2017-11-10T17:17:17Z')
                .build();

            this.program = new ProgramDataBuilder().build();
            this.requestingFacility = new FacilityDataBuilder().build();
            this.orderCode = 'ORDER-' + BasicOrderResponseDataBuilder.instanceNumber;
            this.status = 'ORDERED';
            this.facility = new FacilityDataBuilder().build();
            this.receivingFacility = new FacilityDataBuilder().build();
            this.supplyingFacility = new FacilityDataBuilder().build();
            this.lastUpdaterId = 'user-id' + BasicOrderResponseDataBuilder.instanceNumber;
            this.orderLineItems = [];
        }

        function withId(newId) {
            this.id = newId;
            return this;
        }

        function withCreatedDate(newDate) {
            this.createdDate = newDate;
            return this;
        }

        function withLastUpdatedDate(newDate) {
            this.lastUpdatedDate = newDate;
            return this;
        }

        function withProcessingPeriod(newPeriod) {
            this.processingPeriod = newPeriod;
            return this;
        }

        function withOrderLineItem(lineItem) {
            this.orderLineItems.push(lineItem);
            return this;
        }

        function withStatus(status) {
            this.status = status;
            return this;
        }

        function buildOrdered() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.ORDERED)
                .build();
        }

        function buildFulfilling() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.FULFILLING)
                .build();
        }

        function buildShipped() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.SHIPPED)
                .build();
        }

        function buildReceived() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.RECEIVED)
                .build();
        }

        function buildTransferFailed() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.TRANSFER_FAILED)
                .build();
        }

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        function buildPartiallyFulfilled() {
            return new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.PARTIALLY_FULFILLED)
                .build();
        }
        // #400: ends here

        function build() {
            return {
                id: this.id,
                emergency: this.emergency,
                createdDate: this.createdDate,
                program: this.program,
                requestingFacility: this.requestingFacility,
                orderCode: this.orderCode,
                status: this.status,
                processingPeriod: this.processingPeriod,
                lastUpdatedDate: this.lastUpdatedDate,
                facility: this.facility,
                receivingFacility: this.receivingFacility,
                supplyingFacility: this.supplyingFacility,
                lastUpdaterId: this.lastUpdaterId,
                orderLineItems: this.orderLineItems
            };
        }

    }

})();
