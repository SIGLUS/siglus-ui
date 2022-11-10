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
     * @name siglus-analytics-report-customize-tb.controller:siglusAnalyticsReportCustomizeTBController
     *
     * @description
     * Get Requisitions and Monthly Report second-tier page rapid test Report Customize
     */
    angular
        .module('siglus-analytics-report-customize-tb')
        .controller('siglusAnalyticsReportCustomizeTBController', controller);

    controller.$inject = [
        'facility',
        'requisition',
        'openlmisDateFilter',
        'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES',
        '$timeout',
        '$q',
        'siglusDownloadLoadingModalService',
        '$filter',
        '$stateParams'
    ];

    function controller(
        facility,
        requisition,
        openlmisDateFilter,
        siglusTemplateConfigureService,
        SIGLUS_SECTION_TYPES,
        $timeout,
        $q,
        siglusDownloadLoadingModalService,
        $filter,
        $stateParams
    ) {
        var vm = this, services = [];
        vm.facility = undefined;
        vm.columns = undefined;
        vm.services = undefined;
        vm.showBreadCrumb = undefined;
        vm.signaure = {};
        vm.$onInit = onInit;
        vm.creationDate = undefined;
        vm.getCreationDate = getCreationDate;
        vm.getMonth = getMonth;
        vm.getPdfName = getPdfName;
        vm.requisition = {};
        vm.mergedPatientMap = {};
        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.productLineItems = requisition.requisitionLineItems;
            // requisition.requisitionLineItems;
            services = requisition.testConsumptionLineItems;
            vm.showBreadCrumb = $stateParams.showBreadCrumb === 'false';
            if (vm.showBreadCrumb) {
                hideBreadcrumb();
            }
            vm.year = openlmisDateFilter(requisition.processingPeriod.startDate, 'yyyy');
            vm.signaure = getSignaure(requisition.extraData.signaure);
            vm.creationDate = getCreationDate(requisition.createdDate);
            vm.month = getMonth(requisition.processingPeriod.endDate);
            vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss a');
            vm.service = siglusTemplateConfigureService.getSectionByName(
                requisition.usageTemplate.rapidTestConsumption,
                SIGLUS_SECTION_TYPES.SERVICE
            );
            vm.testProject = siglusTemplateConfigureService.getSectionByName(
                requisition.usageTemplate.rapidTestConsumption,
                SIGLUS_SECTION_TYPES.PROJECT
            );
            vm.testOutcome = siglusTemplateConfigureService.getSectionByName(
                requisition.usageTemplate.rapidTestConsumption,
                SIGLUS_SECTION_TYPES.OUTCOME
            );
            extendLineItems();
            vm.services = _.chain(services)
                .sortBy('displayOrder')
                .value();
            vm.ageGroupLineItems = vm.requisition.ageGroupLineItems;
            vm.quantificationPart1 = {};
            vm.quantificationPart2 =
                $filter('orderBy')(_.get(vm.requisition.patientLineItems[0], ['columns', 'columns']), 'displayOrder');
            vm.quantificationPart3 = {};
            vm.getValueByKey = getValueByKey;
            vm.getSignaure = getSignaure;
            getPatientData();
            vm.draftStatusMessages =
                getDraftStatusMessages(getHistoryComments(requisition.statusHistory));
        }
        function getDraftStatusMessages(draftStatusMessage) {
            var arr = ['', '', '', '', '', '', ''];
            if (draftStatusMessage.length > 63) {
                for (var i = 0, l = draftStatusMessage.length; i < l / 63; i++) {
                    var a = draftStatusMessage.slice(63 * i, 63 * (i + 1));
                    arr[i] = a;
                }
            } else {
                arr[0] = draftStatusMessage;
            }
            return arr;
        }
        function getPatientData() {
            var sectionsMap = _.indexBy(vm.requisition.usageTemplate.patient, 'name');
            angular.forEach(vm.requisition.patientLineItems, function(lineItem) {
                lineItem.section = sectionsMap[lineItem.name];
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    var column = _.find(lineItem.section.columns, {
                        name: columnName
                    });
                    lineItem.columns[columnName] = angular.merge({}, column, lineItem.columns[columnName]);
                });
            });
        }

        function getValueByKey(key, index) {
            if (!vm.requisition.patientLineItems.length) {
                return '';
            }
            var result = '';
            if (vm.mergedPatientMap[key]) {
                var innerKey = vm.mergedPatientMap[key].column.columns[index].name;
                result = vm.mergedPatientMap[key].columns[innerKey].value;
            }
            return result;
        }

        function getHistoryComments(statusHistory) {
            var historyCommentsStr = _.reduce(statusHistory, function(r, c) {
                r = c.statusMessageDto ? r + c.statusMessageDto.body + '.' : r + '';
                return r;
            }, '');
            return historyCommentsStr.substr(0, historyCommentsStr.length - 1);
        }

        function getSignaure(signaure) {
            var newSignaure = angular.copy(signaure);
            if (newSignaure && newSignaure.approve) {
                newSignaure.approve = newSignaure && newSignaure.approve.length
                    ? newSignaure.approve.join(',')
                    : '';
            }
            return newSignaure;
        }

        function getCreationDate(date) {
            return openlmisDateFilter(date, 'dd')
            + ' '
            + openlmisDateFilter(date, 'MMM')
            + ' '
            + openlmisDateFilter(date, 'yyyy');
        }

        function getPdfName(date, facilityName, id) {
            return (
                'MIA.' + id
                + '.' + openlmisDateFilter(date, 'yy')
                + openlmisDateFilter(date, 'MM') + '.'
                + '01'
                + '.pdf'
            );
        }

        function extendLineItems() {
            var serviceColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.service);
            var testProjectColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.testProject);
            var testOutcomeColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.testOutcome);
            angular.forEach(services, function(lineItem) {
                _.extend(lineItem, serviceColumnsMap[lineItem.service]);
                angular.forEach(Object.keys(lineItem.projects), function(project) {
                    lineItem.projects[project] = angular.merge({},
                        testProjectColumnsMap[project], lineItem.projects[project]);
                    angular.forEach(Object.keys(lineItem.projects[project].outcomes), function(outcome) {
                        lineItem.projects[project].outcomes[outcome] = angular.merge({},
                            testOutcomeColumnsMap[outcome],
                            lineItem.projects[project].outcomes[outcome]);
                    });
                });
            });
        }

        function getMonth(date) {
            return openlmisDateFilter(date, 'MMMM');
        }

        vm.downloadPdf = function() {
            siglusDownloadLoadingModalService.open();
            var node = document.getElementById('tb-form');
            var headerNode = document.getElementById('header');
            var repeatTitleNode = document.getElementById('repeatTitle');
            var footerNode = document.getElementById('footer');
            var outerNode = document.getElementById('outer');
            var contentWidth = node.offsetWidth;
            var a4Height = 1250 / 585 * 821.89;
            // var leftHeight = contentHeight - secondSectionNode.offsetHeight;
            var canUseHeight = a4Height
                - headerNode.offsetHeight
                - repeatTitleNode.offsetHeight;
            var neddCalcNodes = document.querySelectorAll('#calcTr');
            var neddCalcNodesArray = Array.from(neddCalcNodes);
            // eslint-disable-next-line no-undef
            var PDF = new jsPDF('', 'pt', 'a4');
            var rate = 585 / 1250;
            var promiseList = [];
            var headerAndFooterPromiseList = [
                // eslint-disable-next-line no-undef
                domtoimage.toPng(headerNode, {
                    scale: 1,
                    width: 1250,
                    height: headerNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: headerNode.offsetWidth,
                        nodeHeight: headerNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(repeatTitleNode, {
                    scale: 1,
                    width: 1250,
                    height: repeatTitleNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: repeatTitleNode.offsetWidth,
                        nodeHeight: repeatTitleNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(footerNode, {
                    scale: 1,
                    width: 1250,
                    height: footerNode.offsetHeight + 25
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: footerNode.offsetWidth,
                        nodeHeight: footerNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(outerNode, {
                    scale: 1,
                    width: 1250,
                    height: outerNode.offsetHeight + 10 + 22
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: outerNode.offsetWidth,
                        nodeHeight: outerNode.offsetHeight + 22
                    };
                })
            ];
            _.forEach(neddCalcNodesArray, function(item) {
                // eslint-disable-next-line no-undef
                promiseList.push(domtoimage.toPng(item, {
                    scale: 1,
                    width: contentWidth,
                    height: item.offsetHeight + 1
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: item.offsetWidth,
                        nodeHeight: item.offsetHeight
                    };
                }));
            });
            var A4_HEIGHT = 841.89;
            //var promiseListLen = promiseList.length;
            $q.all(headerAndFooterPromiseList).then(function(reback) {
                var offsetHeight = headerNode.offsetHeight;
                var realHeight = 0;
                var pageNumber = 1;
                $q.all(promiseList).then(function(result) {
                    PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);
                    PDF.addImage(reback[1].data, 'JPEG', 5, offsetHeight * rate, 585, reback[1].nodeHeight * rate);
                    _.forEach(result, function(res, index) {
                        realHeight = realHeight + result[index].nodeHeight;
                        if (realHeight > canUseHeight) {
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                A4_HEIGHT - 10
                            );
                            pageNumber = pageNumber + 1;
                            PDF.addPage();
                            PDF.addImage(
                                reback[1].data,
                                'JPEG',
                                5,
                                0,
                                585,
                                (reback[1].nodeHeight) * rate
                            );

                            offsetHeight = reback[1].nodeHeight;
                            realHeight = 0;
                        }
                        PDF.addImage(
                            res.data,
                            'JPEG',
                            5,
                            pageNumber > 1
                                ? offsetHeight * rate
                                : (offsetHeight + reback[1].nodeHeight) * rate,
                            585,
                            res.nodeHeight * rate
                        );
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                    });

                    if (canUseHeight - offsetHeight > (reback[2].nodeHeight * rate + reback[3].nodeHeight * rate)) {
                        PDF.setFontSize(10);
                        PDF.text(
                            pageNumber.toString() + '-END',
                            585 / 2,
                            A4_HEIGHT - 10
                        );
                        PDF.addImage(
                            reback[2].data,
                            'JPEG',
                            5,
                            pageNumber > 1
                                ? (offsetHeight) * rate
                                : (offsetHeight + reback[1].nodeHeight) * rate,
                            585,
                            reback[2].nodeHeight * rate
                        );
                        PDF.addImage(
                            reback[3].data,
                            'JPEG',
                            5,
                            pageNumber > 1
                                ? (offsetHeight + reback[2].nodeHeight) * rate
                                : (offsetHeight + reback[1].nodeHeight + reback[2].nodeHeight) * rate,
                            585,
                            reback[3].nodeHeight * rate
                        );
                    } else {
                        PDF.setFontSize(10);
                        PDF.text(
                            pageNumber.toString(),
                            585 / 2,
                            A4_HEIGHT - 10
                        );
                        pageNumber = pageNumber + 1;
                        PDF.addPage();
                        PDF.setFontSize(10);
                        PDF.text(
                            pageNumber.toString() + '-END',
                            585 / 2,
                            A4_HEIGHT - 10
                        );
                        PDF.addImage(
                            reback[2].data,
                            'JPEG',
                            5,
                            0,
                            585,
                            reback[2].nodeHeight * rate
                        );
                        PDF.addImage(
                            reback[3].data,
                            'JPEG',
                            5,
                            reback[2].nodeHeight * rate,
                            585,
                            reback[3].nodeHeight * rate
                        );
                    }
                    PDF.save(vm.requisition.requisitionNumber + '.pdf');
                    siglusDownloadLoadingModalService.close();
                });
            });
        };

        function hideBreadcrumb() {
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        }
    }

})();
