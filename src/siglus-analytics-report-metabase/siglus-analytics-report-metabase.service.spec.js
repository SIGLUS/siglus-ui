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
    var $rootScope, $httpBackend, analyticsReportMetabaseService,
        analyticsReportUrlFactory, AnalyticsReportMetabaseDataBuilder;
    beforeEach(function() {
        module('siglus-analytics-report');
        module('siglus-analytics-report-metabase');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            analyticsReportMetabaseService = $injector.get('analyticsReportMetabaseService');
            analyticsReportUrlFactory = $injector.get('analyticsReportUrlFactory');
            AnalyticsReportMetabaseDataBuilder = $injector.get('AnalyticsReportMetabaseDataBuilder');
        });

    });

    describe('getMetabaseUrl', function() {

        var analyticsReportMetabase;
        beforeEach(function() {
            analyticsReportMetabase = new AnalyticsReportMetabaseDataBuilder().build();
            this.$httpBackend
                // eslint-disable-next-line max-len
                .whenGET(analyticsReportUrlFactory('/api/siglusapi/dashboard?dashboardName=system_version_report'))
                .respond(200, analyticsReportMetabase);
        });

        it('should call /api/siglusapi/dashboard dashboardName', function() {
            $httpBackend
                .expectGET(analyticsReportUrlFactory('/api/siglusapi/dashboard?dashboardName=system_version_report'));

            analyticsReportMetabaseService.getMetabaseUrl();

            $httpBackend.flush();
        });

        it('should return response', function() {
            var  expectAnalyticsReportMetabase = {
                iframeUrl: 'https://qa-metabase.siglus.us/**'
            };
            var result;
            analyticsReportMetabaseService.getMetabaseUrl('system_version_report').then(function(data) {
                result = data;
            });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(expectAnalyticsReportMetabase));
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.verifyNoOutstandingExpectation();
    });

});
