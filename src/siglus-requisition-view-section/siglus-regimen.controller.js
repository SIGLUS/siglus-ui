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
        .module('siglus-requisition-view-section')
        .controller('SiglusRegimentController', controller);

    controller.$inject = ['SIGLUS_SECTION_TYPES', 'COLUMN_SOURCES', 'siglusTemplateConfigureService',
        'selectProductsModalService', 'siglusRequisitionUtils', 'siglusColumnUtils', 'requisitionValidator'];

    function controller(SIGLUS_SECTION_TYPES, COLUMN_SOURCES, siglusTemplateConfigureService,
                        selectProductsModalService, siglusRequisitionUtils, siglusColumnUtils,
                        requisitionValidator) {

        var vm = this;

        vm.$onInit = onInit;
        vm.categories = undefined;
        vm.regimenSection = undefined;
        vm.summarySection = undefined;
        vm.hasCode = false;
        vm.regimenTotal = undefined;
        vm.groupedLineItems = undefined;
        vm.getTotal = getTotal;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isCalculated = siglusColumnUtils.isCalculated;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.addRegimen = addRegimen;
        vm.removeRegimen = removeRegimen;

        function onInit() {
            vm.categories = getCategories();
            vm.regimenSection =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.REGIMEN);
            vm.summarySection =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SUMMARY);
            vm.hasCode = !!_.find(vm.regimenSection.columns, siglusColumnUtils.isCode);
            vm.regimenTotal = _.find(vm.regimenLineItems, siglusColumnUtils.isTotal);
            enhanceColumns(vm.regimenLineItems, vm.regimenSection);
            enhanceColumns(vm.regimenSummaryLineItems, vm.regimenSection);
            enhanceLineItems([vm.regimenTotal], vm.summarySection);
            enhanceLineItems(vm.regimenSummaryLineItems, vm.summarySection);
        }

        function getCategories() {
            var categoryMap = {};
            _.forEach(vm.regimenLineItems, function(item) {
                if (item.regimen) {
                    categoryMap[item.regimen.regimenCategory.name] = item.regimen.regimenCategory;
                }
            });
            return _.values(categoryMap);
        }

        function enhanceColumns(lineItems, section) {
            var columnsMap = siglusTemplateConfigureService.getSectionColumnsMap(section);
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName] = angular.merge({},
                        columnsMap[columnName], lineItem.columns[columnName]);
                });
            });
        }

        function enhanceLineItems(lineItems, section) {
            var columnsMap = siglusTemplateConfigureService.getSectionColumnsMap(section);
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName] = angular.merge({},
                        columnsMap[columnName], lineItem.columns[columnName]);
                });
                lineItem.column = columnsMap[lineItem.name];
            });
        }

        function getTotal(lineItems, column) {
            column.value = siglusRequisitionUtils.getRegimenLineItemsTotal(lineItems, column);
            requisitionValidator.validateTotalColumn(column);
            return column.value;
        }

        function addRegimen(category) {
            var notYetAddedRegimens = vm.customRegimens.filter(function(regimen) {
                return  !_.find(vm.regimenLineItems, function(item) {
                    return item.regimen && item.regimen.id === regimen.id;
                }) && regimen.regimenCategory.name === category;
            });
            selectProductsModalService.show({
                products: notYetAddedRegimens,
                state: '.addRegimens'
            }).then(function(regimens) {
                angular.forEach(regimens, function(regimen) {
                    vm.regimenLineItems.push({
                        columns: siglusRequisitionUtils.getInputColumnsMap(vm.regimenSection.columns),
                        regimen: regimen
                    });
                });
            });
        }

        function removeRegimen(regime) {
            var index = _.findIndex(vm.regimenLineItems, regime);
            if (index >= 0) {
                vm.regimenLineItems.splice(index, 1);
            }
        }
    }

})();
