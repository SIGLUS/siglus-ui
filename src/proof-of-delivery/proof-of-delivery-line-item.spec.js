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

describe('ProofOfDeliveryLineItem', function() {

    var ProofOfDeliveryLineItem, proofOfDeliveryLineItem, ProofOfDeliveryLineItemDataBuilder;

    beforeEach(function() {
        module('proof-of-delivery');

        inject(function($injector) {
            ProofOfDeliveryLineItem = $injector.get('ProofOfDeliveryLineItem');
            ProofOfDeliveryLineItemDataBuilder = $injector.get('ProofOfDeliveryLineItemDataBuilder');
        });
    });

    describe('constructor', function() {

        var json;

        beforeEach(function() {
            json = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityAccepted(100)
                .withQuantityRejected(undefined)
                .withQuantityShipped(150)
                .buildJson();
        });

        it('should copy fields from JSON', function() {
            var result = new ProofOfDeliveryLineItem(json);

            expect(result.id).toEqual(json.id);
            expect(result.orderable).toEqual(json.orderable);
            expect(result.lot).toEqual(json.lot);
            expect(result.quantityAccepted).toEqual(json.quantityAccepted);
            expect(result.notes).toEqual(json.notes);
            expect(result.quantityShipped).toEqual(150);
        });

        it('should calculate quantity rejected', function() {
            var result = new ProofOfDeliveryLineItem(json);

            expect(result.quantityRejected).toEqual(50);
        });

    });

    describe('updateQuantityRejected', function() {

        it('should set quantity rejected to 0 if quantity accepted is bigger than shipped', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityAccepted(101)
                .withQuantityRejected(10)
                .withQuantityShipped(100)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(0);
        });

        it('should set quantity rejected to 0 if quantity accepted matches quantity shipped', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityShipped(100)
                .withQuantityAccepted(100)
                .withQuantityRejected(10)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(0);
        });

        it('should set quantity rejected to quantity shipped if quantity accepted is 0', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityShipped(100)
                .withQuantityAccepted(0)
                .withQuantityRejected(10)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(100);
        });

        it('should set quantity rejected to 0 if quantity accepted is undefined', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityShipped(100)
                .withQuantityAccepted(undefined)
                .withQuantityRejected(10)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(0);
        });

        it('should set quantity rejected to quantity shipped if quantity accepted is negative', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityShipped(100)
                .withQuantityAccepted(-20)
                .withQuantityRejected(10)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(100);
        });

        it('should calculate the quantity rejected', function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder()
                .withQuantityShipped(100)
                .withQuantityAccepted(60)
                .withQuantityRejected(10)
                .build();

            proofOfDeliveryLineItem.updateQuantityRejected();

            expect(proofOfDeliveryLineItem.quantityRejected).toBe(40);
        });

    });

    describe('validate', function() {

        beforeEach(function() {
            proofOfDeliveryLineItem = new ProofOfDeliveryLineItemDataBuilder().build();
        });

        it('should return undefined if line items is valid', function() {
            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();
        });

        it('should return error if quantityAccepted is empty', function() {
            proofOfDeliveryLineItem.quantityAccepted = undefined;

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                quantityAccepted: 'proofOfDelivery.required'
            });
        });

        it('should return error if quantityAccepted is negative', function() {
            proofOfDeliveryLineItem.quantityAccepted = -1;

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                quantityAccepted: 'proofOfDelivery.positive'
            });
        });

        it('should return if trying to accept more than was shipped', function() {
            proofOfDeliveryLineItem.quantityAccepted = 100;
            proofOfDeliveryLineItem.quantityShipped = 90;

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                quantityAccepted: 'proofOfDelivery.canNotAcceptMoreThanShipped'
            });
        });

        it('should return error if rejecting without reason', function() {
            proofOfDeliveryLineItem.quantityRejected = 5;
            proofOfDeliveryLineItem.rejectionReasonId = undefined;

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                rejectionReasonId: 'proofOfDelivery.required'
            });
        });

        it('should not return error if not rejecting and not specifying a reason', function() {
            proofOfDeliveryLineItem.quantityRejected = 0;
            proofOfDeliveryLineItem.rejectionReasonId = undefined;

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();
        });

        it('should require rejection reason to be undefined if not rejecting anything', function() {
            proofOfDeliveryLineItem.quantityRejected = 0;
            proofOfDeliveryLineItem.rejectionReasonId = 'rejection-reason-id';

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                rejectionReasonId: 'proofOfDelivery.canNotSpecifyReasonForRejectionIfNotRejectingAnything'
            });
        });

        it('should require vvm status when use vvm is true and quantity accepted', function() {
            proofOfDeliveryLineItem.quantityAccepted = 1;
            proofOfDeliveryLineItem.useVvm = true;
            proofOfDeliveryLineItem.vvmStatus = undefined;

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                vvmStatus: 'proofOfDelivery.vvmStatusIsRequired'
            });

            proofOfDeliveryLineItem.vvmStatus = 'STAGE_1';

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();

            proofOfDeliveryLineItem.quantityAccepted = 0;
            proofOfDeliveryLineItem.vvmStatus = undefined;

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();
        });

        it('should return error when VVM status is selected and nothing was accepted', function() {
            proofOfDeliveryLineItem.quantityAccepted = 0;
            proofOfDeliveryLineItem.vvmStatus = 'STAGE_1';

            expect(proofOfDeliveryLineItem.validate()).toEqual({
                vvmStatus: 'proofOfDelivery.cannotSelectVvmStatusWhenNothingAccepted'
            });

            proofOfDeliveryLineItem.vvmStatus = null;

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();

            proofOfDeliveryLineItem.vvmStatus = undefined;

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();

            proofOfDeliveryLineItem.vvmStatus = '';

            expect(proofOfDeliveryLineItem.validate()).toBeUndefined();
        });
    });
});
