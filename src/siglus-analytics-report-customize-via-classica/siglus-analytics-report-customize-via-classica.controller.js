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
     * @name siglus-analytics-report-customize-via-classica.controller:siglusAnalyticsReportCustomizeMalariaController
     *
     * @description
     * Get Requisitions and Monthly Report second-tier page Malaria Report Customize
     */
    angular
        .module('siglus-analytics-report-customize-via-classica')
        .controller('siglusAnalyticsReportCustomizeViaClassicaController', controller);

    controller.$inject = [ 'requisition', 'facility', 'processingPeriod',
        'messageService',  'lineItemsList', 'columns', '$q', 'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES', 'openlmisDateFilter', 'requisitionService', 'siglusDownloadLoadingModalService',
        '$stateParams'];

    function controller(requisition, facility, processingPeriod, messageService, lineItemsList,
                        columns, $q, siglusTemplateConfigureService, SIGLUS_SECTION_TYPES, openlmisDateFilter,
                        requisitionService, siglusDownloadLoadingModalService, $stateParams) {
        var vm = this;
        vm.requisition = undefined;
        vm.facility = undefined;
        vm.processingPeriod = undefined;
        vm.lineItemsList = undefined;
        vm.columns = undefined;
        vm.showBreadCrumb = undefined;
        vm.$onInit = onInit;
        vm.downloadPdf = downloadPdf;
        vm.emergencyCount = '01';
        vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.processingPeriod = processingPeriod;
            vm.showBreadCrumb = $stateParams.showBreadCrumb === 'false';
            vm.requisitionType = messageService.get(
                vm.isEmergency ? 'requisitionView.emergency' : 'requisitionView.regular'
            );
            vm.lineItemsList = lineItemsList;
            vm.columns = columns;
            if (vm.showBreadCrumb) {
                hideBreadcrumb();
            }
            var collection = siglusTemplateConfigureService.
                getSectionByName(vm.requisition.usageTemplate.kitUsage, SIGLUS_SECTION_TYPES.COLLECTION);
            var collectionColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(collection);
            var service = siglusTemplateConfigureService
                .getSectionByName(vm.requisition.usageTemplate.kitUsage, SIGLUS_SECTION_TYPES.SERVICE);
            var serviceColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(service);
            _.sortBy(angular.forEach(vm.requisition.kitUsageLineItems, function(lineItem) {
                _.extend(lineItem, collectionColumnsMap[lineItem.collection]);
                angular.forEach(Object.keys(lineItem.services), function(serviceName) {
                    lineItem.services[serviceName] = angular.merge({},
                        serviceColumnsMap[serviceName],
                        lineItem.services[serviceName]);
                });
            }), 'displayOrder');
            emergencyCount();
        }

        function emergencyCount() {
            var formatNumber = function(num) {
                num = num.toString();
                return num[1] ? num : '0' + num;
            };
            var stateParams = {
                facility: facility.id,
                initiatedDateFrom: vm.requisition.processingPeriod.startDate,
                initiatedDateTo: vm.requisition.processingPeriod.endDate,
                program: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                sort: 'createdDate,desc'
            };
            return requisitionService.searchOriginal(
                false,
                stateParams
            ).then(function(res) {
                if (res.totalElements > 0) {
                    vm.emergencyCount = formatNumber(res.totalElements);
                }
            });
        }

        function downloadPdf() {
            siglusDownloadLoadingModalService.open();
            var viaHeader = document.getElementById('via-header');
            var viaTableHeader = document.getElementById('via-table-header');
            var viaSignaure = document.getElementById('via-signaure');
            var viaPrint = document.getElementById('via-print');

            var viaHeaderHeight = viaHeader.offsetHeight;
            var viaTableHeaderHeight = viaTableHeader.offsetHeight;
            var viaSignaureHeight = viaSignaure.offsetHeight;
            var viaPrintHeight = viaPrint.offsetHeight;

            //A4[595.28,841.89]
            var leftOffsetConstant = 20;
            var topOffsetConstant = 20;
            var A4_WIDTH = 801.89,
                A4_HEIGHT = 555,
                CONTAINER_WIDTH = viaHeader.offsetWidth,
                BLANK_DIVIDE_HEIGHT = 10,
                PAGE_NUMBER_TOPOFFSET_HEIGHT = 575;
            var rate = A4_WIDTH / CONTAINER_WIDTH;
            var a4Height2px = A4_HEIGHT / rate;
            var fixedHeight = viaHeaderHeight
                    + viaTableHeaderHeight
                    + viaSignaureHeight
                    + viaPrintHeight;
            var canUseHeight = a4Height2px - fixedHeight  - topOffsetConstant * 2;
            var needCalcTrNodes = document.querySelectorAll('.calcTr');
            var needCalcTrNodesArray = Array.from(needCalcTrNodes);
            var tableDomList = [viaHeader, viaTableHeader, viaSignaure, viaPrint];
            var fixedPromiseList = [];
            angular.forEach(tableDomList, function(item) {
                // eslint-disable-next-line no-undef
                fixedPromiseList.push(domtoimage.toPng(item, {
                    scale: 1,
                    width: CONTAINER_WIDTH,
                    height: item.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: CONTAINER_WIDTH,
                        nodeHeight: item.offsetHeight
                    };
                }));
            });

            var promiseList = [];
            // eslint-disable-next-line no-undef
            var PDF = new jsPDF('l', 'pt', 'a4');
            _.forEach(needCalcTrNodesArray, function(item) {
                // eslint-disable-next-line no-undef
                promiseList.push(domtoimage.toPng(item, {
                    scale: 1,
                    width: CONTAINER_WIDTH,
                    height: item.offsetHeight + 1
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: CONTAINER_WIDTH,
                        nodeHeight: item.offsetHeight + 1
                    };
                }));
            });

            $q.all(fixedPromiseList).then(function(reback) {
                var offsetHeight = topOffsetConstant / rate +
                viaHeaderHeight +
                BLANK_DIVIDE_HEIGHT +
                viaTableHeaderHeight +
                BLANK_DIVIDE_HEIGHT;
                // 当前分页部分tr的累积高度
                var realHeight = 0;
                // 页码
                var pageNumber = 1;
                var promiseListLen = promiseList.length;
                //$q.all(promiseList).then(function() {
                $q.all(promiseList).then(function(result) {
                    // 添加分页部分上方的固定部分图片到PDF中
                    PDF.addImage(
                        reback[0].data,
                        'PNG',
                        leftOffsetConstant,
                        topOffsetConstant,
                        A4_WIDTH,
                        reback[0].nodeHeight * rate
                    );
                    PDF.addImage(
                        reback[1].data,
                        'PNG',
                        leftOffsetConstant,
                        topOffsetConstant + (reback[0].nodeHeight + BLANK_DIVIDE_HEIGHT)   * rate,
                        A4_WIDTH,
                        reback[1].nodeHeight * rate
                    );
                    _.forEach(result, function(res, index) {
                        // 计算分页部分实际高度
                        realHeight = realHeight + result[index].nodeHeight;
                        if (realHeight > canUseHeight) {
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                A4_WIDTH / 2,
                                PAGE_NUMBER_TOPOFFSET_HEIGHT
                            );

                            // 遍历跟随分页部分重复的部分
                            PDF.addImage(
                                reback[2].data,
                                'PNG',
                                leftOffsetConstant,
                                (
                                    offsetHeight
                                    + 10
                                ) * rate,
                                A4_WIDTH,
                                reback[2].nodeHeight * rate
                            );
                            PDF.addImage(
                                reback[3].data,
                                'PNG',
                                leftOffsetConstant,
                                (
                                    offsetHeight
                                    + reback[2].nodeHeight
                                    + 10
                                ) * rate,
                                A4_WIDTH,
                                reback[3].nodeHeight * rate
                            );
                            // 新开分页
                            PDF.addPage('a4', 'l');
                            pageNumber = pageNumber + 1;
                            PDF.setFontSize(10);

                            PDF.text(
                                pageNumber.toString(),
                                A4_WIDTH / 2,
                                PAGE_NUMBER_TOPOFFSET_HEIGHT
                            );

                            PDF.addImage(
                                reback[0].data,
                                'PNG',
                                leftOffsetConstant,
                                topOffsetConstant,
                                A4_WIDTH,
                                reback[0].nodeHeight * rate
                            );
                            PDF.addImage(
                                reback[1].data,
                                'PNG',
                                leftOffsetConstant,
                                topOffsetConstant + (reback[0].nodeHeight + BLANK_DIVIDE_HEIGHT)   * rate,
                                A4_WIDTH,
                                reback[1].nodeHeight * rate
                            );
                            offsetHeight = topOffsetConstant / rate +
                            viaHeaderHeight +
                            BLANK_DIVIDE_HEIGHT +
                            viaTableHeaderHeight +
                            BLANK_DIVIDE_HEIGHT;
                            realHeight = 0;
                        }
                        // 添加当前遍历元素的图片到PDF
                        PDF.addImage(
                            res.data,
                            'PNG',
                            leftOffsetConstant,
                            offsetHeight * rate,
                            res.nodeWidth * rate,
                            res.nodeHeight * rate
                        );
                        if (promiseListLen - 1 === index) {
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString() + '-END',
                                A4_WIDTH / 2,
                                PAGE_NUMBER_TOPOFFSET_HEIGHT
                            );
                        }
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                    });
                    PDF.addImage(
                        reback[2].data,
                        'PNG',
                        leftOffsetConstant,
                        (
                            offsetHeight
                            + 10
                        ) * rate,
                        A4_WIDTH,
                        reback[2].nodeHeight * rate
                    );
                    PDF.addImage(
                        reback[3].data,
                        'PNG',
                        leftOffsetConstant,
                        (
                            offsetHeight
                            + reback[2].nodeHeight
                            + 10
                        ) * rate,
                        A4_WIDTH,
                        reback[3].nodeHeight * rate
                    );

                    var reportName = 'RNO';
                    if (vm.requisition.emergency) {
                        reportName = 'REM';
                    }
                    console.log(reportName);
                    PDF.save(vm.requisition.requisitionNumber + '.pdf');
                    siglusDownloadLoadingModalService.close();
                });
            });
        }

        function hideBreadcrumb() {
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        }
    }
})();
