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

describe('programService', function() {

    beforeEach(function() {
        this.programsStorage = jasmine.createSpyObj('programsStorage', ['getBy', 'getAll', 'put', 'search']);
        this.offlineService = jasmine.createSpyObj('offlineService', ['isOffline', 'checkConnection']);

        var programsStorage = this.programsStorage,
            offlineService = this.offlineService;
        module('referencedata-program', function($provide) {
            $provide.service('localStorageFactory', function() {
                return function() {
                    return programsStorage;
                };
            });
            $provide.service('offlineService', function() {
                return offlineService;
            });
        });

        inject(function($injector) {
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.openlmisUrlFactory = $injector.get('openlmisUrlFactory');
            this.programService = $injector.get('programService');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        this.program1 = new this.ProgramDataBuilder().build();
        this.program2 = new this.ProgramDataBuilder().build();

        this.programs = [
            this.program1,
            this.program2
        ];

        this.userId = 'userId';
        this.userIdOffline = {
            userIdOffline: this.userId
        };

        this.programsStorage.search.andReturn([]);
    });

    it('should get program by id and save it to storage', function() {
        // SIGLUS-REFACTOR: starts here
        this.$httpBackend
            .expectGET(this.openlmisUrlFactory('/api/siglusapi/programs/' + this.program1.id))
            .respond(200, this.program1);
        // SIGLUS-REFACTOR: ends here
        var result;
        this.programService
            .get(this.program1.id)
            .then(function(response) {
                result = response;
            });
        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(angular.toJson(result)).toEqual(angular.toJson(this.program1));
    });

    it('should get all programs', function() {

        this.$httpBackend
            .expectGET(this.openlmisUrlFactory('/api/programs'))
            .respond(200, this.programs);

        var result;
        this.programService.getAll().then(function(response) {
            result = response;
        });

        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(angular.toJson(result)).toEqual(angular.toJson(this.programs));
    });

    it('should get user programs and save them to storage', function() {
        this.offlineService.isOffline.andReturn(false);

        this.$httpBackend
            .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/programs'))
            .respond(200, this.programs);

        var result;
        this.programService
            .getUserPrograms(this.userId)
            .then(function(response) {
                result = response;
            });

        this.$httpBackend.flush();
        this.$rootScope.$apply();

        var expectedProgram1 = _.extend({}, this.program1, this.userIdOffline),
            expectedProgram2 = _.extend({}, this.program2, this.userIdOffline);

        expect(angular.toJson(result)).toEqual(angular.toJson([
            expectedProgram1,
            expectedProgram2
        ]));

        expect(angular.toJson(this.programsStorage.put.calls[0].args[0])).toEqual(angular.toJson(expectedProgram1));
        expect(angular.toJson(this.programsStorage.put.calls[1].args[0])).toEqual(angular.toJson(expectedProgram2));
    });

    it('should update program and save it to storage', function() {

        this.$httpBackend
            .expectPUT(this.openlmisUrlFactory('/api/programs/' + this.program1.id))
            .respond(200, this.program2);

        var result;
        this.programService.update(this.program1).then(function(response) {
            result = response;
        });
        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(angular.toJson(result)).toEqual(angular.toJson(this.program2));
        expect(this.programsStorage.put).toHaveBeenCalled();
    });

    describe('getUserPrograms', function() {

        it('will get a list of all the users programs', function() {
            this.$httpBackend
                .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/programs'))
                .respond(200, [this.program1]);

            var result;
            this.programService
                .getUserPrograms(this.userId)
                .then(function(programs) {
                    result = programs;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson([
                _.extend({}, this.program1, this.userIdOffline)
            ]));
        });

        it('will cache the first successful request', function() {
            this.$httpBackend
                .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/programs'))
                .respond(200, this.programs);

            this.programService.getUserPrograms(this.userId);

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(this.programsStorage.put.calls[0].args[0]))
                .toEqual(angular.toJson(_.extend({}, this.program1, this.userIdOffline)));
        });

        it('will not cache an unsuccessful request', function() {
            this.$httpBackend
                .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/programs'))
                .respond(400);

            var rejected;
            this.programService
                .getUserPrograms(this.userId)
                .catch(function() {
                    rejected = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(rejected).toEqual(true);
            expect(this.programsStorage.put).not.toHaveBeenCalled();
        });

        it('will return a cached response instead of making another request', function() {
            var cachedPrograms = [new this.ProgramDataBuilder().build()];

            this.programsStorage.search.andReturn(cachedPrograms);

            var result;
            this.programService
                .getUserPrograms(this.userId)
                .then(function(programs) {
                    result = programs;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(cachedPrograms);
        });
    });

    describe('getSupportedUserPrograms', function() {

        it('should get a list of all the users programs', function() {
            this.$httpBackend
                .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/supportedPrograms'))
                .respond(200, this.programs);

            var result;
            this.programService
                .getUserSupportedPrograms(this.userId)
                .then(function(programs) {
                    result = programs;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.programs));
        });

        it('should reject promise on unsuccessful request', function() {
            this.$httpBackend
                .expectGET(this.openlmisUrlFactory('api/users/' + this.userId + '/supportedPrograms'))
                .respond(400);

            var rejected;
            this.programService
                .getUserSupportedPrograms(this.userId)
                .catch(function() {
                    rejected = true;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
            expect(this.programsStorage.put).not.toHaveBeenCalled();
        });
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
