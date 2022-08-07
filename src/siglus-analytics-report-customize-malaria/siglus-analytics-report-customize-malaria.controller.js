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

    /**
     * @ngdoc controller
     * @name siglus-analytics-report-customize-malaria.controller:siglusAnalyticsReportCustomizeMalariaController
     *
     * @description
     * Get Requisitions and Monthly Report second-tier page Malaria Report Customize
     */
    angular
        .module('siglus-analytics-report-customize-malaria')
        .controller('siglusAnalyticsReportCustomizeMalariaController', controller);

    controller.$inject = [ 'requisition', 'facility', 'siglusColumnUtils',
        'siglusTemplateConfigureService',
        'requisitionValidator', 'SIGLUS_SECTION_TYPES', 'openlmisDateFilter'];

    function controller(requisition, facility, siglusColumnUtils, siglusTemplateConfigureService,
                        requisitionValidator, SIGLUS_SECTION_TYPES, openlmisDateFilter) {
        var vm = this;

        vm.$onInit = onInit;
        vm.downloadPdf = downloadPdf;
        vm.requisition = undefined;
        vm.facility = undefined;
        vm.isTotal = siglusColumnUtils.isTotal;
        vm.getTotal = getTotal;
        vm.getOrderNumber = getOrderNumber;
        vm.isUserInput = siglusColumnUtils.isUserInput;
        vm.isCalculated = siglusColumnUtils.isCalculated;
        vm.firstService = undefined;
        vm.informationColspan = 0;
        vm.lineItems = undefined;
        vm.sections = undefined;
        vm.addedProducts = undefined;
        vm.availableProducts = undefined;
        vm.completedBy = undefined;
        vm.approvedBy = undefined;
        vm.date = undefined;
        vm.yearAndMonth = undefined;
        vm.processingPeriodEndDate = undefined;
        vm.submitDate = undefined;
        vm.nowTime = openlmisDateFilter(new Date(), 'd MMM y h:mm:ss');
        function onInit() {
            vm.requisition = requisition;
            vm.facility = facility;
            vm.completedBy = vm.requisition.extraData.signaure.submit ? vm.requisition.extraData.signaure.submit : '';
            vm.approvedBy = vm.requisition.extraData.signaure.approve && vm.requisition.extraData.signaure.approve[0] ?
                vm.requisition.extraData.signaure.approve[0] : '';
            vm.sections = vm.requisition.usageTemplate.usageInformation;
            vm.lineItems = vm.requisition.usageInformationLineItems;
            vm.availableProducts = vm.requisition.availableFullSupplyProducts;
            vm.addedProducts = vm.requisition.requisitionLineItems;
            vm.processingPeriodEndDate = vm.requisition.processingPeriod.endDate;
            vm.submitDate = vm.requisition.statusChanges.SUBMITTED.changeDate ?
                vm.requisition.statusChanges.SUBMITTED.changeDate : '';
            extendLineItems();
            vm.firstService = _.first(vm.lineItems);
            angular.forEach(Object.keys(vm.firstService.informations), function(informationItem) {
                vm.informationColspan = Object.keys(vm.firstService.informations[informationItem].orderables).length;
            });
        }

        function getOrderNumber(index, last) {
            if (last) {
                return '';
            }
            return (index + 1);
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
                angular.forEach(Object.keys(lineItem.informations), function(key) {
                    lineItem.informations[key] = angular.merge({},
                        informationColumnsMap[key], lineItem.informations[key]);
                    angular.forEach(Object.keys(lineItem.informations[key].orderables), function(orderableId) {
                        lineItem.informations[key].orderables[orderableId] = angular.merge({},
                            productsMap[orderableId],
                            lineItem.informations[key].orderables[orderableId]);
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

        function downloadPdf() {
            var dom = document.getElementById('malaria-form-outer');
            // eslint-disable-next-line no-undef
            domtoimage.toPng(dom)
                .then(function(dataUrl) {
                    var contentWidth = dom.offsetWidth;
                    var contentHeight = dom.offsetHeight;
                    var imgWidth = 505.28;
                    var imgHeight = (505.28 / contentWidth) * contentHeight;
                    var pageData = dataUrl;
                    // eslint-disable-next-line no-undef
                    var PDF = new jsPDF('', 'pt', 'a4');
                    PDF.addImage(pageData, 'PNG', 45, 45, imgWidth, imgHeight);
                    PDF.save('ALS.'
                    + vm.facility.code + '.'
                    + openlmisDateFilter(vm.requisition.processingPeriod.startDate, 'yy')
                    + openlmisDateFilter(vm.requisition.processingPeriod.startDate, 'MM') + '.'
                    + '01'
                    + '.pdf');
                });
        }

    }

})();
