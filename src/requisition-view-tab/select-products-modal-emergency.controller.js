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
     * @name select-products-modal.controller:SelectProductsModalController
     *
     * @description
     * Manages Select Products Modal.
     */
    angular
        .module('requisition-view-tab')
        .controller('SelectProductsModalEmergencyController', controller);

    controller.$inject = ['$scope', 'modalDeferred', 'products', 'amountCanAdd', 'alertService'];

    function controller($scope, modalDeferred, products, amountCanAdd, alertService) {
        var vm = this;

        vm.paginationId = 'select-products-modal-emergency';

        vm.$onInit = onInit;
        vm.selectProducts = selectProducts;
        vm.close = modalDeferred.reject;
        vm.search = search;

        vm.showSelectTooManyError = false;

        /**
         * @ngdoc property
         * @propertyOf select-products-modal.controller:SelectProductsModalController
         * @name products
         * @type {Array}
         *
         * @description
         * Holds a list of available products.
         */
        vm.products = undefined;

        /**
         * @ngdoc property
         * @propertyOf select-products-modal.controller:SelectProductsModalController
         * @name searchText
         * @type {String}
         *
         * @description
         * Holds text entered in product search box.
         */
        vm.searchText = undefined;

        /**
         * @ngdoc property
         * @propertyOf select-products-modal.controller:SelectProductsModalController
         * @type {Object}
         * @name selections
         *
         * @description
         * The maps storing information about selected products.
         */
        vm.selections = undefined;

        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SelectProductsModalController.
         */
        function onInit() {
            vm.products = products;
            vm.searchText = '';
            vm.selections = {};
            vm.search();
        }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name selectProducts
         *
         * @description
         * Resolves promise with products selected in the modal.
         */
        function selectProducts() {
            var selectedProducts = vm.products.filter(function(orderable) {
                return vm.selections[orderable.id];
            });

            if (selectedProducts.length < 1) {
                alertService.error('selectProductsModal.addProducts.emptyList');
            } else if (selectedProducts.length > amountCanAdd) {
                vm.showSelectTooManyError = true;
            } else {
                vm.showSelectTooManyError = false;
                modalDeferred.resolve(selectedProducts);
            }
        }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name search
         *
         * @description
         * Refreshes the product list so the add product dialog box shows only relevant products.
         */
        function search() {
            if (vm.searchText) {
                vm.filteredProducts = vm.products.filter(searchByCodeAndName);
            } else {
                vm.filteredProducts = vm.products;
            }
        }

        function searchByCodeAndName(product) {
            var searchText = vm.searchText.toLowerCase();
            var foundInFullProductName;
            var foundInProductCode;

            if (product.productCode !== undefined) {
                foundInProductCode = product.productCode.toLowerCase().startsWith(searchText);
            }

            if (product.fullProductName !== undefined) {
                foundInFullProductName = product.fullProductName.toLowerCase().contains(searchText);
            }
            return foundInFullProductName || foundInProductCode;
        }

        $scope.$watch('vm.selections', function(newVal) {
            var count = 0;
            for (var key in newVal) {
                if (newVal.hasOwnProperty(key) && newVal[key]) {
                    count++;
                }
            }
            vm.showSelectTooManyError = count >= amountCanAdd;
        }, true);
    }

})();
