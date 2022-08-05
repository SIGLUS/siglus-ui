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

describe('openlmis.administration.facilities.facility.add state', function() {

    'use strict';

    beforeEach(function() {
        module('admin-facility-add');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.facilityService = $injector.get('facilityService');
            this.$templateCache = $injector.get('$templateCache');
            this.facilityTypeService = $injector.get('facilityTypeService');
            this.geographicZoneService = $injector.get('geographicZoneService');
            this.facilityOperatorService = $injector.get('facilityOperatorService');

            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            this.GeographicZoneDataBuilder = $injector.get('GeographicZoneDataBuilder');
        });

        this.facilityTypes = new this.PageDataBuilder()
            .withContent([
                new this.FacilityTypeDataBuilder().build(),
                new this.FacilityTypeDataBuilder().build()
            ])
            .build();

        this.geographicZones = [
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build()
        ];

        this.facilityOperators = [
            new this.FacilityTypeDataBuilder().build(),
            new this.FacilityTypeDataBuilder().build()
        ];

        spyOn(this.geographicZoneService, 'getAll').andReturn(this.$q.when({
            content: []
        }));
        spyOn(this.facilityService, 'search').andReturn(this.$q.when({
            content: []
        }));
        spyOn(this.facilityTypeService, 'query').andReturn(this.$q.when([]));
        spyOn(this.facilityOperatorService, 'getAll').andReturn(this.$q.when([]));

        this.$state.go('openlmis.administration.facilities');
        this.$rootScope.$apply();

        this.goToUrl = function(url) {
            this.$location.url(url);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };
    });

    it('should be available under \'administration/facilities/new/details\'', function() {
        expect(this.$state.current.name).not.toEqual('openlmis.administration.facilities.facility.add');

        this.goToUrl('/administration/facilities/new/details');

        expect(this.$state.current.name).toEqual('openlmis.administration.facilities.facility.add');
    });

    it('should resolve facility types', function() {
        this.facilityTypeService.query.andReturn(this.$q.when(this.facilityTypes));

        this.goToUrl('/administration/facilities/new/details');

        expect(this.getResolvedValue('facilityTypes')).toEqual(this.facilityTypes.content);
        expect(this.facilityTypeService.query).toHaveBeenCalledWith({
            active: true
        });
    });

    it('should resolve geographicZones', function() {
        this.geographicZoneService.getAll.andReturn(this.$q.when({
            content: this.geographicZones
        }));

        this.goToUrl('/administration/facilities/new/details');

        expect(this.getResolvedValue('geographicZones')).toEqual(this.geographicZones);
    });

    it('should resolve facility operators', function() {
        this.facilityOperatorService.getAll.andReturn(this.$q.when(this.facilityOperators));

        this.goToUrl('/administration/facilities/new/details');

        expect(this.getResolvedValue('facilityOperators')).toEqual(this.facilityOperators);
    });

    it('should resolve facility', function() {
        this.goToUrl('/administration/facilities/new/details');

        expect(this.getResolvedValue('facility')).toEqual({});
    });

    it('should use template', function() {
        spyOn(this.$templateCache, 'get').andCallThrough();

        this.goToUrl('/administration/facilities/new/details');

        expect(this.$templateCache.get).toHaveBeenCalledWith('admin-facility-add/facility-add.html');
    });

});
