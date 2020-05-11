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

describe('UserRepositoryImpl', function() {

    beforeEach(function() {
        module('openlmis-pagination');
        module('referencedata-user');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.UserRepositoryImpl = $injector.get('UserRepositoryImpl');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.ReferenceDataUserResource = $injector.get('ReferenceDataUserResource');
            this.AuthUserResource = $injector.get('AuthUserResource');
            this.UserContactDetailsResource = $injector.get('UserContactDetailsResource');
            // SIGLUS-REFACTOR: starts here
            this.InitialInventoryResource = $injector.get('InitialInventoryResource');
            // SIGLUS-REFACTOR: ends here
        });

        this.userDataBuilder = new this.UserDataBuilder().asNew();

        this.user = this.userDataBuilder.build();

        this.userBuilders = [
            new this.UserDataBuilder(),
            new this.UserDataBuilder(),
            new this.UserDataBuilder(),
            new this.UserDataBuilder()
        ];

        this.userDataBuilder.withId('some-id');
        this.expected = this.userDataBuilder.build();

        this.authUser = this.userDataBuilder.buildAuthUserJson();

        spyOn(this.AuthUserResource.prototype, 'create').andReturn(this.$q.resolve(this.authUser));
        spyOn(this.AuthUserResource.prototype, 'get').andReturn(this.$q.resolve(this.authUser));
        // SIGLUS-REFACTOR: starts here
        spyOn(this.InitialInventoryResource.prototype, 'query').andReturn(this.$q.resolve({
            canInitialInventory: false
        }));
        // SIGLUS-REFACTOR: starts here

        spyOn(this.ReferenceDataUserResource.prototype, 'query');
        spyOn(this.ReferenceDataUserResource.prototype, 'update')
            .andReturn(this.$q.resolve(this.userDataBuilder.buildReferenceDataUserJson()));
        spyOn(this.ReferenceDataUserResource.prototype, 'get')
            .andReturn(this.$q.resolve(this.userDataBuilder.buildReferenceDataUserJson()));

        spyOn(this.UserContactDetailsResource.prototype, 'query');
        spyOn(this.UserContactDetailsResource.prototype, 'update')
            .andReturn(this.$q.resolve(this.userDataBuilder.buildUserContactDetailsJson()));
        spyOn(this.UserContactDetailsResource.prototype, 'get')
            .andReturn(this.$q.resolve(this.userDataBuilder.buildUserContactDetailsJson()));

        this.userRepositoryImpl = new this.UserRepositoryImpl();
    });

    describe('create', function() {

        it('should create reference data user before creating contact and auth details', function() {
            var referenceDataUserUpdateDeferred = this.$q.defer();
            this.ReferenceDataUserResource.prototype.update.andReturn(referenceDataUserUpdateDeferred.promise);

            this.userRepositoryImpl.create(this.user);

            expect(this.ReferenceDataUserResource.prototype.update)
                .toHaveBeenCalledWith(this.user.getBasicInformation());

            expect(this.AuthUserResource.prototype.create).not.toHaveBeenCalled();
            expect(this.UserContactDetailsResource.prototype.update).not.toHaveBeenCalled();

            referenceDataUserUpdateDeferred.resolve(this.userDataBuilder.buildReferenceDataUserJson());
            this.$rootScope.$apply();

            expect(this.AuthUserResource.prototype.create).toHaveBeenCalledWith(this.expected.getAuthDetails());
            expect(this.UserContactDetailsResource.prototype.update)
                .toHaveBeenCalledWith(this.expected.getContactDetails());
        });

        it('should return user json', function() {
            var expected = this.userDataBuilder.buildJson(),
                result;

            expected.enabled = this.authUser.enabled;

            this.userRepositoryImpl.create(this.user)
                .then(function(user) {
                    result = user;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(expected);
        });

        it('should reject if reference data user creation failed', function() {
            this.ReferenceDataUserResource.prototype.update.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.create(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if auth data user creation failed', function() {
            this.AuthUserResource.prototype.create.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.create(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if user contact details creation failed', function() {
            this.UserContactDetailsResource.prototype.update.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.create(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

    });

    describe('update', function() {

        beforeEach(function() {
            this.user = this.userDataBuilder.build();
        });

        it('should return user json', function() {
            var expected = this.userDataBuilder.buildJson(),
                result;

            expected.enabled = this.authUser.enabled;

            this.userRepositoryImpl.update(this.user)
                .then(function(user) {
                    result = user;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(expected);
            expect(this.AuthUserResource.prototype.create)
                .toHaveBeenCalledWith(this.expected.getAuthDetails());

            expect(this.ReferenceDataUserResource.prototype.update)
                .toHaveBeenCalledWith(this.expected.getBasicInformation());

            expect(this.UserContactDetailsResource.prototype.update)
                .toHaveBeenCalledWith(this.expected.getContactDetails());
        });

        it('should reject if reference data user update failed', function() {
            this.ReferenceDataUserResource.prototype.update.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.update(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if user contact details update failed', function() {
            this.UserContactDetailsResource.prototype.update.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.update(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if auth data user update failed', function() {
            this.AuthUserResource.prototype.create.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.update(this.user)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

    });

    describe('get', function() {

        beforeEach(function() {
            this.user = this.userDataBuilder.build();
        });

        it('should return user json', function() {
            var expected = this.userDataBuilder.buildJson(),
                result;

            expected.enabled = this.authUser.enabled;
            // SIGLUS-REFACTOR: starts here
            expected.canInitialInventory = false;
            // SIGLUS-REFACTOR: ends here

            this.userRepositoryImpl.get(this.user.id)
                .then(function(user) {
                    result = user;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(expected);
            expect(this.ReferenceDataUserResource.prototype.get).toHaveBeenCalledWith(this.user.id);
            expect(this.UserContactDetailsResource.prototype.get).toHaveBeenCalledWith(this.user.id);
            expect(this.AuthUserResource.prototype.get).toHaveBeenCalledWith(this.user.id);
        });

        it('should reject if reference data user creation failed', function() {
            this.ReferenceDataUserResource.prototype.get.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.get(this.user.id)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if user contact details creation failed', function() {
            this.UserContactDetailsResource.prototype.get.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.get(this.user.id)
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

    });

    describe('query', function() {

        beforeEach(function() {
            this.ReferenceDataUserResource.prototype.query.andReturn(this.$q.resolve(
                new this.PageDataBuilder()
                    .withContent([
                        this.userBuilders[0].buildReferenceDataUserJson(),
                        this.userBuilders[1].buildReferenceDataUserJson(),
                        this.userBuilders[2].buildReferenceDataUserJson()
                    ])
                    .build()
            ));

            this.UserContactDetailsResource.prototype.query.andReturn(this.$q.resolve(
                new this.PageDataBuilder()
                    .withContent([
                        this.userBuilders[0].buildUserContactDetailsJson(),
                        this.userBuilders[1].buildUserContactDetailsJson(),
                        this.userBuilders[2].buildUserContactDetailsJson()
                    ])
                    .build()
            ));
        });

        it('should fetch user contact details first if searching by email', function() {
            this.ReferenceDataUserResource.prototype.query.andReturn(this.$q.resolve(
                new this.PageDataBuilder()
                    .withContent([
                        this.userBuilders[0].buildReferenceDataUserJson(),
                        this.userBuilders[1].buildReferenceDataUserJson()
                    ])
                    .build()
            ));

            var result,
                params = {
                    email: 'jack.smith@opelmis.com',
                    username: 'user'
                };

            this.userRepositoryImpl.query(params).then(function(page) {
                result = page;
            });
            this.$rootScope.$apply();

            expect(result.content).toEqual([
                this.userBuilders[0].buildJson(),
                this.userBuilders[1].buildJson()
            ]);

            expect(this.UserContactDetailsResource.prototype.query).toHaveBeenCalledWith({
                email: 'jack.smith@opelmis.com'
            });

            expect(this.ReferenceDataUserResource.prototype.query).toHaveBeenCalledWith({
                email: 'jack.smith@opelmis.com',
                username: 'user',
                id: [
                    this.userBuilders[0].id,
                    this.userBuilders[1].id,
                    this.userBuilders[2].id
                ]
            });
        });

        it('should not call reference data if there are no matching contact details', function() {
            this.UserContactDetailsResource.prototype.query
                .andReturn(this.$q.resolve(new this.PageDataBuilder().build()));

            var result,
                params = {
                    email: 'jack.smith@opelmis.com',
                    username: 'user'
                };

            this.userRepositoryImpl.query(params).then(function(page) {
                result = page;
            });
            this.$rootScope.$apply();

            expect(result.content).toEqual([]);
            expect(this.UserContactDetailsResource.prototype.query).toHaveBeenCalledWith({
                email: 'jack.smith@opelmis.com'
            });

            expect(this.ReferenceDataUserResource.prototype.query).not.toHaveBeenCalled();
        });

        it('should fetch referencedata user first if email is not specified', function() {
            var result,
                params = {
                    username: 'user'
                };

            this.userRepositoryImpl.query(params).then(function(page) {
                result = page;
            });
            this.$rootScope.$apply();

            expect(result.content).toEqual([
                this.userBuilders[0].buildJson(),
                this.userBuilders[1].buildJson(),
                this.userBuilders[2].buildJson()
            ]);

            expect(this.ReferenceDataUserResource.prototype.query).toHaveBeenCalledWith({
                username: 'user'
            });

            expect(this.UserContactDetailsResource.prototype.query).toHaveBeenCalledWith({
                id: [
                    this.userBuilders[0].id,
                    this.userBuilders[1].id,
                    this.userBuilders[2].id
                ]
            });
        });

        it('should not call notification if there are no matching users', function() {
            this.ReferenceDataUserResource.prototype.query
                .andReturn(this.$q.resolve(new this.PageDataBuilder().build()));

            var result,
                params = {
                    username: 'user'
                };

            this.userRepositoryImpl.query(params).then(function(page) {
                result = page;
            });
            this.$rootScope.$apply();

            expect(result.content).toEqual([]);
            expect(this.ReferenceDataUserResource.prototype.query).toHaveBeenCalledWith({
                username: 'user'
            });

            expect(this.UserContactDetailsResource.prototype.query).not.toHaveBeenCalled();
        });

        it('should reference data user if there is no contact details', function() {
            this.UserContactDetailsResource.prototype.query.andReturn(this.$q.resolve(
                new this.PageDataBuilder()
                    .withContent([
                        this.userBuilders[0].buildUserContactDetailsJson(),
                        this.userBuilders[1].buildUserContactDetailsJson()
                    ])
                    .build()
            ));

            var result,
                params = {
                    username: 'user'
                };

            this.userRepositoryImpl.query(params).then(function(page) {
                result = page;
            });
            this.$rootScope.$apply();

            expect(result.content).toEqual([
                this.userBuilders[0].buildJson(),
                this.userBuilders[1].buildJson(),
                this.userBuilders[2].buildReferenceDataUserJson()
            ]);

            expect(this.ReferenceDataUserResource.prototype.query).toHaveBeenCalledWith({
                username: 'user'
            });

            expect(this.UserContactDetailsResource.prototype.query).toHaveBeenCalledWith({
                id: [
                    this.userBuilders[0].id,
                    this.userBuilders[1].id,
                    this.userBuilders[2].id
                ]
            });
        });

        it('should reject if reference data rejects', function() {
            this.ReferenceDataUserResource.prototype.query.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

        it('should reject if notification rejects', function() {
            this.UserContactDetailsResource.prototype.query.andReturn(this.$q.reject());

            var rejected;
            this.userRepositoryImpl.query()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
        });

    });

});
