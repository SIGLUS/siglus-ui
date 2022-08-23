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

describe('siglusAnalyticsReportTracerDrugController', function() {

    var  $controller, AnalyticsReportMetabaseDataBuilder, analyticsReportMetabase,
        vm, loadingModalService, $scope, $rootScope, filterInfo;

    beforeEach(function() {
        module('siglus-analytics-report');
        module('siglus-analytics-report-metabase');
        module('stockmanagement');
        module('siglus-analytics-report-tracer-drug');

        inject(function($injector) {

            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            AnalyticsReportMetabaseDataBuilder = $injector.get('AnalyticsReportMetabaseDataBuilder');
            $rootScope = $injector.get('$rootScope');
        });
        $scope = $rootScope.$new();
        analyticsReportMetabase = new AnalyticsReportMetabaseDataBuilder().build();
        filterInfo = prepareFilterInfo();
        vm = $controller('siglusAnalyticsReportTracerDrugController', {
            analyticsReportMetabase: analyticsReportMetabase,
            $scope: $scope,
            filterInfo: filterInfo
        });
        spyOn($scope, '$watch').andCallThrough();
        vm.$onInit();

    });

    describe('onInit', function() {

        beforeEach(function() {
            spyOn(loadingModalService, 'open');
        });

        it('should watch province', function() {
            vm.districtCode = filterInfo.geographicZones[1].code;

            expect($scope.$watch).toHaveBeenCalled();
        });

        it('should watch district', function() {
            vm.districtCode = filterInfo.geographicZones[0].code;

            expect($scope.$watch).toHaveBeenCalled();
        });

        it('should expose analyticsReportMetabase', function() {
            //expect(loadingModalService.open).toHaveBeenCalled();
            expect(angular.toJson(vm.analyticsReportMetabase)).toEqual(angular.toJson(analyticsReportMetabase));
        });

        it('should have one province option', function() {
            expect(vm.provinceList.length).toEqual(1);
        });

        it('should have one district option', function() {
            expect(vm.districtList.length).toEqual(1);
        });
    });

    function prepareFilterInfo() {
        return {
            tracerDrugs: [
                {
                    productCode: '2A601',
                    productName: '牛逼药品'
                },
                {
                    productCode: '2A601',
                    productName: '牛逼药品'
                }
            ],
            geographicZones: [
                {
                    name: 'CIDADE DE LICHINGAA',
                    code: '0102',
                    parentCode: '01',
                    level: 'District',
                    levelCode: 3
                },
                {
                    name: 'NIASSA',
                    code: '01',
                    parentCode: null,
                    level: 'Province',
                    levelCode: 2
                }
            ]
        };
    }

});
