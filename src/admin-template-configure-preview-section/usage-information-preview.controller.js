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
        .controller('UsageInformationPreviewController', controller);

    controller.$inject = ['columnUtils', 'COLUMN_SOURCES', 'messageService', 'templateConfigureService'];

    function controller(columnUtils, COLUMN_SOURCES, messageService, templateConfigureService) {

        var vm = this;

        vm.information = undefined;
        vm.service = undefined;
        vm.products = undefined;
        vm.monthOrYearColspan = undefined;

        vm.$onInit = onInit;
        vm.getColumnValue = getColumnValue;
        vm.isUserInput = columnUtils.isUserInput;
        vm.isTotalService = templateConfigureService.isTotalService;

        function onInit() {
            vm.information = templateConfigureService.getInformation(vm.sections);
            vm.service = templateConfigureService.getService(vm.sections);
            vm.products = getProducts(vm.information);
            vm.monthOrYearColspan = vm.products.length + 1;
        }

        function getColumnValue(serviceColumn) {
            return messageService.get(COLUMN_SOURCES.getLabel(serviceColumn.source));
        }

        function getProducts(information) {
            var result = [];
            information.columns.forEach(function(column) {
                if (column.isDisplayed) {
                    result = result.concat(['Product 1', 'Product 2']);
                }
            });
            return result;
        }
    }

})();
