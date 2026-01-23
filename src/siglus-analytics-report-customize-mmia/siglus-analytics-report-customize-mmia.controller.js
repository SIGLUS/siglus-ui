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
        'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES',
        '$timeout',
        '$q',
        'siglusDownloadLoadingModalService',
        '$stateParams',
        'messageService',
        'moment',
        'siglusAnalyticsDateService'
    ];

    function controller(
        facility,
        requisition,
        siglusTemplateConfigureService,
        SIGLUS_SECTION_TYPES,
        $timeout,
        $q,
        siglusDownloadLoadingModalService,
        $stateParams,
        messageService,
        moment,
        siglusAnalyticsDateService
    ) {
        var vm = this, services = [];
        vm.facility = undefined;
        vm.columns = undefined;
        vm.services = undefined;
        vm.showBreadCrumb = undefined;
        vm.signaure = {};
        vm.$onInit = onInit;
        vm.creationDate = undefined;
        vm.getPdfName = getPdfName;
        vm.requisition = {};
        vm.mergedPatientMap = {};
        vm.totalWithInThisMonth = undefined;
        vm.totalWithTreatment = undefined;
        vm.adjustmentValue = undefined;

        var productOrder1 = ['08S18WI', '08S18W', '08S40', '08S18Z', '08S18ZX', '08S18XZ',
            '08S01ZY', '08S30WZ', '08S30ZY', '08S38Z', '08S30Y', '08S29'];
        var productOrder2 = ['08S01ZV', '08S01ZVI', '08S30ZW', '08S39B', '08S01ZWI', '08S40Z'];
        var productOrder3 = ['08S23', '08S17'];

        function sortProductLineItems(productLineItems) {
            var sort1 = [];
            productOrder1.forEach(function(c) {
                var found = _.find(productLineItems, function(p) {
                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                });
                if (found) {
                    sort1.push(found);
                }
            });

            var sort2 = [];
            productOrder2.forEach(function(c) {
                var found = _.find(productLineItems, function(p) {
                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                });
                if (found) {
                    sort2.push(found);
                }
            });

            var sort3 = [];
            productOrder3.forEach(function(c) {
                var found = _.find(productLineItems, function(p) {
                    return c === _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                });
                if (found) {
                    sort3.push(found);
                }
            });

            var divider1 = _.filter(productLineItems, function(p) {
                return !_.get(p, ['orderable', 'productCode']) &&
                    'Adulto' === _.get(p, ['orderable', 'programs', '0', 'orderableCategoryDisplayName']);
            });

            var divider2 = _.filter(productLineItems, function(p) {
                return !_.get(p, ['orderable', 'productCode']) &&
                    'Pediátrico' === _.get(p, ['orderable', 'programs', '0', 'orderableCategoryDisplayName']);
            });

            var divider3 = _.filter(productLineItems, function(p) {
                return !_.get(p, ['orderable', 'productCode']) &&
                    'Solution' === _.get(p, ['orderable', 'programs', '0', 'orderableCategoryDisplayName']);
            });

            var allDefined = {};
            productOrder1.concat(productOrder2, productOrder3).forEach(function(code) {
                allDefined[code] = true;
            });

            var otherLineItems = productLineItems.filter(function(p) {
                var code = _.get(p, ['orderable', 'productCode'], '').toUpperCase();
                return code && !allDefined[code];
            });

            otherLineItems.sort(function(a, b) {
                return _.get(a, ['orderable', 'productCode'])
                    .localeCompare(_.get(b, ['orderable', 'productCode']));
            });

            return [].concat(
                sort1,
                divider1,
                sort2,
                divider2,
                sort3,
                divider3,
                otherLineItems
            );
        }

        var regimenOrderAdults = ['1aLTLD', '1alt1', '1alt2', '2alt3', '2alt1', '2alt2', 'A2F',
            'C7A', 'ABC12', '2Op4', 'HepB_TDF', 'PreP_LEN', 'PreP_TDF+3TC'].map(function(c) {
            return c.toUpperCase();
        });

        var regimenOrderPaediatrics = ['X7BPed', 'X7APed', 'X6APed', 'ABCPedCpts', 'A2Fped Cpts',
            'CE123'].map(function(c) {
            return c.toUpperCase();
        });

        function sortRegimenOrderAdults(regimenLineItems) {
            var sort1 = [];
            regimenOrderAdults.forEach(function(c) {
                var found = _.find(regimenLineItems, function(r) {
                    return c === _.get(r, ['regimen', 'code'], '').toUpperCase();
                });
                if (found) {
                    sort1.push(found);
                }
            });

            var allDefined = {};
            regimenOrderAdults.forEach(function(code) {
                allDefined[code] = true;
            });

            var otherLineItems = regimenLineItems.filter(function(p) {
                var code = _.get(p, ['regimen', 'code'], '').toUpperCase();
                return code && !allDefined[code];
            });

            otherLineItems.sort(function(a, b) {
                return _.get(a, ['regimen', 'code'])
                    .localeCompare(_.get(b, ['regimen', 'code']));
            });
            console.log('sortRegimenOrderAdults sort1', sort1);
            console.log('sortRegimenOrderAdults otherLineItems', otherLineItems);
            return [].concat(
                sort1,
                otherLineItems
            );
        }

        function sortRegimenOrderPaediatrics(regimenLineItems) {
            var sort1 = [];
            regimenOrderPaediatrics.forEach(function(c) {
                var found = _.find(regimenLineItems, function(r) {
                    return c === _.get(r, ['regimen', 'code'], '').toUpperCase();
                });
                if (found) {
                    sort1.push(found);
                }
            });

            var allDefined = {};
            regimenOrderPaediatrics.forEach(function(code) {
                allDefined[code] = true;
            });

            var otherLineItems = regimenLineItems.filter(function(p) {
                var code = _.get(p, ['regimen', 'code'], '').toUpperCase();
                return code && !allDefined[code];
            });

            otherLineItems.sort(function(a, b) {
                return _.get(a, ['regimen', 'code'])
                    .localeCompare(_.get(b, ['regimen', 'code']));
            });
            console.log('sortRegimenOrderPaediatrics sort1', sort1);
            console.log('sortRegimenOrderPaediatrics otherLineItems', otherLineItems);
            return [].concat(
                sort1,
                otherLineItems
            );
        }

        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.showBreadCrumb = $stateParams.showBreadCrumb === 'false';
            if (vm.showBreadCrumb) {
                hideBreadcrumb();
            }
            vm.productLineItems = sortProductLineItems(getProductLineItems(requisition.requisitionLineItems));
            console.log('openlmis.analyticsReport.requisitionAndMonthly.mmia', vm.productLineItems);
            services = requisition.testConsumptionLineItems;
            vm.year = moment(requisition.processingPeriod.endDate).format('YYYY');
            vm.signaure = getSignaure(requisition.extraData.signaure);
            vm.historyComments = getHistoryComments(requisition.statusHistory);
            vm.creationDate = siglusAnalyticsDateService.getCreationDateWithTranslatedMonth(requisition.createdDate);
            var endDate = _.get(requisition, ['processingPeriod', 'endDate']);
            vm.month = siglusAnalyticsDateService.getAbbrTranslatedMonthFromDateText(endDate);
            vm.nowTime = moment().format('D MMM Y h:mm:ss a');
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

            var categories = getCategories(vm.requisition.regimenLineItems);
            var adultoItems = categories['Adulto'] || [];

            vm.regimensAdults = sortRegimenOrderAdults(adultoItems.filter(function(lineItem) {
                return lineItem.regimen && lineItem.regimen.code !== 'CE123';
            }));
            console.log('vm.regimensAdults', vm.regimensAdults);

            var extraItems = vm.requisition.regimenLineItems.filter(function(lineItem) {
                return lineItem.regimen && (lineItem.regimen.code === 'X7BPed' || lineItem.regimen.code === 'CE123');
            });
            vm.regimensPaediatrics = sortRegimenOrderPaediatrics(
                _.union(getCategories(vm.requisition.regimenLineItems)['Criança'],
                    extraItems)
            );
            setBarCodeDom();
            var summerySection = _.find(vm.requisition.usageTemplate.regimen, function(item) {
                return item.name === 'summary';
            });
            vm.regimenSummaryLineItems = lineItemsFactory(
                vm.requisition.regimenSummaryLineItems,
                summerySection.columns
            );
            var patients = patientTemplateFactory();
            vm.patientList = ignoreSection5(ignoreSection6(patients.normalPatientList));
            vm.mergedPatientMap = patients.mergedPatientMap;
            vm.getValueByKey = getValueByKey;
            vm.getHistoryComments = getHistoryComments;
            vm.getSignaure = getSignaure;
            vm.patientTemplateFactory = patientTemplateFactory;
            calculatePatientValues();
        }

        function ignoreSection6(patientList) {
            // Ticket#729 newSection6 Tipo de Dispensa - Total de pacientes com tratamento
            return patientList.filter(function(p) {
                return p.name !== 'newSection6';
            });
        }

        function ignoreSection5(patientList) {
            // Ticket#729 newSection5 Tipo de Dispensa - Levantaram no mês
            return patientList.filter(function(p) {
                return p.name !== 'newSection5';
            });
        }

        function calculatePatientValues() {
            var dbThisMonth = getValueByKey('newSection9', 1);
            if ('' === dbThisMonth) {
                dbThisMonth = 0;
            }
            vm.totalWithInThisMonth = getValueByKey('newSection2', 5) +
                getValueByKey('newSection3', 2) +
                dbThisMonth +
                getValueByKey('newSection4', 0);
            var dbTotal = getValueByKey('newSection9', 2);
            if ('' === dbTotal) {
                dbTotal = 0;
            }
            vm.totalWithTreatment = getValueByKey('newSection2', 6) +
                getValueByKey('newSection3', 3) +
                dbTotal +
                getValueByKey('newSection4', 1);
            vm.adjustmentValue = (vm.totalWithTreatment / vm.totalWithInThisMonth).toFixed(2);
        }

        function setBarCodeDom() {
            $timeout(function() {
                angular.forEach(vm.productLineItems, function(item) {
                    if (item.showBarCode) {
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
                item.expirationDate = moment(item.expirationDate).format('DD/MM/YYYY');
                item.showBarCode = true;
                return item;
            });
            var lineItemsGroupByCategory = _.reduce(productLineItems, function(r, c) {
                if (
                    r[c.orderable.programs[0].orderableCategoryDisplayName]
                ) {
                    r[c.orderable.programs[0].orderableCategoryDisplayName].push(c);
                }
                if (
                    !r[c.orderable.programs[0].orderableCategoryDisplayName]
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
            //  * newSection9 : Tipo de Dispensa - Dispensa Bi-Mestral (DB)
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
                // Tipo de Dispensa - Dispensa Bi-Mestral (DB)
                'newSection9',
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

        function getPdfName(date, facilityName, id) {
            return (
                'MIA.' + id
                + '.' + moment(date).format('YY MM')
                + '.01'
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
