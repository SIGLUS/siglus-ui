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

describe('periodFactory', function() {

    var $rootScope, $q, periodServiceMock, periodFactory, periodOne, periodTwo, REQUISITION_STATUS;

    beforeEach(function() {
        module('requisition-initiate', function($provide) {
            periodServiceMock = jasmine.createSpyObj('periodService', ['getPeriodsForInitiate']);
            $provide.service('periodService', function() {
                return periodServiceMock;
            });
        });

        inject(function(_$rootScope_, _$q_, _periodFactory_, _REQUISITION_STATUS_) {
            $rootScope = _$rootScope_;
            periodFactory = _periodFactory_;
            $q = _$q_;
            REQUISITION_STATUS = _REQUISITION_STATUS_;
        });

        periodOne = {
            id: '1',
            name: 'period1',
            startDate: 'date1',
            endDate: 'date2'
        };

        periodTwo = {
            id: '1',
            name: 'period1',
            startDate: 'date1',
            endDate: 'date2',
            requisitionId: '05eb8040-66a9-4cd7-8da4-0735c9c44ab2',
            requisitionStatus: REQUISITION_STATUS.INITIATED
        };
    });

    describe('get emergency periods', function() {

        var programId = '1',
            facilityId = '2',
            emergency = true,
            data;

        beforeEach(function() {
            periodServiceMock.getPeriodsForInitiate.andCallFake(function() {
                return $q.when([periodOne, periodTwo]);
            });

            periodFactory.get(programId, facilityId, emergency).then(function(response) {
                data = response;
            });

            $rootScope.$apply();
        });

        it('should call periodService getPeriodsForInitiate method with proper params', function() {
            expect(periodServiceMock.getPeriodsForInitiate).toHaveBeenCalledWith(programId, facilityId, emergency);
        });

        it('should return proper periods', function() {
            expect(data[0]).toEqual({
                name: periodOne.name,
                startDate: periodOne.startDate,
                endDate: periodOne.endDate,
                rnrStatus: 'requisitionInitiate.notYetStarted',
                activeForRnr: true,
                rnrId: null,
                submitStartDate: undefined,
                submitEndDate: undefined,
                id: '1'
            });

            expect(data[1]).toEqual({
                name: periodTwo.name,
                startDate: periodTwo.startDate,
                endDate: periodTwo.endDate,
                rnrStatus: REQUISITION_STATUS.INITIATED,
                submitStartDate: undefined,
                submitEndDate: undefined,
                activeForRnr: true,
                rnrId: periodTwo.requisitionId,
                id: '1'
            });
        });
    });

    describe('get regular periods', function() {

        var programId = '1',
            facilityId = '2',
            emergency = false,
            data;

        beforeEach(function() {
            periodServiceMock.getPeriodsForInitiate.andCallFake(function() {
                return $q.when([periodTwo]);
            });

            periodFactory.get(programId, facilityId, emergency).then(function(response) {
                data = response;
            });

            $rootScope.$apply();
        });

        it('should call periodService getPeriodsForInitiate method with proper params', function() {
            expect(periodServiceMock.getPeriodsForInitiate).toHaveBeenCalledWith(programId, facilityId, emergency);
        });

        it('should return proper periods', function() {
            expect(data[0]).toEqual({
                name: periodTwo.name,
                startDate: periodTwo.startDate,
                endDate: periodTwo.endDate,
                rnrStatus: REQUISITION_STATUS.INITIATED,
                activeForRnr: true,
                rnrId: periodTwo.requisitionId,
                id: '1'
            });
        });
    });
});
