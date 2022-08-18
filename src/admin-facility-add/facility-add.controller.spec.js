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

describe('FacilityAddController', function() {

    beforeEach(function() {
        module('admin-facility-add');
        module('referencedata-facility');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.confirmService = $injector.get('confirmService');
            this.$q = $injector.get('$q');
            this.FacilityRepository = $injector.get('FacilityRepository');
            this.stateTrackerService = $injector.get('stateTrackerService');
            this.$state = $injector.get('$state');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
            this.messageService = $injector.get('messageService');
            this.facilityService = $injector.get('facilityService');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.FacilityTypeDataBuilder = $injector.get(
                'FacilityTypeDataBuilder'
            );
            this.GeographicZoneDataBuilder = $injector.get(
                'GeographicZoneDataBuilder'
            );
            this.FacilityOperatorDataBuilder = $injector.get(
                'FacilityOperatorDataBuilder'
            );
        });

        this.facility = new this.FacilityDataBuilder().withoutId()
            .build();

        this.facilityTypes = [
            new this.FacilityTypeDataBuilder().build(),
            new this.FacilityTypeDataBuilder().build(),
            new this.FacilityTypeDataBuilder().build()
        ];

        this.geographicZones = [
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build()
        ];

        this.facilityOperators = [
            new this.FacilityOperatorDataBuilder().build(),
            new this.FacilityOperatorDataBuilder().build()
        ];

        this.confirmDeferred = this.$q.defer();
        this.saveDeferred = this.$q.defer();
        var loadingDeferred = this.$q.defer();

        spyOn(this.confirmService, 'confirm').andReturn(
            this.confirmDeferred.promise
        );
        spyOn(this.stateTrackerService, 'goToPreviousState').andCallFake(
            loadingDeferred.resolve
        );
        spyOn(this.FacilityRepository.prototype, 'create').andReturn(
            this.saveDeferred.promise
        );
        spyOn(this.$state, 'go');
        spyOn(this.loadingModalService, 'open').andReturn(
            loadingDeferred.promise
        );
        spyOn(this.loadingModalService, 'close').andCallFake(
            loadingDeferred.resolve
        );
        spyOn(this.notificationService, 'success');
        spyOn(this.notificationService, 'error');
        spyOn(this.messageService, 'get').andCallFake(function(key, param) {
            if (key === 'adminFacilityAdd.doYouWantToAddPrograms') {
                return 'Do you want to add programs to ' + param.facility + '?';
            }
        });

        this.vm = this.$controller('FacilityAddController', {
            facility: this.facility,
            facilityTypes: this.facilityTypes,
            geographicZones: this.geographicZones,
            facilityOperators: this.facilityOperators
        });
        this.vm.$onInit();

        this.$rootScope.$apply();
    });

    describe('$onInit', function() {

        it('should expose this.stateTrackerService.goToPreviousState method',
            function() {
                this.vm.$onInit();

                expect(this.vm.goToPreviousState).toBe(
                    this.stateTrackerService.goToPreviousState
                );
            });

        it('should expose resolved fields', function() {
            this.vm.$onInit();

            expect(this.vm.facilityTypes).toEqual(this.facilityTypes);
            expect(this.vm.geographicZones).toEqual(this.geographicZones);
            expect(this.vm.facilityOperators).toEqual(this.facilityOperators);
        });

        it('should default active to true', function() {
            this.facility.active = undefined;

            this.vm.$onInit();

            expect(this.vm.facility.active).toBe(true);
        });

        it('should default enabled to true', function() {
            this.facility.enabled = undefined;

            this.vm.$onInit();

            expect(this.vm.facility.enabled).toBe(true);
        });

    // it('should copy facility', function() {
    //     this.vm.$onInit();
    //
    //     expect(this.vm.facility).toEqual(this.facility);
    //     expect(this.vm.facility).not.toBe(this.facility);
    // });

    });

    describe('save', function() {

    // it('should prompt user to add programs', function() {
    //     this.FacilityRepository.prototype.create.andReturn(
    //         this.$q.when(this.facility)
    //     );
    //     this.vm.save();
    //     this.$rootScope.$apply();
    //
    //     expect(this.confirmService.confirm).toHaveBeenCalledWith(
    //         'Do you want to add programs to Assumane, Lichinga Cidade?',
    //         'adminFacilityAdd.addPrograms',
    //         'adminFacilityAdd.cancel'
    //     );
    // });

        it('should open loading modal if user refuses to add programs',
            function() {
                this.vm.save();

                this.confirmDeferred.reject();
                this.$rootScope.$apply();

                expect(this.loadingModalService.open).toHaveBeenCalled();
            });

    // it('should show notification if facility was saved successfully',
    //     function() {
    //         this.vm.save();
    //
    //         this.confirmDeferred.reject();
    //         this.saveDeferred.resolve();
    //         this.$rootScope.$apply();
    //
    //         expect(this.notificationService.success).toHaveBeenCalledWith(
    //             'adminFacilityAdd.facilityHasBeenSaved'
    //         );
    //     });
    //
    // it('should show notification if facility save has failed', function() {
    //     this.vm.save();
    //
    //     this.confirmDeferred.reject();
    //     this.saveDeferred.reject();
    //     this.$rootScope.$apply();
    //
    //     expect(this.notificationService.error).toHaveBeenCalledWith(
    //         'adminFacilityAdd.failedToSaveFacility'
    //     );
    // });

    // it('should take to the user to add programs page if user agrees to it',
    //     function() {
    //         this.FacilityRepository.prototype.create.andReturn(
    //             this.$q.when(this.facility)
    //         );
    //         this.vm.save();
    //
    //         this.confirmDeferred.resolve();
    //         this.$rootScope.$apply();
    //
    //         expect(this.$state.go).toHaveBeenCalledWith(
    //             'openlmis.administration.facilities.facility.programs', {
    //                 facility: this.facility
    //             }
    //         );
    //     });

    });

});
