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

describe('requisitionApprovalService', function() {

    beforeEach(function() {
        module('requisition-approval');

        inject(function($injector) {
            this.requisitionApprovalService = $injector.get('requisitionApprovalService');
            this.currentUserService = $injector.get('currentUserService');
            this.programService = $injector.get('programService');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.$q = $injector.get('$q');
            this.RoleDataBuilder = $injector.get('RoleDataBuilder');
            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.RightDataBuilder = $injector.get('RightDataBuilder');
            this.currentUserRolesService = $injector.get('currentUserRolesService');
            this.$rootScope = $injector.get('$rootScope');
            this.LocalDatabase = $injector.get('LocalDatabase');
            // #368: The approver can filter the requisitions by facility
            this.$httpBackend = $injector.get('$httpBackend');
            this.openlmisUrlFactory = $injector.get('openlmisUrlFactory');
            // #368: ends here
        });

        this.accessiblePrograms = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.programs = [
            this.accessiblePrograms[0],
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build(),
            this.accessiblePrograms[1]
        ];

        this.rights = [
            new this.RightDataBuilder()
                .withName(this.REQUISITION_RIGHTS.REQUISITION_APPROVE)
                .build(),
            new this.RightDataBuilder()
                .withName(this.REQUISITION_RIGHTS.REQUISITION_CREATE)
                .build()
        ];

        this.roles = [
            new this.RoleDataBuilder()
                .withRight(this.rights[0])
                .build(),
            new this.RoleDataBuilder()
                .withRight(this.rights[1])
                .build(),
            new this.RoleDataBuilder()
                .withRight(this.rights[0])
                .build()
        ];

        this.user = new this.UserDataBuilder()
            .withSupervisionRoleAssignment(this.roles[0].id, 'supervisoryNodeId', this.accessiblePrograms[0].id)
            .withSupervisionRoleAssignment(this.roles[1].id, 'supervisoryNodeId', this.programs[2].id)
            .withSupervisionRoleAssignment(this.roles[2].id, 'supervisoryNodeId', this.accessiblePrograms[1].id)
            .buildReferenceDataUserJson();

        spyOn(this.programService, 'getAll').andReturn(this.$q.resolve(this.programs));
        spyOn(this.currentUserService, 'getUserInfo').andReturn(this.$q.resolve(this.user));
        spyOn(this.currentUserRolesService, 'getUserRoles').andReturn(this.$q.resolve(this.roles));
        spyOn(this.LocalDatabase.prototype, 'getAll').andReturn(this.$q.resolve([]));
        spyOn(this.LocalDatabase.prototype, 'putAll').andReturn(this.$q.resolve());
        spyOn(this.LocalDatabase.prototype, 'removeAll');
    });

    describe('getPrograms', function() {

        it('should return programs user has access to', function() {
            var result;
            this.requisitionApprovalService.getPrograms()
                .then(function(programs) {
                    result = programs;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.accessiblePrograms);
        });

        it('should reject if fetching current user fails', function() {
            this.currentUserService.getUserInfo.andReturn(this.$q.reject());

            var rejected;
            this.requisitionApprovalService.getPrograms()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject if fetching current user roles fails', function() {
            this.currentUserRolesService.getUserRoles.andReturn(this.$q.reject());

            var rejected;
            this.requisitionApprovalService.getPrograms()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject if fetching programs fails', function() {
            this.programService.getAll.andReturn(this.$q.reject());

            var rejected;
            this.requisitionApprovalService.getPrograms()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should return programs from local storage if any are cached', function() {
            this.LocalDatabase.prototype.getAll.andReturn(this.$q.resolve(this.accessiblePrograms));

            var result;
            this.requisitionApprovalService.getPrograms()
                .then(function(programs) {
                    result = programs;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.accessiblePrograms);
            expect(this.programService.getAll).not.toHaveBeenCalled();
        });

        it('should cache programs in the local storage', function() {
            this.requisitionApprovalService.getPrograms();
            this.$rootScope.$apply();

            expect(this.LocalDatabase.prototype.putAll).toHaveBeenCalledWith(this.accessiblePrograms);
        });

        it('should not duplicate requests for subsequent calls', function() {
            this.requisitionApprovalService.getPrograms();
            this.$rootScope.$apply();

            expect(this.programService.getAll.callCount).toEqual(1);
            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.currentUserRolesService.getUserRoles.callCount).toEqual(1);

            this.requisitionApprovalService.getPrograms();
            this.$rootScope.$apply();

            expect(this.programService.getAll.callCount).toEqual(1);
            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.currentUserRolesService.getUserRoles.callCount).toEqual(1);
        });

    });

    describe('clearCache', function() {

        it('should clear cache', function() {
            this.requisitionApprovalService.getPrograms();
            this.$rootScope.$apply();

            expect(this.programService.getAll.callCount).toEqual(1);
            expect(this.currentUserService.getUserInfo.callCount).toEqual(1);
            expect(this.currentUserRolesService.getUserRoles.callCount).toEqual(1);

            this.requisitionApprovalService.clearCache();
            this.requisitionApprovalService.getPrograms();
            this.$rootScope.$apply();

            expect(this.programService.getAll.callCount).toEqual(2);
            expect(this.currentUserService.getUserInfo.callCount).toEqual(2);
            expect(this.currentUserRolesService.getUserRoles.callCount).toEqual(2);
            expect(this.LocalDatabase.prototype.removeAll).toHaveBeenCalled();
        });

    });

    // #368: The approver can filter the requisitions by facility
    describe('getFacilities', function() {

        beforeEach(function() {
            var facilities = ['facility-1', 'facility-2'];
            this.$httpBackend.when('GET', this.openlmisUrlFactory('/api/siglusapi/requisitions/facilitiesForApproval'))
                .respond(200, facilities);
        });

        it('should call /api/siglusapi/requisitions/facilitiesForApproval', function() {
            var result = [];
            this.requisitionApprovalService.getFacilities().then(function(response) {
                result = response;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result.length).toEqual(2);
        });

    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
    // #368: ends here

});