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

describe('SupervisoryNodeListController', function() {

    beforeEach(function() {

        module('admin-supervisory-node-list');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.SupervisoryNodeDataBuilder = $injector.get('SupervisoryNodeDataBuilder');
            this.GeographicZoneDataBuilder = $injector.get('GeographicZoneDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.$state = $injector.get('$state');
        });

        this.supervisoryNodes = [
            new this.SupervisoryNodeDataBuilder().build(),
            new this.SupervisoryNodeDataBuilder().build()
        ];

        this.geographicZones = [
            new this.GeographicZoneDataBuilder().build(),
            new this.GeographicZoneDataBuilder().build()
        ];

        this.$stateParams = {
            page: 0,
            size: 10,
            zoneId: 'zone-id',
            name: '1'
        };

        this.facilitiesMap = {
            'facility-id-one': new this.FacilityDataBuilder()
                .withId('facility-id-one')
                .build(),
            'facility-id-two': new this.FacilityDataBuilder()
                .withId('facility-id-two')
                .build()
        };

        this.supervisoryNodesMap = {};
        this.supervisoryNodesMap[this.supervisoryNodes[0].id] = this.supervisoryNodes[0];
        this.supervisoryNodesMap[this.supervisoryNodes[1].id] = this.supervisoryNodes[1];

        this.vm = this.$controller('SupervisoryNodeListController', {
            supervisoryNodes: this.supervisoryNodes,
            geographicZones: this.geographicZones,
            $stateParams: this.$stateParams,
            facilitiesMap: this.facilitiesMap,
            supervisoryNodesMap: this.supervisoryNodesMap
        });
        this.vm.$onInit();

        spyOn(this.$state, 'go').andReturn();
    });

    describe('onInit', function() {

        it('should expose facilities array', function() {
            expect(this.vm.supervisoryNodes).toEqual(this.supervisoryNodes);
        });

        it('should expose geographic zones array', function() {
            expect(this.vm.geographicZones).toEqual(this.geographicZones);
        });

        it('should expose facility name', function() {
            expect(this.vm.supervisoryNodeName).toEqual(this.$stateParams.name);
        });

        it('should expose geographic zone id', function() {
            expect(this.vm.geographicZone).toEqual(this.$stateParams.zoneId);
        });

        it('should expose facilities map', function() {
            expect(this.vm.facilitiesMap).toEqual(this.facilitiesMap);
        });

        it('should expose supervisory nodes map', function() {
            expect(this.vm.supervisoryNodesMap).toEqual(this.supervisoryNodesMap);
        });
    });

    describe('search', function() {

        it('should set name param', function() {
            this.vm.supervisoryNodeName = 'name';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.supervisoryNodes', {
                page: this.$stateParams.page,
                size: this.$stateParams.size,
                name: 'name',
                nodesPage: 0,
                zoneId: this.$stateParams.zoneId
            }, {
                reload: true
            });
        });

        it('should set firstName param', function() {
            this.vm.geographicZone = 'some-id';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.supervisoryNodes', {
                page: this.$stateParams.page,
                size: this.$stateParams.size,
                name: this.$stateParams.name,
                nodesPage: 0,
                zoneId: 'some-id'
            }, {
                reload: true
            });
        });

        it('should call state go method', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });
});
