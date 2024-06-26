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

describe('siglusAnalyticsReportMetabaseController', function() {

    var $controller, AnalyticsReportMetabaseDataBuilder, analyticsReportMetabase,
        vm, loadingModalService, $scope, $rootScope;

    beforeEach(function() {
        module('siglus-analytics-report');
        module('siglus-analytics-report-metabase');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            AnalyticsReportMetabaseDataBuilder = $injector.get('AnalyticsReportMetabaseDataBuilder');
            analyticsReportMetabase = new AnalyticsReportMetabaseDataBuilder().build();
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            vm = $controller('siglusAnalyticsReportMetabaseController', {
                analyticsReportMetabase: analyticsReportMetabase,
                $scope: $scope
            });
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        beforeEach(function() {
            spyOn(loadingModalService, 'open');
        });

        // it('should open loading modal', function() {
        //     expect(loadingModalService.open).toHaveBeenCalled();
        // });

        it('should expose analyticsReportMetabase', function() {
            //expect(loadingModalService.open).toHaveBeenCalled();
            expect(angular.toJson(vm.analyticsReportMetabase)).toEqual(angular.toJson(analyticsReportMetabase));
        });
    });

});
