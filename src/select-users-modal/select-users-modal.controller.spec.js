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

describe('SelectUsersModalController', function() {

    beforeEach(function() {
        module('select-users-modal');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$controller = $injector.get('$controller');
            this.alertService = $injector.get('alertService');
            this.RoleDataBuilder = $injector.get('RoleDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.SupervisoryNodeDataBuilder = $injector.get('SupervisoryNodeDataBuilder');
            this.MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.userRoleAssignmentFactory = $injector.get('userRoleAssignmentFactory');
            this.loadingModalService = $injector.get('loadingModalService');
            this.$state = $injector.get('$state');
            this.UserRolesReportService = $injector.get('UserRolesReportService');
        });

        this.rolesUpdated = [
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build()
        ];

        this.programsUpdated = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.supervisoryNodesUpdated = [
            new this.SupervisoryNodeDataBuilder().build(),
            new this.SupervisoryNodeDataBuilder().build()
        ];

        this.warehousesUpdated = [
            new this.MinimalFacilityDataBuilder().build(),
            new this.MinimalFacilityDataBuilder().build()
        ];

        this.homeFacility = new this.MinimalFacilityDataBuilder().build();

        this.userUpdated = new this.UserDataBuilder()
            .withHomeFacilityId(this.homeFacility.id)
            .build();

        this.users = [
            new this.UserDataBuilder()
                .withHomeFacilityId(this.homeFacility.id)
                .withSupervisionRoleAssignment(this.rolesUpdated[0].id,
                    this.supervisoryNodesUpdated[0].id,
                    this.programsUpdated[0].id)
                .withUsername('FirstUser')
                .build(),
            new this.UserDataBuilder()
                .withHomeFacilityId(this.homeFacility.id)
                .withSupervisionRoleAssignment(this.rolesUpdated[1].id,
                    this.supervisoryNodesUpdated[1].id,
                    this.programsUpdated[1].id)
                .withUsername('SecondUser')
                .build(),
            new this.UserDataBuilder()
                .withHomeFacilityId(this.homeFacility.id)
                .withOrderFulfillmentRoleAssignment(this.rolesUpdated[2].id,
                    this.warehousesUpdated[0].id)
                .withUsername('ThirdUser')
                .build(),
            new this.UserDataBuilder()
                .withHomeFacilityId(this.homeFacility.id)
                .withOrderFulfillmentRoleAssignment(this.rolesUpdated[3].id,
                    this.warehousesUpdated[1].id)
                .withUsername('FourthUser')
                .build()
        ];

        this.usersPage = new this.PageDataBuilder()
            .withContent(this.users)
            .build();

        this.selectedUser = this.users[0];
        this.$stateParams = {};

        this.selectDeferred = this.$q.defer();

        spyOn(this.$state, 'go');
        spyOn(this.loadingModalService, 'open');

        this.initController = function() {
            this.vm = this.$controller('SelectUsersModalController', {
                users: this.users,
                userUpdated: this.userUpdated,
                rolesUpdated: this.rolesUpdated,
                supervisoryNodesUpdated: this.supervisoryNodesUpdated,
                programsUpdated: this.programsUpdated,
                warehousesUpdated: this.warehousesUpdated,
                $stateParams: this.$stateParams
            });
            this.vm.$onInit();
        };
    });

    describe('$onInit', function() {

        it('should expose users', function() {
            this.initController();

            expect(this.vm.users).toEqual(this.users);
        });

        it('should expose filteredUsers', function() {
            this.initController();

            expect(this.vm.filteredUsers).toEqual(this.users);
        });

        it('should show all for empty filter', function() {
            this.$stateParams.rolesUsername = '';
            this.initController();

            expect(this.vm.filteredUsers).toEqual(this.users);
        });

        it('should show all for undefined', function() {
            this.$stateParams.rolesUsername = undefined;
            this.initController();

            expect(this.vm.filteredUsers).toEqual(this.users);
        });

        it('should show all for null', function() {
            this.$stateParams.rolesUsername = null;
            this.initController();

            expect(this.vm.filteredUsers).toEqual(this.users);
        });

        it('should only return users starting with the search text', function() {
            this.$stateParams.rolesUsername = 'Fi';
            this.initController();

            expect(this.vm.filteredUsers).toEqual([this.users[0]]);

            this.$stateParams.rolesUsername = 'Ls';
            this.initController();

            expect(this.vm.filteredUsers).toEqual([]);
        });

        it('should return empty list if no matches found', function() {
            this.$stateParams.rolesUsername = 'po';
            this.initController();

            expect(this.vm.filteredUsers).toEqual([]);
        });

    });

    describe('search', function() {

        it('should reload state with search param', function() {
            this.initController();
            this.vm.searchText = 'admin';
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('.', {
                rolesUsername: 'admin'
            });
        });

    });

    describe('select user', function() {

        beforeEach(function() {
            this.initController();
        });

        it('should return promise', function() {
            expect(angular.isFunction(this.vm.selectUser().then)).toBe(true);
        });

        it('should open loading modal', function() {
            this.vm.selectUser();

            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        it('should not import roles if roles are already assigned', function() {
            spyOn(this.userRoleAssignmentFactory, 'getUser').andReturn(this.$q.resolve(this.selectedUser));
            var roleAssignmentsCount = this.selectedUser.roleAssignments.length;
            this.userUpdated.roleAssignments = this.selectedUser.roleAssignments;

            this.vm.selectUser();
            this.$rootScope.$apply();

            expect(this.userUpdated.roleAssignments.length).toEqual(roleAssignmentsCount);
        });

        it('should import roles successfully', function() {
            spyOn(this.userRoleAssignmentFactory, 'getUser').andReturn(this.$q.resolve(this.selectedUser));
            spyOn(this.UserRolesReportService, 'getUserGeographicList').andReturn(this.$q.resolve([]));
            this.vm.selectUser();

            expect(this.userUpdated.roleAssignments[0]).toEqual(undefined);

            this.$rootScope.$apply();

            expect(this.userUpdated.roleAssignments[0]).toEqual(this.selectedUser.roleAssignments[0]);
        });

        it('should not import roles if select has failed', function() {
            spyOn(this.userRoleAssignmentFactory, 'getUser').andReturn(this.$q.reject(this.selectedUser));
            this.vm.selectUser();

            this.$rootScope.$apply();

            expect(this.userUpdated.roleAssignments[0]).toEqual(undefined);
        });

    });

});
