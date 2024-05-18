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

    controller.$inject = [
        '$scope', 'analyticsReportMetabase', 'loadingModalService', 'SIGLUS_TIME',
        'moment', 'analyticsReportMetabaseService', 'filterInfo', 'geographicList',
        'isSystemAdmin'
    ];

    function controller(
        $scope, analyticsReportMetabase, loadingModalService, SIGLUS_TIME,
        moment, analyticsReportMetabaseService, filterInfo, geographicList,
        isSystemAdmin
    ) {

        var vm = this;
        var DATE_FORMAT = 'YYYY-MM-DD';
        var ALL_CODE = '0000-0000';
        var ALL = {
            name: 'ALL',
            code: ALL_CODE
        };
        var REPORT_VIEW_ALL_CODE = '00000000-0000-0000-0000-000000000000';

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
        vm.allProvinceList = [];
        vm.allDistrictList = [];
        vm.availableDistrictList = [];
        vm.provinceCodeToDistrictSelectionListMap = undefined;

        vm.startMaxDate = moment().format(DATE_FORMAT);
        vm.endMaxDate = moment().format(DATE_FORMAT);

        vm.onProvinceSelectChange = onProvinceSelectChange;
        vm.onDistrictSelectChange = onDistrictSelectChange;
        vm.onStartDateChange = onStartDateChange;
        vm.onEndDateChange = onEndDateChange;
        vm.exportData = _.throttle(exportData, SIGLUS_TIME.THROTTLE_TIME, {
            trailing: false
        });

        function onInit() {
            vm.analyticsReportMetabase = analyticsReportMetabase;
            loadingModalService.open();

            vm.drugList = angular.copy(filterInfo.tracerDrugs);

            var geographicZones = angular.copy(_.get(filterInfo, 'geographicZones', []));
            vm.allProvinceList = geographicZones.filter(function(zoneItem) {
                return zoneItem.levelCode === 2;
            });
            vm.allDistrictList = geographicZones.filter(function(zoneItem) {
                return zoneItem.levelCode === 3;
            });
            vm.provinceList = buildProvinceSelectList(geographicList);
            vm.availableDistrictList = filterDistrictListFromAllByReportView();
            vm.districtList = getDistrictSelectionList();
            vm.provinceCodeToDistrictSelectionListMap = _.groupBy(vm.availableDistrictList, 'parentCode');
        }

        function onProvinceSelectChange() {
            vm.districtList = getDistrictSelectionList();

            if (vm.provinceCode === ALL_CODE) {
                vm.districtCode = ALL_CODE;
                return;
            }

            if (isEmpty(vm.districtCode)) {
                return;
            }

            var district = _.find(vm.districtList, function(item) {
                return item.code === vm.districtCode;
            });

            if (_.get(district, 'parentCode') !== vm.provinceCode) {
                vm.districtCode = undefined;
            }
        }

        function onDistrictSelectChange() {
            if (!isEmpty(vm.districtCode) && vm.districtCode !== ALL_CODE) {
                var districtItem = _.find(vm.districtList, function(districtItem) {
                    return districtItem.code === vm.districtCode;
                });
                vm.provinceCode = _.get(districtItem, 'parentCode');
            }
        }

        function onStartDateChange() {
            if (isEmpty(vm.startDate)) {
                vm.startMaxDate = moment().format(DATE_FORMAT);
                vm.endMaxDate =  moment().format(DATE_FORMAT);
                vm.endMinDate =  undefined;
            } else {
                vm.endMinDate = vm.startDate;
                var oneYearLaterFromStartDate = moment(vm.startDate).add(1, 'year');
                var now = moment();
                vm.endMaxDate = oneYearLaterFromStartDate < now ?
                    oneYearLaterFromStartDate.format(DATE_FORMAT) : now.format(DATE_FORMAT);
            }
        }

        function onEndDateChange() {
            if (isEmpty(vm.endDate)) {
                vm.startMinDate = undefined;
                vm.startMaxDate = moment().format(DATE_FORMAT);
            } else {
                vm.startMinDate = moment(vm.endDate).subtract(1, 'year')
                    .format(DATE_FORMAT);
                vm.startMaxDate = vm.endDate;
            }
        }

        function exportData() {
            analyticsReportMetabaseService.exportTracerDrugReport(
                vm.drugCode,
                buildRequestDistrictNameList(),
                vm.startDate,
                vm.endDate
            );
        }

        function buildRequestDistrictNameList() {
            if (vm.districtCode !== ALL_CODE) {
                return [vm.districtCode];
            } else if (vm.provinceCode === ALL_CODE) {
                // districtCode === ALL_CODE, provinceCode === ALL_CODE
                return vm.availableDistrictList.map(function(districtItem) {
                    return districtItem.code;
                });
            }
            // provinceCode !== ALL_CODE, districtCode === ALL_CODE
            return vm.districtList.filter(function(districtItem) {
                return districtItem.parentCode === vm.provinceCode;
            }).map(function(districtItem) {
                return districtItem.code;
            });
        }

        function iframeLoadedCallBack() {
            // eslint-disable-next-line no-undef
            iFrameResize({}, '#metabase-iframe');
            loadingModalService.close();
        }

        function buildProvinceSelectList(geographicList) {
            var provinceSelectList = [];

            if (geographicList.some(function(geographicItem) {
                return geographicItem.provinceId === REPORT_VIEW_ALL_CODE;
            }) || isSystemAdmin) {
                provinceSelectList = vm.allProvinceList;
            } else {
                geographicList.forEach(function(geographicItem) {
                    var provinceItem = vm.allProvinceList.find(function(availableProvinceItem) {
                        return availableProvinceItem.name === geographicItem.provinceName;
                    });
                    if (provinceItem) {
                        provinceSelectList.push(provinceItem);
                    }
                });
            }
            if (provinceSelectList.length > 1) {
                provinceSelectList.push(ALL);
            }

            return _.uniq(provinceSelectList, 'code');
        }

        function getDistrictSelectionList() {
            var districtSelectionList = [];
            if (isEmpty(vm.provinceCode)) {
                districtSelectionList = vm.availableDistrictList;
            } else if (vm.provinceCode === ALL_CODE) {
                districtSelectionList = [ALL];
            } else {
                districtSelectionList = vm.provinceCodeToDistrictSelectionListMap[vm.provinceCode];
            }

            var finalDistrictList = angular.copy(districtSelectionList);
            if (finalDistrictList.length > 1) {
                finalDistrictList.push(ALL);
            }
            return _.uniq(finalDistrictList, 'code');
        }

        function filterDistrictListFromAllByReportView() {
            var shouldUseAllDistrict = isSystemAdmin ||
                geographicList.some(function(reportViewGeographicItem) {
                    return reportViewGeographicItem.provinceId === REPORT_VIEW_ALL_CODE;
                });
            return vm.allDistrictList.filter(function(districtItem) {
                return geographicList.some(function(reportViewGeographicItem) {
                    return shouldUseAllDistrict || reportViewGeographicItem.districtName === districtItem.name ||
                        (reportViewGeographicItem.districtId === REPORT_VIEW_ALL_CODE &&
                            reportViewGeographicItem.provinceName === getProvinceNameByCode(districtItem.parentCode));
                });
            });
        }

        function getProvinceNameByCode(code) {
            var provinceItem = vm.allProvinceList.find(function(provinceItem) {
                return provinceItem.code === code;
            });
            return provinceItem ? provinceItem.name : '';
        }

        function isEmpty(params) {
            return params === undefined || params === null;
        }

    }
})();
