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

describe('periodService', function() {

    beforeEach(function() {
        this.offlineService = jasmine.createSpyObj('offlineService', ['isOffline', 'checkConnection']);
        this.periodsStorage = jasmine.createSpyObj('periodsStorage', ['getBy', 'getAll', 'put', 'search']);

        var offlineService = this.offlineService,
            periodsStorage = this.periodsStorage;
        module('referencedata-period', function($provide) {
            $provide.service('localStorageFactory', function() {
                return jasmine.createSpy('localStorageFactory').andReturn(periodsStorage);
            });

            $provide.service('offlineService', function() {
                return offlineService;
            });
        });

        inject(function($injector) {
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.referencedataUrlFactory = $injector.get('referencedataUrlFactory');
            this.dateUtils = $injector.get('dateUtils');
            this.periodService = $injector.get('periodService');
            this.PeriodDataBuilder = $injector.get('PeriodDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.$q = $injector.get('$q');
        });

        this.offlineService.isOffline.andReturn(false);

        this.period = new this.PeriodDataBuilder().build();

        this.periods = [
            this.period,
            new this.PeriodDataBuilder().build()
        ];

        this.periodsPage = new this.PageDataBuilder()
            .withContent(this.periods)
            .build();
    });

    describe('get', function() {

        it('should get processing period by id from storage while offline', function() {
            this.periodsStorage.getBy.andReturn(this.period);
            this.offlineService.isOffline.andReturn(true);

            var result;
            this.periodService.get(this.period.id).then(function(period) {
                result = period;
            });
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toBe(angular.toJson(this.period));
        });

        it('should get processing period by id and save it to storage', function() {
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .expectGET(this.referencedataUrlFactory('/api/siglusapi/processingPeriods/' + this.period.id))
                .respond(200, this.period);
            // SIGLUS-REFACTOR: ends here
            var result;
            this.periodService
                .get(this.period.id)
                .then(function(response) {
                    result = response;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.period));
            expect(this.periodsStorage.put).toHaveBeenCalled();
        });
    });

    describe('create', function() {

        it('should create new processing period', function() {
            var periodCopy = angular.copy(this.period);

            periodCopy.startDate = this.dateUtils.toStringDate(periodCopy.startDate);
            periodCopy.endDate = this.dateUtils.toStringDate(periodCopy.endDate);
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .expectPOST(this.referencedataUrlFactory('/api/siglusapi/processingPeriods'), periodCopy)
                .respond(200, this.period);
            // SIGLUS-REFACTOR: ends here
            var result;
            this.periodService
                .create(this.period)
                .then(function(response) {
                    result = response;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.period));
        });
    });

    describe('query', function() {

        it('should get all periods and save them to storage', function() {
            var params = {
                page: 0
            };
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend
                .expectGET(this.referencedataUrlFactory('/api/siglusapi/processingPeriods?page=' + params.page))
                .respond(200, this.periodsPage);
            // SIGLUS-REFACTOR: ends here
            var result;
            this.periodService
                .query(params)
                .then(function(periodsPage) {
                    result = periodsPage;
                });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.periodsPage));
        });
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
