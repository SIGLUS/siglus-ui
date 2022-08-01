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
                        SIGLUS_TIME, moment, analyticsReportMetabaseService, filterInfo) {

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

        vm.endMaxDate = moment().format(DATE_FORMAT);

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
            if (_.size(provinceList) > 1) {
                provinceList.push(all);
            }

            if (_.size(districtList) > 1) {
                districtList.push(all);
            }

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
                    vm.startMaxDate =  moment()
                        .format(DATE_FORMAT);
                    vm.endMaxDate =  moment().
                        format(DATE_FORMAT);
                    vm.endMinDate =  undefined;
                } else {
                    vm.endMinDate = newValue;
                    if (moment() > moment(newValue).add(1, 'year')) {
                        vm.endMaxDate =  moment(newValue).add(1, 'year')
                            .format(DATE_FORMAT);
                    } else {
                        vm.endMaxDate =  moment().format(DATE_FORMAT);
                    }
                }

            }, true);

            $scope.$watch(function() {
                return vm.endDate;
            }, function(newValue) {
                if (_.isEmpty(newValue)) {
                    vm.startMaxDate = moment().format(DATE_FORMAT);
                    vm.startMinDate = undefined;
                } else {
                    vm.startMaxDate = newValue;
                    vm.startMinDate =  moment(newValue).subtract(1, 'year')
                        .format(DATE_FORMAT);

                }
            }, true);
        }

        vm.exportData = _.throttle(exportData, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        function exportData() {
            analyticsReportMetabaseService.exportTracerDrugReport(vm.drugCode,
                vm.provinceCode,
                vm.districtCode,
                vm.startDate,
                vm.endDate);
        }

        function iframeLoadedCallBack() {
            // eslint-disable-next-line no-undef
            iFrameResize({}, '#metabase-iframe');
            loadingModalService.close();
        }
    }
})();
