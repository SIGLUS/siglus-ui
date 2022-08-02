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

describe('facilityService', function() {

    beforeEach(function() {
        this.offlineService = jasmine.createSpyObj('offlineService',
            ['isOffline', 'checkConnection']);
        this.facilitiesStorage = jasmine.createSpyObj('facilitiesStorage',
            ['getBy', 'getAll', 'put', 'search']);

        var offlineService = this.offlineService,
            facilitiesStorage = this.facilitiesStorage;
        module('referencedata-facility', function($provide) {
            $provide.service('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(
                    facilitiesStorage
                );
            });

            $provide.service('offlineService', function() {
                return offlineService;
            });
        });

        inject(function($injector) {
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.referencedataUrlFactory = $injector.get('referencedataUrlFactory');
            this.facilityService = $injector.get('facilityService');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.MinimalFacilityDataBuilder = $injector.get(
                'MinimalFacilityDataBuilder'
            );
            this.PermissionDataBuilder = $injector.get('PermissionDataBuilder');
            this.permissionService = $injector.get('permissionService');
            this.$q = $injector.get('$q');
        });

        this.offlineService.isOffline.andReturn(false);

        this.facilityOne = new this.FacilityDataBuilder().buildJson();
        this.facilityTwo = new this.FacilityDataBuilder().buildJson();

        this.minimalFacilityOne = new this.MinimalFacilityDataBuilder().buildJson();
        this.minimalFacilityTwo = new this.MinimalFacilityDataBuilder().buildJson();

        this.facilities = [
            this.facilityOne,
            this.facilityTwo
        ];

        this.minimalFacilities = [
            this.minimalFacilityOne,
            this.minimalFacilityTwo
        ];

        this.facilitiesPage = new this.PageDataBuilder()
            .withContent(this.facilities)
            .build();

        this.minimalFacilitiesPage = new this.PageDataBuilder()
            .withContent(this.minimalFacilities)
            .build();

        this.page = 0;
        this.size = 2;

        this.params = {
            page: this.page,
            size: this.size
        };
    });

    describe('get', function() {

        it('should get facility by id from storage while offline', function() {
            this.facilitiesStorage.getBy.andReturn(this.facilityTwo);
            this.offlineService.isOffline.andReturn(true);

            var result;
            this.facilityService.get(this.facilityTwo.id).then(
                function(facility) {
                    result = facility;
                }
            );
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toBe(
                angular.toJson(this.facilityTwo)
            );
        });
    });

    //     it('should get facility by id and save it to storage', function() {
    //         this.$httpBackend
    //             .whenGET(this.referencedataUrlFactory(
    //                 '/api/siglusapi/facilities' + this.facilityOne.id
    //             ))
    //             .respond(200, this.facilityOne);
    //
    //         var result;
    //         this.facilityService.get(this.facilityOne.id).then(function(facility) {
    //             result = facility;
    //         });
    //         this.$httpBackend.flush();
    //         this.$rootScope.$apply();
    //
    //         expect(angular.toJson(result)).toBe(angular.toJson(this.facilityOne));
    //         expect(this.facilitiesStorage.put).toHaveBeenCalled();
    //     });
    // });

    describe('getAll', function() {

        it('should get all facilities from storage while offline', function() {
            this.facilitiesStorage.getAll.andReturn(this.facilities);
            this.offlineService.isOffline.andReturn(true);

            var result;
            this.facilityService
                .query(this.params, {})
                .then(function(facilities) {
                    result = facilities;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.facilities);
        });

        it('should get all facilities and save them to storage', function() {
            this.$httpBackend
                .expectGET(this.referencedataUrlFactory(
                    '/api/siglusapi/facilities?page=' + this.page + '&size=' + this.size
                ))
                .respond(200, this.facilitiesPage);

            var result;
            this.facilityService
                .query(this.params, {})
                .then(function(paginatedObject) {
                    result = paginatedObject;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result.content).toEqual(this.facilities);
            expect(this.facilitiesStorage.put.callCount).toEqual(2);
        });

        it('should get all facilities by id and save them to storage', function() {
            this.$httpBackend
                .expectGET(this.referencedataUrlFactory(
                    '/api/siglusapi/facilities' +
          '?id=' + this.facilityOne.id +
          '&id=' + this.facilityTwo.id +
          '&page=' + this.page +
          '&size=' + this.size
                ))
                .respond(200, this.facilitiesPage);

            var result;
            this.facilityService
                .query(this.params, {
                    id: [this.facilityOne.id, this.facilityTwo.id]
                })
                .then(function(facilitiesPage) {
                    result = facilitiesPage;
                });

            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result.content).toEqual(this.facilities);
            expect(this.facilitiesStorage.put.callCount).toEqual(2);
        });
    });

    describe('getAllMinimal', function() {

        it('should get all facilities with minimal representation', function() {
            this.$httpBackend
                .expectGET(
                    this.referencedataUrlFactory('/api/facilities/minimal?sort=name')
                )
                .respond(200, this.minimalFacilitiesPage);

            var result;
            this.facilityService.getAllMinimal()
                .then(function(response) {
                    result = response;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(result).toEqual(this.minimalFacilities);
        });
    });

    describe('getFulfillmentFacilities', function() {

        it('should resolve to facility list', function() {
            this.userId = 'user-id';

            this.$httpBackend
                .expectGET(this.referencedataUrlFactory(
                    '/api/users/' + this.userId + '/fulfillmentFacilities'
                ))
                .respond(200, [this.facilityOne]);

            var result;
            this.facilityService
                .getFulfillmentFacilities({
                    userId: this.userId
                })
                .then(function(facilities) {
                    result = facilities;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(
                angular.toJson([this.facilityOne])
            );
        });

    });

    describe('search', function() {

        beforeEach(function() {
            this.page = 0;
            this.size = 2;
            this.name = 'facility';
            this.url = this.referencedataUrlFactory(
                '/api/siglusapi/facilities?page=' + this.page
          + '&size='
          + this.size
            );

            this.$httpBackend
                .whenPOST(this.url)
                .respond(200, this.facilitiesPage);
        });

        it('should resolve to facility list', function() {
            this.$httpBackend
                .expectPOST(this.referencedataUrlFactory(
                    '/api/siglusapi/facilities?page=' + this.page
          + '&size='
          + this.size
                ))
                .respond(200, this.facilitiesPage);

            var result;
            this.facilityService
                .search(this.params, {
                    name: name
                })
                .then(function(facilitiesPage) {
                    result = facilitiesPage;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(
                angular.toJson(this.facilitiesPage)
            );
        });
    });

    describe('getUserFacilitiesForRight', function() {

        beforeEach(function() {
            this.programOne = 'program-1';
            this.programTwo = 'program-2';

            var permissions = [
                new this.PermissionDataBuilder()
                    .withRight('example')
                    .withFacilityId(this.facilityOne.id)
                    .withProgramId(this.programOne)
                    .build(),
                new this.PermissionDataBuilder()
                    .withRight('example')
                    .withFacilityId(this.facilityOne.id)
                    .withProgramId(this.programTwo)
                    .build(),
                new this.PermissionDataBuilder()
                    .withRight('example')
                    .withFacilityId(this.facilityTwo.id)
                    .withProgramId(this.programOne)
                    .build(),
                new this.PermissionDataBuilder()
                    .withRight('test')
                    .withFacilityId(this.facilityTwo.id)
                    .build()
            ];

            spyOn(this.permissionService, 'load').andReturn(
                this.$q.resolve(permissions)
            );
            spyOn(this.facilityService, 'getAllMinimal').andReturn(
                this.$q.resolve(this.minimalFacilities)
            );
        });

        it('should reject if a userId is not specified', function() {
            var resultSpy = jasmine.createSpy('spy');

            this.facilityService.getUserFacilitiesForRight()
                .catch(resultSpy);

            this.$rootScope.$apply();

            expect(resultSpy).toHaveBeenCalled();
        });

        it('should reject if a right is not specified', function() {
            var resultSpy = jasmine.createSpy('spy');

            this.facilityService.getUserFacilitiesForRight('userId')
                .catch(resultSpy);

            this.$rootScope.$apply();

            expect(resultSpy).toHaveBeenCalled();
        });

        it('should get permissions for user', inject(function(permissionService) {
            this.facilityService.getUserFacilitiesForRight('userId', 'right');

            this.$rootScope.$apply();

            expect(permissionService.load).toHaveBeenCalledWith('userId');
        }));

        it('will only return facilities that are associated with the right',
            function() {
                var results;

                this.facilityService.getUserFacilitiesForRight('userId', 'example')
                    .then(function(facilities) {
                        results = facilities;
                    });
                this.$rootScope.$apply();

                expect(results.length).toBe(2);
                expect(results[0].id).toBe(this.facilityOne.id);

                results = undefined;
                this.facilityService.getUserFacilitiesForRight('userId', 'test')
                    .then(function(facilities) {
                        results = facilities;
                    });
                this.$rootScope.$apply();

                expect(results.length).toBe(1);
                expect(results[0].id).toBe(this.facilityTwo.id);
            });

        it('will sort the returned facilities alphabetically by name', function() {
            var results;

            // This name should make facility 2 first
            this.minimalFacilityOne.name = 'Another Facility';
            this.facilityService.getUserFacilitiesForRight('userId', 'example').then(
                function(facilities) {
                    results = facilities;
                }
            );
            this.$rootScope.$apply();

            expect(results.length).toBe(2);
            expect(results[0].name).toBe('Another Facility');
        });

        it('will add program ids into facility.supportedPrograms array',
            function() {
                var results;

                this.facilityService.getUserFacilitiesForRight('userId',
                    'example').then(function(facilities) {
                    results = facilities;
                });
                this.$rootScope.$apply();

                expect(results[0].id).toBe(this.minimalFacilityOne.id);
                expect(Array.isArray(results[0].supportedPrograms)).toBe(true);
                expect(results[0].supportedPrograms.length).toBe(2);
                expect(results[0].supportedPrograms[0].id).toBe(this.programOne);
            });

    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingRequest();
        this.$httpBackend.verifyNoOutstandingExpectation();
    });
});