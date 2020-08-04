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

    controller.$inject = ['siglusTemplateConfigureService', 'SECTION_TYPES', 'selectProductsModalService'];

    function controller(siglusTemplateConfigureService, SECTION_TYPES, selectProductsModalService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.regimenSection = undefined;
        vm.summarySection = undefined;
        vm.getTotal = getTotal;
        vm.addRegimen = addRegimen;

        function onInit() {
            vm.regimenSection = siglusTemplateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.REGIMEN);
            vm.summarySection = siglusTemplateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.SUMMARY);
            enhanceLineItems(vm.regimenLineItems, vm.regimenSection);
            enhanceLineItems(vm.regimenDispatchLineItems, vm.summarySection);
        }

        function enhanceLineItems(lineItems, section) {
            var columnsMap = siglusTemplateConfigureService.getSectionColumnsMap(section);
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

        function addRegimen() {
            var notYetAddedRegimens = vm.customRegimens.filter(function(regimen) {
                return !_.find(vm.regimenLineItems, {
                    regimen: {
                        id: regimen.id
                    }
                });
            });
            selectProductsModalService.show({
                products: notYetAddedRegimens,
                state: '.addRegimens'
            });
        }
    }

})();
