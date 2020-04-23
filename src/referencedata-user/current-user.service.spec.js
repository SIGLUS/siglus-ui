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

describe('currentUserService', function() {

    beforeEach(function() {
        module('referencedata-user');

        inject(function($injector) {
            this.currentUserService = $injector.get('currentUserService');
            this.authorizationService = $injector.get('authorizationService');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.AuthUserDataBuilder = $injector.get('AuthUserDataBuilder');
            this.localStorageService = $injector.get('localStorageService');
            this.UserRepository = $injector.get('UserRepository');
            // SIGLUS-REFACTOR: starts here
            this.InitialInventoryResource = $injector.get('InitialInventoryResource');
            // SIGLUS-REFACTOR: ends here
        });

        this.currentUser = 'currentUser';

        this.authUser = new this.AuthUserDataBuilder().build();

        this.cachedUser = new this.UserDataBuilder()
            .withId(this.authUser.user_id)
            .withUsername('cachedUser')
            .build();

        this.user = new this.UserDataBuilder()
            .withId(this.authUser.user_id)
            .build();

        spyOn(this.authorizationService, 'getUser').andReturn(this.authUser);
        spyOn(this.localStorageService, 'get');
        spyOn(this.localStorageService, 'remove');
        spyOn(this.UserRepository.prototype, 'get').andReturn(this.$q.resolve(this.user));
        // SIGLUS-REFACTOR: starts here
        spyOn(this.InitialInventoryResource.prototype, 'query').andReturn(this.$q.resolve({
            canInitialInventory: false
        }));
        // SIGLUS-REFACTOR: starts here
    });

    describe('getUserInfo', function() {

        it('should reject promise if user is not logged in', function() {
            this.authorizationService.getUser.andReturn();

            var rejected;
            this.currentUserService.getUserInfo()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
            expect(this.localStorageService.get).not.toHaveBeenCalled();
            expect(this.UserRepository.prototype.get).not.toHaveBeenCalled();
        });

        it('should reject promise if user is logged in but no details are cached and they does not exist on the server',
            function() {
                this.UserRepository.prototype.get.andReturn(this.$q.reject());

                var rejected;
                this.currentUserService.getUserInfo()
                    .catch(function() {
                        rejected = true;
                    });
                this.$rootScope.$apply();

                expect(rejected).toBe(true);
                expect(this.UserRepository.prototype.get).toHaveBeenCalledWith(this.authUser.user_id);
            });

        it('should return cached user if available', function() {
            this.localStorageService.get.andReturn(angular.toJson(this.cachedUser));

            var result;
            this.currentUserService.getUserInfo().then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.cachedUser));
            expect(this.localStorageService.get).toHaveBeenCalledWith(this.currentUser);
            expect(this.UserRepository.prototype.get).not.toHaveBeenCalledWith();
        });

        it('should not fetch user twice from the server if none is cached', function() {
            this.currentUserService.getUserInfo();
            this.$rootScope.$apply();

            expect(this.localStorageService.get.callCount).toEqual(1);
            expect(this.UserRepository.prototype.get.callCount).toEqual(1);

            this.currentUserService.getUserInfo();
            this.$rootScope.$apply();

            expect(this.localStorageService.get.callCount).toEqual(1);
            expect(this.UserRepository.prototype.get.callCount).toEqual(1);
        });

        it('should fetch user from the server if none is cached', function() {
            var result;
            this.currentUserService.getUserInfo().then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();

            expect(result).toEqual(this.user);
            expect(this.localStorageService.get).toHaveBeenCalledWith(this.currentUser);
            expect(this.UserRepository.prototype.get).toHaveBeenCalledWith(this.authUser.user_id);
        });

        it('should reject promise if object returned by service is not an User', function() {
            this.UserRepository.prototype.get.andReturn(this.$q.resolve({
                not: 'an',
                instance: 'of',
                user: 'class'
            }));

            var rejected;
            this.currentUserService.getUserInfo()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
            expect(this.UserRepository.prototype.get).toHaveBeenCalledWith(this.authUser.user_id);
        });

    });

    describe('clearCache', function() {

        it('should clear cache', function() {
            this.currentUserService.getUserInfo();
            this.$rootScope.$apply();

            expect(this.localStorageService.get.callCount).toEqual(1);
            expect(this.UserRepository.prototype.get.callCount).toEqual(1);

            this.currentUserService.clearCache();
            this.currentUserService.getUserInfo();
            this.$rootScope.$apply();

            expect(this.localStorageService.get.callCount).toEqual(2);
            expect(this.UserRepository.prototype.get.callCount).toEqual(2);
            expect(this.localStorageService.remove).toHaveBeenCalledWith(this.currentUser);
        });

    });
});
