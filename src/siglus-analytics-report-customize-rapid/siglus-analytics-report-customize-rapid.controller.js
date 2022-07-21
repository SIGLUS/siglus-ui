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
        .module('siglus-analytics-report-customize-rapid')
        .controller('siglusAnalyticsReportCustomizeRapidController', controller);

    controller.$inject = [
        'facility',
        'requisition',
        'openlmisDateFilter',
        'siglusTemplateConfigureService',
        'SIGLUS_SECTION_TYPES'
    ];

    function controller(
        facility,
        requisition,
        openlmisDateFilter,
        siglusTemplateConfigureService,
        SIGLUS_SECTION_TYPES
    ) {
        var vm = this, services = [];
        vm.facility = undefined;
        vm.columns = undefined;
        vm.services = undefined;
        vm.comments = undefined;
        vm.signaure = {};
        vm.$onInit = onInit;
        vm.creationDate = undefined;
        vm.getCreationDate = getCreationDate;
        vm.getMonth = getMonth;
        vm.getPdfName = getPdfName;
        vm.requisition = {};
        function onInit() {
            vm.facility = facility;
            vm.requisition = requisition;
            vm.columns = _.forEach(requisition.requisitionLineItems, function(item) {
                item.expirationDate = openlmisDateFilter(item.expirationDate, 'dd/MM/yyyy');
            });
            services = requisition.testConsumptionLineItems;
            vm.comments = requisition.draftStatusMessage;
            vm.year = openlmisDateFilter(requisition.processingPeriod.startDate, 'yyyy');
            vm.signaure =  requisition.extraData.signaure;
            vm.creationDate = getCreationDate(requisition.createdDate);
            vm.month = getMonth(requisition.processingPeriod.startDate);
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
        }
        function getCreationDate(date) {
            return openlmisDateFilter(date, 'MMM')
                + ' '
                + openlmisDateFilter(date, 'yyyy');
        }
        function getPdfName(date, facilityName, id) {
            return (
                'MIT.' + id
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
            var node = document.getElementById('test_repaid_wrap');
            var contentWidth = node.offsetWidth;
            var contentHeight = node.offsetHeight;
            var imgWidth = 595.28;
            var imgHeight = 592.28 / contentWidth * contentHeight;
            // var rate = contentWidth / 595.28;
            // var imgY = contentHeight / rate;
            // eslint-disable-next-line no-undef
            domtoimage.toPng(node, {
                scale: 1,
                width: contentWidth,
                height: contentHeight
            }).then(function(data) {
                var pageData = data;
                // eslint-disable-next-line no-undef
                var PDF = new jsPDF('', 'pt', 'a4');
                // 595×842 a4纸

                PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);

                PDF.save(
                    getPdfName(
                        requisition.processingPeriod.startDate,
                        facility.name,
                        requisition.id.substring(0, 8)
                    )
                );
            });
        };
    }

})();
