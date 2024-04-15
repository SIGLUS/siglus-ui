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

describe('UserRolesController', function() {

    beforeEach(function() {

        module('admin-user-roles');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.$q = $injector.get('$q');
            this.ROLE_TYPES = $injector.get('ROLE_TYPES');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.notificationService = $injector.get('notificationService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.UserRolesReportService = $injector.get('UserRolesReportService');
        });

        this.user = new this.UserDataBuilder()
            .withSupervisionRoleAssignment('role-id-1', 'node-id-1', 'program-id-1')
            .withGeneralAdminRoleAssignment('role-id-2')
            .build();
        // TODO: get reportViewGeographicList from report view roleAssignments
        this.user.roleAssignments[0].reportViewGeographicList = [{
            districtId: '00000000-0000-0000-0000-000000000000',
            districtName: null,
            provinceId: '00000000-0000-0000-0000-000000000000',
            provinceName: null
        }, {
            districtId: 'adc02066-cfaf-11e9-9398-0242ac130008',
            districtName: 'ANCUABE',
            provinceId: '3f2debb0-cfaf-11e9-9398-0242ac130008',
            provinceName: 'CABO DELGADO'
        }];

        spyOn(this.notificationService, 'error');
        spyOn(this.notificationService, 'success');
        spyOn(this.loadingModalService, 'close');
        spyOn(this.loadingModalService, 'open');
        spyOn(this.$state, 'go').andReturn();
        spyOn(this.user, 'save');
        spyOn(this.UserRolesReportService, 'saveUserReportViewRoles');

        this.vm = this.$controller('UserRolesController', {
            user: this.user
        });

        this.vm.$onInit();
        this.$rootScope.$apply();
    });

    describe('on init', function() {

        it('should expose saveUserRoles method', function() {
            expect(angular.isFunction(this.vm.saveUserRoles)).toBe(true);
        });

        it('should expose goToUserList method', function() {
            expect(angular.isFunction(this.vm.goToUserList)).toBe(true);
        });

        it('should set user', function() {
            expect(this.vm.user).toEqual(this.user);
        });

        it('should set types', function() {
            expect(this.vm.roleTypes).toEqual(this.ROLE_TYPES.getRoleTypes());
        });
    });

    describe('saveUser', function() {

        beforeEach(function() {
            this.UserRolesReportService.saveUserReportViewRoles.andReturn(this.$q.resolve());
            this.user.save.andReturn(this.$q.when(true));
            this.loadingModalService.open.andReturn(this.$q.when(true));
            this.vm.saveUserRoles();
        });

        it('should open loading modal', function() {
            expect(this.loadingModalService.open).toHaveBeenCalledWith(true);
        });

        it('should save user', function() {
            expect(this.user.save).toHaveBeenCalled();
        });

        it('should show success notification', function() {
            this.$rootScope.$apply();

            expect(this.notificationService.success).toHaveBeenCalledWith('adminUserRoles.updateSuccessful');
        });

        it('should redirect to users list', function() {
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {}, {
                reload: true
            });
        });

        it('should close loading modal', function() {
            this.$rootScope.$apply();

            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should show error notification if save failed', function() {
            var deferred = this.$q.defer();
            deferred.reject();

            this.$rootScope.$apply();
            this.user.save.andReturn(deferred.promise);
            this.vm.saveUserRoles();
            this.$rootScope.$apply();

            expect(this.notificationService.error).toHaveBeenCalledWith('adminUserRoles.updateFailed');
        });
    });

    describe('goToUserList', function() {

        beforeEach(function() {
            this.vm.goToUserList();
        });

        it('should redirect to users list page', function() {
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {}, {
                reload: true
            });
        });
    });

    describe('getRoleTypeLabel', function() {

        it('should redirect to users list page', function() {
            expect(this.vm.getRoleTypeLabel(this.ROLE_TYPES.SUPERVISION))
                .toEqual(this.ROLE_TYPES.getLabel(this.ROLE_TYPES.SUPERVISION));
        });
    });
});
