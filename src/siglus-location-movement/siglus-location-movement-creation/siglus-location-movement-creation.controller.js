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
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('siglus-location-movement-creation')
        .controller('SiglusLocationMovementCreationController', controller);

    controller.$inject = ['draftInfo', 'orderableGroups', '$filter', 'paginationService', '$stateParams',
        'addAndRemoveLineItemService'];

    function controller(draftInfo, orderableGroups, $filter, paginationService, $stateParams,
                        addAndRemoveLineItemService) {
        var vm = this;

        vm.orderableGroups = orderableGroups;

        vm.selectedOrderableGroup = null;

        vm.$onInit = function() {
            vm.orderableGroups = _.chain(orderableGroups).map(function(group) {
                return _.first(group);
            })
                .filter(function(item) {
                    return !_.isEmpty(item);
                })
                .value();

            var validator = function() {
                return true;
            };
            return paginationService.registerList(validator, angular.copy($stateParams), function() {
                return vm.orderableGroups;
            });
        };

        vm.displayItems = [];

        vm.orderableSelectionChanged = function() {
            console.log(vm.selectedOrderableGroup);
        };

        vm.addProduct = function() {
            var orderable = vm.selectedOrderableGroup.orderable;
            var hasAdded = _.some(vm.displayItems, function(group) {
                return group[0].orderableId === orderable.id;
            });
            if (hasAdded) {
                console.log('has added....');
            } else {
                var rowData = {
                    $error: {},
                    $hint: {},
                    orderableId: orderable.id,
                    productCode: orderable.productCode,
                    productName: $filter('productName')(vm.selectedOrderableGroup.orderable),
                    lot: null,
                    area: '',
                    moveToLocation: null,
                    isKit: orderable.isKit,
                    isMainGroup: true,
                    location: null,
                    moveTo: null,
                    quantity: null
                };
                vm.displayItems.unshift([rowData]);
                console.log(vm.displayItems);
            }
        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveLineItemService.addLineItem(lineItem, lineItems);
        };

        vm.removeItem = function(lineItems, index) {
            addAndRemoveLineItemService.removeItem(lineItems, index);
        };

        vm.getTotalQuantity = function(lineItems) {
            return _.reduce(lineItems, function(sum, item) {
                return sum + (item.quantity || 0);
            }, 0);
        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return !lineItem.isKit && (lineItems.length === 1 || (lineItem.length > 1 && index > 0));
        };

        vm.showEmptyBlock = function(lineItem, lineItems, index) {
            return (lineItems.length === 1 || (lineItems.length > 1 && index > 0));
        };
    }

})();
