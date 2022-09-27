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
     * @name stock-add-products-modal.controller:AddProductsModalController
     *
     * @description
     * Manages Add Products Modal.
     */
    angular
        .module('stock-add-products-modal-with-location')
        .controller('SiglusAddProductsModalWithLocationController', controller);

    controller.$inject = ['items', 'hasLot', 'messageService',
        'modalDeferred', 'orderableGroupService', '$scope', 'MAX_INTEGER_VALUE',
        'locationCode', 'siglusOrderableLotService'];

    function controller(items, hasLot, messageService,
                        modalDeferred, orderableGroupService, $scope, MAX_INTEGER_VALUE,
                        locationCode, siglusOrderableLotService) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name items
         * @type {Array}
         *
         * @description
         * All products available for users to choose from.
         */
        vm.items = items;
        vm.selectedItem = {
            isInModal: false
        };
        vm.withLocation = true;
        vm.locationCode = locationCode;
        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name hasLot
         * @type {Array}
         *
         * @description
         * Indicates if any line item has lot. If all line items have not lot, page will not display
         *   any lot related information.
         */
        vm.hasLot = hasLot;
        /**
         * @ngdoc property
         * @propertyOf stock-add-products-modal.controller:AddProductsModalController
         * @name addedItems
         * @type {Array}
         *
         * @description
         * Products that users have chosen in this modal.
         */
        vm.addedItems = [];

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name orderableSelectionChanged
         *
         * @description
         * Reset form status and change content inside lots drop down list.
         */
        vm.orderableSelectionChanged = function() {
            //reset selected lot, so that lot field has no default value
            vm.selectedLot = null;

            //same as above
            $scope.productForm.$setUntouched();

            //make form good as new, so errors won't persist
            $scope.productForm.$setPristine();

            var addedItems = vm.selectedOrderableGroup;
            if (addedItems) {
                siglusOrderableLotService.fillLotsToAddedItems(addedItems);
                var selectedItem = addedItems[0];
                selectedItem.locationCode = locationCode;
                if (selectedItem.lot && selectedItem.lot.lotCode) {
                    selectedItem.lot.lotCode = null;
                    selectedItem.lot.expirationDate = null;
                    selectedItem.lot.id = null;
                }
                vm.selectedItem = selectedItem;
            } else {
                vm.selectedItem = {};
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name addOneProduct
         *
         * @description
         * Add the currently selected product into the table beneath it for users to do further actions.
         */
        vm.addOneProduct = function() {
            if (vm.selectedOrderableGroup === null || vm.selectedOrderableGroup === undefined) {
                return undefined;
            }
            var selectedItem = angular.copy(vm.selectedOrderableGroup[0]);
            var addedItems = angular.copy(vm.addedItems);
            selectedItem.$errors = {};
            selectedItem.skipped = false;
            var notAlreadyAdded = selectedItem && !_.contains(vm.addedItems, selectedItem);

            if (notAlreadyAdded) {
                vm.addedItems = addedItems.concat(selectedItem);
                var hasAddedLotCode = _.map(vm.addedItems, function(item) {
                    return item.lot && item.lot.lotCode;
                });
                vm.selectedItem.lotOptions = _.filter(vm.selectedItem.lotOptions, function(lot) {
                    return !_.contains(hasAddedLotCode, lot.lotCode);
                });
                vm.selectedItem.lot.lotCode = null;
                vm.selectedItem.lot.expirationDate = null;
                vm.selectedItem.lot.id = null;
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name removeAddedProduct
         *
         * @description
         * Removes an already added product and reset its quantity value.
         */
        vm.removeAddedProduct = function(item) {
            item.quantity = undefined;
            item.quantityMissingError = undefined;
            vm.addedItems = _.without(vm.addedItems, item);
        };

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name validate
         *
         * @description
         * Validate if quantity is filled in by user.
         */
        vm.validate = function(item) {
            if (!item.quantity) {
                item.quantityInvalid = messageService.get('stockAddProductsModal.required');
            } else if (item.quantity > MAX_INTEGER_VALUE) {
                item.quantityInvalid = messageService.get('stockmanagement.numberTooLarge');
            } else {
                item.quantityInvalid = undefined;
            }
        };

        /**
         * @ngdoc method
         * @methodOf stock-add-products-modal.controller:AddProductsModalController
         * @name confirm
         *
         * @description
         * Confirm added products and close modal. Will not close modal if any quanity not filled in.
         */
        vm.confirm = function() {
            //some items may not have been validated yet, so validate all here.
            _.forEach(vm.addedItems, function(item) {
                vm.validate(item);
            });

            $scope.$broadcast('openlmis-form-submit');

            // SIGLUS-REFACTOR: remove added products
            modalDeferred.resolve(angular.copy(vm.addedItems));
            _.forEach(vm.addedItems, function(item) {
                return vm.removeAddedProduct(item);
            });
            // SIGLUS-REFACTOR: ends here
        };

        modalDeferred.promise.catch(function() {
            _.forEach(vm.addedItems, function(item) {
                item.quantity = undefined;
                item.quantityInvalid = undefined;
            });
        });

        //this function will initiate product select options
        function onInit() {
            vm.orderableGroups = orderableGroupService.groupByOrderableId(items);
        }

        onInit();
    }
})();