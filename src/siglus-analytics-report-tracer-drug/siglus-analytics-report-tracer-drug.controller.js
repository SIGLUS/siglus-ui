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

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name siglus-analytics-report-tracer-drug.controller:siglusAnalyticsReportTracerDrugController
     *
     * @description
     * second-tier detail page Controller for tracer drug report
     */
    angular
        .module('siglus-analytics-report-tracer-drug')
        .controller('siglusAnalyticsReportTracerDrugController', controller);

    controller.$inject = ['$scope', 'analyticsReportMetabase', 'loadingModalService', 'SIGLUS_TIME',
        'moment', 'analyticsReportMetabaseService', 'filterInfo', 'analyticsReportUrlFactory'];

    function controller($scope, analyticsReportMetabase, loadingModalService,
                        SIGLUS_TIME, moment, analyticsReportMetabaseService, filterInfo, analyticsReportUrlFactory) {

        var vm = this;
        var DATE_FORMAT = 'YYYY-MM-DD';
        var ALL_CODE = '0000-0000';
        vm.$onInit = onInit;
        $scope.iframeLoadedCallBack = iframeLoadedCallBack;
        vm.analyticsReportMetabase = {};

        vm.drugList = undefined;
        vm.provinceList = undefined;
        vm.districtList = undefined;
        vm.drugCode = undefined;
        vm.provinceCode = undefined;
        vm.districtCode = undefined;
        vm.startDate = undefined;
        vm.endDate = undefined;

        vm.startMaxDate = moment().format(DATE_FORMAT);

        vm.startMinDate = moment().subtract(1, 'year')
            .format(DATE_FORMAT);

        vm.endMaxDate = moment().format(DATE_FORMAT);

        vm.endMinDate =  moment().subtract(1, 'year')
            .format(DATE_FORMAT);

        function onInit() {

            vm.analyticsReportMetabase = analyticsReportMetabase;
            loadingModalService.open();

            var all = {
                name: 'ALL',
                code: ALL_CODE
            };

            var geographicZones = angular.copy(_.get(filterInfo, 'geographicZones', []));
            var provinceList = [], districtList = [];
            angular.forEach(geographicZones, function(item) {
                if (item.level === 'Province' && _.isNull(item.parentCode)) {
                    provinceList.push(item);
                }
                if (item.level === 'District' && !_.isEmpty(item.parentCode)) {
                    districtList.push(item);
                }
            });
            provinceList.push(all);
            districtList.push(all);

            vm.provinceList = provinceList;
            vm.districtList = districtList;
            vm.drugList = angular.copy(filterInfo.tracerDrugs);

            $scope.$watch(function() {
                return vm.provinceCode;
            }, function(newValue, oldValue) {
                var district = _.find(vm.districtList, function(item) {
                    return item.code === vm.districtCode;
                });
                if (newValue !== oldValue
                    && vm.districtCode !== ALL_CODE
                    && _.get(district, 'parentCode', '') !== newValue) {
                    vm.districtCode = undefined;
                }
                if (newValue === ALL_CODE) {
                    vm.districtList = _.filter(districtList, function(item) {
                        return item.code === ALL_CODE;
                    });
                    vm.districtCode = ALL_CODE;
                } else if (_.isEmpty(newValue)) {
                    vm.districtList = districtList;
                } else {
                    vm.districtList = _.filter(districtList, function(item) {
                        return item.parentCode === newValue || item.code === ALL_CODE;
                    });
                }
            }, true);

            $scope.$watch(function() {
                return vm.districtCode;
            }, function(newValue) {
                if (newValue !== ALL_CODE && !_.isEmpty(newValue)) {
                    var districtItem =  _.find(districtList, function(item) {
                        return item.code === newValue;
                    });
                    vm.provinceCode = districtItem.parentCode;
                }
            }, true);

            $scope.$watch(function() {
                return vm.startDate;
            }, function(newValue) {
                if (_.isEmpty(newValue)) {

                    vm.endMinDate =  moment().subtract(1, 'year')
                        .format(DATE_FORMAT);
                } else {
                    vm.endMinDate = newValue;
                }

            }, true);

            $scope.$watch(function() {
                return vm.endDate;
            }, function(newValue) {
                if (_.isEmpty(newValue)) {

                    vm.startMaxDate =  moment()
                        .format(DATE_FORMAT);
                } else {
                    vm.startMaxDate = newValue;
                }
            }, true);
        }

        vm.exportData = _.throttle(exportData, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        function exportData() {
            //loadingModalService.open();

            // var exportUrl = analyticsReportUrlFactory('/api/siglusapi/report/tracerDrug/excel')
            // + '?provinceCode='
            // + vm.provinceCode +
            // + '&districtCode='
            // + vm.districtCode
            // + '&startDate='
            // + vm.startDate
            // + '&endDate='
            // + vm.endDate
            // + '&drugCode='
            // + vm.drugCode;

            // var link = document.createElement('a');
            // link.style.display = 'none';
            // link.href = exportUrl;
            // link.setAttribute('download', 'test.xlsx');
            // document.body.appendChild(link);
            // link.click();
            // link.remove();

            //window.open(exportUrl, '_blank');
            analyticsReportMetabaseService.exportTracerDrugReport(vm.drugCode,
                vm.provinceCode,
                vm.districtCode,
                vm.startDate,
                vm.endDate);
            /*
                .$promise.then(function(result) {
                console.log(result);
                //loadingModalService.close();
                // var blob = new Blob([result], {
                //     type: 'application/vnd.ms-excel'
                // });
                var objectUrl = URL.createObjectURL(result);
                //利用浏览器打开URL实现下载
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display:none');
                a.setAttribute('href', objectUrl);
                var filename = 'test.xlsx';
                a.setAttribute('download', filename);
                a.click();
                URL.revokeObjectURL(objectUrl);

                // var BLOB = result;
                // var fileReader = new FileReader();
                // fileReader.readAsDataURL(BLOB);
                // fileReader.onload = function(event) {
                //     var a = document.createElement('a');
                //     a.download = 'tracer_drug_information_'
                 + moment().format('YYYY-MM-DDTHH_mm_ss.SSSSSS') + 'Z.xlsx';
                //     a.href = event.target.result;
                //     document.body.appendChild(a);
                //     a.click();
                //     document.body.removeChild(a);
                // };
            })
                .catch(function() {
                    loadingModalService.close();
                });
                */

        }
        function iframeLoadedCallBack() {
            // eslint-disable-next-line no-undef
            iFrameResize({}, '#metabase-iframe');
            loadingModalService.close();
        }
    }
})();
