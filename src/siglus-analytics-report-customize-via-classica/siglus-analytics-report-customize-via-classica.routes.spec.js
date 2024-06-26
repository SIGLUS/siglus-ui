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

describe('openlmis.analyticsReport.requisitionAndMonthly.ViaClassica', function() {

    beforeEach(function() {
        module('siglus-analytics-report-customize-via-classica');
        module('requisition-view');
        inject(function($injector) {
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.PeriodDataBuilder = $injector.get('PeriodDataBuilder');
            this.RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');

            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
            this.requisitionService = $injector.get('requisitionService');
            this.facilityService = $injector.get('facilityService');
            this.programService = $injector.get('programService');
            this.periodService = $injector.get('periodService');
            this.$location = $injector.get('$location');
        });

        this.goToUrl = goToUrl;
        this.getResolvedValue = getResolvedValue;

        this.program = new this.ProgramDataBuilder().build();
        this.facility = new this.FacilityDataBuilder().build();
        this.period = new this.PeriodDataBuilder().build();
        this.requisition = new this.RequisitionDataBuilder()
            .withProgram(this.program)
            .withFacility(this.facility)
            .withProcessingPeriod(this.period)
            .withRequisitionLineItems([
                new this.RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(this.program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(this.program)
                    .buildJson(),
                new this.RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(this.program)
                    .buildJson()
            ])
            .build();
        this.lineItemsList = [
            this.requisition.requisitionLineItems[0],
            this.requisition.requisitionLineItems[2]
        ];

        spyOn(this.requisitionService, 'get').andReturn(this.$q.resolve(this.requisition));
        spyOn(this.programService, 'get').andReturn(this.$q.when(this.program));
        spyOn(this.facilityService, 'get').andReturn(this.$q.resolve(this.facility));
        spyOn(this.periodService, 'get').andReturn(this.$q.resolve(this.period));
    });

    it('should set $isEditable to false when fetch requisition', function() {
        this.requisition.$isEditable = true;
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('requisition')).not.toEqual({});
    });

    it('should fetch facility', function() {
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('facility')).not.toEqual(this.facility);
    });

    it('should fetch program', function() {
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('program')).not.toEqual(this.program);
    });

    it('should fetch period', function() {
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('processingPeriod')).not.toEqual(this.period);
    });

    it('should prepare line items', function() {
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('lineItemsList')).not.toEqual(this.lineItemsList);
    });

    it('should prepare columns', function() {
        this.goToUrl('/analyticsReports/requisitionAndMonthly/Balance%20Requisition/requisition-id');

        expect(this.getResolvedValue('columns')).not.toEqual([]);
    });

    function goToUrl(url) {
        this.$location.url(url);
        this.$rootScope.$apply();
    }

    function getResolvedValue(name) {
        return this.$state.$current.locals.globals[name];
    }

});
