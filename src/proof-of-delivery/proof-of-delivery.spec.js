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

describe('ProofOfDelivery', function() {

    var ProofOfDelivery, ProofOfDeliveryLineItem, ProofOfDeliveryDataBuilder, $q, $rootScope, json,
        ProofOfDeliveryLineItemDataBuilder, PROOF_OF_DELIVERY_STATUS;

    beforeEach(function() {
        module('proof-of-delivery');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            ProofOfDelivery = $injector.get('ProofOfDelivery');
            ProofOfDeliveryLineItem = $injector.get('ProofOfDeliveryLineItem');
            PROOF_OF_DELIVERY_STATUS = $injector.get('PROOF_OF_DELIVERY_STATUS');
            ProofOfDeliveryDataBuilder = $injector.get('ProofOfDeliveryDataBuilder');
            ProofOfDeliveryLineItemDataBuilder = $injector.get('ProofOfDeliveryLineItemDataBuilder');
        });

        json = new ProofOfDeliveryDataBuilder().buildJson();
        json.lineItems.forEach((function(lineItem) {
            lineItem.lot.lotCode = 'lot-1';
            lineItem.lot.expirationDate = '2027-03-24';
        }));
    });

    describe('constructor', function() {

        it('should copy properties from JSON', function() {
            var result = new ProofOfDelivery(json);

            expect(result.id).toEqual(json.id);
            expect(result.order).toEqual(json.order);
            expect(result.deliveredBy).toEqual(json.deliveredBy);
            expect(result.receivedBy).toEqual(json.receivedBy);
        });

        it('should create line items', function() {
            var result = new ProofOfDelivery(json);

            expect(result.lineItems[0] instanceof ProofOfDeliveryLineItem).toBe(true);
            expect(result.lineItems[1] instanceof ProofOfDeliveryLineItem).toBe(true);
            expect(result.lineItems).toEqual([
                new ProofOfDeliveryLineItem(json.lineItems[0]),
                new ProofOfDeliveryLineItem(json.lineItems[1])
            ]);
        });
    });

    describe('save', function() {

        var proofOfDelivery, proofOfDeliveryRepositoryMock;

        beforeEach(function() {
            proofOfDeliveryRepositoryMock = jasmine.createSpyObj('repository', ['update']);
            proofOfDelivery = new ProofOfDelivery(json, proofOfDeliveryRepositoryMock);
        });

        it('should resolve when saved', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.resolve());

            var saved;
            proofOfDelivery.save()
                .then(function() {
                    saved = true;
                });
            $rootScope.$apply();

            expect(saved).toBe(true);
        });

        it('should reject if save failed', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.reject());

            var saved;
            proofOfDelivery.save()
                .catch(function() {
                    saved = false;
                });
            $rootScope.$apply();

            expect(saved).toBe(false);
        });

    });

    describe('confirm', function() {

        var proofOfDelivery, proofOfDeliveryRepositoryMock;

        beforeEach(function() {
            proofOfDeliveryRepositoryMock = jasmine.createSpyObj('repository', ['update']);
            proofOfDelivery = new ProofOfDelivery(json, proofOfDeliveryRepositoryMock);
        });

        // it('should reject if Proof of Delivery is invalid', function() {
        //     proofOfDelivery.receivedBy = undefined;

        //     var result;
        //     proofOfDelivery.confirm()
        //         .catch(function(errors) {
        //             result = errors;
        //         });
        //     $rootScope.$apply();

        //     expect(result).toEqual({
        //         receivedBy: 'proofOfDelivery.required'
        //     });
        // });

        // it('should not call repository if Proof of Delivery is invalid', function() {
        //     proofOfDelivery.receivedBy = undefined;

        //     proofOfDelivery.confirm();
        //     $rootScope.$apply();

        //     expect(proofOfDeliveryRepositoryMock.update).not.toHaveBeenCalled();
        // });

        // it('should not set status to confirmed if Proof of Delivery is invalid', function() {
        //     proofOfDelivery.receivedBy = undefined;

        //     proofOfDelivery.confirm();
        //     $rootScope.$apply();

        //     expect(proofOfDelivery.status).not.toBe(PROOF_OF_DELIVERY_STATUS.CONFIRMED);
        // });

        it('should reject if repository rejects', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.reject());

            var rejected;
            proofOfDelivery.confirm()
                .catch(function(errors) {
                    rejected = !errors;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should not set status to confirmed if repository rejects', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.reject());

            proofOfDelivery.confirm();
            $rootScope.$apply();

            expect(proofOfDelivery.status).not.toBe(PROOF_OF_DELIVERY_STATUS.CONFIRMED);
        });

        it('should set status to confirmed when saving in repository', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.reject());

            var expected = angular.copy(proofOfDelivery);
            expected.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;

            proofOfDelivery.confirm();

            expect(proofOfDeliveryRepositoryMock.update).toHaveBeenCalledWith(expected);

            $rootScope.$apply();
        });

        it('should resolve after Proof of Delivery has been confirmed', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.resolve());

            var confirmed;
            proofOfDelivery.confirm()
                .then(function() {
                    confirmed = true;
                });
            $rootScope.$apply();

            expect(confirmed).toBe(true);
        });

        it('should set status as confirmed if confirm was successful', function() {
            proofOfDeliveryRepositoryMock.update.andReturn($q.resolve());

            expect(proofOfDelivery.status).toBe(PROOF_OF_DELIVERY_STATUS.INITIATED);

            proofOfDelivery.confirm();
            $rootScope.$apply();

            expect(proofOfDelivery.status).toBe(PROOF_OF_DELIVERY_STATUS.CONFIRMED);
        });

    });

    describe('validate', function() {

        var proofOfDelivery;

        beforeEach(function() {
            proofOfDelivery = new ProofOfDelivery(json);
        });

        it('should return undefined if Proof of Delivery is valid', function() {
            expect(proofOfDelivery.validate()).toBeUndefined();
        });

        // it('should return error if receivedBy is empty', function() {
        //     proofOfDelivery.receivedBy = undefined;

        //     expect(proofOfDelivery.validate()).toEqual({
        //         receivedBy: 'proofOfDelivery.required'
        //     });
        // });

        // it('should return error if deliveredBy is empty', function() {
        //     proofOfDelivery.deliveredBy = undefined;

        //     expect(proofOfDelivery.validate()).toEqual({
        //         deliveredBy: 'proofOfDelivery.required'
        //     });
        // });

        // it('should return error if receivedDate is empty', function() {
        //     proofOfDelivery.receivedDate = undefined;

        //     expect(proofOfDelivery.validate()).toEqual({
        //         receivedDate: 'proofOfDelivery.required'
        //     });
        // });

        it('should return error if at least one of line items is invalid', function() {
            proofOfDelivery.lineItems[0].quantityAccepted = null;

            expect(proofOfDelivery.validate()).toEqual({
                lineItems: [{
                    quantityAccepted: 'proofOfDelivery.required'
                }]
            });

            proofOfDelivery.lineItems[1].quantityAccepted = null;

            expect(proofOfDelivery.validate()).toEqual({
                lineItems: [{
                    quantityAccepted: 'proofOfDelivery.required'
                }, {
                    quantityAccepted: 'proofOfDelivery.required'
                }]
            });

            proofOfDelivery.lineItems[1].quantityAccepted = 50;

            expect(proofOfDelivery.validate()).toEqual({
                lineItems: [{
                    quantityAccepted: 'proofOfDelivery.required'
                }]
            });
        });

    });

    describe('isInitiated', function() {

        var proofOfDelivery;

        beforeEach(function() {
            proofOfDelivery = new ProofOfDeliveryDataBuilder().build();
        });

        it('should return true if Proof of Delivery is initiated', function() {
            expect(proofOfDelivery.isInitiated()).toBe(true);
        });

        it('should return false if Proof of Delivery is not initiated', function() {
            proofOfDelivery.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;

            expect(proofOfDelivery.isInitiated()).toBe(false);
        });

    });

    describe('hasProductsUseVvmStatus', function() {

        var proofOfDelivery;

        beforeEach(function() {
            proofOfDelivery = new ProofOfDeliveryDataBuilder()
                .withLineItems([
                    new ProofOfDeliveryLineItemDataBuilder().withUseVvm(false)
                        .buildJson(),
                    new ProofOfDeliveryLineItemDataBuilder().withUseVvm(false)
                        .buildJson()
                ])
                .build();
        });

        it('should return true if Proof of Delivery Line Item uses VVM', function() {
            proofOfDelivery.lineItems[0].useVvm = true;

            expect(proofOfDelivery.hasProductsUseVvmStatus()).toBe(true);
        });

        it('should return false if Proof of Delivery Line Items do not use VVM', function() {
            expect(proofOfDelivery.hasProductsUseVvmStatus()).toBe(false);
        });
    });
});
