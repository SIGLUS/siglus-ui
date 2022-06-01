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

describe('siglusRequisitionInitiateService', function() {

    beforeEach(function() {
        module('requisition-initiate');

        inject(function($injector) {
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            this.siglusRequisitionInitiateService = $injector.get('siglusRequisitionInitiateService');
        });

        this.facility = new this.FacilityDataBuilder().build();
        this.program = new this.FacilityDataBuilder().build();
    });

    it('should get latest physicalInventory by facility id', function() {
        this.$httpBackend
            .expectGET(this.requisitionUrlFactory('/api/siglusapi/physicalInventories/latest?facilityId='
                + this.facility.id))
            .respond(200, {});

        var result;
        this.siglusRequisitionInitiateService
            .getLatestPhysicalInventory(this.facility.id)
            .then(function(response) {
                result = response;
            });
        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(angular.toJson(result)).toEqual(angular.toJson({}));
    });

    it('should get physicalInventory dates', function() {

        this.$httpBackend
            .expectGET(this.requisitionUrlFactory('/api/siglusapi/physicalInventories/dates?'
                + 'facilityId=' + this.facility.id
                + '&programId=' + this.program.id
                + '&startDate=2020-02-10&endDate=2020-02-20'))
            .respond(200, []);

        var result;
        this.siglusRequisitionInitiateService
            .getPhysicalInventoryDates(this.program.id, this.facility.id, '2020-02-10', '2020-02-20')
            .then(function(response) {
                result = response;
            });
        this.$httpBackend.flush();
        this.$rootScope.$apply();

        expect(angular.toJson(result)).toEqual(angular.toJson([]));
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingExpectation();
        this.$httpBackend.verifyNoOutstandingRequest();
    });
});
