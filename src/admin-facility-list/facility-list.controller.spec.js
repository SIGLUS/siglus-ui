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

describe('FacilityListController', function() {

    beforeEach(function() {
        module('admin-facility-list');
        module('siglus-alert-confirm-modal');
        // module('');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.GeographicZoneDataBuilder = $injector.get(
                'GeographicZoneDataBuilder'
            );
            this.alertConfirmModalService = $injector.get(
                'alertConfirmModalService'
            );
            this.facilityService = $injector.get('facilityService');
        });

        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        this.stateParams = {
            page: 0,
            size: 10,
            zoneId: 'zone-id',
            name: '1'
        };

        this.vm = this.$controller('FacilityListController', {
            facilities: this.facilities,
            geographicZones: this.geographicZones,
            $stateParams: this.stateParams
        });
        this.vm.$onInit();

        spyOn(this.$state, 'go').andReturn();
    });

    describe('onInit', function() {

        it('should expose search method', function() {
            expect(angular.isFunction(this.vm.search)).toBe(true);
        });

        it('should expose facilities array', function() {
            expect(this.vm.facilities).toEqual(this.facilities);
        });

        it('should expose geographic zones array', function() {
            expect(this.vm.geographicZones).toEqual(this.geographicZones);
        });

        it('should expose facility name', function() {
            expect(this.vm.facilityName).toEqual(this.stateParams.name);
        });

        it('should expose geographic zone id', function() {
            expect(this.vm.geographicZone).toEqual(this.stateParams.zoneId);
        });
    });

    describe('search', function() {

        it('should set lastName param', function() {
            this.vm.facilityName = 'lastName';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.administration.facilities', {
                    page: this.stateParams.page,
                    size: this.stateParams.size,
                    name: 'lastName',
                    zoneId: this.stateParams.zoneId
                }, {
                    reload: true
                }
            );
        });

        it('should set firstName param', function() {
            this.vm.geographicZone = 'some-id';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.administration.facilities', {
                    page: this.stateParams.page,
                    size: this.stateParams.size,
                    name: this.stateParams.name,
                    zoneId: 'some-id'
                }, {
                    reload: true
                }
            );
        });

        it('should call state go method', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });
});
