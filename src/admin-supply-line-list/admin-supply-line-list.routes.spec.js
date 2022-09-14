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

describe('openlmis.administration.supplyLine', function() {

    beforeEach(function() {
        module('admin-supply-line-list');

        inject(function($injector) {
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.SupplyLineDataBuilder = $injector.get('SupplyLineDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.$q = $injector.get('$q');
            this.FacilityRepositoryOrigin = $injector.get('FacilityRepositoryOrigin');
            this.programService = $injector.get('programService');
            this.SupplyLineResource = $injector.get('SupplyLineResource');
        });

        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.supplyLines = [
            new this.SupplyLineDataBuilder().buildJson(),
            new this.SupplyLineDataBuilder().buildJson()
        ];

        this.facilitiesPage = new this.PageDataBuilder()
            .withContent(this.facilities)
            .build();

        this.supplyLinesPage = new this.PageDataBuilder()
            .withContent(this.supplyLines)
            .build();

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;

        spyOn(this.FacilityRepositoryOrigin.prototype, 'query').andReturn(
            this.$q.resolve(this.facilitiesPage)
        );
        spyOn(this.programService, 'getAll').andReturn(
            this.$q.resolve(this.programs)
        );
        spyOn(this.SupplyLineResource.prototype, 'query').andReturn(
            this.$q.resolve(this.supplyLinesPage)
        );
    });

    it('should be available under "/profile" URI', function() {
        expect(this.$state.current.name).not.toEqual(
            'openlmis.administration.supplyLines'
        );

        this.goToUrl('/administration/supplyLines');

        expect(this.$state.current.name).toEqual(
            'openlmis.administration.supplyLines'
        );
    });

    it('should retrieve related supplying facilities', function() {
        this.goToUrl('/administration/supplyLines');

        expect(this.getResolvedValue('supplyingFacilities')).toEqual(
            this.facilities
        );
    });

    it('should retrieve related programs', function() {
        this.goToUrl('/administration/supplyLines');

        expect(this.getResolvedValue('programs')).toEqual(this.programs);
    });

    it('should retrieve supply lines', function() {
        this.goToUrl('/administration/supplyLines');

        expect(this.SupplyLineResource.prototype.query).toHaveBeenCalledWith({
            supplyingFacilityId: undefined,
            programId: undefined,
            page: 0,
            size: 10,
            sort: 'supplyingFacility.name',
            expand: [
                'supervisoryNode.requisitionGroup.memberFacilities',
                'supplyingFacility',
                'program'
            ]
        });

        expect(this.getResolvedValue('supplyLines')).toEqual(this.supplyLines);
    });

    it('should not change state when fetching supplying facilities fails',
        function() {
            this.FacilityRepositoryOrigin.prototype.query.andReturn(
                this.$q.reject()
            );

            this.goToUrl('/administration/supplyLines');

            expect(this.$state.current.name).not.toEqual(
                'openlmis.administration.supplyLines'
            );
        });

    it('should not change state when fetching programs fails ', function() {
        this.programService.getAll.andReturn(this.$q.reject());

        this.goToUrl('/administration/supplyLines');

        expect(this.$state.current.name).not.toEqual(
            'openlmis.administration.supplyLines'
        );
    });

    it('should not change state when fetching supply lines fails', function() {
        this.SupplyLineResource.prototype.query.andReturn(this.$q.reject());

        this.goToUrl('/administration/supplyLines');

        expect(this.$state.current.name).not.toEqual(
            'openlmis.administration.supplyLines'
        );
    });

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }
});