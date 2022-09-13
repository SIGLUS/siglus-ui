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

describe('currentUserRolesService', function() {

    beforeEach(function() {
        module('openlmis-permissions');

        inject(function($injector) {
            this.RoleDataBuilder = $injector.get('RoleDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.currentUserRolesService = $injector.get('currentUserRolesService');
            this.currentUserService = $injector.get('currentUserService');
            this.RoleResource = $injector.get('RoleResource');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.localStorageService = $injector.get('localStorageService');
        });

        this.localStorageKey = 'currentUserRoles';

        this.roles = [
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build(),
            new this.RoleDataBuilder().build()
        ];

        this.user = new this.UserDataBuilder()
            .withSupervisionRoleAssignment(this.roles[0].id, 'supervisoryNodeId', 'program-id')
            .withOrderFulfillmentRoleAssignment(this.roles[2].id, 'warehouse-id')
            .withGeneralAdminRoleAssignment(this.roles[4].id)
            .buildReferenceDataUserJson();

        spyOn(this.currentUserService, 'getUserInfo').andReturn(this.$q.resolve(this.user));
        spyOn(this.RoleResource.prototype, 'query').andReturn(this.$q.resolve(this.roles));
        spyOn(this.localStorageService, 'get');
        spyOn(this.localStorageService, 'add');
        spyOn(this.localStorageService, 'remove');
    });

    describe('getUserRoles', function() {

        it('should return list of roles assigned to the user', function() {
            var result;

            this.currentUserRolesService.getUserRoles()
                .then(function(roles) {
                    result = roles;
                });
            this.$rootScope.$apply();

            expect(result).toEqual([
                this.roles[0],
                this.roles[2],
                this.roles[4]
            ]);
        });

        it('should not repeat calls for concurrent requests', function() {
            this.currentUserRolesService.getUserRoles();
            this.$rootScope.$apply();

            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.RoleResource.prototype.query.callCount).toEqual(1);

            this.currentUserRolesService.getUserRoles();
            this.$rootScope.$apply();

            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.RoleResource.prototype.query.callCount).toEqual(1);
        });

        // it('should return cached data if available', function() {
        //     this.localStorageService.get.andReturn(angular.toJson([
        //         this.roles[1],
        //         this.roles[3]
        //     ]));

        //     var result;

        //     this.currentUserRolesService.getUserRoles()
        //         .then(function(roles) {
        //             result = roles;
        //         });
        //     this.$rootScope.$apply();

        //     expect(this.localStorageService.get).toHaveBeenCalledWith(this.localStorageKey);
        //     expect(this.currentUserService.getUserInfo.callCount).toEqual(0);
        //     expect(this.RoleResource.prototype.query.callCount).toEqual(0);
        //     expect(result).toEqual([
        //         this.roles[1],
        //         this.roles[3]
        //     ]);
        // });

        // it('should cache roles', function() {
        //     this.currentUserRolesService.getUserRoles();
        //     this.$rootScope.$apply();

        //     expect(this.localStorageService.add).toHaveBeenCalledWith(this.localStorageKey, angular.toJson([
        //         this.roles[0],
        //         this.roles[2],
        //         this.roles[4]
        //     ]));
        // });

        it('should reject if fetching current user fails', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.reject());

            var rejected;
            this.currentUserRolesService.getUserRoles()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if fetching roles fails', function() {
            this.RoleResource.prototype.query.andReturn(this.$q.reject());

            var rejected;
            this.currentUserRolesService.getUserRoles()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

    });

    describe('clearCachedRoles', function() {

        it('should clear cache', function() {
            this.currentUserRolesService.getUserRoles();
            this.$rootScope.$apply();

            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.RoleResource.prototype.query.callCount).toEqual(1);

            this.currentUserRolesService.clearCachedRoles();
            this.currentUserRolesService.getUserRoles();
            this.$rootScope.$apply();

            expect(this.localStorageService.remove).toHaveBeenCalledWith(this.localStorageKey);
            expect(this.currentUserService.getUserInfo.callCount).toEqual(2);
            expect(this.RoleResource.prototype.query.callCount).toEqual(2);
        });

    });

});