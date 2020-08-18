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
        .controller('SiglusUsageInformationController', controller);

    controller.$inject = ['siglusColumnUtils', 'siglusTemplateConfigureService', 'requisitionValidator',
        'SIGLUS_SECTION_TYPES'];

    function controller(siglusColumnUtils, siglusTemplateConfigureService, requisitionValidator,
                        SIGLUS_SECTION_TYPES) {

        var vm = this;

        vm.$onInit = onInit;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.getTotal = getTotal;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isCalculated = siglusColumnUtils.isCalculated;
        vm.update = requisitionValidator.validateSiglusLineItemField;
        vm.firstService = undefined;
        vm.monthOrYearColspan = 1;
        vm.informationColspan = 0;

        function onInit() {
            extendLineItems();
            vm.firstService = _.first(vm.lineItems);
            angular.forEach(Object.keys(vm.firstService.informations), function(information) {
                vm.informationColspan = Object.keys(vm.firstService.informations[information].orderables).length;
                vm.monthOrYearColspan = vm.monthOrYearColspan + vm.informationColspan;
            });
        }

        function getTotal(informationName, orderableId) {
            var totalLineItem = _.first(vm.lineItems.filter(vm.isTotal));
            var totalField = totalLineItem.informations[informationName].orderables[orderableId];
            totalField.value = _.reduce(vm.lineItems, function(total, lineItem) {
                var value = lineItem.informations[informationName].orderables[orderableId].value;
                if (!vm.isTotal(lineItem) && _.isNumber(value)) {
                    return (total || 0) + value;
                }
                return total;
            }, undefined);
            requisitionValidator.validateTotalColumn(totalField);
            return totalField.value;
        }

        function extendLineItems() {
            var information =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.INFORMATION);
            var informationColumnsMap =
                siglusTemplateConfigureService.getSectionColumnsMap(information);
            var service =
                siglusTemplateConfigureService.getSectionByName(vm.sections, SIGLUS_SECTION_TYPES.SERVICE);
            var serviceColumnsMap = siglusTemplateConfigureService.getSectionColumnsMap(service);
            var productsMap = getProductsMap();
            angular.forEach(vm.lineItems, function(lineItem) {
                _.extend(lineItem, serviceColumnsMap[lineItem.service]);
                angular.forEach(Object.keys(lineItem.informations), function(information) {
                    lineItem.informations[information] = angular.merge({},
                        informationColumnsMap[information], lineItem.informations[information]);
                    angular.forEach(Object.keys(lineItem.informations[information].orderables), function(orderableId) {
                        lineItem.informations[information].orderables[orderableId] = angular.merge({},
                            productsMap[orderableId],
                            lineItem.informations[information].orderables[orderableId]);
                    });
                });
            });
        }

        function getProductsMap() {
            var products = angular.copy(vm.availableProducts);
            angular.forEach(vm.addedProducts, function(addedProduct) {
                products = products.concat(addedProduct.orderable);
            });
            return _.reduce(products, function(productMap, product) {
                productMap[product.id] = product;
                return productMap;
            }, {});
        }
    }

})();
