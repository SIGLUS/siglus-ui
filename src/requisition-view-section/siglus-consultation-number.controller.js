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
        .controller('SiglusConsultationNumberViewController', controller);

    controller.$inject = ['columnUtils', 'SECTION_TYPES', 'templateConfigureService', 'requisitionValidator',
        'messageService'];

    function controller(columnUtils, SECTION_TYPES, templateConfigureService, requisitionValidator,
                        messageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.isUserInput = columnUtils.isUserInput;
        vm.isCalculated = columnUtils.isCalculated;
        vm.isTotal = columnUtils.isTotal;
        vm.getTotal = getTotal;
        vm.consultationNumber = undefined;
        vm.requisitionType = undefined;

        function onInit() {
            vm.consultationNumber = templateConfigureService.getSectionByName(vm.sections, SECTION_TYPES.NUMBER);
            vm.requisitionType = messageService.get(
                vm.isEmergency ? 'requisitionView.emergency' : 'requisitionView.regular'
            );
            extendLineItems();
        }

        function getTotal(lineItem, column) {
            column.value = _.reduce(lineItem.columns, function(total, column) {
                if (!vm.isCalculated(column)) {
                    return total + column.value;
                }
                return total;
            }, 0);
            requisitionValidator.validateSiglusLineItemField(column);
            return column.value;
        }

        function extendLineItems() {
            var sectionsMap = _.indexBy(vm.sections, 'name');
            var consultationNumberColumnsMap = templateConfigureService.getSectionColumnsMap(vm.consultationNumber);
            angular.forEach(vm.lineItems, function(lineItem) {
                lineItem.section = sectionsMap[lineItem.name];
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName] =
                        angular.merge({}, consultationNumberColumnsMap[columnName], lineItem.columns[columnName]);
                });
            });
        }
    }
})();
