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

describe('Facility service minimal decorator', function() {

    beforeEach(function() {
        this.originalGetAllMinimalSpy = jasmine.createSpy('originalGetAllMinimal');

        var originalGetAllMinimalSpy = this.originalGetAllMinimalSpy;
        angular.module('test-utils', ['referencedata-facility'])
            .config(function($provide) {
                $provide.decorator('facilityService', function($delegate) {
                    $delegate.getAllMinimal = originalGetAllMinimalSpy;
                    return $delegate;
                });
            });

        module('test-utils');
        module('referencedata-facilities-cache');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.facilityService = $injector.get('facilityService');
            this.LocalDatabase = $injector.get('LocalDatabase');
            this.MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
        });

        this.minimalFacilities = [
            new this.MinimalFacilityDataBuilder().build(),
            new this.MinimalFacilityDataBuilder().build(),
            new this.MinimalFacilityDataBuilder().build()
        ];

        spyOn(this.LocalDatabase.prototype, 'putAll');
        spyOn(this.LocalDatabase.prototype, 'getAll');
        spyOn(this.LocalDatabase.prototype, 'get');
        spyOn(this.LocalDatabase.prototype, 'removeAll');
    });

    describe('cacheAllMinimal', function() {

        var fetchDeferred, removeDeferred, putDeferred;

        beforeEach(function() {
            this.originalGetAllMinimalSpy.andReturn(this.$q.resolve(this.minimalFacilities));
            this.LocalDatabase.prototype.removeAll.andReturn(this.$q.resolve());
            this.LocalDatabase.prototype.putAll.andReturn(this.$q.resolve());
        });

        it('should cache on the first call', function() {
            //the calls order is important thus using deferred instead of $q.resolve and $q.reject
            fetchDeferred = this.$q.defer();
            removeDeferred = this.$q.defer();
            putDeferred = this.$q.defer();

            this.LocalDatabase.prototype.putAll.andReturn(putDeferred.promise);
            this.LocalDatabase.prototype.removeAll.andReturn(removeDeferred.promise);

            this.originalGetAllMinimalSpy.andReturn(fetchDeferred.promise);

            var success;
            this.facilityService.cacheAllMinimal()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(this.originalGetAllMinimalSpy).toHaveBeenCalled();
            expect(this.LocalDatabase.prototype.removeAll).not.toHaveBeenCalled();
            expect(this.LocalDatabase.prototype.putAll).not.toHaveBeenCalled();

            fetchDeferred.resolve(this.minimalFacilities);
            this.$rootScope.$apply();

            expect(this.LocalDatabase.prototype.removeAll).toHaveBeenCalled();
            expect(this.LocalDatabase.prototype.putAll).not.toHaveBeenCalled();

            removeDeferred.resolve();
            this.$rootScope.$apply();

            expect(this.LocalDatabase.prototype.putAll).toHaveBeenCalledWith(this.minimalFacilities);

            expect(success).toBeUndefined();

            putDeferred.resolve();
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });

        it('should reject if fetching fails', function() {
            this.originalGetAllMinimalSpy.andReturn(this.$q.reject());

            var rejected;
            this.facilityService.cacheAllMinimal()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject if database fails to clear', function() {
            this.LocalDatabase.prototype.removeAll.andReturn(this.$q.reject());

            var rejected;
            this.facilityService.cacheAllMinimal()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject if database fails to save', function() {
            this.LocalDatabase.prototype.putAll.andReturn(this.$q.reject());

            var rejected;
            this.facilityService.cacheAllMinimal()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should attempt to fetch the facilities if the first attempt fails', function() {
            this.LocalDatabase.prototype.putAll.andReturn(this.$q.reject());

            this.facilityService.cacheAllMinimal();
            this.$rootScope.$apply();

            this.LocalDatabase.prototype.putAll.andReturn(this.$q.resolve());

            var success;
            this.facilityService.cacheAllMinimal()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });

        it('should not fetch data twice for following requests', function() {
            this.facilityService.cacheAllMinimal();

            this.originalGetAllMinimalSpy.reset();

            var success;
            this.facilityService.cacheAllMinimal()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(success).toBe(true);
            expect(this.originalGetAllMinimalSpy).not.toHaveBeenCalled();
        });

        it('should not fetch data if it already is cached', function() {
            this.facilityService.cacheAllMinimal();
            this.$rootScope.$apply();

            this.originalGetAllMinimalSpy.reset();

            var success;
            this.facilityService.cacheAllMinimal()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(success).toBe(true);
            expect(this.originalGetAllMinimalSpy).not.toHaveBeenCalled();
        });

        it('should re-fetch the data after re-logging', function() {
            this.facilityService.cacheAllMinimal();
            this.$rootScope.$apply();

            this.originalGetAllMinimalSpy.reset();

            this.facilityService.clearMinimalFacilitiesCache();
            this.$rootScope.$apply();

            var success;
            this.facilityService.cacheAllMinimal()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(success).toBe(true);
            expect(this.originalGetAllMinimalSpy).toHaveBeenCalled();
        });

    });

    describe('getAllMinimal', function() {

        beforeEach(function() {
            spyOn(this.facilityService, 'cacheAllMinimal').andReturn(this.$q.resolve());
            this.LocalDatabase.prototype.getAll.andReturn(this.$q.resolve(this.minimalFacilities));
        });

        it('should return cached facilities', function() {
            var result;
            this.facilityService.getAllMinimal()
                .then(function(minimalFacilities) {
                    result = minimalFacilities;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.minimalFacilities);
        });

        // SIGLUS-REFACTOR: starts here
        it('should return empty array', function() {
            this.facilityService.cacheAllMinimal.andReturn(this.$q.reject());

            var result;
            this.facilityService.getAllMinimal()
                .then(function(minimalFacilities) {
                    result = minimalFacilities;
                });
            this.$rootScope.$apply();

            expect(result).toEqual([]);
            expect(this.facilityService.cacheAllMinimal).toHaveBeenCalled();
        });
        // SIGLUS-REFACTOR: ends here

    });

    describe('getMinimal', function() {

        beforeEach(function() {
            spyOn(this.facilityService, 'cacheAllMinimal').andReturn(this.$q.resolve());
            this.LocalDatabase.prototype.get.andReturn(this.$q.resolve(this.minimalFacilities[0]));
        });

        it('should return cached facilities', function() {
            var result;
            this.facilityService.getMinimal()
                .then(function(minimalFacility) {
                    result = minimalFacility;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(this.minimalFacilities[0]);
        });

        it('should reject if caching fails', function() {
            this.facilityService.cacheAllMinimal.andReturn(this.$q.reject());

            var rejected;
            this.facilityService.getMinimal()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
            expect(this.facilityService.cacheAllMinimal).toHaveBeenCalled();
        });

    });

    describe('clearMinimalFacilitiesCache', function() {

        it('should clear the database', function() {
            this.LocalDatabase.prototype.removeAll.andReturn(this.$q.resolve());

            this.facilityService.clearMinimalFacilitiesCache();

            expect(this.LocalDatabase.prototype.removeAll).toHaveBeenCalled();
        });

        it('should resolve once the database is cleared', function() {
            var deferred = this.$q.defer();
            this.LocalDatabase.prototype.removeAll.andReturn(deferred.promise);

            var success;
            this.facilityService.clearMinimalFacilitiesCache()
                .then(function() {
                    success = true;
                });
            this.$rootScope.$apply();

            expect(success).toBeFalsy();

            deferred.resolve();
            this.$rootScope.$apply();

            expect(success).toBe(true);
        });

        it('should reject if database fail to clear', function() {
            this.LocalDatabase.prototype.removeAll.andReturn(this.$q.reject());

            var rejected;
            this.facilityService.clearMinimalFacilitiesCache()
                .catch(function() {
                    rejected = true;
                });
            this.$rootScope.$apply();

            expect(rejected).toBe(true);
        });

    });

});
