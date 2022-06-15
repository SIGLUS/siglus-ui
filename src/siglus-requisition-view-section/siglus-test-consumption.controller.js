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

    angular
        .module('siglus-requisition-view-section')
        .controller('SiglusTestConsumptionController', controller);

    controller.$inject = ['siglusColumnUtils', 'SIGLUS_SECTION_TYPES', 'siglusTemplateConfigureService',
        'requisitionValidator'];

    function controller(siglusColumnUtils, SIGLUS_SECTION_TYPES, siglusTemplateConfigureService, requisitionValidator) {
        var vm = this;

        vm.$onInit = onInit;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.isAPES = siglusColumnUtils.isAPES;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isCalculated = siglusColumnUtils.isCalculated;
        vm.validateOnUpdate = validateOnUpdate;
        vm.getTotal = getTotal;
        vm.testProject = undefined;
        vm.testOutcome = undefined;
        vm.service = undefined;
        vm.testProjectColspan = undefined;
        vm.programColspan = undefined;

        function onInit() {
            vm.testProject = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.PROJECT);
            vm.testOutcome = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.OUTCOME);
            vm.service = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SERVICE);
            vm.testProjectColspan = getTestProjectColspan();
            vm.programColspan = getProgramColspan();
            extendLineItems();
            // console.log('#### test', vm.service);
        }

        function getTotal(project, outcome) {
            var total = 0;
            var isFilled = false;
            var totalLineItem = _.first(vm.lineItems.filter(vm.isTotal));
            var totalField = totalLineItem.projects[project.name].outcomes[outcome.name];
            totalField.value = undefined;
            angular.forEach(vm.lineItems, function(lineItem) {
                var value = lineItem.projects[project.name].outcomes[outcome.name].value;
                if (!vm.isTotal(lineItem) && !vm.isAPES(lineItem) && _.isNumber(value)) {
                    isFilled = true;
                    total = total + value;
                }
            });
            if (isFilled) {
                totalField.value = total;
                requisitionValidator.validateSiglusLineItemField(totalField);
            }
            return totalField.value;
        }

        function validateOnUpdate() {
            return requisitionValidator.validateTestConsumptionLineItems(vm.lineItems);
        }

        function extendLineItems() {
            var serviceColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.service);
            var testProjectColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.testProject);
            var testOutcomeColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(vm.testOutcome);
            angular.forEach(vm.lineItems, function(lineItem) {
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

        function getTestProjectColspan() {
            var displayedTestOutcomeColumns = vm.testOutcome.columns.filter(function(column) {
                return column.isDisplayed;
            });
            return displayedTestOutcomeColumns.length;
        }

        function getProgramColspan() {
            var displayedTestProjectColumns = vm.testProject.columns.filter(function(column) {
                return column.isDisplayed;
            });
            return displayedTestProjectColumns.length * getTestProjectColspan() + 1;
        }
    }
})();
