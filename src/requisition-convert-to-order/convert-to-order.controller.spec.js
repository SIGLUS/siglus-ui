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

describe('ConvertToOrderController', function() {

    var UuidGenerator, ProgramDataBuilder, FacilityDataBuilder;

    beforeEach(function() {
        module('requisition-convert-to-order');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionService = $injector.get('requisitionService');
            this.notificationService = $injector.get('notificationService');
            this.$state = $injector.get('$state');
            this.confirmService = $injector.get('confirmService');
            this.loadingModalService = $injector.get('loadingModalService');

            UuidGenerator = $injector.get('UuidGenerator');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');

            this.key = 'key';
            spyOn(UuidGenerator.prototype, 'generate').andCallFake(function() {
                return 'key';
            });

            this.stateParams = {
                programId: 'program-id',
                facilityId: 'facility-id',
                page: 0,
                size: 10
            };
            this.supplyingDepots = [
                new FacilityDataBuilder().build(),
                new FacilityDataBuilder().build()
            ];
            this.facilities = [
                new FacilityDataBuilder().build(),
                new FacilityDataBuilder().build()
            ];
            this.programs = [
                new ProgramDataBuilder().build(),
                new ProgramDataBuilder().build()
            ];
            this.requisitions = [
                {
                    requisition: {
                        id: 'requisitionId1',
                        facility: new FacilityDataBuilder().build(),
                        program: new ProgramDataBuilder().build()
                    },
                    supplyingDepots: this.supplyingDepots
                },
                {
                    requisition: {
                        id: 'requisitonId2',
                        facility: new FacilityDataBuilder().build(),
                        program: new ProgramDataBuilder().build()
                    },
                    supplyingDepots: this.supplyingDepots
                }
            ];

            this.vm = $injector.get('$controller')('ConvertToOrderController', {
                requisitions: this.requisitions,
                $stateParams: this.stateParams,
                facilities: this.facilities,
                programs: this.programs
            });
        });
    });

    it('should assign facilities', function() {
        expect(this.vm.facilities).toEqual(this.facilities);
    });

    it('should assign programs', function() {
        expect(this.vm.programs).toEqual(this.programs);
    });

    describe('convertToOrder', function() {
        var confirmDeferred, convertDeferred, loadingDeferred;

        beforeEach(function() {
            confirmDeferred = this.$q.defer();
            convertDeferred = this.$q.defer();
            loadingDeferred = this.$q.defer();

            spyOn(this.loadingModalService, 'open').andReturn(loadingDeferred.promise);
            spyOn(this.loadingModalService, 'close').andReturn();
            spyOn(this.confirmService, 'confirm').andReturn(confirmDeferred.promise);
            spyOn(this.requisitionService, 'convertToOrder').andReturn(convertDeferred.promise);
            spyOn(this.notificationService, 'error').andReturn();
            spyOn(this.notificationService, 'success').andReturn();
        });

        it('should show error if requisition does not have facility selected', function() {
            this.vm.requisitions[0].$selected = true;

            this.vm.convertToOrder(this.requisitions[0]);

            expect(this.notificationService.error)
                .toHaveBeenCalledWith('requisitionConvertToOrder.noSupplyingDepotSelected');
        });

        it('should not call requisitionService if requisition does not have facility selected', function() {
            this.vm.requisitions[0].$selected = true;

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.requisitionService.convertToOrder).not.toHaveBeenCalled();
        });

        it('should call confirmation modal', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.confirmService.confirm)
                .toHaveBeenCalledWith('requisitionConvertToOrder.convertToOrder.confirm');
        });

        it('should bring up loading modal if confirmation passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should call requisitionService if confirmation passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            var requisition = this.vm.requisitions[0],
                key = this.key;

            expect(this.requisitionService.convertToOrder).toHaveBeenCalledWith([
                requisition
            ], key);
        });

        it('should show alert if convert passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();
            loadingDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.notificationService.success)
                .toHaveBeenCalledWith('requisitionConvertToOrder.convertToOrder.success');
        });

        it('should show error if convert failed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.reject();
            this.$rootScope.$apply();

            expect(this.notificationService.error)
                .toHaveBeenCalledWith('requisitionConvertToOrder.errorOccurred');
        });

        it('should close loading modal if convert failed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.convertToOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.reject();
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

    });

    describe('releaseWithoutOrder', function() {
        var confirmDeferred, convertDeferred, loadingDeferred;

        beforeEach(function() {
            confirmDeferred = this.$q.defer();
            convertDeferred = this.$q.defer();
            loadingDeferred = this.$q.defer();

            spyOn(this.loadingModalService, 'open').andReturn(loadingDeferred.promise);
            spyOn(this.loadingModalService, 'close').andReturn();
            spyOn(this.confirmService, 'confirm').andReturn(confirmDeferred.promise);
            spyOn(this.requisitionService, 'releaseWithoutOrder').andReturn(convertDeferred.promise);
            spyOn(this.notificationService, 'error').andReturn();
            spyOn(this.notificationService, 'success').andReturn();
        });

        it('should not call requisitionService if no requisition is selected', function() {
            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.requisitionService.releaseWithoutOrder).not.toHaveBeenCalled();
        });

        it('should show error if requisition does not have facility selected', function() {
            this.vm.requisitions[0].$selected = true;

            this.vm.releaseWithoutOrder(this.requisitions[0]);

            expect(this.notificationService.error)
                .toHaveBeenCalledWith('requisitionConvertToOrder.noSupplyingDepotSelected');
        });

        it('should not call requisitionService if requisition does not have facility selected', function() {
            this.vm.requisitions[0].$selected = true;

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.requisitionService.releaseWithoutOrder).not.toHaveBeenCalled();
        });

        it('should call confirmation modal', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.confirmService.confirm)
                .toHaveBeenCalledWith('requisitionConvertToOrder.releaseWithoutOrder.confirm');
        });

        it('should bring up loading modal if confirmation passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should call requisitionService if confirmation passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();

            var requisition = this.vm.requisitions[0],
                key = this.key;

            expect(this.requisitionService.releaseWithoutOrder).toHaveBeenCalledWith([
                requisition
            ], key);
        });

        it('should show alert if release without order passed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.resolve();
            this.$rootScope.$apply();
            loadingDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.notificationService.success)
                .toHaveBeenCalledWith('requisitionConvertToOrder.releaseWithoutOrder.success');
        });

        it('should show error if release without order failed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.reject();
            this.$rootScope.$apply();

            expect(this.notificationService.error)
                .toHaveBeenCalledWith('requisitionConvertToOrder.errorOccurred');
        });

        it('should close loading modal if release without order failed', function() {
            this.vm.requisitions[0].$selected = true;
            this.vm.requisitions[0].requisition.supplyingFacility = this.supplyingDepots[0];

            this.vm.releaseWithoutOrder(this.requisitions[0]);
            confirmDeferred.resolve();
            convertDeferred.reject();
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

    });

    describe('search', function() {

        beforeEach(function() {
            spyOn(this.$state, 'go').andReturn();
        });

        it('should expose search method', function() {
            expect(angular.isFunction(this.vm.search)).toBe(true);
        });

        it('should call state go method', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });

        it('should call state go method with changed params', function() {
            this.vm.programId = 'programId';
            this.vm.facilityId = 'facilityId';
            this.vm.sort = 'sort';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.convertToOrder', {
                programId: 'programId',
                facilityId: 'facilityId',
                sort: 'sort',
                page: 0,
                size: 10
            }, {
                reload: true
            });
        });
    });
});
