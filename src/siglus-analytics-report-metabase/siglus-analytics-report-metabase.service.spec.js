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

describe('analyticsReportMetabaseService', function() {

    beforeEach(function() {
        module('siglus-analytics-report');
        module('siglus-analytics-report-metabase');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$httpBackend = $injector.get('$httpBackend');
            this.analyticsReportMetabaseService = $injector.get('analyticsReportMetabaseService');
            this.analyticsReportUrlFactory = $injector.get('analyticsReportUrlFactory');
            this.AnalyticsReportMetabaseDataBuilder = $injector.get('AnalyticsReportMetabaseDataBuilder');
        });

        this.analyticsReportMetabase = new this.AnalyticsReportMetabaseDataBuilder().build();
    });

    describe('getMetabaseUrl', function() {

        beforeEach(function() {
            this.$httpBackend
                // eslint-disable-next-line max-len
                .whenGET(this.analyticsReportMetabaseService('/api/siglusapi/dashboard?dashboardName=system_version_report'))
                .respond(200, this.analyticsReportMetabase);
        });

        it('should return promise', function() {
            var result = this.analyticsReportMetabaseService.getMetabaseUrl('system_version_report');
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to analyticsReportMetabase', function() {
            var result;
            this.analyticsReportMetabaseService.getMetabaseUrl('system_version_report').then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.analyticsReportMetabase));
        });
    });

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingRequest();
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

});
