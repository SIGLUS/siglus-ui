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
        vm.testProjectColspan = getTestProjectColspan;
        vm.programColspan = undefined;
        vm.replenishArray = replenishArray;

        var POSITIVE_HIV_NAME = 'positive_hiv';
        var POSITIVE_HIV_LABEL = 'Positivo HIV';
        var POSITIVE_SYPHILIS_NAME = 'positive_syphilis';
        var POSITIVE_SYPHILIS_LABEL = 'Positivo Sifilis';

        function onInit() {
            vm.testProject = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.PROJECT);
            vm.testOutcome = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.OUTCOME);
            vm.service = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SERVICE);
            buildTestProject();
            vm.programColspan = getProgramColspan();
            extendLineItems();
        }

        function buildTestProject() {
            vm.testProject.columns.forEach(function(project) {
                if ('newColumn3' === project.name) {
                    var outcomeColumns = [];
                    outcomeColumns.push(vm.testOutcome.columns[0]);
                    var positiveColumn = vm.testOutcome.columns[1];
                    var positiveHivColumn = createOutComeColumn(positiveColumn,
                        POSITIVE_HIV_NAME, POSITIVE_HIV_LABEL, 1);
                    outcomeColumns.push(positiveHivColumn);
                    var positiveSyphilisColumn = createOutComeColumn(positiveColumn,
                        POSITIVE_SYPHILIS_NAME, POSITIVE_SYPHILIS_LABEL, 2);
                    outcomeColumns.push(positiveSyphilisColumn);
                    var unjustifiedColumn = createOutComeColumn(vm.testOutcome.columns[2], null, null, 3);
                    outcomeColumns.push(unjustifiedColumn);
                    project['outcomeColumns'] = outcomeColumns;
                } else {
                    project['outcomeColumns'] = vm.testOutcome.columns;
                }
            });
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
            var testOutcomeColumnsMap = buildOutcomeColumnsMap();
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

        function buildOutcomeColumnsMap() {
            var outcomeColumns = [];
            outcomeColumns.push(vm.testOutcome.columns[0]);
            outcomeColumns.push(vm.testOutcome.columns[1]);
            outcomeColumns.push(createOutComeColumn(vm.testOutcome.columns[1],
                POSITIVE_HIV_NAME, POSITIVE_HIV_LABEL, 2));
            outcomeColumns.push(createOutComeColumn(vm.testOutcome.columns[1],
                POSITIVE_SYPHILIS_NAME, POSITIVE_SYPHILIS_LABEL, 3));
            outcomeColumns.push(createOutComeColumn(vm.testOutcome.columns[2], null, null, 4));
            return _.reduce(outcomeColumns, function(columnMap, column) {
                columnMap[column.name] = column;
                return columnMap;
            }, {});
        }

        function createOutComeColumn(originOutCome, name, label, displayOrder) {
            var newOutColumn = angular.copy(originOutCome);
            if (name) {
                newOutColumn['name'] = name;
            }
            if (label) {
                newOutColumn['label'] = label;
            }
            if (displayOrder) {
                newOutColumn['displayOrder'] = displayOrder;
            }
            return newOutColumn;
        }

        function getTestProjectColspan(projectLabel) {
            var project = vm.testProject.columns.find(function(project) {
                return project.label === projectLabel;
            });
            return project.outcomeColumns.length;
        }

        function getProgramColspan() {
            return vm.testProject.columns.reduce(function(sum, project) {
                return sum + project.outcomeColumns.length;
            }, 0) + 1;
        }

        function replenishArray(lineItem) {
            var count = Object.keys(lineItem.projects).reduce(function(sum, key) {
                var project = lineItem.projects[key];
                return sum + getTestProjectColspan(project.label);
            }, 0);
            count = getProgramColspan() - count - 1;
            return Array(count).fill(0);
        }
    }
})();
