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

describe('OpenlmisFacilityProgramSelectController', function() {

    beforeEach(function() {
        module('openlmis-facility-program-select');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$stateParams = $injector.get('$stateParams');
            this.$rootScope = $injector.get('$rootScope');
            this.scope = this.$rootScope.$new();
            this.facilityProgramCacheService = $injector.get('facilityProgramCacheService');
            this.vm = $injector.get('$controller')('OpenlmisFacilityProgramSelectController', {
                $scope: this.scope
            });
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');

        });

        this.supervisedPrograms = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        this.homeFacility = new this.FacilityDataBuilder().build();

        spyOn(this.facilityProgramCacheService, 'loadData').andReturn(this.$q.when(true));
        spyOn(this.facilityProgramCacheService, 'getUserHomeFacility').andReturn(this.homeFacility);
        spyOn(this.facilityProgramCacheService, 'getUserPrograms').andReturn(this.supervisedPrograms);
        spyOn(this.facilityProgramCacheService, 'getSupervisedFacilities').andReturn(this.facilities);
        spyOn(this.scope, '$emit');

        this.vm.$onInit();
        this.$rootScope.$apply();
    });

    describe('$onInit', function() {

        it('should expose home facility', function() {
            expect(this.vm.homeFacility).toEqual(this.homeFacility);
        });

        it('should expose supervised programs', function() {
            expect(this.vm.supervisedPrograms).toEqual(this.supervisedPrograms);
        });

        it('should expose isSupervised', function() {
            this.$stateParams.supervised = 'true';
            this.vm.$onInit();
            this.$rootScope.$apply();

            expect(this.vm.isSupervised).toEqual(true);
        });

        it('should expose program for home facility', function() {
            this.$stateParams.program = this.supervisedPrograms[0].id;
            this.vm.$onInit();
            this.$rootScope.$apply();

            expect(this.vm.program).toEqual(this.supervisedPrograms[0]);
        });
    });

    describe('updateForm', function() {

        it('should clear program', function() {
            this.vm.program = {
                id: 'some-program-id'
            };

            this.vm.updateForm();

            expect(this.vm.program).toBeUndefined();
        });

        it('should update facilities', function() {
            spyOn(this.vm, 'updateFacilities');

            this.vm.updateForm();

            expect(this.vm.updateFacilities).toHaveBeenCalledWith();
        });

    });

    describe('updateFacilities', function() {

        it('should expose home facility as facility list and select it', function() {
            this.vm.isSupervised = false;
            this.vm.updateFacilities();

            expect(this.vm.facilities).toEqual([this.homeFacility]);
            expect(this.vm.facility).toEqual(this.homeFacility);
        });

        it('should clear facilities if program is undefined', function() {
            this.vm.isSupervised = true;
            this.vm.program = undefined;
            this.vm.updateFacilities();

            expect(this.vm.facilities).toEqual([]);
        });

        it('should get supervised programs', function() {
            this.vm.isSupervised = true;
            this.vm.module = 'module';
            this.vm.program = this.supervisedPrograms[1];

            this.vm.updateFacilities();

            expect(this.vm.facilities).toEqual(this.facilities);
            expect(this.facilityProgramCacheService.getSupervisedFacilities).toHaveBeenCalledWith(this.vm.program.id);
            expect(this.vm.facility).toBeUndefined();
        });

        it('should set selected facility if facility specified in state', function() {
            this.vm.isSupervised = true;
            this.vm.program = this.supervisedPrograms[1];
            this.$stateParams.facility = this.facilities[1].id;

            this.vm.updateFacilities();

            expect(this.vm.facilities).toEqual(this.facilities);
            expect(this.facilityProgramCacheService.getSupervisedFacilities).toHaveBeenCalledWith(this.vm.program.id);
            expect(this.vm.facility).toEqual(this.facilities[1]);
        });
    });
});
