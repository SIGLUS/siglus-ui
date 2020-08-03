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

    controller.$inject = ['siglusColumnUtils', 'templateConfigureService', 'SECTION_TYPES'];

    function controller(siglusColumnUtils, templateConfigureService, SECTION_TYPES) {

        var vm = this;

        vm.testProject = undefined;
        vm.testOutcome = undefined;
        vm.service = undefined;
        vm.testOutcomeDisplayCount = undefined;
        vm.testOutcomeDisplayColumns = undefined;

        vm.$onInit = onInit;
        vm.columnDisplayName = siglusColumnUtils.columnDisplayName;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.isAPES = siglusColumnUtils.isAPES;

        function onInit() {
            vm.testProject = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.PROJECT);
            vm.testOutcome = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.OUTCOME);
            vm.service = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SERVICE);
            vm.testOutcomeDisplayedCount = vm.testOutcome.columns.filter(function(column) {
                return column.isDisplayed;
            }).length;
            vm.testOutcomeDisplayColumns = getTestOutcomeDisplayColumns();
        }

        function getTestOutcomeDisplayColumns() {
            var columns = [];
            var displayedColumns = vm.testOutcome.columns.filter(function(column) {
                return column.isDisplayed;
            });
            vm.testProject.columns.forEach(function(testProjectColumn) {
                if (testProjectColumn.isDisplayed) {
                    columns = columns.concat(displayedColumns);
                }
            });
            return columns;
        }
    }

})();
