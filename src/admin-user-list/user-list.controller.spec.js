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

describe('UserListController', function() {

    beforeEach(function() {
        this.confirmSpy = jasmine.createSpyObj('confirmService', ['confirm']);
        this.userPasswordModalFactoryMock = jasmine.createSpyObj('userPasswordModalFactoryMock', ['resetPassword']);

        var context = this;
        module('admin-user-list', function($provide) {
            $provide.service('confirmService', function() {
                return context.confirmSpy;
            });

            $provide.service('userPasswordModalFactory', function() {
                return context.userPasswordModalFactoryMock;
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$rootScope = $injector.get('$rootScope');
            this.$state = $injector.get('$state');
            this.$q = $injector.get('$q');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
        });

        this.usersList = [
            new this.UserDataBuilder().withUsername('administrator')
                .build(),
            new this.UserDataBuilder().withUsername('user')
                .build()
        ];

        this.vm = this.$controller('UserListController', {
            users: this.usersList
        });

        spyOn(this.$state, 'reload').andReturn();
        spyOn(this.$state, 'go').andReturn();
    });

    describe('onInit', function() {

        beforeEach(function() {
            this.stateParams = {
                firstName: this.usersList[0].firstName,
                lastName: this.usersList[0].lastName,
                username: this.usersList[0].username,
                email: this.usersList[0].email
            };

            this.vm = this.$controller('UserListController', {
                users: this.usersList,
                $stateParams: this.stateParams
            });
            this.vm.$onInit();
        });

        it('should expose users', function() {
            expect(this.vm.users).toEqual(this.usersList);
        });

        it('should expose firstName', function() {
            expect(this.vm.firstName).toEqual(this.usersList[0].firstName);
        });

        it('should expose lastName', function() {
            expect(this.vm.lastName).toEqual(this.usersList[0].lastName);
        });

        it('should expose email', function() {
            expect(this.vm.email).toEqual(this.usersList[0].email);
        });

        it('should expose username', function() {
            expect(this.vm.username).toEqual(this.usersList[0].username);
        });
    });

    it('should expose sort options', function() {
        expect(this.vm.options).toEqual({
            'adminUserList.firstName': ['firstName'],
            'adminUserList.lastName': ['lastName'],
            'adminUserList.username': ['username']
        });
    });

    describe('resetUserPassword', function() {

        beforeEach(function() {
            this.modalDeferred = this.$q.defer();
            this.userPasswordModalFactoryMock.resetPassword.andReturn(this.modalDeferred.promise);
        });

        it('should open user password modal', function() {
            this.vm.resetUserPassword(this.usersList[0]);

            expect(this.userPasswordModalFactoryMock.resetPassword).toHaveBeenCalledWith(this.usersList[0]);
        });

        it('should reload state after password change was successful', function() {
            this.vm.resetUserPassword(this.usersList[0]);
            this.modalDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.$state.reload).toHaveBeenCalled();
        });

        it('should not reload state if password change was unsuccessful', function() {
            this.vm.resetUserPassword(this.usersList[0]);
            this.modalDeferred.reject();
            this.$rootScope.$apply();

            expect(this.$state.reload).not.toHaveBeenCalled();
        });
    });

    describe('search', function() {

        it('should set lastName param', function() {
            this.vm.lastName = 'lastName';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {
                lastName: this.vm.lastName,
                firstName: undefined,
                email: undefined,
                usersPage: 0,
                username: undefined
            }, {
                reload: true
            });
        });

        it('should set firstName param', function() {
            this.vm.firstName = 'firstName';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {
                lastName: undefined,
                firstName: this.vm.firstName,
                email: undefined,
                usersPage: 0,
                username: undefined
            }, {
                reload: true
            });
        });

        it('should set email param', function() {
            this.vm.email = 'email';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {
                lastName: undefined,
                firstName: undefined,
                email: this.vm.email,
                usersPage: 0,
                username: undefined
            }, {
                reload: true
            });
        });

        it('should set username param', function() {
            this.vm.username = 'username';

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.administration.users', {
                lastName: undefined,
                firstName: undefined,
                email: undefined,
                usersPage: 0,
                username: this.vm.username
            }, {
                reload: true
            });
        });

        it('should call state go method', function() {
            this.vm.search();

            expect(this.$state.go).toHaveBeenCalled();
        });
    });
});
