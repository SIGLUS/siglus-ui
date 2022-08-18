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

    controller.$inject = ['draftInfo', 'addedLineItems', '$state', 'orderableGroups', '$filter',
        'paginationService', '$stateParams',
        'addAndRemoveLineItemService', 'displayItems', 'locations', 'siglusMovementFilterService',
        'SiglusLocationCommonUtilsService'];

    function controller(draftInfo, addedLineItems, $state, orderableGroups, $filter, paginationService, $stateParams,
                        addAndRemoveLineItemService, displayItems, locations, siglusMovementFilterService,
                        SiglusLocationCommonUtilsService) {
        var vm = this;

        vm.orderableGroups = orderableGroups;

        vm.selectedOrderableGroup = null;

        vm.addedLineItems = [];

        vm.displayItems = displayItems || [];

        vm.getLocationList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLocationList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLotsLocationMap(locations)
            );
        };

        vm.getLotList = function(lineItem) {
            return SiglusLocationCommonUtilsService.getLotList(
                lineItem,
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations)
            );
        };
        vm.$onInit = function() {
            $stateParams.draftInfo = draftInfo;
            $stateParams.addedLineItems = vm.addedLineItems;
            vm.orderableGroups = _.chain(orderableGroups).map(function(group) {
                return _.first(group);
            })
                .filter(function(item) {
                    return !_.isEmpty(item);
                })
                .value();

            $stateParams.orderableGroups = orderableGroups;

            return paginationService.registerList(isValid, angular.copy($stateParams), function() {
                return vm.addedLineItems;
            });
        };

        vm.orderableSelectionChanged = function() {

        };

        vm.addProduct = function() {
            var orderable = vm.selectedOrderableGroup.orderable;
            var hasAdded = _.some(vm.addedLineItems, function(group) {
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
                    stockOnHand: 0,
                    area: '',
                    moveToLocation: null,
                    isKit: orderable.isKit,
                    isMainGroup: true,
                    location: null,
                    moveTo: null,
                    quantity: null
                };
                vm.addedLineItems.unshift([rowData]);
                searchList();
            }
        };

        function searchList() {
            $stateParams.keyword = vm.keyword;
            vm.displayItems = siglusMovementFilterService
                .filterMovementList($stateParams.keyword || '', vm.addedLineItems);
        }

        vm.changeLot = function(lineItem) {
            lineItem.$error.lotCodeError = _.isEmpty(lineItem.lot) ? 'openlmisForm.required' : '';
        };

        vm.changeLocation = function(lineItem) {
            lineItem.$error.locationError = _.isEmpty(lineItem.location) ? 'openlmisForm.required' : '';
        };

        vm.changeQuantity = function(lineItem) {
            var isNumberEmpty =  _.isNumber(lineItem.quantity) ? lineItem.quantity < 0 : true;
            lineItem.$error.quantityError = isNumberEmpty ? 'openlmisForm.required' : '';

            validateQuantityMtSoh(lineItem);
        };

        vm.addItem = function(lineItem, lineItems) {
            addAndRemoveLineItemService.addLineItem(lineItem, lineItems);
        };

        vm.removeItem = function(lineItems, index) {
            addAndRemoveLineItemService.removeItem(lineItems, index);
            if (lineItems.length === 0) {
                vm.addedLineItems = _.filter(vm.addedLineItems, function(item) {
                    return !_.isEmpty(item);
                });
            }
            searchList();

        };

        vm.getStockOnHand = function(lineItem) {
            return _.get(lineItem.lot, 'stockOnHand', 0);
        };

        function validateQuantityMtSoh(lineItem) {
            if (lineItem.quantity > vm.getStockOnHand(lineItem)) {
                lineItem.$error.quantityError = 'locationMovement.mtSoh';
            }
        }

        function reloadPage() {
            $state.go($state.current.name, $stateParams, {});
        }

        vm.getTotalQuantity = function(lineItems) {
            return _.reduce(lineItems, function(sum, item) {
                return sum + (item.quantity || 0);
            }, 0);
        };

        vm.showEmptyBlockWithKit = function(lineItem, lineItems, index) {
            return lineItem.isKit || (lineItems.length > 1 && index === 0);
        };

        vm.showEmptyBlock = function(lineItem, lineItems, index) {
            return (lineItems.length > 1 && index === 0);
        };

        vm.save = function() {

        };

        vm.search = function() {
            searchList();
            $stateParams.keyword = vm.keyword;
            $stateParams.addedLineItems = vm.addedLineItems;
            reloadPage();
        };

        vm.cancelFilter = function() {

        };

        function validateLotCodeRequired(lineItem) {
            if (_.isEmpty(lineItem.lot)) {
                lineItem.$error.lotCodeError = 'openlmisForm.required';
            }
        }

        function validateLocationRequired(lineItem) {
            if (_.isEmpty(lineItem.location)) {
                lineItem.$error.locationError = 'openlmisForm.required';
            }
        }

        function validateQuantity(lineItem) {
            if (_.isEmpty(lineItem.quantity)) {
                lineItem.$error.quantityError = 'openlmisForm.required';
            }
        }

        function validateForm() {
            _.forEach(vm.addedLineItems, function(lineItems) {
                _.forEach(lineItems, function(lineItem, index) {
                    lineItem.$error = {};
                    if (lineItems.length > 1 && index === 0) {
                        return;
                    }
                    validateLotCodeRequired(lineItem);
                    validateLocationRequired(lineItem);
                    validateQuantity(lineItem);
                    validateQuantityMtSoh(lineItem);
                });
            });
            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        function isValid() {
            return _.every(vm.addedLineItems, function(lineItems) {
                return _.every(lineItems, function(lineItem) {
                    return _.chain(lineItem.$error)
                        .keys()
                        .all(function(key) {
                            return _.isEmpty(lineItem.$error[key]);
                        })
                        .value();
                });
            });
        }

        vm.submit = function() {
            validateForm();
            if (isValid()) {
                return;
            }
        };

        vm.deleteDraft = function() {

        };
    }

})();
