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
        .controller('SiglusRegimentController', controller);

    controller.$inject = ['templateConfigureService', 'SECTION_TYPES'];

    function controller(templateConfigureService, SECTION_TYPES) {

        var vm = this;

        vm.$onInit = onInit;
        vm.regimenSection = undefined;
        vm.summarySection = undefined;
        vm.getTotal = getTotal;

        function onInit() {
            vm.regimenSection = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.REGIMEN);
            vm.summarySection = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SUMMARY);
            enhanceLineItems(vm.regimenLineItems, vm.regimenSection);
            enhanceLineItems(vm.regimenDispatchLineItems, vm.summarySection);
        }

        function enhanceLineItems(lineItems, section) {
            var columnsMap = templateConfigureService.getSectionColumnsMap(section);
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName] = angular.merge({},
                        columnsMap[columnName], lineItem.columns[columnName]);
                });
            });
        }

        function getTotal(lineItems, column) {
            return _.reduce(lineItems, function(total, lineItem) {
                return total + lineItem.columns[column.name].value;
            }, 0);
        }
    }

})();
