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

describe('siglusAnalyticsReportCustomizeRapidController', function() {
    var testData = [];
    beforeEach(function() {
        var context = this;
        module('siglus-analytics-report-customize-rapid');
        module('requisition-view', function($provide) {
            context.RequisitionStockCountDateModalMock = jasmine.createSpy('RequisitionStockCountDateModal');

            $provide.factory('RequisitionStockCountDateModal', function() {
                return context.RequisitionStockCountDateModalMock;
            });
        });
        module('referencedata-facility-type-approved-product');
        module('referencedata-facility');
        module('referencedata-program');
        module('referencedata-period');

        var RequisitionDataBuilder, RequisitionLineItemDataBuilder, ProgramDataBuilder;
        inject(function($injector) {
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.openlmisDateFilter = $injector.get('openlmisDateFilter');
            this.$controller = $injector.get('$controller');
        });

        this.program = new ProgramDataBuilder()
            .withEnabledDatePhysicalStockCountCompleted()
            .build();
        this.facility = new this.FacilityDataBuilder().build();
        // for constroller's functions
        testData = [
            {
                title: 'is January',
                date: '2022-01-10',
                expect: 'January',
                id: '000001',
                pdfName: 'Requi000001_' + this.facility.name + '_Jan 10_2022_MMIT.pdf'
            },
            {
                title: 'is February',
                date: '2021-02-10',
                expect: 'February',
                id: '000002',
                pdfName: 'Requi000002_' + this.facility.name + '_Feb 10_2021_MMIT.pdf'
            },
            {
                title: 'is March',
                date: '2020-03-10',
                expect: 'March',
                id: '000003',
                pdfName: 'Requi000003_' + this.facility.name + '_Mar 10_2020_MMIT.pdf'
            },
            {
                title: 'is April',
                date: '2022-04-10',
                expect: 'April',
                id: '000004',
                pdfName: 'Requi000004_' + this.facility.name + '_Apr 10_2022_MMIT.pdf'
            },
            {
                title: 'is May',
                date: '2023-05-10',
                expect: 'May',
                id: '000005',
                pdfName: 'Requi000005_' + this.facility.name + '_May 10_2023_MMIT.pdf'
            },
            {
                title: 'is June',
                date: '2022-06-10',
                expect: 'June',
                id: '000006',
                pdfName: 'Requi000006_' + this.facility.name + '_Jun 10_2022_MMIT.pdf'
            },
            {
                title: 'is July',
                date: '2022-07-10',
                expect: 'July',
                id: '000007',
                pdfName: 'Requi000007_' + this.facility.name + '_Jul 10_022_MMIT.pdf'
            },
            {
                title: 'is August',
                date: '2024-08-10',
                expect: 'August',
                id: '000008',
                pdfName: 'Requi000008_' + this.facility.name + '_Aug 10_2024_MMIT.pdf'
            },
            {
                title: 'is September',
                date: '2022-09-10',
                expect: 'September',
                id: '000009',
                pdfName: 'Requi000009_' + this.facility.name + '_Sep 10_2022_MMIT.pdf'
            },
            {
                title: 'is October',
                date: '2029-10-10',
                expect: 'October',
                id: '000010',
                pdfName: 'Requi000010_' + this.facility.name + '_Oct 10_2029_MMIT.pdf'
            },
            {
                title: 'is November',
                date: '2022-11-10',
                expect: 'November',
                id: '000011',
                pdfName: 'Requi000011_' + this.facility.name + '_Nov 10_2022_MMIT.pdf'
            },
            {
                title: 'is December',
                date: '2022-12-10',
                expect: 'December',
                id: '000012',
                pdfName: 'Requi000012_' + this.facility.name + '_Dec 10_2022_MMIT.pdf'
            }
        ];
        this.requisition = new RequisitionDataBuilder()
            .withProgram(this.program)
            .withRequisitionLineItems([
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(this.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(this.program)
                    .buildJson()
            ])
            .build();
        // console.log('#### requisition', this.requisition)
        // SIGLUS-REFACTOR: starts here
        this.requisition.extraData = {
            consultationNumber: undefined,
            openedKitByCHW: undefined,
            openedKitByHF: undefined,
            receivedKitByCHW: undefined,
            receivedKitByHF: undefined
        };
        // SIGLUS-REFACTOR: ends here
        this.vm = this.$controller('siglusAnalyticsReportCustomizeRapidController', {
            facility: this.facility,
            requisition: this.requisition,
            openlmisDateFilter: this.openlmisDateFilter
        });
        this.vm.$onInit();
    });

    describe('$onInit', function() {

        it('should expose facility', function() {
            expect(angular.toJson(this.vm.facility)).toEqual(angular.toJson(this.facility));
        });

        it('should expose requisition', function() {
            expect(angular.toJson(this.vm.requisition)).toEqual(angular.toJson(this.requisition));
        });
    });

    describe('get fully month function', function() {
        _.forEach(testData, function(item) {
            it('should expose month ' + item.title, function() {
                expect(this.vm.getMonth(item.date)).toEqual(item.expect);
            });
        });
    });

    describe('get creationDate function', function() {
        _.forEach(testData, function(item) {
            it('should expose month year ' + item.title, function() {
                expect(this.vm.getCreationDate(item.date))
                    .toEqual(item.expect.substring(0, 3) + ' ' + new Date(item.date).getFullYear());
            });
        });
    });

    describe('get getPdfName function', function() {
        _.forEach(testData, function(item) {
            it('should expose pdf name ' + item.title, function() {
                expect(this.vm.getPdfName(item.date, this.vm.facility.name, item.id))
                    .toEqual(item.pdfName);
            });
        });
    });

});