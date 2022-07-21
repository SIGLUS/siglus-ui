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
        '$q'
    ];

    function controller(
        facility,
        requisition,
        openlmisDateFilter,
        siglusTemplateConfigureService,
        SIGLUS_SECTION_TYPES,
        $timeout,
        $q
    ) {
        var vm = this, services = [];
        vm.facility = undefined;
        vm.columns = undefined;
        vm.services = undefined;
        // console.log('#### template', template);
        vm.comments = undefined;
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
            var productLineItems = _.forEach(requisition.requisitionLineItems, function(item) {
                item.expirationDate = openlmisDateFilter(item.expirationDate, 'dd/MM/yyyy');
            });
            var lineItemsGroupByCategory = _.reduce(productLineItems, function(r, c) {
                if (r[c.$program.orderableCategoryDisplayName]) {
                    r[c.$program.orderableCategoryDisplayName].push(c);
                } else {
                    r[c.$program.orderableCategoryDisplayName] = [c];
                }
                return r;
            }, {});
            console.log('#### lineItemsGroupByCategory', lineItemsGroupByCategory);
            var temp = _.map(Object.keys(lineItemsGroupByCategory), function(item) {
                lineItemsGroupByCategory[item].push({}, {});
                return lineItemsGroupByCategory[item];
            });
            vm.productLineItems = _.flatten(temp, 2);
            services = requisition.testConsumptionLineItems;
            vm.comments = requisition.draftStatusMessage;
            vm.year = openlmisDateFilter(requisition.processingPeriod.startDate, 'yyyy');
            vm.signaure =  requisition.extraData.signaure;
            vm.creationDate = getCreationDate(requisition.createdDate);
            vm.month = getMonth(requisition.processingPeriod.startDate);
            vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss');
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
            vm.regimensAdults = getCategories(vm.requisition.regimenLineItems).Adults;
            vm.regimensPaediatrics = getCategories(vm.requisition.regimenLineItems).Paediatrics;
            $timeout(function() {
                angular.forEach(productLineItems, function(item) {
                    // eslint-disable-next-line no-undef
                    JsBarcode('#barcode_' + item.orderable.productCode, item.orderable.productCode, {
                        width: 1,
                        height: 20,
                        displayValue: true,
                        fontSize: 10,
                        marginTop: 2,
                        marginBottom: 2,
                        textMargin: 1
                    });
                });
            }, 100);
            var summerySection = _.find(vm.requisition.usageTemplate.regimen, function(item) {
                return item.name === 'summary';
            });
            // vm.requisition.usageTemplate.regimen[0].columns
            vm.regimenSummaryLineItems = lineItemsFactory(
                vm.requisition.regimenSummaryLineItems,
                summerySection.columns
            );
            var patients = patientTemplateFactory();
            vm.patientList = patients.normalPatientList;
            vm.mergedPatientMap = patients.mergedPatientMap;
            // console.log('#### map', vm.mergedPatientMap);
            console.log('#### vm', vm);
            vm.getValueByKey = function(key, index) {
                // var innerKeys = Object.keys(vm.mergedPatientMap[key].columns);
                // console.log('#### array', vm.mergedPatientMap[key].column.columns);
                // console.log('#### obj', vm.mergedPatientMap[key].columns);
                if (!vm.requisition.patientLineItems.length) {
                    return '';
                }
                var innerKey = vm.mergedPatientMap[key].column.columns[index].name;
                return vm.mergedPatientMap[key].columns[innerKey].value ;
            };
        }

        function patientTemplateFactory() {
            if (!vm.requisition.patientLineItems.length) {
                return {
                    normalPatientList: [],
                    mergedPatientMap: {}
                };
            }
            var jugeArray = [
                'Tipo de Dispensa - Dispensa Mensal (DM)',
                'Tipo de Dispensa - Dispensa para 3 Mensal (DT)',
                'Tipo de Dispensa - Dispensa para 6 Mensal (DS)',
                'Tipo de Dispensa - Mês Corrente',
                'Tipo de Dispensa - Total de pacientes com tratamento',
                'Tipo de Dispensa - Ajuste'
            ];
            return _.reduce(vm.requisition.usageTemplate.patient, function(r, c) {
                var temp = _.find(vm.requisition.patientLineItems, function(item) {
                    return item.name === c.name;
                });
                c.columns = _.filter(c.columns, function(itm) {
                    return itm.isDisplayed;
                });
                temp.column = c;
                if (_.contains(jugeArray, c.label)) {
                    // console.log('hello', c);
                    r.mergedPatientMap[c.label] = temp;
                } else {
                    r.normalPatientList.push(temp);
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
            // console.log('#### regimenLineItems', regimenLineItems);
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
            return openlmisDateFilter(date, 'MMM')
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
        // function translateCodeToBarcode() {
        //     var codeNodes = document.querySelectorAll('#barCodeArea');
        //     console.log(codeNodes);
        //     // eslint-disable-next-line no-undef
        //     // JsBarcode(codeNode, code);
        // }
        vm.downloadPdf = function() {
            var node = document.getElementById('mmia-form');
            var secondSectionNode = document.getElementById('secondSection');
            var middleSectionNode = document.getElementById('middleSection');
            var firstSectionNode = document.getElementById('firstSection');
            var footerSectionNode = document.getElementById('bottomSection');
            var contentWidth = node.offsetWidth;
            var contentHeight = node.offsetHeight;
            var a4Height = 1250 / 585 * 781.89;
            var leftHeight = contentHeight - secondSectionNode.offsetHeight;
            var canUseHeight = a4Height - leftHeight;
            // console.log('#### canUseHeight', canUseHeight);
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
            $q.all(headerAndFooterPromiseList).then(function(reback) {
                var offsetHeight = firstSectionNode.offsetHeight;
                var realHeight = 0;
                var pageNumber = 0;
                $q.all(promiseList).then(function(result) {
                    PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);
                    _.forEach(result, function(res, index) {
                        realHeight = realHeight + result[index].nodeHeight;
                        console.log(index + ':', realHeight);
                        if (realHeight > canUseHeight - 30) {
                            pageNumber = pageNumber + 1;
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
                            PDF.addPage();
                            PDF.addImage(reback[0].data, 'JPEG', 5, 0, 585, reback[0].nodeHeight * rate);
                            // PDF.text(
                            //     pageNumber,
                            //     585 / 2,
                            //     (offsetHeight + reback[1].nodeHeight + reback[2].nodeHeight + 4) * rate
                            // );
                            offsetHeight = firstSectionNode.offsetHeight;
                            realHeight = 0;
                        }
                        PDF.addImage(res.data, 'JPEG', 5, offsetHeight * rate, 585, res.nodeHeight * rate);
                        offsetHeight = offsetHeight + result[index].nodeHeight;
                    });
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
                        getPdfName(
                            requisition.processingPeriod.startDate,
                            facility.name,
                            requisition.id.substring(0, 8)
                        )
                    );
                });
            });
            // var imgWidth = 585.28;
            // var imgHeight = 592.28 / contentWidth * contentHeight;
            // // var rate = contentWidth / 585.28;
            // // var imgY = contentHeight / rate;
        };
    }

})();
