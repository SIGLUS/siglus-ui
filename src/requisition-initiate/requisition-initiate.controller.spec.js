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

describe('RequisitionInitiateController', function() {

    beforeEach(function() {
        module('requisition-initiate');

        var FacilityDataBuilder, ProgramDataBuilder, PeriodDataBuilder, RequisitionDataBuilder;

        inject(function($injector) {
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            PeriodDataBuilder = $injector.get('PeriodDataBuilder');
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');

            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.$scope = this.$rootScope.$new();
            this.requisitionService = $injector.get('requisitionService');
            this.authorizationService = $injector.get('authorizationService');
            this.$q = $injector.get('$q');
            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.loadingModalService = $injector.get('loadingModalService');
            this.UuidGenerator = $injector.get('UuidGenerator');
            // SIGLUS-REFACTOR: starts here
            this.confirmService = $injector.get('confirmService');
            this.siglusRequisitionInitiateService = $injector.get('siglusRequisitionInitiateService');
            this.siglusRequisitionDatePickerService = $injector.get('siglusRequisitionDatePickerService');
            this.dateUtils = $injector.get('dateUtils');
            // SIGLUS-REFACTOR: ends here

            this.user = {
                //eslint-disable-next-line camelcase
                user_id: 'user_id'
            };
            this.programs = [
                new ProgramDataBuilder().build(),
                new ProgramDataBuilder().build()
            ];
            this.facility = new FacilityDataBuilder().build();
            this.periods = [
                new PeriodDataBuilder()
                    // SIGLUS-REFACTOR: starts here
                    .withStartDate(this.dateUtils.toStringDate(new Date()))
                    .withEndDate(this.dateUtils.toStringDate(new Date()))
                    // SIGLUS-REFACTOR: ends here
                    .build()
            ];
            this.$stateParams = {
                facility: this.facility.id
            };

            this.requisition = new RequisitionDataBuilder()
                .withProcessingPeriod(this.periods[0])
                .withProgram(this.programs[0])
                .withFacility(this.facility)
                .buildJson();

            this.canInitiateRnr = true;

            this.permissionService = $injector.get('permissionService');
            spyOn(this.permissionService, 'hasPermission').andReturn(this.$q.resolve());

            spyOn(this.authorizationService, 'getUser').andReturn(this.user);

            this.key = 'key';

            var context = this;
            spyOn(context.UuidGenerator.prototype, 'generate').andCallFake(function() {
                return context.key;
            });

            this.vm = $injector.get('$controller')('RequisitionInitiateController', {
                periods: this.periods,
                $stateParams: this.$stateParams,
                $scope: this.$scope,
                canInitiateRnr: this.canInitiateRnr,
                // SIGLUS-REFACTOR: starts here
                inventoryDates: []
                // SIGLUS-REFACTOR: ends here
            });

            spyOn(this.$scope, '$on');

            // SIGLUS-REFACTOR: starts here
            spyOn(this.siglusRequisitionInitiateService, 'getLatestPhysicalInventory')
                .andReturn(this.$q.resolve({
                    occurredDate: new Date().toJSON()
                        .slice(0, 10)
                }));
            // SIGLUS-REFACTOR: ends here
        });
    });

    // SIGLUS-REFACTOR: delete goToRequisition relevant
    // it('should change page to requisitions.requisition for with selected period with rnrId', function() {
    //     spyOn(this.$state, 'go');
    //
    //     this.vm.goToRequisition(1);
    //
    //     expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
    //         rnr: 1
    //     });
    // });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: move to siglus-requisition-initiate-requisition.controller.spec.js
    // it('should change page to requisition full supply for newly initialized requisition in selected period',
    //     function() {
    //         this.vm.$onInit();
    //         spyOn(this.$state, 'go');
    //         spyOn(this.requisitionService, 'siglusInitiate').andReturn(this.$q.when(this.requisition));
    //         this.vm.program = this.programs[0];
    //         this.vm.facility = this.facility;
    //
    //         this.vm.initRnr(this.periods[0]);
    //         this.$rootScope.$apply();
    //
    //         expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
    //             rnr: this.requisition.id,
    //             requisition: this.requisition
    //         });
    //
    //         expect(this.permissionService.hasPermission).toHaveBeenCalledWith('user_id', {
    //             right: this.REQUISITION_RIGHTS.REQUISITION_CREATE,
    //             programId: this.programs[0].id,
    //             facilityId: this.facility.id
    //         });
    //     });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: move to siglus-requisition-initiate-requisition.controller.spec.js
    // it('should initiate requisition with idempotency key', function() {
    //     this.vm.$onInit();
    //     spyOn(this.$state, 'go');
    //     spyOn(this.requisitionService, 'siglusInitiate').andReturn(this.$q.when(this.requisition));
    //
    //     this.vm.program = this.programs[0];
    //     this.vm.facility = this.facility;
    //
    //     this.vm.initRnr(this.periods[0]);
    //     this.$rootScope.$apply();
    //
    //     expect(this.requisitionService.siglusInitiate)
    //         .toHaveBeenCalledWith(this.vm.facility.id, this.vm.program.id, this.periods[0].id,
    //             this.vm.emergency, this.key, this.periods[0].startDate);
    // });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: move to siglus-requisition-initiate-requisition.controller.spec.js
    // it('should display error when user has no right to init requisition', function() {
    //     this.permissionService.hasPermission.andReturn(this.$q.reject());
    //
    //     this.vm.$onInit();
    //     spyOn(this.$state, 'go');
    //     spyOn(this.requisitionService, 'initiate');
    //     this.vm.program = this.programs[0];
    //     this.vm.facility = this.facility;
    //
    //     this.vm.initRnr(this.periods[0]);
    //     this.$rootScope.$apply();
    //
    //     expect(this.$state.go).not.toHaveBeenCalled();
    //     expect(this.permissionService.hasPermission).toHaveBeenCalled();
    //     expect(this.requisitionService.initiate).not.toHaveBeenCalled();
    // });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: move to siglus-requisition-initiate-requisition.controller.spec.js
    // it('should not change page to requisitions.requisition with selected period without rnrId and when invalid' +
    //     ' response from service', function() {
    //
    //     spyOn(this.requisitionService, 'initiate').andReturn(this.$q.reject(this.requisition));
    //     spyOn(this.$state, 'go');
    //     this.vm.program = this.programs[0];
    //     this.vm.facility = this.facility;
    //
    //     this.vm.initRnr(selectedPeriod);
    //     this.$rootScope.$apply();
    //
    //     expect(this.$state.go).not.toHaveBeenCalled();
    //     expect(this.UuidGenerator.prototype.generate.calls.length).toEqual(2);
    // });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: move to siglus-requisition-initiate-requisition.controller.spec.js
    // it('should open loading modal', function() {
    //     spyOn(this.loadingModalService, 'open');
    //     this.vm.program = this.programs[0];
    //     this.vm.facility = this.facility;
    //
    //     this.vm.initRnr(this.periods[0]);
    //
    //     expect(this.loadingModalService.open).toHaveBeenCalled();
    // });
    // SIGLUS-REFACTOR: ends here

    // it('should reload periods with proper data', function() {
    //     spyOn(this.$state, 'go');
    //     // SIGLUS-REFACTOR: starts here
    //     this.$state.current = {
    //         name: 'openlmis.requisitions.initRnr.requisition'
    //     };
    //     // SIGLUS-REFACTOR: ends here
    //     this.vm.program = this.programs[0];
    //     this.vm.facility = this.facility;
    //     this.vm.isSupervised = false;
    //
    //     this.vm.$onInit();
    //     this.vm.loadPeriods();
    //     this.$rootScope.$apply();
    //
    //     // SIGLUS-REFACTOR: starts here
    //     expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.initRnr.requisition', {
    //         supervised: false,
    //         emergency: false,
    //         program: this.vm.program.id,
    //         facility: this.vm.facility.id,
    //         replaceId: ''
    //     }, {
    //         reload: 'openlmis.requisitions.initRnr.requisition'
    //     });
    //     // SIGLUS-REFACTOR: ends here
    // });

    // SIGLUS-REFACTOR: add test for goToHistory
    it('should change page to openlmis.requisitions.initRnr.history', function() {
        spyOn(this.$state, 'go');

        this.vm.goToHistory();

        expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.initRnr.history', {});
    });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: add test for isHistory
    it('should return true when current state name is openlmis.requisitions.initRnr.history', function() {
        this.$state.current.name = 'openlmis.requisitions.initRnr.history';

        expect(this.vm.isHistory()).toBe(true);
    });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: add test for goToRequsition
    it('should change page to openlmis.requisitions.initRnr.requisition', function() {
        spyOn(this.$state, 'go');

        this.vm.goToRequisition();

        expect(this.$state.go).toHaveBeenCalledWith('openlmis.requisitions.initRnr.requisition', {
            replaceId: ''
        });
    });
    // SIGLUS-REFACTOR: ends here

    // SIGLUS-REFACTOR: add test for isRequisition
    it('should return true when current state name is openlmis.requisitions.initRnr.requisition', function() {
        this.$state.current.name = 'openlmis.requisitions.initRnr.requisition';

        expect(this.vm.isRequisition()).toBe(true);
    });
    // SIGLUS-REFACTOR: ends here

    describe('test getMLProgramParam methods', function() {
        it('should return result contains replaceId attribute when current selected program is Malaria', function() {
            this.vm.program = {
                name: 'Malaria',
                code: 'ML',
                id: 'ad8c9a54-cc66-4395-a353-1849caec87da'
            };
            this.vm.programs = [
                {
                    name: 'Malaria',
                    code: 'ML',
                    id: 'ad8c9a54-cc66-4395-a353-1849caec87da'
                },
                {
                    name: 'Via Clássica',
                    code: 'VC',
                    id: 'dce17f2e-af3e-40ad-8e00-3496adef44c3'
                }
            ];

            expect(this.vm.getMLProgramParam({})).toEqual({
                replaceId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3'
            });
        });

        it('should return result not contains replaceId attribute when current selected program is not Malaria',
            function() {
                this.vm.program = {
                    name: 'Testes Rápidos Diag.',
                    code: 'TR',
                    id: 'ad8c9a54-cc66-4395-a353-1849caec87da'
                };
                this.vm.programs = [
                    {
                        name: 'Testes Rápidos Diag.',
                        code: 'TR',
                        id: 'ad8c9a54-cc66-4395-a353-1849caec87da'
                    },
                    {
                        name: 'Malaria',
                        code: 'ML',
                        id: 'ad8c9a54-cc66-4395-a353-1849caec87da'
                    },
                    {
                        name: 'Via Clássica',
                        code: 'VC',
                        id: 'dce17f2e-af3e-40ad-8e00-3496adef44c3'
                    }
                ];

                expect(this.vm.getMLProgramParam({})).toEqual({
                    replaceId: ''
                });
            });
    });
});
