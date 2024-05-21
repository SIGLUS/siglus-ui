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
     * @name siglus-analytics-report-customize-rapid.controller:siglusAnalyticsReportCustomizeRapidController
     *
     * @description
     * Get Requisitions and Monthly Report second-tier page rapid test Report Customize
     */
    angular
        .module('siglus-analytics-report-customize-mmia')
        .controller('siglusAnalyticsReportCustomizeMMIAController', controller);

    controller.$inject = [
        'facility',
        'requisition',
        'openlmisDateFilter',
        'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES',
        '$timeout',
        '$q',
        'siglusDownloadLoadingModalService',
        '$stateParams',
        'messageService'
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
        $stateParams,
        messageService
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
        vm.totalWithInThisMonth = undefined;
        vm.totalWithTreatment = undefined;
        vm.adjustmentValue = undefined;
        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.showBreadCrumb = $stateParams.showBreadCrumb === 'false';
            if (vm.showBreadCrumb) {
                hideBreadcrumb();
            }
            vm.productLineItems = getProductLineItems(requisition.requisitionLineItems);
            services = requisition.testConsumptionLineItems;
            vm.year = openlmisDateFilter(requisition.processingPeriod.endDate, 'yyyy');
            vm.signaure = getSignaure(requisition.extraData.signaure);
            vm.historyComments = getHistoryComments(requisition.statusHistory);
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
            vm.regimensAdults = getCategories(vm.requisition.regimenLineItems)['Adulto'];
            vm.regimensPaediatrics = getCategories(vm.requisition.regimenLineItems)['Criança'];
            setBarCodeDom();
            var summerySection = _.find(vm.requisition.usageTemplate.regimen, function(item) {
                return item.name === 'summary';
            });
            vm.regimenSummaryLineItems = lineItemsFactory(
                vm.requisition.regimenSummaryLineItems,
                summerySection.columns
            );
            var patients = patientTemplateFactory();
            vm.patientList = patients.normalPatientList;
            vm.mergedPatientMap = patients.mergedPatientMap;
            vm.getValueByKey = getValueByKey;
            vm.getHistoryComments = getHistoryComments;
            vm.getSignaure = getSignaure;
            vm.patientTemplateFactory = patientTemplateFactory;
            vm.setBarCodeDom = setBarCodeDom;
            calculatePatientValues();
        }

        function calculatePatientValues() {
            vm.totalWithInThisMonth = getValueByKey('newSection2', 5) +
                getValueByKey('newSection3', 2) +
                getValueByKey('newSection4', 0);
            vm.totalWithTreatment = getValueByKey('newSection2', 6) +
                getValueByKey('newSection3', 3) +
                getValueByKey('newSection4', 1);
            vm.adjustmentValue = (vm.totalWithTreatment / vm.totalWithInThisMonth).toFixed(2);
        }
        function setBarCodeDom() {
            $timeout(function() {
                angular.forEach(vm.productLineItems, function(item) {
                    if (item.id) {
                        // eslint-disable-next-line no-undef
                        JsBarcode('#barcode_' + item.orderable.productCode, item.orderable.productCode, {
                            height: 24,
                            displayValue: true,
                            fontSize: 10,
                            marginTop: 10,
                            marginBottom: 2
                        });
                    }
                });
            }, 100);
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
                r = c.statusMessageDto ?  r + c.statusMessageDto.body + '.' : r + '';
                return r;
            }, '');
            return historyCommentsStr.substr(0, historyCommentsStr.length - 1);
        }

        function getSignaure(signaure) {
            var newSignaure = angular.copy(signaure);
            if (newSignaure.approve) {
                newSignaure.approve = newSignaure && newSignaure.approve.length
                    ? newSignaure.approve.join(',')
                    : '';
            }
            return newSignaure;
        }

        function getProductLineItems(requisitionLineItems) {
            var productLineItems = _.map(requisitionLineItems, function(item) {
                item.expirationDate = openlmisDateFilter(item.expirationDate, 'dd/MM/yyyy');
                return item;
            });
            var lineItemsGroupByCategory = _.reduce(productLineItems, function(r, c) {
                if (
                    r[c.orderable.programs[0].orderableCategoryDisplayName]
                        && c.orderable.programs[0].orderableCategoryDisplayName !== 'Default'
                ) {
                    r[c.orderable.programs[0].orderableCategoryDisplayName].push(c);
                }
                if (
                    !r[c.orderable.programs[0].orderableCategoryDisplayName]
                        && c.orderable.programs[0].orderableCategoryDisplayName !== 'Default'
                ) {
                    r[c.orderable.programs[0].orderableCategoryDisplayName] = [c];
                }
                return r;
            }, {});
            var temp = _.map(Object.keys(lineItemsGroupByCategory), function(item) {
                lineItemsGroupByCategory[item].push(
                    {
                        orderable: {
                            programs: [
                                {
                                    orderableCategoryDisplayName: item
                                }
                            ]
                        }
                    },
                    {
                        orderable: {
                            programs: [
                                {
                                    orderableCategoryDisplayName: item
                                }
                            ]
                        }
                    }
                );
                return lineItemsGroupByCategory[item];
            });
            return _.flatten(temp, 2);
        }

        function patientTemplateFactory() {
            if (!vm.requisition.patientLineItems.length) {
                return {
                    normalPatientList: [],
                    mergedPatientMap: {}
                };
            }
            // because  vm.requisition.usageTemplate.patient label can edit
            // if choose fixed label
            // the label changed  and the data will not get
            // get new Map to match name and label
            // the name should not change

            //  *
            //  * newSection2 : Tipo de dispensa - Dispensa para 6 Meses (DS)
            //  * newSection3 : Tipo de dispensa - Dispensa para 3 Meses (DT)
            //  * newSection4 : Tipo de dispensa - Dispensa Mensal(DM)
            //  * newSection7:Tipo de Dispensa - Ajuste
            //  * 'Tipo de Dispensa - Mês Corrente',
            //  * 'Tipo de Dispensa - Total de pacientes com tratamento',

            var patientLabelNameMap = {};
            _.each(vm.requisition.usageTemplate.patient, function(item) {
                patientLabelNameMap[item.name] = item.label;
            });

            var jugeArray = [
                // 'Tipo de Dispensa - Dispensa Mensal(DM)'
                'newSection4',
                // Tipo de dispensa - Dispensa para 6 Meses (DS)
                'newSection2',
                //Tipo de dispensa - Dispensa para 3 Meses (DT)
                'newSection3',
                // Tipo de Dispensa - Ajuste
                'newSection7'

            ];

            return _.reduce(vm.requisition.usageTemplate.patient, function(r, c) {
                var temp = _.find(vm.requisition.patientLineItems, function(item) {
                    return item.name === c.name;
                });
                if (temp) {
                    c.columns = _.chain(c.columns)
                        .filter(function(item) {
                            return item.isDisplayed;
                        })
                        .sortBy(function(item) {
                            return item.displayOrder;
                        })
                        .value();
                    temp.column = c;
                    if (_.contains(jugeArray, c.name)) {
                        r.mergedPatientMap[c.name] = temp;
                    } else {
                        r.normalPatientList.push(temp);
                    }
                }
                return r;
            }, {
                mergedPatientMap: {},
                normalPatientList: []
            });
        }

        function lineItemsFactory(lineItems, sections) {
            return _.map(lineItems, function(item) {
                _.forEach(sections, function(_item) {
                    if (item.name === _item.name) {
                        _item.columns = _.filter(_item.columns, function(c) {
                            return c.isDisplayed;
                        });
                        item.column = _item;
                    }
                });
                return item;
            });
        }

        function getCategories(regimenLineItems) {
            var regimentLineItemsCopy = angular.copy(regimenLineItems);
            vm.totalItem = regimentLineItemsCopy.pop();
            return _.reduce(regimentLineItemsCopy, function(r, c) {
                if (r[c.regimen.regimenCategory.name]) {
                    r[c.regimen.regimenCategory.name].push(c);
                } else {
                    r[c.regimen.regimenCategory.name] = [c];
                }
                return r;
            }, {});
        }

        function getCreationDate(date) {
            return openlmisDateFilter(date, 'd MMM y');

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
            var node = document.getElementById('mmia-form');
            var middleSectionNode = document.getElementById('middleSection');
            var firstSectionNode = document.getElementById('firstSection');
            var footerSectionNode = document.getElementById('bottomSection');
            var contentWidth = node.offsetWidth;
            var a4Height = 1250 / 585 * 821.89;
            var canUseHeight = a4Height - firstSectionNode.offsetHeight;
            var secondSectionTrNodes = document.querySelectorAll('#calcTr');
            var secondSectionTrNodesArray = Array.from(secondSectionTrNodes);
            // eslint-disable-next-line no-undef
            var PDF = new jsPDF('', 'pt', 'a4');
            var rate = 585 / 1250;
            var promiseList = [];
            var headerAndFooterPromiseList = [
                // eslint-disable-next-line no-undef
                domtoimage.toPng(firstSectionNode, {
                    scale: 1,
                    width: 1250,
                    height: firstSectionNode.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: firstSectionNode.offsetWidth,
                        nodeHeight: firstSectionNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(middleSectionNode, {
                    scale: 1,
                    width: 1250,
                    height: middleSectionNode.offsetHeight + 10
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: middleSectionNode.offsetWidth,
                        nodeHeight: middleSectionNode.offsetHeight
                    };
                }),
                // eslint-disable-next-line no-undef
                domtoimage.toPng(footerSectionNode, {
                    scale: 1,
                    width: 1250,
                    height: footerSectionNode.offsetHeight + 10 + 22
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: footerSectionNode.offsetWidth,
                        nodeHeight: footerSectionNode.offsetHeight + 22
                    };
                })
            ];
            _.forEach(secondSectionTrNodesArray, function(item) {
                // eslint-disable-next-line no-undef
                promiseList.push(domtoimage.toPng(item, {
                    scale: 1,
                    width: contentWidth,
                    height: item.offsetHeight
                }).then(function(data) {
                    return {
                        data: data,
                        nodeWidth: item.offsetWidth,
                        nodeHeight: item.offsetHeight
                    };
                }));
            });
            var A4_HEIGHT = 841.89;
            var promiseListLen = promiseList.length;
            $q.all(headerAndFooterPromiseList).then(function(reback) {
                var offsetHeight = firstSectionNode.offsetHeight;
                var realHeight = 0;
                var pageNumber = 1;
                $q.all(promiseList).then(function(result) {

                    PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);
                    _.forEach(result, function(res, index) {
                        realHeight = realHeight + result[index].nodeHeight;
                        if (realHeight > canUseHeight) {

                            PDF.line(5, offsetHeight * rate, 589, offsetHeight * rate, 'FD');

                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                A4_HEIGHT - 10
                            );
                            PDF.text(
                                messageService.get('mmia.print_on_computer'),
                                5,
                                A4_HEIGHT - 10
                            );
                            PDF.text(
                                vm.nowTime,
                                478,
                                A4_HEIGHT - 10
                            );
                            pageNumber = pageNumber + 1;

                            PDF.addPage();
                            PDF.setFontSize(10);
                            PDF.text(
                                pageNumber.toString(),
                                585 / 2,
                                A4_HEIGHT - 10
                            );
                            PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);

                            offsetHeight = firstSectionNode.offsetHeight;
                            realHeight = 0;
                        }
                        PDF.addImage(res.data, 'JPEG', 5, offsetHeight * rate, 585, res.nodeHeight * rate);
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                        if (promiseListLen - 1 === index) {
                            var shouldAddNewPage = offsetHeight + middleSectionNode.offsetHeight
                                > canUseHeight;
                            PDF.setFontSize(10);
                            PDF.text(
                                shouldAddNewPage ? pageNumber.toString() : pageNumber.toString() + '-END',
                                shouldAddNewPage ? 585 / 2 : 585 / 2 - 10,
                                A4_HEIGHT - 10
                            );
                            PDF.text(
                                messageService.get('mmia.print_on_computer'),
                                5,
                                A4_HEIGHT - 10
                            );
                            PDF.text(
                                vm.nowTime,
                                478,
                                A4_HEIGHT - 10
                            );
                        }
                    });

                    if (offsetHeight + middleSectionNode.offsetHeight > canUseHeight) {
                        pageNumber = pageNumber + 1;

                        PDF.addPage();
                        PDF.setFontSize(10);
                        PDF.text(
                            pageNumber.toString() + '-END',
                            585 / 2 - 10,
                            A4_HEIGHT - 10
                        );
                        PDF.text(
                            messageService.get('mmia.print_on_computer'),
                            5,
                            A4_HEIGHT - 10
                        );
                        PDF.text(
                            vm.nowTime,
                            478,
                            A4_HEIGHT - 10
                        );
                        PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);

                        offsetHeight = firstSectionNode.offsetHeight;
                        realHeight = 0;
                    }

                    PDF.addImage(
                        reback[1].data,
                        'JPEG',
                        5,
                        offsetHeight * rate,
                        585,
                        reback[1].nodeHeight * rate
                    );
                    PDF.addImage(
                        reback[2].data,
                        'JPEG',
                        5,
                        (offsetHeight + reback[1].nodeHeight) * rate,
                        585,
                        reback[2].nodeHeight * rate
                    );
                    PDF.save(
                        vm.requisition.requisitionNumber + '.pdf'
                    );
                    siglusDownloadLoadingModalService.close();
                });
            });
        };

        function hideBreadcrumb() {
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        }
    }

})();
