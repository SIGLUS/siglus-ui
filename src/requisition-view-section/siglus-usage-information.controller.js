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
        .controller('SiglusUsageInformationController', controller);

    controller.$inject = ['columnUtils', 'templateConfigureService', 'requisitionValidator'];

    function controller(columnUtils, templateConfigureService, requisitionValidator) {

        var vm = this;

        vm.$onInit = onInit;
        vm.isTotalService = templateConfigureService.isTotalService;
        vm.getTotal = getTotal;
        vm.isUserInput = columnUtils.isUserInput;
        vm.update = requisitionValidator.validateSiglusLineItemField;
        vm.firstService = undefined;
        vm.monthOrYearColspan = 1;
        vm.informationColspan = 0;

        function onInit() {
            extendLineItems();
            vm.firstService = vm.lineItems.values().next().value;
            angular.forEach(Object.keys(vm.firstService.informations), function(information) {
                vm.informationColspan = Object.keys(vm.firstService.informations[information].orderables).length;
                vm.monthOrYearColspan = vm.monthOrYearColspan + vm.informationColspan;
            });
        }

        function getTotal(informationName, orderableId) {
            var total = 0;
            angular.forEach(vm.lineItems, function(lineItem) {
                if (!vm.isTotalService(lineItem)) {
                    total = total + lineItem.informations[informationName].orderables[orderableId].value;
                }
            });
            angular.forEach(vm.lineItems, function(lineItem) {
                if (vm.isTotalService(lineItem)) {
                    lineItem.informations[informationName].orderables[orderableId].value = total;
                }
            });
            return total;
        }

        function extendLineItems() {
            var information = templateConfigureService.getInformation(vm.sections);
            var informationColumnsMap = templateConfigureService.getSectionColumnsMap(information);
            var service = templateConfigureService.getService(vm.sections);
            var serviceColumnsMap = templateConfigureService.getSectionColumnsMap(service);
            var availableProductsMap = getAvailableProductsMap(vm.availableProducts);
            angular.forEach(vm.lineItems, function(lineItem) {
                _.extend(lineItem, serviceColumnsMap[lineItem.service]);
                angular.forEach(Object.keys(lineItem.informations), function(information) {
                    lineItem.informations[information] = angular.merge({},
                        informationColumnsMap[information], lineItem.informations[information]);
                    angular.forEach(Object.keys(lineItem.informations[information].orderables), function(orderableId) {
                        lineItem.informations[information].orderables[orderableId] = angular.merge({},
                            availableProductsMap[orderableId],
                            lineItem.informations[information].orderables[orderableId],
                            {
                                $error: undefined
                            });
                    });
                });
            });
        }

        function getAvailableProductsMap(availableProducts) {
            return _.reduce(availableProducts, function(productMap, product) {
                productMap[product.id] = product;
                return productMap;
            }, {});
        }
    }

})();
