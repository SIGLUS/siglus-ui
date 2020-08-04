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

    controller.$inject = ['SECTION_TYPES', 'COLUMN_SOURCES', 'MAX_INTEGER_VALUE', 'siglusTemplateConfigureService',
        'selectProductsModalService', 'messageService', 'requisitionUtils'];

    function controller(SECTION_TYPES, COLUMN_SOURCES, MAX_INTEGER_VALUE, siglusTemplateConfigureService,
                        selectProductsModalService, messageService, requisitionUtils) {

        var vm = this;

        vm.$onInit = onInit;
        vm.regimenSection = undefined;
        vm.summarySection = undefined;
        vm.getTotal = requisitionUtils.getBasicLineItemsTotal;
        vm.validateTotal = validateTotal;
        vm.addRegimen = addRegimen;
        vm.removeRegimen = removeRegimen;

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

        function validateTotal(lineItems, column) {
            if (vm.getTotal(lineItems, column) > MAX_INTEGER_VALUE) {
                return messageService.get('requisitionValidation.numberTooLarge');
            }
        }

        function addRegimen(category) {
            var notYetAddedRegimens = vm.customRegimens.filter(function(regimen) {
                return !_.find(vm.regimenLineItems, function(item) {
                    return item.regimen.id === regimen.id;
                }) && regimen.regimenCategory.name === category ;
            });
            selectProductsModalService.show({
                products: notYetAddedRegimens,
                state: '.addRegimens'
            }).then(function(regimens) {
                angular.forEach(regimens, function(regimen) {
                    vm.regimenLineItems.push({
                        columns: getColumns(),
                        regimen: regimen
                    });
                });
            });
        }

        function getColumns() {
            var columns = _.filter(vm.regimenSection.columns, {
                source: COLUMN_SOURCES.USER_INPUT
            });
            return angular.copy(_.indexBy(columns, 'name'));
        }

        function removeRegimen(regime) {
            var index = _.findIndex(vm.regimenLineItems, regime);
            if (index >= 0) {
                vm.regimenLineItems.splice(index, 1);
            }
        }
    }

})();
