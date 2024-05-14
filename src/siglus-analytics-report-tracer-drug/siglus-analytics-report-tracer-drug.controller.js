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
        'moment', 'analyticsReportMetabaseService', 'filterInfo', 'geographicList'
    ];

    function controller(
        $scope, analyticsReportMetabase, loadingModalService, SIGLUS_TIME,
        moment, analyticsReportMetabaseService, filterInfo, geographicList
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
        vm.allProvinceDistrictList = [];

        vm.startMaxDate = moment().format(DATE_FORMAT);

        vm.endMaxDate = moment().format(DATE_FORMAT);

        function onInit() {
            vm.analyticsReportMetabase = analyticsReportMetabase;
            vm.geographicList = geographicList;
            loadingModalService.open();

            var geographicNameList = buildProvinceAndDistrictNameList(geographicList);
            var geographicZones = angular.copy(_.get(filterInfo, 'geographicZones', []));
            var availableProvinceList = geographicZones.filter(function(zoneItem) {
                return zoneItem.levelCode === 2;
            });
            var availableDistrictList = geographicZones.filter(function(zoneItem) {
                return zoneItem.levelCode === 3;
            });

            var provinceList = [], districtList = [];

            if (geographicNameList.provinceNameList.some(function(provinceName) {
                return provinceName === ALL.name;
            })) {
                provinceList = availableProvinceList;
            } else {
                angular.forEach(geographicNameList.provinceNameList, function(provinceName) {
                    var zoneItem = availableProvinceList.find(function(zoneItem) {
                        return zoneItem.name === provinceName;
                    });
                    if (zoneItem) {
                        provinceList.push(zoneItem);
                    }
                });
            }

            if (geographicNameList.districtNameList.some(function(districtName) {
                return districtName === ALL.name;
            })) {
                districtList = availableDistrictList;
            } else {
                angular.forEach(geographicNameList.districtNameList, function(districtName) {
                    var zoneItem = availableDistrictList.find(function(zoneItem) {
                        return zoneItem.name === districtName;
                    });
                    if (zoneItem) {
                        districtList.push(zoneItem);
                    }
                });
            }
            vm.allProvinceDistrictList = districtList;

            if (_.size(provinceList) > 1) {
                provinceList.push(ALL);
            }

            if (_.size(districtList) > 1) {
                districtList.push(ALL);
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
                return vm.allProvinceDistrictList.map(function(districtItem) {
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

        function buildProvinceAndDistrictNameList(geographicList) {
            var provinceNameList = [], districtNameList = [];
            geographicList.forEach(function(geographicItem) {
                provinceNameList.push(
                    geographicItem.provinceId === REPORT_VIEW_ALL_CODE ? ALL.name : geographicItem.provinceName
                );
                districtNameList.push(
                    geographicItem.districtId === REPORT_VIEW_ALL_CODE ? ALL.name : geographicItem.districtName
                );
            });
            return {
                provinceNameList: _.uniq(provinceNameList),
                districtNameList: _.uniq(districtNameList)
            };
        }
    }
})();
