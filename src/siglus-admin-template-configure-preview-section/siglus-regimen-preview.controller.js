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

    controller.$inject = ['siglusColumnUtils', 'SIGLUS_SECTION_TYPES', 'siglusTemplateConfigureService'];

    function controller(siglusColumnUtils, SIGLUS_SECTION_TYPES, siglusTemplateConfigureService) {

        var vm = this;
        vm.summary = undefined;
        vm.regimenColumns = undefined;
        vm.summaryColumns = undefined;
        vm.total = undefined;
        vm.categories = undefined;
        vm.regimenLineItems = undefined;

        vm.$onInit = onInit;
        vm.columnDisplayName = columnDisplayName;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isTotal = siglusColumnUtils.isTotal;

        function onInit() {
            var regimen = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.REGIMEN);
            vm.summary = siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SUMMARY);
            vm.regimenColumns = getDisplayedColumns(regimen);
            vm.summaryColumns = getDisplayedColumns(vm.summary);
            vm.colspan = _.find(vm.regimenColumns, siglusColumnUtils.isCode) ? 2 : 1;
            vm.total = _.find(vm.summaryColumns, siglusColumnUtils.isTotal);
            vm.categories = ['Category 1', 'Category 2'];
            vm.regimenLineItem = {
                code: 'code',
                regiment: 'Regimen name'
            };
        }

        function getDisplayedColumns(section) {
            return _.filter(section.columns, 'isDisplayed');
        }

        function columnDisplayName(column, categoryIndex, lineItemIndex) {
            var value = vm.regimenLineItem[column.name];
            if (value) {
                value = value + ' ' + getIndex(categoryIndex, lineItemIndex);
            } else {
                value = siglusColumnUtils.columnDisplayName(column);
            }
            return value;
        }

        function getIndex(categoryIndex, lineItemIndex) {
            return 2 * categoryIndex + lineItemIndex + 1;
        }
    }

})();
