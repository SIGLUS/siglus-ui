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
        .module('admin-template-configure-usage-information')
        .controller('UsageInformationTemplateController', UsageInformationTemplateController);

    UsageInformationTemplateController.$inject = ['COLUMN_SOURCES', 'templateConfigureService', 'template',
        'SECTION_TYPES'];

    function UsageInformationTemplateController(COLUMN_SOURCES, templateConfigureService, template, SECTION_TYPES) {
        var vm = this;

        vm.$onInit = onInit;
        vm.addInformationColumn = addInformationColumn;
        vm.addServiceColumn = addServiceColumn;

        vm.template = undefined;

        function onInit() {
            vm.template = template;
            vm.information = templateConfigureService.getSectionByName(template.usageInformation,
                SECTION_TYPES.INFORMATION);
            vm.service = templateConfigureService.getSectionByName(template.usageInformation, SECTION_TYPES.SERVICE);
        }

        function addInformationColumn() {
            vm.information.columns.push(angular.merge({}, templateConfigureService.getDefaultColumn(), {
                source: COLUMN_SOURCES.USER_INPUT,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT],
                    supportsTag: false
                }
            }));
        }

        function addServiceColumn() {
            vm.service.columns.push(angular.merge({}, templateConfigureService.getDefaultColumn(), {
                source: COLUMN_SOURCES.USER_INPUT,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT],
                    supportsTag: false
                }
            }));
        }
    }
})();
