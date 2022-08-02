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
        'messageService', 'lineItemsList', 'columns', '$q', 'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES', 'openlmisDateFilter', 'requisitionService' ];

    function controller(requisition, facility, processingPeriod, messageService, lineItemsList,
                        columns, $q, siglusTemplateConfigureService, SIGLUS_SECTION_TYPES, openlmisDateFilter,
                        requisitionService) {
        var vm = this;
        vm.requisition = undefined;
        vm.facility = undefined;
        vm.processingPeriod = undefined;
        vm.lineItemsList = undefined;
        vm.columns = undefined;
        vm.$onInit = onInit;
        vm.downloadPdf = downloadPdf;
        vm.emergencyCount = '01';
        vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss');
        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.processingPeriod = processingPeriod;
            vm.requisitionType = messageService.get(
                vm.isEmergency ? 'requisitionView.emergency' : 'requisitionView.regular'
            );
            vm.lineItemsList = lineItemsList;
            vm.columns = columns;

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
            var viaHeader = document.getElementById('via-header');
            var viaTableHeader = document.getElementById('via-table-header');
            var viaSignaure = document.getElementById('via-signaure');
            var viaTableBodys = document.getElementsByClassName('via-table-body');

            var imgWidth = 781.89;
            var leftOffsetConstant = 30;
            var topOffsetConstant = 30;
            var contentWidth = viaHeader.offsetWidth;
            var viaHeaderHeight = viaHeader.offsetHeight;
            var viaTableHeaderHeight = viaTableHeader.offsetHeight;
            var viaSignaureHeight = viaSignaure.offsetHeight;

            var tableDomList = [viaHeader, viaTableHeader, viaSignaure];
            var tableImagePromiseList = [];

            angular.forEach(tableDomList, function(item) {
                // eslint-disable-next-line no-undef
                tableImagePromiseList.push(domtoimage.toPng(item).then(function(dataUrl) {
                    return dataUrl;
                }));
            });

            $q.all(tableImagePromiseList).then(function(result) {
                var promiseList = [];
                angular.forEach(viaTableBodys, function(item) {
                    // eslint-disable-next-line no-undef
                    promiseList.push(domtoimage.toPng(item).then(function(dataUrl) {
                        return dataUrl;
                    }));
                });
                $q.all(promiseList).then(function(result2) {
                    // eslint-disable-next-line no-undef
                    var PDF = new jsPDF('l', 'pt', 'a4');
                    angular.forEach(result2, function(item, index) {
                        PDF.addImage(result[0], 'PNG', getLeftOffset(),
                            topOffsetConstant, imgWidth, getImgHeight(viaHeaderHeight));
                        PDF.addImage(result[1], 'PNG', getLeftOffset(),
                            getViaTableHeaderTopOffset(), imgWidth, getImgHeight(viaTableHeaderHeight));
                        PDF.addImage(item, 'PNG', getLeftOffset(), getViaTableBodyTopOffset(),
                            imgWidth, getImgHeight(viaTableBodys[index].offsetHeight));
                        PDF.addImage(result[2], 'PNG', getLeftOffset(),
                            getViaSignaureTopOffset(viaTableBodys[index]), imgWidth, getImgHeight(viaSignaureHeight));
                        var pageNumber = index + 1 + '';
                        var pageNumberLeftOffset = 841.89 - leftOffsetConstant  - 15;
                        var pageNumberTopOffset = getViaSignaureTopOffset(viaTableBodys[index])
                        + getImgHeight(viaSignaureHeight) + 12;
                        PDF.setFontSize(10);
                        PDF.text(pageNumber,  pageNumberLeftOffset, pageNumberTopOffset);
                        if (index !== result2.length - 1) {
                            PDF.addPage('a4', 'l');
                        }
                    });
                    var reportName = 'RNO';
                    if (vm.requisition.emergency) {
                        reportName = 'REM';
                    }
                    PDF.save(reportName + '.'
                    + vm.requisition.id.substr(0, 8) + '.'
                    + openlmisDateFilter(vm.requisition.processingPeriod.startDate, 'yy')
                    + openlmisDateFilter(vm.requisition.processingPeriod.startDate, 'MM') + '.'
                    + vm.emergencyCount
                    + '.pdf');
                });
            });

            function getImgHeight(y) {
                return (imgWidth / contentWidth) * y;
            }

            function getLeftOffset() {
                return leftOffsetConstant;
            }

            function getViaTableHeaderTopOffset() {
                return parseInt(topOffsetConstant + getImgHeight(viaHeaderHeight) + getImgHeight(5));
            }

            function getViaTableBodyTopOffset() {
                return parseInt(topOffsetConstant + getImgHeight(viaHeaderHeight)
                +  getImgHeight(viaTableHeaderHeight) + getImgHeight(10));
            }

            function getViaSignaureTopOffset(item) {
                return  parseInt(topOffsetConstant + getImgHeight(viaHeaderHeight)
                + getImgHeight(item.offsetHeight) + getImgHeight(viaTableHeaderHeight) + getImgHeight(15));
            }
        }
    }
})();
