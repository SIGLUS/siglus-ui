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

describe('Requisition', function() {

    beforeEach(function() {
        this.offlineRequisitions = jasmine.createSpyObj('offlineRequisitions', ['remove', 'removeBy']);

        var context = this;
        module('requisition', function($provide) {

            var offlineFlag = jasmine.createSpyObj('offlineRequisitions', ['getAll']);
            offlineFlag.getAll.andReturn([false]);
            $provide.factory('localStorageFactory', function() {
                return function(name) {
                    if (name === 'offlineFlag') {
                        return offlineFlag;
                    }
                    return context.offlineRequisitions;
                };
            });

        });

        inject(function($injector) {
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            this.REQUISITION_STATUS = $injector.get('REQUISITION_STATUS');
            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.authorizationService = $injector.get('authorizationService');
            this.Requisition = $injector.get('Requisition');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.LineItem = $injector.get('LineItem');
            this.UuidGenerator = $injector.get('UuidGenerator');
            this.requisitionCacheService = $injector.get('requisitionCacheService');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        var requisitionDataBuilder = new this.RequisitionDataBuilder();
        this.sourceRequisition = requisitionDataBuilder.withRequisitionLineItems([
            new this.RequisitionLineItemDataBuilder()
                .fullSupplyForProgram(requisitionDataBuilder.program)
                .buildJson(),
            new this.RequisitionLineItemDataBuilder()
                .nonFullSupplyForProgram(requisitionDataBuilder.program)
                .buildJson(),
            new this.RequisitionLineItemDataBuilder()
                .fullSupplyForProgram(requisitionDataBuilder.program)
                .buildJson()
        ]).buildJson();

        this.calculatedOrderQuantity = {
            isDisplayed: true
        };

        this.key = 'key';
        this.UuidGenerator.prototype.generate = function() {
            return context.key;
        };
        this.requisition = new this.Requisition(this.sourceRequisition);

        spyOn(this.requisition.template, 'getColumn').andReturn(this.calculatedOrderQuantity);
        spyOn(this.authorizationService, 'isAuthenticated');
        spyOn(this.requisitionCacheService, 'cacheRequisition').andCallThrough();

        var REQUISITION_RIGHTS = this.REQUISITION_RIGHTS;
        spyOn(this.authorizationService, 'hasRight').andCallFake(function(right) {
            if (context.userHasApproveRight && right === REQUISITION_RIGHTS.REQUISITION_APPROVE) {
                return true;
            }
            if (context.userHasAuthorizeRight && right === REQUISITION_RIGHTS.REQUISITION_AUTHORIZE) {
                return true;
            }
            if (context.userHasCreateRight && right === REQUISITION_RIGHTS.REQUISITION_CREATE) {
                return true;
            }
            if (context.userHasDeleteRight && right === REQUISITION_RIGHTS.REQUISITION_DELETE) {
                return true;
            }
            return false;
        });
    });

    describe('submit', function() {

        it('should submit requisition that is available offline', function() {
            var storedRequisition;
            this.requisitionCacheService.cacheRequisition.andCallFake(function(argument) {
                storedRequisition = argument;
            });

            this.key = 'new-key';

            expect(this.requisition.$isSubmitted()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.SUBMITTED;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/submit')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = true;
            this.requisition.$submit();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isSubmitted()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
            expect(storedRequisition.$modified).toBe(false);
            expect(storedRequisition.$availableOffline).toBe(true);
            expect(storedRequisition.id).toEqual(this.requisition.id);
            expect(storedRequisition.idempotencyKey).toEqual(this.key);
        });

        it('should update modifiedDate, status and statusChanges of a requisition', function() {
            var storedRequisition, updatedRequisition;
            this.requisitionCacheService.cacheRequisition.andCallFake(function(argument) {
                storedRequisition = argument;
            });

            updatedRequisition = angular.copy(this.requisition);
            updatedRequisition.status = this.REQUISITION_STATUS.SUBMITTED;
            updatedRequisition.modifiedDate = [2016, 4, 31, 16, 25, 33];
            updatedRequisition.statusChanges = 'statusChanges';

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/submit')
            )
                .respond(200, updatedRequisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = true;
            this.requisition.$submit();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
            expect(storedRequisition.modifiedDate).toEqual(updatedRequisition.modifiedDate);
            expect(storedRequisition.status).toEqual(updatedRequisition.status);
            expect(storedRequisition.statusChanges).toEqual(updatedRequisition.statusChanges);
        });

        it('should save requisition to local storage after updating it', function() {
            var storedRequisition, updatedRequisition;
            this.requisitionCacheService.cacheRequisition.andCallFake(function(argument) {
                storedRequisition = argument;
            });

            updatedRequisition = angular.copy(this.requisition);

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/submit')
            )
                .respond(200, updatedRequisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = true;
            this.requisition.$submit();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
            expect(storedRequisition.id).toEqual(updatedRequisition.id);
        });

        it('should submit requisition that is not available offline', function() {
            expect(this.requisition.$isSubmitted()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.SUBMITTED;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/submit')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = false;
            this.requisition.$submit();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isSubmitted()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).not.toHaveBeenCalled();
        });
    });

    describe('authorize', function() {

        it('should authorize requisition that is available offline', function() {
            var storedRequisition;
            this.requisitionCacheService.cacheRequisition.andCallFake(function(argument) {
                storedRequisition = argument;
            });

            this.key = 'new-key';

            expect(this.requisition.$isAuthorized()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/authorize')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = true;
            this.requisition.$authorize();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isAuthorized()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
            expect(storedRequisition.$modified).toBe(false);
            expect(storedRequisition.$availableOffline).toBe(true);
            expect(storedRequisition.id).toEqual(this.requisition.id);
            expect(storedRequisition.idempotencyKey).toEqual(this.key);
        });

        it('should authorize requisition that is not available offline', function() {
            expect(this.requisition.$isAuthorized()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/authorize')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = false;
            this.requisition.$authorize();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isAuthorized()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).not.toHaveBeenCalled();
        });

        it('should set approved quantity to requested quantity when requested quantity is not empty', function() {
            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;
            this.requisition.template.getColumn('this.calculatedOrderQuantity').isDisplayed = true;
            this.requisition.requisitionLineItems[0].requestedQuantity = 10;
            this.requisition.requisitionLineItems[1].requestedQuantity = 15;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/authorize')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = false;
            this.requisition.$authorize();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isAuthorized()).toBe(true);
            expect(this.requisition.requisitionLineItems[0].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[0].requestedQuantity);

            expect(this.requisition.requisitionLineItems[1].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[1].requestedQuantity);
        });

        it('should set approved quantity to calculated quantity when calculated quantity is displayed and requested' +
            ' quantity is empty', function() {
            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;
            this.requisition.template.getColumn('this.calculatedOrderQuantity').isDisplayed = true;
            this.requisition.requisitionLineItems[0].requestedQuantity = null;
            this.requisition.requisitionLineItems[1].requestedQuantity = null;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/authorize')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: starts here

            this.requisition.$availableOffline = false;
            this.requisition.$authorize();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isAuthorized()).toBe(true);
            expect(this.requisition.requisitionLineItems[0].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[0].calculatedOrderQuantity);

            expect(this.requisition.requisitionLineItems[1].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[1].calculatedOrderQuantity);
        });

        it('should set approved quantity to requested quantity when calculated quantity is not displayed', function() {
            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;
            this.requisition.template.getColumn('this.calculatedOrderQuantity').isDisplayed = false;
            this.requisition.requisitionLineItems[0].requestedQuantity = 15;
            this.requisition.requisitionLineItems[1].requestedQuantity = null;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.whenPOST(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id + '/authorize')
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$availableOffline = false;
            this.requisition.$authorize();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isAuthorized()).toBe(true);
            expect(this.requisition.requisitionLineItems[0].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[0].requestedQuantity);

            expect(this.requisition.requisitionLineItems[1].approvedQuantity)
                .toBe(this.requisition.requisitionLineItems[1].requestedQuantity);
        });
    });

    describe('approve', function() {

        it('should approve requisition that is available offline', function() {
            var storedRequisition;
            this.requisitionCacheService.cacheRequisition.andCallFake(function(argument) {
                storedRequisition = argument;
            });

            expect(this.requisition.$isApproved()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.APPROVED;

            this.$httpBackend
                .whenPOST(this.requisitionUrlFactory('/api/siglusintegration/requisitions/'
                    + this.requisition.id + '/approve'))
                .respond(200, this.requisition);

            this.requisition.$availableOffline = true;
            this.requisition.$approve();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isApproved()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).toHaveBeenCalledWith(this.requisition);
            expect(storedRequisition.$modified).toBe(false);
            expect(storedRequisition.$availableOffline).toBe(true);
            expect(storedRequisition.id).toEqual(this.requisition.id);
            expect(storedRequisition.idempotencyKey).toEqual(this.key);
        });

        it('should approve requisition that is not available offline', function() {
            expect(this.requisition.$isApproved()).toBe(false);

            this.requisition.status = this.REQUISITION_STATUS.APPROVED;

            this.$httpBackend
                .whenPOST(this.requisitionUrlFactory('/api/siglusintegration/requisitions/'
                    + this.requisition.id + '/approve'))
                .respond(200, this.requisition);

            this.requisition.$availableOffline = false;
            this.requisition.$approve();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.requisition.$isApproved()).toBe(true);
            expect(this.requisitionCacheService.cacheRequisition).not.toHaveBeenCalled();
        });
    });

    describe('reject', function() {

        it('should reject requisition', function() {
            var data;

            this.$httpBackend
                .whenPUT(this.requisitionUrlFactory('/api/requisitions/' + this.requisition.id + '/reject'))
                .respond(200, this.requisition);

            this.requisition.$reject().then(function(response) {
                data = response;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(data)).toEqual(angular.toJson(this.requisition));
        });

    });

    describe('skip', function() {

        it('should skip requisition', function() {
            var data;

            this.$httpBackend
                .whenPUT(this.requisitionUrlFactory('/api/requisitions/' + this.requisition.id + '/skip'))
                .respond(200, this.requisition);

            this.requisition.$skip().then(function(response) {
                data = response;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(data)).toEqual(angular.toJson(this.requisition));
        });
    });

    describe('remove', function() {

        it('should remove requisition', function() {
            var data;

            this.$httpBackend
            // SIGLUS-REFACTOR: starts here
                .whenDELETE(this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id))
                // SIGLUS-REFACTOR: ends here
                .respond(200, this.requisition);

            this.requisition.$remove().then(function(response) {
                data = response;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(data)).toEqual(angular.toJson(this.requisition));
        });

        it('should not approve requisition if request fails', function() {
            this.$httpBackend
            // SIGLUS-REFACTOR: starts here
                .whenDELETE(this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id))
                // SIGLUS-REFACTOR: ends here
                .respond(500);

            var spy = jasmine.createSpy();
            this.requisition.$remove().then(spy);

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('save', function() {

        it('should save requisition', function() {
            var data;

            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .whenPUT(this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id))
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.name = 'Saved requisition';

            this.requisition.$save().then(function(response) {
                data = response;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(data)).toEqual(angular.toJson(this.requisition));
        });

        it('should remove offline when 403', function() {
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .whenPUT(this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id))
                .respond(403, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$save();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.offlineRequisitions.removeBy).toHaveBeenCalledWith('id', this.requisition.id);
        });

        it('should remove offline when 409', function() {
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .whenPUT(this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id))
                .respond(403, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$save();

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.offlineRequisitions.removeBy).toHaveBeenCalledWith('id', this.requisition.id);
        });

        it('should remove extra fields before sending a request', function() {
            var expected = angular.copy(this.requisition);

            expected.requisitionLineItems[0].stockOnHand = null;
            expected.requisitionLineItems[1].stockOnHand = null;
            expected.requisitionLineItems[2].stockOnHand = null;

            delete this.requisition.requisitionLineItems[0].$program;
            delete this.requisition.requisitionLineItems[1].$program;
            delete this.requisition.requisitionLineItems[2].$program;

            delete this.requisition.requisitionLineItems[0].$errors;
            delete this.requisition.requisitionLineItems[1].$errors;
            delete this.requisition.requisitionLineItems[2].$errors;

            expected.requisitionLineItems[0].orderable = {
                id: expected.requisitionLineItems[0].orderable.id,
                versionNumber: expected.requisitionLineItems[0].orderable.meta.versionNumber
            };
            expected.requisitionLineItems[1].orderable = {
                id: expected.requisitionLineItems[1].orderable.id,
                versionNumber: expected.requisitionLineItems[1].orderable.meta.versionNumber

            };
            expected.requisitionLineItems[2].orderable = {
                id: expected.requisitionLineItems[2].orderable.id,
                versionNumber: expected.requisitionLineItems[2].orderable.meta.versionNumber
            };

            expected.processingPeriod.startDate = '2017-01-01';
            expected.processingPeriod.endDate = '2017-01-31';

            expected.program = {
                id: expected.program.id
            };

            expected.facility = {
                id: expected.facility.id
            };

            delete expected.availableNonFullSupplyProducts;
            delete expected.availableFullSupplyProducts;
            delete expected.availableProducts;
            delete expected.stockAdjustmentReasons;
            delete expected.template;

            var $httpBackend = this.$httpBackend;
            // SIGLUS-REFACTOR: starts here
            $httpBackend.expectPUT(
                this.requisitionUrlFactory('/api/siglusintegration/requisitions/' + this.requisition.id), expected
            )
                .respond(200, this.requisition);
            // SIGLUS-REFACTOR: ends here

            this.requisition.$save();
            this.$httpBackend.flush();
            this.$rootScope.$apply();
        });
    });

    describe('isInitiated', function() {

        it('should return true if requisition status is initiated', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isInitiated = this.requisition.$isInitiated();

            expect(isInitiated).toBe(true);
        });

        it('should return false if requisition status is not initiated', function() {
            this.requisition.status = this.REQUISITION_STATUS.SUBMITTED;

            var isInitiated = this.requisition.$isInitiated();

            expect(isInitiated).toBe(false);
        });
    });

    describe('isSubmitted', function() {

        it('should return true if requisition status is submitted', function() {
            this.requisition.status = this.REQUISITION_STATUS.SUBMITTED;

            var isSubmitted = this.requisition.$isSubmitted();

            expect(isSubmitted).toBe(true);
        });

        it('should return false if requisition status is not submitted', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isSubmitted = this.requisition.$isSubmitted();

            expect(isSubmitted).toBe(false);
        });
    });

    describe('isAuthorized', function() {

        it('should return true if requisition status is authorized', function() {
            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;

            var isAuthorized = this.requisition.$isAuthorized();

            expect(isAuthorized).toBe(true);
        });

        it('should return false if requisition status is not authorized', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isAuthorized = this.requisition.$isAuthorized();

            expect(isAuthorized).toBe(false);
        });
    });

    describe('isApproved', function() {

        it('should return true if requisition status is approved', function() {
            this.requisition.status = this.REQUISITION_STATUS.APPROVED;

            var isApproved = this.requisition.$isApproved();

            expect(isApproved).toBe(true);
        });

        it('should return false if requisition status is not approved', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isApproved = this.requisition.$isApproved();

            expect(isApproved).toBe(false);
        });
    });

    describe('isReleased', function() {

        it('should return true if requisition status is released', function() {
            this.requisition.status = this.REQUISITION_STATUS.RELEASED;

            var isReleased = this.requisition.$isReleased();

            expect(isReleased).toBe(true);
        });

        it('should return false if requisition status is not released', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isReleased = this.requisition.$isReleased();

            expect(isReleased).toBe(false);
        });
    });

    describe('isRejected', function() {

        it('should return true if requisition status is rejected', function() {
            this.requisition.status = this.REQUISITION_STATUS.REJECTED;

            var isRejected = this.requisition.$isRejected();

            expect(isRejected).toBe(true);
        });

        it('should return false if requisition status is not rejected', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isRejected = this.requisition.$isRejected();

            expect(isRejected).toBe(false);
        });
    });

    describe('isSkipped', function() {

        it('should return true if requisition status is skipped', function() {
            this.requisition.status = this.REQUISITION_STATUS.SKIPPED;

            var isSkipped = this.requisition.$isSkipped();

            expect(isSkipped).toBe(true);
        });

        it('should return false if requisition status is not skipped', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            var isSkipped = this.requisition.$isRejected();

            expect(isSkipped).toBe(false);
        });
    });

    describe('isAfterAuthorize', function() {
        it('should return false for requisition status INITIATED', function() {
            this.requisition.status = this.REQUISITION_STATUS.INITIATED;

            expect(this.requisition.$isAfterAuthorize()).toBe(false);
        });

        it('should return false for requisition status SUBMITTED', function() {
            this.requisition.status = this.REQUISITION_STATUS.SUBMITTED;

            expect(this.requisition.$isAfterAuthorize()).toBe(false);
        });

        it('should return true for requisition status AUTHORIZED', function() {
            this.requisition.status = this.REQUISITION_STATUS.AUTHORIZED;

            expect(this.requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true for requisition status IN_APPROVAL', function() {
            this.requisition.status = this.REQUISITION_STATUS.IN_APPROVAL;

            expect(this.requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true requisition status APPROVED', function() {
            this.requisition.status = this.REQUISITION_STATUS.APPROVED;

            expect(this.requisition.$isAfterAuthorize()).toBe(true);
        });

        it('should return true requisition status RELEASED', function() {
            this.requisition.status = this.REQUISITION_STATUS.RELEASED;

            expect(this.requisition.$isAfterAuthorize()).toBe(true);
        });
    });

    describe('constructor', function() {

        beforeEach(function() {
            this.userHasApproveRight = false;
            this.userHasAuthorizeRight = false;
            this.userHasCreateRight = false;
            this.userHasDeleteRight = false;
        });

        it('should set isEditable to true if user has REQUISITION_CREATE right and requisition is initiated',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;
                this.userHasCreateRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_CREATE right and requisition is rejected',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.REJECTED;
                this.userHasCreateRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_APPROVE right and requisition is authorized',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.AUTHORIZED;
                this.userHasApproveRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_APPROVE right and requisition is in approval',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.IN_APPROVAL;
                this.userHasApproveRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_DELETE and REQUISITION_CREATE rights and' +
            ' requisition is initiated', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;
            this.userHasDeleteRight = true;
            this.userHasCreateRight = true;

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.$isEditable).toBe(true);
        });

        it('should set isEditable to true if user has REQUISITION_DELETE and REQUISITION_CREATE rights and' +
            ' requisition is rejected', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.REJECTED;
            this.userHasDeleteRight = true;
            this.userHasCreateRight = true;

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.$isEditable).toBe(true);
        });

        it('should set isEditable to true if user has REQUISITION_DELETE and REQUISITION_AUTHORIZE rights and' +
            'requisition is submitted', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.SUBMITTED;
            this.userHasDeleteRight = true;
            this.userHasAuthorizeRight = true;

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.$isEditable).toBe(true);
        });

        it('should set isEditable to true if user has REQUISITION_AUTHORIZE right and requisition is initiated',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;
                this.userHasAuthorizeRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_AUTHORIZE right and requisition is rejected',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.REJECTED;
                this.userHasAuthorizeRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to true if user has REQUISITION_AUTHORIZE right and requisition is submitted',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.SUBMITTED;
                this.userHasAuthorizeRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(true);
            });

        it('should set isEditable to false if user does not have REQUISITION_CREATE right and requisition is initiated',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(false);
            });

        it('should set isEditable to false if user has REQUISITION_CREATE right and requisition is submitted',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.SUBMITTED;
                this.userHasCreateRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(false);
            });

        it('should set isEditable to false if user has REQUISITION_AUTHORIZE right and requisition is authorized',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.AUTHORIZED;
                this.userHasAuthorizeRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(false);
            });

        it('should set isEditable to false if user has REQUISITION_APPROVE right and requisition is approved',
            function() {
                this.sourceRequisition.status = this.REQUISITION_STATUS.APPROVED;
                this.userHasApproveRight = true;

                this.requisition = new this.Requisition(this.sourceRequisition);

                expect(this.requisition.$isEditable).toBe(false);
            });

        it('should set isEditable to false if requisition is released', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.RELEASED;
            this.userHasAuthorizeRight = true;
            this.userHasCreateRight = true;
            this.userHasApproveRight = true;
            this.userHasDeleteRight = true;

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.$isEditable).toBe(false);
        });

        it('should set idempotency key if it is not set', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;
            this.userHasCreateRight = true;

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.idempotencyKey).toBe(this.key);
        });

        it('should not set idempotency key if it is set', function() {
            this.sourceRequisition.status = this.REQUISITION_STATUS.INITIATED;
            this.userHasCreateRight = true;
            this.sourceRequisition.idempotencyKey = 'some-key';

            this.requisition = new this.Requisition(this.sourceRequisition);

            expect(this.requisition.idempotencyKey).toBe('some-key');
        });
    });

    describe('skipAllFullSupplyLineItems', function() {

        beforeEach(function() {
            var builder = new this.RequisitionDataBuilder(),
                program = builder.program;

            this.requisition = builder.withRequisitionLineItems([
                new this.RequisitionLineItemDataBuilder()
                    .asSkipped()
                    .fullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .asSkipped()
                    .nonFullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(program)
                    .buildJson()
            ])
                .build();

            this.requisition.template.getColumns.andCallFake(function(nonFullSupply) {
                return nonFullSupply ? nonFullSupplyColumns() : fullSupplyColumns();
            });
        });

        it('should skip all full supply line items', function() {
            this.requisition.skipAllFullSupplyLineItems();

            expect(this.requisition.requisitionLineItems[0].skipped).toBe(true);
            expect(this.requisition.requisitionLineItems[1].skipped).toBe(true);
        });

        it('should not touch non full supply line items', function() {
            this.requisition.skipAllFullSupplyLineItems();

            expect(this.requisition.requisitionLineItems[2].skipped).toBe(true);
            expect(this.requisition.requisitionLineItems[3].skipped).toBe(false);
        });

        it('should respect line items ability to skip', function() {
            spyOn(this.requisition.requisitionLineItems[1], 'canBeSkipped').andReturn(false);

            this.requisition.skipAllFullSupplyLineItems();

            expect(this.requisition.requisitionLineItems[1].skipped).toBe(false);
        });

    });

    describe('unskipAllFullSupplyLineItems', function() {

        beforeEach(function() {
            var builder = new this.RequisitionDataBuilder(),
                program = builder.program;

            this.requisition = builder.withRequisitionLineItems([
                new this.RequisitionLineItemDataBuilder()
                    .asSkipped()
                    .fullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .asSkipped()
                    .nonFullSupplyForProgram(program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(program)
                    .buildJson()
            ])
                .build();
        });

        it('should skip all full supply line items', function() {
            this.requisition.unskipAllFullSupplyLineItems();

            expect(this.requisition.requisitionLineItems[0].skipped).toBe(false);
            expect(this.requisition.requisitionLineItems[1].skipped).toBe(false);
        });

        it('should not touch non full supply line items', function() {
            this.requisition.unskipAllFullSupplyLineItems();

            expect(this.requisition.requisitionLineItems[2].skipped).toBe(true);
            expect(this.requisition.requisitionLineItems[3].skipped).toBe(false);
        });

    });

    describe('addLineItem', function() {

        beforeEach(function() {
            this.orderable = new this.OrderableDataBuilder().buildJson();
        });

        it('should throw exception if status is AUTHORIZED', function() {
            var requisition = new this.RequisitionDataBuilder().buildAuthorized(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is IN_APPROVAL', function() {
            var requisition = new this.RequisitionDataBuilder().buildInApproval(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is APPROVED', function() {
            var requisition = new this.RequisitionDataBuilder().buildApproved(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is SKIPPED', function() {
            var requisition = new this.RequisitionDataBuilder().buildSkipped(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is RELEASED', function() {
            var requisition = new this.RequisitionDataBuilder().buildReleased(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if line item for the given orderable already exist', function() {
            var requisition = new this.RequisitionDataBuilder().buildRejected(),
                lineItemOrderable = requisition.requisitionLineItems[0].orderable;

            expect(function() {
                requisition.addLineItem(lineItemOrderable, 10, 'explanation');
            }).toThrow('Line item for the given orderable already exist');
        });

        it('should throw exception if trying to add product that is not available for the requisition', function() {
            var requisition = new this.RequisitionDataBuilder().buildSubmitted(),
                orderable = this.orderable;

            requisition.availableFullSupplyProducts = [
                new this.OrderableDataBuilder().buildJson()
            ];

            this.orderable = new this.OrderableDataBuilder()
                .withPrograms(requisition.availableFullSupplyProducts[0].programs)
                .buildJson();

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('The given product is not available for this requisition');
        });

        it('should throw exception if orderable is not part of the requisition program', function() {
            var requisition = new this.RequisitionDataBuilder().build(),
                orderable = this.orderable;

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
            }).toThrow('The given product is not available for this requisition');
        });

        it('should throw exception if trying to add full supply product to regular requisition', function() {
            var requisition = new this.RequisitionDataBuilder().build();
            requisition.availableFullSupplyProducts = [
                requisition.availableProducts[0]
            ];
            var orderable = requisition.availableFullSupplyProducts[0];

            expect(function() {
                requisition.addLineItem(orderable, 10, 'explanation');
                // SIGLUS-REFACTOR: starts here
            }).toThrow('The given product is not available for this requisition');
            // SIGLUS-REFACTOR: ends here
        });

        it('should add new available full supply line item to emergency requisition', function() {
            this.requisition = new this.RequisitionDataBuilder().buildEmergency();
            this.requisition.availableFullSupplyProducts = [
                this.requisition.availableProducts[0]
            ];

            var orderable = this.requisition.availableFullSupplyProducts[0];
            // SIGLUS-REFACTOR: starts here
            orderable.programs.forEach(function(program) {
                program.parentId = program.programId;
            });
            // SIGLUS-REFACTOR: ends here

            this.requisition.addLineItem(orderable, 16, 'explanation');

            expect(this.requisition.requisitionLineItems.length).toBe(3);
            expect(this.requisition.requisitionLineItems[2].orderable).toEqual(orderable);
            expect(this.requisition.requisitionLineItems[2].requestedQuantity).toEqual(16);
            expect(this.requisition.requisitionLineItems[2].requestedQuantityExplanation)
                .toEqual('explanation');
        });

        it('should add new available non full supply line item', function() {
            this.requisition = new this.RequisitionDataBuilder().build();
            this.requisition.availableNonFullSupplyProducts = [
                this.requisition.availableProducts[3]
            ];

            var orderable = this.requisition.availableNonFullSupplyProducts[0];
            // SIGLUS-REFACTOR: starts here
            orderable.programs.forEach(function(program) {
                program.parentId = program.programId;
            });
            // SIGLUS-REFACTOR: ends here

            this.requisition.addLineItem(orderable, 16, 'explanation');

            expect(this.requisition.requisitionLineItems.length).toBe(3);
            expect(this.requisition.requisitionLineItems[2].orderable).toEqual(orderable);
            expect(this.requisition.requisitionLineItems[2].requestedQuantity).toEqual(16);
            expect(this.requisition.requisitionLineItems[2].requestedQuantityExplanation)
                .toEqual('explanation');
        });

        it('should add instance of the LineItem class', function() {
            this.requisition = new this.RequisitionDataBuilder().buildSubmitted();
            this.requisition.availableNonFullSupplyProducts = [
                this.requisition.availableProducts[3]
            ];
            var orderable = this.requisition.availableNonFullSupplyProducts[0];
            // SIGLUS-REFACTOR: starts here
            orderable.programs.forEach(function(program) {
                program.parentId = program.programId;
            });
            // SIGLUS-REFACTOR: ends here

            this.requisition.addLineItem(orderable, 16, 'explanation');

            expect(this.requisition.requisitionLineItems[2] instanceof this.LineItem).toBe(true);
        });

    });

    describe('addLineItems', function() {

        beforeEach(function() {
            this.orderables = [
                new this.OrderableDataBuilder().build(),
                new this.OrderableDataBuilder().build()
            ];

            this.requisition = new this.RequisitionDataBuilder().build();
            this.requisition.addLineItem.andReturn();
        });

        it('should create line item for all orderables', function() {
            this.requisition.addLineItems(this.orderables);

            expect(this.requisition.addLineItem).toHaveBeenCalledWith(this.orderables[0]);
            expect(this.requisition.addLineItem).toHaveBeenCalledWith(this.orderables[1]);
        });

    });

    describe('deleteLineItem', function() {

        it('should throw exception if status is AUTHORIZED', function() {
            var requisition = new this.RequisitionDataBuilder().buildAuthorized();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[1]);
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is IN_APPROVAL', function() {
            var requisition = new this.RequisitionDataBuilder().buildInApproval();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[1]);
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is APPROVED', function() {
            var requisition = new this.RequisitionDataBuilder().buildApproved();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[1]);
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is SKIPPED', function() {
            var requisition = new this.RequisitionDataBuilder().buildSkipped();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[1]);
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if status is RELEASED', function() {
            var requisition = new this.RequisitionDataBuilder().buildReleased();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[1]);
            }).toThrow('Can not add or remove line items past SUBMITTED status');
        });

        it('should throw exception if trying to remove non existent line item', function() {
            var requisition = new this.RequisitionDataBuilder().build();

            var otherRequisition = new this.RequisitionDataBuilder().build();

            expect(function() {
                requisition.deleteLineItem(otherRequisition.requisitionLineItems[0]);
            }).toThrow('The given line item is not part of this requisition');
        });

        it('should throw exception if trying to remove full supply line item', function() {
            var requisition = new this.RequisitionDataBuilder().buildRejected();

            expect(function() {
                requisition.deleteLineItem(requisition.requisitionLineItems[0]);
            }).toThrow('Can not delete full supply line items');
        });

        it('should remove valid line item', function() {
            var requisition = new this.RequisitionDataBuilder().buildRejected();

            requisition.deleteLineItem(requisition.requisitionLineItems[1]);

            expect(requisition.requisitionLineItems.length).toBe(1);
        });

    });

    describe('getSkippedFullSupplyProducts', function() {

        it('should return empty list if none of the line items is skipped', function() {
            expect(this.requisition.getSkippedFullSupplyProducts()).toEqual([]);
        });

        it('should skipped full supply products', function() {
            this.requisition.requisitionLineItems[0].skipped = true;

            expect(this.requisition.getSkippedFullSupplyProducts()).toEqual([
                this.requisition.requisitionLineItems[0].orderable
            ]);
        });

        it('should ignore non-full supply products', function() {
            this.requisition.requisitionLineItems[0].skipped = true;
            this.requisition.requisitionLineItems[1].skipped = true;

            expect(this.requisition.getSkippedFullSupplyProducts()).toEqual([
                this.requisition.requisitionLineItems[0].orderable
            ]);
        });

    });

    describe('unskipFullSupplyProducts', function() {

        it('should throw exception if undefined is passed', function() {
            expect(function() {
                this.requisition.unskipFullSupplyProducts();
            }).toThrow();
        });

        it('should do nothing if empty list was given', function() {
            this.requisition.requisitionLineItems[0].skipped = true;
            this.requisition.requisitionLineItems[2].skipped = true;

            this.requisition.unskipFullSupplyProducts([]);

            expect(this.requisition.requisitionLineItems[0].skipped).toBe(true);
            expect(this.requisition.requisitionLineItems[2].skipped).toBe(true);
        });

        it('should unskip line items for passed products', function() {
            this.requisition.requisitionLineItems[0].skipped = true;
            this.requisition.requisitionLineItems[2].skipped = true;

            this.requisition.unskipFullSupplyProducts([
                this.requisition.requisitionLineItems[0].orderable,
                this.requisition.requisitionLineItems[2].orderable
            ]);

            expect(this.requisition.requisitionLineItems[0].skipped).toBe(false);
            expect(this.requisition.requisitionLineItems[2].skipped).toBe(false);
        });

    });

    function nonFullSupplyColumns() {
        return [
            column('Three'),
            column('Four')
        ];
    }

    function fullSupplyColumns() {
        return [
            column('One'),
            column('Two')
        ];
    }

    function column(suffix) {
        return {
            name: 'Column' + suffix
        };
    }

});
