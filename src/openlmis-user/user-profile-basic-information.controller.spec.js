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

describe('UserProfileBasicInformationController', function() {

    beforeEach(function() {
        module('openlmis-user');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
            this.userPasswordModalFactory = $injector.get('userPasswordModalFactory');
            this.alertService = $injector.get('alertService');
            this.loginService = $injector.get('loginService');
            this.$state = $injector.get('$state');
            this.authUserService = $injector.get('authUserService');
        });

        this.user = new this.UserDataBuilder().build();
        this.homeFacility = new this.MinimalFacilityDataBuilder().build();

        this.pendingVerificationEmail = {
            email: 'example@test.org'
        };

        this.saveUserDeferred = this.$q.defer();

        spyOn(this.loadingModalService, 'open').andReturn(true);
        spyOn(this.loadingModalService, 'close').andReturn(true);
        spyOn(this.user, 'save').andReturn(this.saveUserDeferred.promise);
        spyOn(this.notificationService, 'success');
        spyOn(this.notificationService, 'error');
        spyOn(this.userPasswordModalFactory, 'resetPassword');
        spyOn(this.$rootScope, '$emit');
        spyOn(this.loginService, 'logout');
        spyOn(this.$state, 'go');
        spyOn(this.alertService, 'info');
        spyOn(this.authUserService, 'sendVerificationEmail').andReturn(this.$q.when(true));

        this.vm = this.$controller('UserProfileBasicInformationController', {
            user: this.user,
            homeFacility: this.homeFacility,
            pendingVerificationEmail: this.pendingVerificationEmail
        });
    });

    describe('onInit', function() {

        beforeEach(function() {
            this.vm.$onInit();
        });

        it('should set user profile', function() {
            expect(this.user).toEqual(this.vm.user);
        });

        it('should set home facility profile', function() {
            expect(this.homeFacility).toEqual(this.vm.homeFacility);
        });

        it('should expose this.pendingVerificationEmail', function() {
            expect(this.vm.pendingVerificationEmail).toEqual(this.pendingVerificationEmail);
        });

    });

    describe('updateProfile', function() {

        beforeEach(function() {
            this.vm.$onInit();
            this.vm.updateProfile();
        });

        it('should update profile and display notification', function() {
            this.saveUserDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.notificationService.error).not.toHaveBeenCalled();
            expect(this.notificationService.success)
                .toHaveBeenCalledWith('openlmisUser.updateProfile.updateSuccessful');
        });

        it('should not update profile and inform about error', function() {
            this.saveUserDeferred.reject();
            this.$rootScope.$apply();

            expect(this.notificationService.success).not.toHaveBeenCalled();
            expect(this.notificationService.error).toHaveBeenCalledWith('openlmisUser.updateProfile.updateFailed');
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should reload the state', function() {
            this.saveUserDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.profile.basicInformation', undefined, {
                reload: true
            });
        });

        afterEach(function() {
            expect(this.loadingModalService.open).toHaveBeenCalled();
            expect(this.user.save).toHaveBeenCalledWith();
        });

    });

    describe('restoreProfile', function() {

        beforeEach(function() {
            this.vm.$onInit();
            this.vm.restoreProfile();
        });

        it('should open loading modal', function() {
            expect(this.loadingModalService.open).toHaveBeenCalled();
        });

        // it('should reload the state', function() {
        //     expect(this.$state.go).toHaveBeenCalledWith('openlmis.profile.basicInformation', undefined, {
        //         reload: true
        //     });
        // });

        it('should show a notification', function() {
            expect(this.notificationService.success).toHaveBeenCalledWith('openlmisUser.cancel.restoreSuccessful');
        });

    });

    describe('changePassword', function() {

        beforeEach(function() {
            this.userPasswordModalFactory.resetPassword.andReturn(this.$q.resolve());
            this.loginService.logout.andReturn(this.$q.resolve());
            this.alertService.info.andReturn(this.$q.resolve());
        });

        it('should do nothing if modal was dismissed', function() {
            this.userPasswordModalFactory.resetPassword.andReturn(this.$q.reject());

            this.vm.changePassword();
            this.$rootScope.$apply();

            expect(this.userPasswordModalFactory.resetPassword).toHaveBeenCalledWith(this.user);
            expect(this.alertService.info).not.toHaveBeenCalled();
            expect(this.$rootScope.$emit).not.toHaveBeenCalled();
            expect(this.loginService.logout).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should do nothing if logout failed', function() {
            this.loginService.logout.andReturn(this.$q.reject());

            this.vm.changePassword();
            this.$rootScope.$apply();

            expect(this.userPasswordModalFactory.resetPassword).toHaveBeenCalledWith(this.user);
            expect(this.loginService.logout).toHaveBeenCalled();
            expect(this.alertService.info).not.toHaveBeenCalled();
            expect(this.$rootScope.$emit).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should show alert after changing password ', function() {
            this.alertService.info.andReturn(this.$q.reject());

            this.vm.changePassword();
            this.$rootScope.$apply();

            expect(this.userPasswordModalFactory.resetPassword).toHaveBeenCalledWith(this.user);
            expect(this.loginService.logout).toHaveBeenCalled();
            expect(this.alertService.info).toHaveBeenCalledWith({
                title: 'openlmisUser.passwordResetAlert.title',
                message: 'openlmisUser.passwordResetAlert.message',
                buttonLabel: 'openlmisUser.passwordResetAlert.label'
            });

            expect(this.$rootScope.$emit).not.toHaveBeenCalled();
            expect(this.$state.go).not.toHaveBeenCalled();

        });

        it('should log user out after successfully changing password', function() {
            this.vm.changePassword();
            this.$rootScope.$apply();

            expect(this.userPasswordModalFactory.resetPassword).toHaveBeenCalledWith(this.user);
            expect(this.loginService.logout).toHaveBeenCalled();
            expect(this.alertService.info).toHaveBeenCalledWith({
                title: 'openlmisUser.passwordResetAlert.title',
                message: 'openlmisUser.passwordResetAlert.message',
                buttonLabel: 'openlmisUser.passwordResetAlert.label'
            });

            expect(this.$rootScope.$emit).toHaveBeenCalledWith('openlmis-auth.logout');
            expect(this.$state.go).toHaveBeenCalledWith('auth.login');
        });

    });

    describe('sendVerificationEmail', function() {

        beforeEach(function() {
            this.vm.$onInit();
            this.vm.sendVerificationEmail();
            this.$rootScope.$apply();
        });

        it('should send verification email', function() {
            expect(this.authUserService.sendVerificationEmail).toHaveBeenCalledWith(this.vm.user.id);
            expect(this.notificationService.success).toHaveBeenCalledWith('openlmisUser.sendVerificationEmail.success');
        });

    });

});
