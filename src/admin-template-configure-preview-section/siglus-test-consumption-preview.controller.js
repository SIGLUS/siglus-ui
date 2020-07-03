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
        .module('admin-template-configure-preview-section')
        .controller('TestConsumptionPreviewController', controller);

    controller.$inject = ['columnUtils', 'COLUMN_SOURCES', 'messageService', 'templateConfigureService'];

    function controller(columnUtils, COLUMN_SOURCES, messageService, templateConfigureService) {

        var vm = this;

        vm.testProject = undefined;
        vm.testOutcome = undefined;
        vm.service = undefined;
        vm.testOutcomeDisplayCount = undefined;
        vm.testOutcomeDisplayColumns = undefined;

        vm.$onInit = onInit;
        vm.getColumnValue = getColumnValue;
        vm.isUserInput = columnUtils.isUserInput;
        vm.isTotal = isTotal;

        function onInit() {
            // TODO: extract constant
            vm.testProject = templateConfigureService.getSectionByName(vm.sections, 'project');
            vm.testOutcome = templateConfigureService.getSectionByName(vm.sections, 'outcome');
            vm.service = templateConfigureService.getSectionByName(vm.sections, 'services');
            vm.testOutcomeDisplayedCount = vm.testOutcome.columns.filter(function(column) {
                return column.isDisplayed;
            }).length;
            vm.testOutcomeDisplayColumns = getTestOutcomeDisplayColumns();
        }

        function getColumnValue(serviceColumn) {
            return messageService.get(COLUMN_SOURCES.getLabel(serviceColumn.source));
        }

        function getTestOutcomeDisplayColumns() {
            var columns = [];
            var displayedColumns = vm.testOutcome.columns.filter(function(column) {
                return column.isDisplayed;
            }).sort(function(a, b) {
                return a.displayOrder - b.displayOrder;
            });
            vm.testProject.columns.forEach(function(testProjectColumn) {
                if (testProjectColumn.isDisplayed) {
                    columns = columns.concat(displayedColumns);
                }
            });
            return columns;
        }

        function isTotal(serviceColumn) {
            return serviceColumn.name === 'total';
        }
    }

})();
