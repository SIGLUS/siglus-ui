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
     * @name admin-template-configure-kit-usage.controller:KitUsageTemplateController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('siglus-admin-template-configure-test-consumption')
        .controller('testConsumptionController', testConsumptionController);

    testConsumptionController.$inject = ['COLUMN_SOURCES', 'templateConfigureService', 'template',
        'SECTION_TYPES'];

    function testConsumptionController(COLUMN_SOURCES, templateConfigureService, template, SECTION_TYPES) {
        var vm = this;

        vm.$onInit = onInit;

        vm.template = undefined;

        function onInit() {
            vm.template = template;
            vm.testProject = templateConfigureService.getSectionByName(template.testConsumption, SECTION_TYPES.PROJECT);
            vm.testOutcome = templateConfigureService.getSectionByName(template.testConsumption, SECTION_TYPES.OUTCOME);
            vm.service = templateConfigureService.getSectionByName(template.testConsumption, SECTION_TYPES.SERVICE);
            vm.addTestProjectColumn = addColumn(vm.testProject.columns);
            vm.addTestOutcomeColumn = addColumn(vm.testOutcome.columns);
            vm.addServiceColumn = addColumn(vm.service.columns);
            enableCurrentSection();
        }

        function enableCurrentSection() {
            vm.template.extension.enableRapidTestConsumption = true;
        }

        function addColumn(columns) {
            return function() {
                columns.push(angular.merge({}, templateConfigureService.getDefaultColumn(), {
                    source: COLUMN_SOURCES.USER_INPUT,
                    columnDefinition: {
                        sources: [COLUMN_SOURCES.USER_INPUT],
                        supportsTag: false
                    }
                }));
            };
        }
    }
})();
