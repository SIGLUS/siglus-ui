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

describe('openlmis-login.loginService', function() {

    beforeEach(function() {
        module('openlmis-database');
        module('openlmis-login');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.authUrl = $injector.get('authUrl');
            this.$rootScope = $injector.get('$rootScope');
            this.authService = $injector.get('authService');
            this.$httpBackend = $injector.get('$httpBackend');
            this.loginService = $injector.get('loginService');
            this.authorizationService = $injector.get('authorizationService');
            this.offlineService = $injector.get('offlineService');
        });

        spyOn(this.authorizationService, 'setAccessToken').andCallThrough();
        spyOn(this.authorizationService, 'clearAccessToken').andCallThrough();
        spyOn(this.authService, 'loginConfirmed').andCallThrough();

        spyOn(this.authorizationService, 'setUser');
        spyOn(this.authorizationService, 'clearUser');
        spyOn(this.offlineService, 'isOffline').andReturn(false);

        this.apiOauthTokenUrl = this.authUrl('/api/oauth/token?grant_type=password');

        this.mock200Response = function() {
            this.$httpBackend
                .whenPOST(this.apiOauthTokenUrl)
                .respond(200, {
                    //eslint-disable-next-line quote-props
                    'access_token': 'access_token',
                    referenceDataUserId: 'userId',
                    username: 'john'
                });
        };

        this.mock400Response = function() {
            this.$httpBackend
                .whenPOST(this.apiOauthTokenUrl)
                .respond(400);
        };
    });

    describe('login', function() {

        it('should reject bad logins', function() {
            this.mock400Response();

            var error = false;
            this.loginService.login('john', 'bad-password')
                .catch(function() {
                    error = true;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(error).toBe(true);
        });

        it('returns an error message for bad logins', function() {
            this.mock400Response();

            var message;
            this.loginService.login('john', 'bad-password')
                .catch(function(error) {
                    message = error;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(message).toBe('openlmisLogin.invalidCredentials');
        });

        it('returns an error if offline', function() {
            this.mock400Response();
            this.offlineService.isOffline.andReturn(true);

            var message;
            this.loginService.login('john', 'john-password')
                .catch(function(error) {
                    message = error;
                });

            this.$rootScope.$apply();

            expect(message).toEqual('openlmisLogin.cannotConnectToServer');
        });

        it('should resolve successful logins', function() {
            this.mock200Response();

            var result;
            this.loginService.login('john', 'john-password')
                .then(function(response) {
                    result = response;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result).toEqual({
                userId: 'userId',
                username: 'john',
                accessToken: 'access_token'
            });

        });

        it('should set access token when login is successful', function() {
            this.mock200Response();

            this.loginService.login('john', 'john-password');
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authorizationService.setAccessToken).toHaveBeenCalledWith('access_token');
        });

        it('should set basic user data when login is successful', function() {
            this.mock200Response();

            this.loginService.login('john', 'john-password');
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authorizationService.setUser).toHaveBeenCalledWith('userId', 'john');
        });

        it('should wait for post login actions', function() {
            this.mock200Response();

            var postLoginActionDeferred = this.$q.defer();
            var postLoginAction = jasmine.createSpy('postLoginAction');
            postLoginAction.andReturn(postLoginActionDeferred.promise);

            this.loginService.registerPostLoginAction(postLoginAction);

            var success;
            this.loginService.login('john', 'john-password')
                .then(function() {
                    success = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(success).toBeFalsy();

            postLoginActionDeferred.resolve();
            this.$rootScope.$apply();

            expect(success).toBe(true);
            expect(postLoginAction).toHaveBeenCalledWith({
                userId: 'userId',
                username: 'john',
                accessToken: 'access_token'
            });
        });

        it('should inform authService about successful login before executing post login actions', function() {
            this.mock200Response();

            var postLoginActionDeferred = this.$q.defer();
            var postLoginAction = jasmine.createSpy('postLoginAction');
            postLoginAction.andReturn(postLoginActionDeferred.promise);

            this.loginService.registerPostLoginAction(postLoginAction);

            var success;
            this.loginService.login('john', 'john-password')
                .then(function() {
                    success = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authService.loginConfirmed).toHaveBeenCalled();
            expect(success).toBeUndefined();
        });

        it('should not inform authService if login failed', function() {
            this.mock400Response();

            var error;
            this.loginService.login('john', 'bad-password')
                .catch(function() {
                    error = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authService.loginConfirmed).not.toHaveBeenCalled();
            expect(error).toBe(true);
        });
    });

    describe('logout', function() {

        beforeEach(function() {
            this.$httpBackend
                .whenPOST(this.authUrl('/api/users/auth/logout'))
                .respond(200);
        });

        it('always clears the access token', function() {
            this.loginService.logout();
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authorizationService.clearAccessToken).toHaveBeenCalled();
        });

        it('always clears user data', function() {
            this.loginService.logout();
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(this.authorizationService.clearUser).toHaveBeenCalled();
        });

        it('should logout while offline', function() {
            this.offlineService.isOffline.andReturn(true);

            var success = false;
            this.loginService.logout().then(function() {
                success = true;
            });
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });

        it('should resolve promise if response status is 401', function() {
            this.$httpBackend
                .whenPOST(this.authUrl('/api/users/auth/logout'))
                .respond(401);

            var resolved = false;
            this.loginService.logout().then(function() {
                resolved = true;
            });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(resolved).toBe(true);
        });

        it('should wait for post logout actions', function() {
            var postLogoutActionDeferred = this.$q.defer();
            var postLogoutAction = jasmine.createSpy('postLogoutAction');
            postLogoutAction.andReturn(postLogoutActionDeferred.promise);

            this.loginService.registerPostLogoutAction(postLogoutAction);

            var success;
            this.loginService.logout()
                .then(function() {
                    success = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(success).toBeFalsy();

            postLogoutActionDeferred.resolve();
            this.$rootScope.$apply();

            expect(success).toBe(true);
            expect(postLogoutAction).toHaveBeenCalled();
        });

    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
