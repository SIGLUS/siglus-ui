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

describe('openlmis.administration.orderables.edit route', function() {

    beforeEach(function() {
        <!-- SIGLUS-REFACTOR: inject mock service -->
        module('admin-orderable-edit', function($provide) {
            var programServiceMock = jasmine.createSpyObj('programService', ['getRealPrograms']);
            $provide.service('programService', function() {
                return programServiceMock;
            });
        });
        <!-- SIGLUS-REFACTOR: ends here -->

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.$templateCache = $injector.get('$templateCache');
            this.OrderableResource = $injector.get('OrderableResource');
            this.programService = $injector.get('programService');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.OrderableChildrenDataBuilder = $injector.get('OrderableChildrenDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.FacilityTypeApprovedProductDataBuilder = $injector.get('FacilityTypeApprovedProductDataBuilder');
            this.FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            this.FacilityTypeApprovedProductResource = $injector.get('FacilityTypeApprovedProductResource');
            this.permissionService = $injector.get('permissionService');
            this.authorizationService = $injector.get('authorizationService');
            this.ADMINISTRATION_RIGHTS = $injector.get('ADMINISTRATION_RIGHTS');
        });

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.orderableChildren = [
            new this.OrderableChildrenDataBuilder().buildJson(),
            new this.OrderableChildrenDataBuilder().buildJson()
        ];

        this.orderable = new this.OrderableDataBuilder()
            .withPrograms([
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[0].id)
                    .buildJson(),
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[2].id)
                    .buildJson()
            ])
            .withChildren(this.orderableChildren)
            .build();

        this.orderables = [
            this.orderable,
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        this.orderablesPage = new this.PageDataBuilder()
            .withContent(this.orderables)
            .build();

        this.facilityType = new this.FacilityTypeDataBuilder().build();

        this.ftaps = [
            new this.FacilityTypeApprovedProductDataBuilder().build(),
            new this.FacilityTypeApprovedProductDataBuilder().build(),
            new this.FacilityTypeApprovedProductDataBuilder()
                .withFacilityType(this.facilityType)
                .withProgram(this.programs[0])
                .build(),
            new this.FacilityTypeApprovedProductDataBuilder()
                .withFacilityType(this.facilityType)
                .withProgram(this.programs[1])
                .build()
        ];

        this.ftapsPage = new this.PageDataBuilder()
            .withContent(this.ftaps)
            .build();

        spyOn(this.OrderableResource.prototype, 'query').andReturn(this.$q.resolve(this.orderablesPage));
        <!-- SIGLUS-REFACTOR: getRealPrograms is already a mock function -->
        this.programService.getRealPrograms.andReturn(this.$q.resolve(this.programs));
        <!-- SIGLUS-REFACTOR: ends here -->
        spyOn(this.OrderableResource.prototype, 'get').andReturn(this.$q.resolve(this.orderable));
        spyOn(this.FacilityTypeApprovedProductResource.prototype, 'query').andReturn(this.$q.resolve(this.ftapsPage));
        spyOn(this.$templateCache, 'get').andCallThrough();
        spyOn(this.authorizationService, 'getUser').andReturn(this.$q.resolve(new this.UserDataBuilder().build()));

        spyOn(this.permissionService, 'hasPermissionWithAnyProgramAndAnyFacility').andReturn(this.$q.resolve());

        this.goToState = function(subState) {
            this.$location.url('/administration/orderables/' + this.orderable.id + subState);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };

    });

    describe('.general state', function() {

        it('should resolve orderable', function() {
            this.goToState('/general');

            expect(this.getResolvedValue('orderable')).toEqual(this.orderable);
            expect(this.getResolvedValue('orderable')).not.toBe(this.orderable);
        });

        it('should fetch orderable if it is not present on the orderable list', function() {
            this.OrderableResource.prototype.query.andReturn(this.$q.resolve(new this.PageDataBuilder().build()));

            this.goToState('/general');

            expect(this.getResolvedValue('orderable')).toEqual(this.orderable);
            expect(this.getResolvedValue('orderable')).not.toBe(this.orderable);
        });

        it('should not change state if fetching orderable fails', function() {
            this.OrderableResource.prototype.query.andReturn(this.$q.reject());

            this.goToState('/general');

            expect(this.$state.current.name).not.toEqual('openlmis.administration.orderables.edit.general');
        });

    });

    describe('.programs state', function() {

        it('should resolve program orderables', function() {
            this.goToState('/programs');

            expect(this.getResolvedValue('programOrderables')).toEqual(this.orderable.programs);
            expect(this.getResolvedValue('programOrderables')).not.toBe(this.orderable.programs);
        });

        it('should not change state if fetching programOrderables fails', function() {
            this.OrderableResource.prototype.query.andReturn(this.$q.reject());

            this.goToState('/programs');

            expect(this.$state.current.name).not.toEqual('openlmis.administration.orderables.edit.general');
        });

        it('should resolve programs map', function() {
            this.goToState('/programs');

            var expected = {};
            expected[this.programs[0].id] = this.programs[0];
            expected[this.programs[1].id] = this.programs[1];
            expected[this.programs[2].id] = this.programs[2];

            expect(this.getResolvedValue('programsMap')).toEqual(expected);
        });

        it('should resolve canEdit as true if user has right to edit programs', function() {

            this.goToState('/programs');

            expect(this.getResolvedValue('canEdit')).toBeTruthy();

        });

        it('should resolve canEdit as false if user does not have right to edit program orderable', function() {
            this.permissionService.hasPermissionWithAnyProgramAndAnyFacility.andReturn(this.$q.reject());

            this.goToState('/programs');

            expect(this.getResolvedValue('canEdit')).toBeFalsy();
        });

        it('should resolve canEdit as true if user have right to edit program orderable', function() {
            this.permissionService.hasPermissionWithAnyProgramAndAnyFacility.andReturn(this.$q.resolve());

            this.goToState('/programs');

            expect(this.getResolvedValue('canEdit')).toBeTruthy();
            expect(this.permissionService.hasPermissionWithAnyProgramAndAnyFacility).toHaveBeenCalledWith(
                this.userId, {
                    right: this.ADMINISTRATION_RIGHTS.ORDERABLES_MANAGE
                }
            );
        });

        it('should not change state if fetching programs fails', function() {
            <!-- SIGLUS-REFACTOR: starts here -->
            this.programService.getRealPrograms.andReturn(this.$q.reject());
            <!-- SIGLUS-REFACTOR: ends here -->

            this.goToState('/programs');

            expect(this.$state.current.name).not.toEqual('openlmis.administration.orderables.edit.programs');
        });

    });

    describe('.ftaps state', function() {

        it('should resolve ftaps', function() {
            this.goToState('/facilityTypeApprovedProducts');

            expect(this.getResolvedValue('ftaps')).toEqual(this.ftaps);
            expect(this.getResolvedValue('ftaps')).not.toBe(this.ftaps);
        });

        it('should not change state if fetching orderable fails', function() {
            this.FacilityTypeApprovedProductResource.prototype.query.andReturn(this.$q.reject());

            this.goToState('/facilityTypeApprovedPrducts');

            expect(this.$state.current.name).not.toEqual('openlmis.administration.orderables.edit.general');
        });

        it('should resolve ftaps map', function() {
            this.goToState('/facilityTypeApprovedProducts');

            var expected = {};
            expected[this.ftaps[0].facilityType.id] = [this.ftaps[0]];
            expected[this.ftaps[1].facilityType.id] = [this.ftaps[1]];
            expected[this.ftaps[2].facilityType.id] = [this.ftaps[2], this.ftaps[3]];

            expect(this.getResolvedValue('ftapsMap')).toEqual(expected);
        });

        it('should resolve facility types map', function() {
            this.goToState('/facilityTypeApprovedProducts');

            var expected = {};
            expected[this.ftaps[0].facilityType.id] = this.ftaps[0].facilityType.name;
            expected[this.ftaps[1].facilityType.id] = this.ftaps[1].facilityType.name;
            expected[this.ftaps[2].facilityType.id] = this.ftaps[2].facilityType.name;

            expect(this.getResolvedValue('facilityTypesMap')).toEqual(expected);
        });

        it('should resolve canEdit as true if user has right to edit ftaps', function() {
            this.goToState('/facilityTypeApprovedProducts');

            expect(this.getResolvedValue('canEdit')).toBeTruthy();
        });

        it('should resolve canEdit as false if user does not have right to edit ftaps', function() {
            this.permissionService.hasPermissionWithAnyProgramAndAnyFacility.andReturn(this.$q.reject());

            this.goToState('/facilityTypeApprovedProducts');

            expect(this.getResolvedValue('canEdit')).toBeFalsy();
        });

    });

    describe('.kitUnpackList.edit state', function() {

        it('should resolve orderable', function() {
            this.goToState('/kitUnpackList');

            expect(this.getResolvedValue('orderable')).toEqual(this.orderable);
            expect(this.getResolvedValue('orderable')).not.toBe(this.orderable);
        });

        it('should not change state if fetching orderable fails', function() {
            this.OrderableResource.prototype.query.andReturn(this.$q.reject());

            this.goToState('/kitUnpackList');

            expect(this.$state.current.name).not.toEqual('openlmis.administration.orderables.edit.kitUnpackList');
        });

        it('should resolve children page', function() {
            this.goToState('/kitUnpackList');

            expect(this.getResolvedValue('children')).toEqual(this.orderable.children);
        });

        it('should resolve orderables', function() {
            this.goToState('/kitUnpackList');

            expect(this.getResolvedValue('orderables')).toEqual(this.orderables);
        });

        it('should resolve children page to empty page if orderable has no children', function() {
            this.orderable.children = [];

            this.goToState('/kitUnpackList');

            expect(this.getResolvedValue('children')).toEqual([]);
            expect(this.OrderableResource.prototype.query.callCount).toBe(1);
        });

        it('should resolve orderables map', function() {
            this.goToState('/kitUnpackList');

            var expected = {};
            expected[this.orderables[0].id] = this.orderables[0];
            expected[this.orderables[1].id] = this.orderables[1];
            expected[this.orderables[2].id] = this.orderables[2];

            expect(this.getResolvedValue('orderablesMap')).toEqual(expected);
        });

    });
});
