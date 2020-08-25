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
     * @name siglus-add-additional-product-modal.controller:SiglusAddAdditionalProductModalController
     *
     * @description
     * Manages Additional Products Modal.
     */
    angular
        .module('siglus-add-additional-product-modal')
        .controller('SiglusAddAdditionalProductModalController', controller);

    controller.$inject = [
        'orderables', '$state', 'selectProductsModalService', '$stateParams', 'alertService',
        'siglusAdminProgramAdditionalProductService', 'notificationService'
    ];

    function controller(orderables, $state, selectProductsModalService, $stateParams, alertService,
                        siglusAdminProgramAdditionalProductService, notificationService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.close = selectProductsModalService.reject;
        vm.search = search;
        vm.selectProducts = selectProducts;

        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SelectProductsModalController.
         */
        function onInit() {
            vm.orderables = orderables;
            vm.selections = selectProductsModalService.getSelections();
            vm.code = $stateParams.productCode;
            vm.name = $stateParams.productName;
        }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name search
         *
         * @description
         * Refreshes the product list so the add product dialog box shows only relevant products
         * without reloading parent state.
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.productCode = vm.code;
            stateParams.productName = vm.name;
            stateParams.addAdditionalProductPage = stateParams.productCode || stateParams.productName
                ? 0 : stateParams.addAdditionalProductPage;

            $state.go('.', stateParams, {
                reload: $state.$current.name,
                notify: false
            });
        }

        function selectProducts() {
            if (selectItems()) {
                siglusAdminProgramAdditionalProductService.addAdditionalProducts(getAdditionalProducts())
                    .then(function() {
                        notificationService.success('selectAdditionalProductModal.productHasBeenAdded');
                        $state.go('^', {}, {
                            reload: 'openlmis.administration.programs.settings.additionalProducts'
                        });
                    });
            } else {
                alertService.error('selectAdditionalProductModal.addProducts.emptyList');
            }
        }

        function selectItems() {
            return Object.keys(vm.selections).filter(function(orderableId) {
                return vm.selections[orderableId];
            }).length;
        }

        function getAdditionalProducts() {
            var additionalProducts = [];
            angular.forEach(vm.selections, function(selection) {
                var additionalProduct = {
                    programId: $stateParams.programId,
                    additionalOrderableId: selection.id,
                    orderableOriginProgramId: selection.program.id
                };
                additionalProducts.push(additionalProduct);
            });
            return additionalProducts;
        }

    }

})();
