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

describe('authStateRouter', function() {

    beforeEach(function() {
        module('auth-state-router');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.loginModalService = $injector.get('loginModalService');
            this.loadingModalService = $injector.get('loadingModalService');
            this.authorizationService = $injector.get('authorizationService');
            this.$state = $injector.get('$state');
            this.alertService = $injector.get('alertService');
        });

        spyOn(this.$state, 'go');
        spyOn(this.$rootScope, '$emit');
        spyOn(this.alertService, 'error');
        spyOn(this.loadingModalService, 'close');
        spyOn(this.authorizationService, 'hasRights');
        spyOn(this.authorizationService, 'isAuthenticated');
        spyOn(this.loginModalService, 'open').andCallThrough();

        this.createState = function(name, accessRights) {
            return {
                name: name ? name : '',
                accessRights: accessRights
            };
        };
    });

    it('will redirect user to login if auth token is not set and state is home', function() {
        this.authorizationService.isAuthenticated.andReturn(false);

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('openlmis.home'));

        expect(this.$state.go).toHaveBeenCalledWith('auth.login', {
            reload: true
        });
    });

    it('will not redirect user if accessing pages in "auth.*" routes, and user is NOT authenticated', function() {
        this.authorizationService.isAuthenticated.andReturn(false);

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('auth.login'));

        expect(this.$state.go).not.toHaveBeenCalled();

    });

    it('will not redirect user if auth token is set, unless page is login.html', function() {
        this.authorizationService.isAuthenticated.andReturn(true);
        this.authorizationService.hasRights.andReturn(true);

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('somewhere'));

        expect(this.$state.go).not.toHaveBeenCalled();

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('auth.login'), {},
            this.createState('somewhere'));

        expect(this.$state.go).toHaveBeenCalledWith('openlmis.home', {}, {
            reload: true
        });
    });

    it('should call alert if has no permission to enter state', function() {
        this.authorizationService.isAuthenticated.andReturn(true);
        this.authorizationService.hasRights.andReturn(false);

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('somewhere', []));

        expect(this.alertService.error).toHaveBeenCalled();
    });

    it('should close loading modal if user has no permission to enter state', function() {
        this.authorizationService.isAuthenticated.andReturn(true);
        this.authorizationService.hasRights.andReturn(false);

        this.$rootScope.$broadcast('$stateChangeStart', this.createState('somewhere', []));

        expect(this.loadingModalService.close).toHaveBeenCalled();
    });
});
