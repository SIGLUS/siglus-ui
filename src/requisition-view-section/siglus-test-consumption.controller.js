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
        .module('requisition-view-section')
        .controller('SiglusTestConsumptionController', controller);

    controller.$inject = ['columnUtils', 'SECTION_TYPES', 'templateConfigureService', 'requisitionValidator'];

    function controller(columnUtils, SECTION_TYPES, templateConfigureService, requisitionValidator) {
        var vm = this;

        vm.$onInit = onInit;
        vm.isTotal = columnUtils.isTotal;
        vm.isAPES = columnUtils.isAPES;
        vm.isUserInput = columnUtils.isUserInput;
        vm.getTotal = getTotal;
        vm.testProject = undefined;
        vm.testOutcome = undefined;
        vm.service = undefined;
        vm.testProjectColspan = undefined;
        vm.programColspan = undefined;

        function onInit() {
            vm.testProject = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.PROJECT);
            vm.testOutcome = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.OUTCOME);
            vm.service = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SERVICE);
            vm.testProjectColspan = getTestProjectColspan();
            vm.programColspan = getProgramColspan();
            extendLineItems();
        }

        function getTotal(project, outcome) {
            var total = 0;
            var totalLineItem = _.first(vm.lineItems.filter(vm.isTotal));
            var totalField = totalLineItem.projects[project.name].outcomes[outcome.name];
            totalField.value = undefined;
            angular.forEach(vm.lineItems, function(lineItem) {
                var value = lineItem.projects[project.name].outcomes[outcome.name].value;
                if (!vm.isTotal(lineItem) && !vm.isAPES(lineItem) && _.isNumber(value)) {
                    total = total + value;
                }
            });
            if (total !== 0) {
                totalField.value = total;
                requisitionValidator.validateSiglusLineItemField(totalField);
            }
            return totalField.value;
        }

        function extendLineItems() {
            var serviceColumnsMap = templateConfigureService.getSectionColumnsMap(vm.service);
            var testProjectColumnsMap = templateConfigureService.getSectionColumnsMap(vm.testProject);
            var testOutcomeColumnsMap = templateConfigureService.getSectionColumnsMap(vm.testOutcome);
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
