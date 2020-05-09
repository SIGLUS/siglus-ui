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

    var $rootScope, $httpBackend, requisitionUrlFactoryMock, dateUtilsMock, alertServiceMock, periodService, periodOne,
        periodTwo;

    beforeEach(function() {
        module('requisition-initiate', function($provide) {
            requisitionUrlFactoryMock = jasmine.createSpy();
            $provide.factory('requisitionUrlFactory', function() {
                return requisitionUrlFactoryMock;
            });
            requisitionUrlFactoryMock.andCallFake(function(parameter) {
                return parameter;
            });

            dateUtilsMock = jasmine.createSpyObj('dateUtils', ['toDate']);
            $provide.factory('dateUtils', function() {
                return dateUtilsMock;
            });
            dateUtilsMock.toDate.andCallFake(function(parameter) {
                return parameter;
            });

            alertServiceMock = jasmine.createSpyObj('alertService', ['error']);
            $provide.factory('alertService', function() {
                return alertServiceMock;
            });
        });

        inject(function(_$httpBackend_, _$rootScope_, _periodService_) {
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
            periodService = _periodService_;
        });

        periodOne = {
            id: '1',
            startDate: 'date1',
            endDate: 'date2'
        };
        periodTwo = {
            id: '2',
            startDate: 'date3',
            endDate: 'date4'
        };
    });

    describe('getPeriodsForInitiate', function() {

        var programId = '1',
            facilityId = '2',
            emergency = false,
            promise;

        it('should return promise', function() {
            // SIGLUS-REFACTOR: starts here
            $httpBackend.when('GET', requisitionUrlFactoryMock(
                '/api/siglusintegration/v2/requisitions/periodsForInitiate?emergency=' +
                emergency + '&facilityId=' + facilityId + '&programId=' + programId
            ))
                .respond(200, [periodOne, periodTwo]);
            // SIGLUS-REFACTOR: ends here
            promise = periodService.getPeriodsForInitiate(programId, facilityId, emergency);

            $httpBackend.flush();

            expect(angular.isFunction(promise.then)).toBe(true);
        });

        it('should return proper response', function() {
            // SIGLUS-REFACTOR: starts here
            $httpBackend.when('GET', requisitionUrlFactoryMock(
                '/api/siglusintegration/v2/requisitions/periodsForInitiate?emergency=' +
                emergency + '&facilityId=' + facilityId + '&programId=' + programId
            ))
                .respond(200, [periodOne, periodTwo]);
            // SIGLUS-REFACTOR: ends here
            promise = periodService.getPeriodsForInitiate(programId, facilityId, emergency);

            $httpBackend.flush();

            var data;
            promise.then(function(response) {
                data = response;
            });

            $rootScope.$apply();

            expect(data).not.toBe(undefined);
            expect(data[0].id).toEqual(periodOne.id);
            expect(data[1].id).toEqual(periodTwo.id);
        });

        it('should call date utils', function() {
            // SIGLUS-REFACTOR: starts here
            $httpBackend.when('GET', requisitionUrlFactoryMock(
                '/api/siglusintegration/v2/requisitions/periodsForInitiate?emergency=' +
                emergency + '&facilityId=' + facilityId + '&programId=' + programId
            ))
                .respond(200, [periodOne, periodTwo]);
            // SIGLUS-REFACTOR: ends here
            promise = periodService.getPeriodsForInitiate(programId, facilityId, emergency);

            $httpBackend.flush();

            expect(dateUtilsMock.toDate).toHaveBeenCalledWith(periodOne.startDate);
            expect(dateUtilsMock.toDate).toHaveBeenCalledWith(periodOne.endDate);
            expect(dateUtilsMock.toDate).toHaveBeenCalledWith(periodTwo.startDate);
            expect(dateUtilsMock.toDate).toHaveBeenCalledWith(periodTwo.endDate);
        });

        it('should show an alert if facility is not supported', function() {
            // SIGLUS-REFACTOR: starts here
            $httpBackend.when('GET', requisitionUrlFactoryMock(
                '/api/siglusintegration/v2/requisitions/periodsForInitiate?emergency=' +
                emergency + '&facilityId=' + facilityId + '&programId=' + programId
            ))
                .respond(400, {
                    messageKey: 'requisition.error.facilityDoesNotSupportProgram'
                });
            // SIGLUS-REFACTOR: ends here
            promise = periodService.getPeriodsForInitiate(programId, facilityId, emergency);

            $httpBackend.flush();

            expect(angular.isFunction(promise.then)).toBe(true);
            expect(alertServiceMock.error).toHaveBeenCalledWith(
                'requisitionInitiate.programNotSupported.label', 'requisitionInitiate.programNotSupported.message'
            );
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

});
