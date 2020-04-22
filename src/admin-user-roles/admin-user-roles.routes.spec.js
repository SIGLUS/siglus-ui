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

describe('openlmis.administration.users.roles', function() {

    beforeEach(function() {
        module('admin-user-roles');
        inject(function($injector) {
            this.RoleDataBuilder = $injector.get('RoleDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.SupervisoryNodeDataBuilder = $injector.get('SupervisoryNodeDataBuilder');
            this.MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.$q = $injector.get('$q');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.referencedataRoleFactory = $injector.get('referencedataRoleFactory');
            this.AdminUserRolesSupervisoryNodeResource = $injector.get('AdminUserRolesSupervisoryNodeResource');
            this.programService = $injector.get('programService');
            this.facilityService = $injector.get('facilityService');
            this.currentUserService = $injector.get('currentUserService');
            this.$state = $injector.get('$state');
            this.userRoleAssignmentFactory = $injector.get('userRoleAssignmentFactory');
            this.$templateCache = $injector.get('$templateCache');
            this.ROLE_TYPES = $injector.get('ROLE_TYPES');
            this.paginationService = $injector.get('paginationService');
        });

        this.roles = [
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build()
        ];

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.supervisoryNodes = [
            new this.SupervisoryNodeDataBuilder().build(),
            new this.SupervisoryNodeDataBuilder().build()
        ];

        this.warehouses = [
            new this.MinimalFacilityDataBuilder().build(),
            new this.MinimalFacilityDataBuilder().build()
        ];

        this.homeFacility = new this.MinimalFacilityDataBuilder().build();

        this.user = new this.UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .withSupervisionRoleAssignment(this.roles[0].id, this.supervisoryNodes[0].id, this.programs[0].id)
            .withSupervisionRoleAssignment(this.roles[1].id, this.supervisoryNodes[1].id, this.programs[1].id)
            .withOrderFulfillmentRoleAssignment(this.roles[2].id, this.warehouses[0].id)
            .withOrderFulfillmentRoleAssignment(this.roles[3].id, this.warehouses[1].id)
            .withGeneralAdminRoleAssignment(this.roles[4].id)
            .withGeneralAdminRoleAssignment(this.roles[5].id)
            .build();

        spyOn(this.AdminUserRolesSupervisoryNodeResource.prototype, 'query')
            .andReturn(this.$q.resolve(new this.PageDataBuilder()
                .withContent(this.supervisoryNodes)
                .build()));
        spyOn(this.referencedataRoleFactory, 'getAllWithType').andReturn(this.$q.resolve(this.roles));
        spyOn(this.facilityService, 'getAllMinimal').andReturn(this.$q.resolve(this.warehouses));
        spyOn(this.currentUserService, 'getUserInfo').andReturn(this.$q.resolve(this.user));
        <!-- SIGLUS-REFACTOR: starts here -->
        spyOn(this.programService, 'getReportPrograms').andReturn(this.$q.resolve(this.programs));
        <!-- SIGLUS-REFACTOR: ends here -->
        spyOn(this.userRoleAssignmentFactory, 'getUser').andReturn(this.$q.resolve(this.user));
        spyOn(this.$templateCache, 'get').andCallThrough();
        spyOn(this.paginationService, 'registerUrl').andReturn(this.$q.resolve([this.user]));

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;
    });

    describe('.supervision state', function() {

        it('should resolve roles', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('roles')).toEqual(this.roles);
            expect(this.referencedataRoleFactory.getAllWithType).toHaveBeenCalled();
        });

        it('should resolve programs', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('programs')).toEqual(this.programs);

            <!-- SIGLUS-REFACTOR: starts here -->
            expect(this.programService.getReportPrograms).toHaveBeenCalled();
            <!-- SIGLUS-REFACTOR: ends here -->
        });

        it('should resolve supervisoryNodes', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('supervisoryNodes')).toEqual(this.supervisoryNodes);
            expect(this.AdminUserRolesSupervisoryNodeResource.prototype.query).toHaveBeenCalled();
        });

        it('should resolve warehouses', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('warehouses')).toEqual(this.warehouses);
            expect(this.facilityService.getAllMinimal).toHaveBeenCalled();
        });

        it('should resolve user', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('user')).toEqual(this.user);
            expect(this.userRoleAssignmentFactory.getUser).toHaveBeenCalledWith(
                this.user.id,
                this.roles,
                this.programs,
                this.supervisoryNodes,
                this.warehouses
            );
        });

        it('should be available under "/:id/roles/supervision" URI', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.administration.users.roles.SUPERVISION');

            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.$state.current.name).toEqual('openlmis.administration.users.roles.SUPERVISION');
        });

        it('should use template', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.$templateCache.get).toHaveBeenCalledWith('admin-user-roles/user-roles-supervision.html');
        });

        it('should resolve tab', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('tab')).toEqual(this.ROLE_TYPES.SUPERVISION);
        });

        it('should resolve roleAssignments', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            expect(this.getResolvedValue('roleAssignments')).toEqual([
                this.user.roleAssignments[0],
                this.user.roleAssignments[1]
            ]);
        });

        it('should resolve home roleRightsMap', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/supervision');

            var roleRightsMap = this.getResolvedValue('roleRightsMap');

            expect(roleRightsMap[this.roles[0].id]).toEqual(this.roles[0].rights);
            expect(roleRightsMap[this.roles[1].id]).toEqual(this.roles[1].rights);
            expect(roleRightsMap[this.roles[2].id]).toEqual(this.roles[2].rights);
            expect(roleRightsMap[this.roles[3].id]).toEqual(this.roles[3].rights);
            expect(roleRightsMap[this.roles[4].id]).toEqual(this.roles[4].rights);
            expect(roleRightsMap[this.roles[5].id]).toEqual(this.roles[5].rights);
        });

    });

    describe('.fulfillment state', function() {

        it('should be available under "/:id/roles/fulfillment" URI', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.administration.users.roles.ORDER_FULFILLMENT');

            this.goToUrl('/administration/users/' + this.user.id + '/roles/fulfillment');

            expect(this.$state.current.name).toEqual('openlmis.administration.users.roles.ORDER_FULFILLMENT');
        });

        it('should use template', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/fulfillment');

            expect(this.$templateCache.get).toHaveBeenCalledWith('admin-user-roles/user-roles-fulfillment.html');
        });

        it('should resolve tab', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/fulfillment');

            expect(this.getResolvedValue('tab')).toEqual(this.ROLE_TYPES.ORDER_FULFILLMENT);
        });

        it('should resolve programs', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/fulfillment');

            expect(this.getResolvedValue('roleAssignments')).toEqual([
                this.user.roleAssignments[2],
                this.user.roleAssignments[3]
            ]);
        });

    });

    describe('.report state', function() {

        it('should be available under "/:id/roles/reports" URI', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.administration.users.roles.REPORTS');

            this.goToUrl('/administration/users/' + this.user.id + '/roles/reports');

            expect(this.$state.current.name).toEqual('openlmis.administration.users.roles.REPORTS');
        });

        it('should use template', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/reports');

            expect(this.$templateCache.get).toHaveBeenCalledWith('admin-user-roles/user-roles-tab.html');
        });

        it('should resolve tab', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/reports');

            expect(this.getResolvedValue('tab')).toEqual(this.ROLE_TYPES.REPORTS);
        });

        it('should resolve programs', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/reports');

            expect(this.getResolvedValue('roleAssignments')).toEqual([]);
        });

    });

    describe('.admin state', function() {

        it('should be available under "/:id/roles/admin" URI', function() {
            expect(this.$state.current.name).not.toEqual('openlmis.administration.users.roles.GENERAL_ADMIN');

            this.goToUrl('/administration/users/' + this.user.id + '/roles/admin');

            expect(this.$state.current.name).toEqual('openlmis.administration.users.roles.GENERAL_ADMIN');
        });

        it('should use template', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/admin');

            expect(this.$templateCache.get).toHaveBeenCalledWith('admin-user-roles/user-roles-tab.html');
        });

        it('should resolve tab', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/admin');

            expect(this.getResolvedValue('tab')).toEqual(this.ROLE_TYPES.GENERAL_ADMIN);
        });

        it('should resolve programs', function() {
            this.goToUrl('/administration/users/' + this.user.id + '/roles/admin');

            expect(this.getResolvedValue('roleAssignments')).toEqual([
                this.user.roleAssignments[4],
                this.user.roleAssignments[5]
            ]);
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
