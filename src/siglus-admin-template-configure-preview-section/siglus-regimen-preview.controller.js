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
        .module('siglus-admin-template-configure-preview-section')
        .controller('SiglusRegimenPreviewController', controller);

    controller.$inject = ['siglusColumnUtils', 'SIGLUS_SECTION_TYPES', 'siglusTemplateConfigureService',
        'COLUMN_SOURCES'];

    function controller(siglusColumnUtils, SIGLUS_SECTION_TYPES, siglusTemplateConfigureService, COLUMN_SOURCES) {

        var vm = this;
        vm.regimenColumns = undefined;
        vm.summaryColumns = undefined;
        vm.total = undefined;
        vm.categories = undefined;
        vm.regimenLineItems = undefined;

        vm.$onInit = onInit;
        vm.columnDisplayName = siglusColumnUtils.columnDisplayName;
        vm.isUserInput = siglusColumnUtils.isUserInput;

        function onInit() {
            var regimen = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.REGIMEN);
            var summary = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SUMMARY);
            vm.regimenColumns = getDisplayedColumns(regimen);
            vm.summaryColumns = getDisplayedColumns(summary);
            vm.total = {
                name: 'total',
                label: 'Total',
                source: COLUMN_SOURCES.CALCULATED
            };
            vm.categories = ['Category 1', 'Category 2'];
            vm.regimenLineItems = [{
                code: 'code 1',
                regimen: 'Regimen name 1'
            }, {
                code: 'code 2',
                regimen: 'Regimen name 2'
            }];
        }

        function getDisplayedColumns(section) {
            return _.filter(section.columns, 'isDisplayed');
        }
    }

})();
