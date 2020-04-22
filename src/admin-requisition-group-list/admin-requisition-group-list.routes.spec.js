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

describe('openlmis.administration.requisitionGroupList', function() {

    beforeEach(function() {
        module('admin-requisition-group-list');

        inject(function($injector) {
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.GeographicZoneDataBuilder = $injector.get('GeographicZoneDataBuilder');
            this.RequisitionGroupDataBuilder = $injector.get('RequisitionGroupDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.ObjectMapper = $injector.get('ObjectMapper');
            this.$q = $injector.get('$q');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.geographicZoneService = $injector.get('geographicZoneService');
            this.programService = $injector.get('programService');
            this.paginationService = $injector.get('paginationService');
            this.requisitionGroupService = $injector.get('requisitionGroupService');
            this.FacilityResource = $injector.get('FacilityResource');
            this.$state = $injector.get('$state');
            this.$templateCache = $injector.get('$templateCache');
        });

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.geographicZones = [
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build()
        ];

        this.requisitionGroups = [
            new this.RequisitionGroupDataBuilder()
                .buildJson(),
            new this.RequisitionGroupDataBuilder()
                .withoutSupervisoryNodeFacility()
                .buildJson(),
            new this.RequisitionGroupDataBuilder()
                .withoutSupervisoryNode()
                .buildJson()
        ];

        this.facilities = [
            this.requisitionGroups[0].supervisoryNode.facility
        ];

        this.objectMapper = new this.ObjectMapper();

        spyOn(this.requisitionGroupService, 'search')
            .andReturn(this.$q.resolve(new this.PageDataBuilder()
                .withContent(this.requisitionGroups)
                .build()));
        <!-- SIGLUS-REFACTOR: starts here -->
        spyOn(this.programService, 'getVirtualPrograms').andReturn(this.$q.resolve(this.programs));
        <!-- SIGLUS-REFACTOR: ends here -->
        spyOn(this.geographicZoneService, 'getAll')
            .andReturn(this.$q.resolve(new this.PageDataBuilder()
                .withContent(this.geographicZones)
                .build()));
        spyOn(this.FacilityResource.prototype, 'query').andReturn(this.$q.resolve(
            new this.PageDataBuilder()
                .withContent(this.facilities)
                .build()
        ));
        spyOn(this.$templateCache, 'get').andCallThrough();

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;
    });

    describe('state', function() {

        it('should be available under "/administration/requisitionGroups" URI', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.administration.requisitionGroupList');

            this.goToUrl('/administration/requisitionGroups');

            expect(this.$state.current.name).toEqual('openlmis.administration.requisitionGroupList');
        });

        it('should use template', function() {
            this.goToUrl('/administration/requisitionGroups');

            expect(this.$templateCache.get)
                .toHaveBeenCalledWith('admin-requisition-group-list/requisition-group-list.html');
        });

        it('should resolve geographicZones', function() {
            this.goToUrl('/administration/requisitionGroups');

            expect(this.getResolvedValue('geographicZones')).toEqual(this.geographicZones);
            expect(this.geographicZoneService.getAll).toHaveBeenCalled();
        });

        it('should resolve programs', function() {
            this.goToUrl('/administration/requisitionGroups');

            expect(this.getResolvedValue('programs')).toEqual(this.programs);
            <!-- SIGLUS-REFACTOR: replace getAll with getVirtualPrograms function -->
            expect(this.programService.getVirtualPrograms).toHaveBeenCalled();
            <!-- SIGLUS-REFACTOR: ends here -->
        });

        it('should resolve facilitiesMap', function() {
            var facilitiesMap = this.objectMapper.map(this.facilities);

            this.goToUrl('/administration/requisitionGroups');

            expect(this.getResolvedValue('facilitiesMap')).toEqual(facilitiesMap);
            expect(this.FacilityResource.prototype.query).toHaveBeenCalledWith({
                id: [this.facilities[0].id],
                page: 0,
                size: 1
            });
        });

        it('should not resolve facilitiesMap if requisition groups is empty', function() {
            this.requisitionGroupService.search
                .andReturn(this.$q.resolve(new this.PageDataBuilder()
                    .withContent([])
                    .build()));

            this.goToUrl('/administration/requisitionGroups');

            expect(this.getResolvedValue('facilitiesMap')).toEqual([]);
            expect(this.FacilityResource.prototype.query).not.toHaveBeenCalled();
        });

    });

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }

});
