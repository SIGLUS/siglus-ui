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

describe('openlmis-auth.authorizationService', function() {

    beforeEach(function() {
        module('openlmis-auth');

        inject(function($injector) {
            this.authorizationService = $injector.get('authorizationService');
            this.localStorageService = $injector.get('localStorageService');
            this.RightDataBuilder = $injector.get('RightDataBuilder');
        });
    });

    describe('setAccessToken', function() {

        it('will return authorized if the accessToken is set', function() {
            expect(this.authorizationService.isAuthenticated()).toBe(false);

            this.authorizationService.setAccessToken('token');

            expect(this.authorizationService.isAuthenticated()).toBe(true);
        });

        it('will not set a access token if it is falsy, and return false', function() {
            var returnValue = this.authorizationService.setAccessToken();

            expect(returnValue).toBe(false);
            expect(this.authorizationService.getAccessToken()).toBe(false);
        });

    });

    describe('getAccessToken', function() {

        it('will return the access token, set by setAccessToken', function() {
            this.authorizationService.setAccessToken('token');

            expect(this.authorizationService.getAccessToken()).toBe('token');
        });

    });

    describe('clearAccessToken', function() {

        it('will clear the access token', function() {
            this.authorizationService.setAccessToken('token');

            expect(this.authorizationService.getAccessToken()).toBe('token');

            this.authorizationService.clearAccessToken();

            expect(this.authorizationService.getAccessToken()).toBe(false);
        });

    });

    describe('clearUser', function() {

        it('will remove the user object', function() {
            this.authorizationService.setUser('1234', 'test');

            expect(this.authorizationService.getUser()).not.toBeUndefined();

            this.authorizationService.clearUser();

            expect(this.authorizationService.getUser()).toBe(false);
        });

    });

    describe('getUser', function() {

        it('will return an object representing the current user, that is set by setUser', function() {
            this.authorizationService.setUser('1234', 'test');

            var user = this.authorizationService.getUser();

            expect(user.user_id).toBe('1234');
            expect(user.username).toBe('test');
        });

    });

    describe('hasRight', function() {

        beforeEach(function() {
            this.authorizationService.setRights([
                new this.RightDataBuilder()
                    .withName('RIGHT_SUPERVISION')
                    .withProgramCodes(['program'])
                    .withProgramIds(['1'])
                    .withFacilityIds(['2'])
                    .build()
            ]);
        });

        it('should return false if right name is undefined', inject(function() {
            expect(function() {
                this.authorizationService.hasRight(undefined);
            }.bind(this)).toThrow(new Error('Right name is required'));
        }));

        it('should return true if supervision right name is found with program id and facility id', function() {
            expect(this.authorizationService.hasRight('RIGHT_SUPERVISION', {
                programId: '1',
                facilityId: '2'
            })).toBe(true);
        });

        it('should return false if supervision right name is found with program id but not facility id', function() {
            expect(this.authorizationService.hasRight('RIGHT_SUPERVISION', {
                programId: '1',
                facilityId: 'not found'
            })).toBe(false);
        });
    });

    describe('hasRights', function() {

        beforeEach(function() {
            this.authorizationService.setRights([
                new this.RightDataBuilder()
                    .withName('RIGHT_ONE')
                    .build(),
                new this.RightDataBuilder()
                    .withName('RIGHT_TWO')
                    .build()
            ]);
        });

        it('should return false if user does not have all required rights', function() {
            expect(this.authorizationService.hasRights(['RIGHT_ONE', 'RIGHT_THREE'], true)).toBe(false);
        });

        it('should return false if user does not have at least one required right', function() {
            expect(this.authorizationService.hasRights(['RIGHT_THREE', 'RIGHT_FOUR'], false)).toBe(false);
        });

        it('should return true if user has all required rights', function() {
            expect(this.authorizationService.hasRights(['RIGHT_ONE', 'RIGHT_TWO'], true)).toBe(true);
        });

        it('should return true if user has at least one required right', function() {
            expect(this.authorizationService.hasRights(['RIGHT_ONE', 'RIGHT_THREE'], false)).toBe(true);
        });

    });

    afterEach(function() {
        this.localStorageService.remove('ACCESS_TOKEN');
        this.localStorageService.remove('USER_ID');
        this.localStorageService.remove('USERNAME');
        this.localStorageService.remove('ROLE_ASSIGNMENTS');
    });

});
