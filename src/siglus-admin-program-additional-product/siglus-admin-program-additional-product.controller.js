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
     * @name siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
     *
     * @description
     * Controller for program settings edit screen.
     */
    angular
        .module('siglus-admin-program-additional-product')
        .controller('SiglusAdminProgramAdditionalProductController', controller);

    controller.$inject = [
        '$stateParams', '$state', 'allPrograms', 'additionalProducts', '$filter', 'confirmService',
        'siglusAdminProgramAdditionalProductService', 'loadingModalService', 'notificationService',
        'selectProductsModalService'
    ];

    function controller($stateParams, $state, allPrograms, additionalProducts, $filter, confirmService,
                        siglusAdminProgramAdditionalProductService, loadingModalService, notificationService,
                        selectProductsModalService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.addAdditionalProducts = addAdditionalProducts;
        vm.remove = remove;
        /**
         * @ngdoc property
         * @propertyOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name additionalProductsProgram
         * @type {Object}
         *
         * @description
         * Holds program to filter.
         */
        vm.additionalProductsProgram = undefined;

        /**
         * @ngdoc property
         * @propertyOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name allPrograms
         * @type {Object}
         *
         * @description
         * Holds allPrograms to filter.
         */
        vm.allPrograms = undefined;

        /**
         * @ngdoc property
         * @propertyOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name additionalProducts
         * @type {Object}
         *
         * @description
         * Holds additionalProducts to display.
         */
        vm.additionalProducts = undefined;

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            vm.allPrograms = allPrograms;
            vm.additionalProducts = _.map(additionalProducts, function(additionalProduct) {
                additionalProduct.program = _.find(vm.allPrograms, function(program) {
                    return program.id === additionalProduct.orderableOriginProgramId;
                });
                return additionalProduct;
            });

            if ($stateParams.code) {
                vm.productCode = $stateParams.code;
            }

            if ($stateParams.name) {
                vm.productName = $stateParams.name;
            }

            if ($stateParams.orderableOriginProgramId) {
                vm.additionalProductsProgram = $filter('filter')(vm.allPrograms, {
                    id: $stateParams.orderableOriginProgramId
                })[0];
            }
        }

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name search
         *
         * @description
         * Retrieves the list of additional products matching the selected code, name, program
         *
         * @return {Array} the list of additional products
         */
        function search() {
            var stateParams = angular.copy($stateParams);

            stateParams.code = vm.productCode ? vm.productCode : null;
            stateParams.name = vm.productName ? vm.productName : null;
            stateParams.orderableOriginProgramId = vm.additionalProductsProgram ?
                vm.additionalProductsProgram.id : null;
            stateParams.additionalProductPage = stateParams.code || stateParams.name
            || stateParams.orderableOriginProgramId ? 0 : stateParams.additionalProductPage;

            $state.go('openlmis.administration.programs.settings.additionalProducts', stateParams, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name addAdditionalProducts
         *
         * @description
         * Add a additional product.
         *
         */
        function addAdditionalProducts() {
            loadingModalService.open();
            selectProductsModalService.show({
                state: '.addAdditionalProduct'
            });
        }

        /**
         * @ngdoc method
         * @methodOf siglus-admin-program-additional-product.controller:SiglusAdminProgramAdditionalProductController
         * @name remove
         *
         * @description
         * Remove a additional product from added additional products.
         *
         * @param {Object} additionalProduct additional product to be removed.
         */
        function remove(additionalProduct) {
            return confirmService.confirm(
                'adminProgramAdditionalProducts.question'
            )
                .then(function() {
                    loadingModalService.open();

                    return siglusAdminProgramAdditionalProductService.remove(additionalProduct.id)
                        .then(function() {
                            notificationService.success('adminProgramAdditionalProducts.productHasBeenRemoved');
                            search();
                        })
                        .catch(function() {
                            notificationService.error('adminProgramAdditionalProducts.failedToRemoveProduct');
                            loadingModalService.close();
                        });
                });
        }
    }
})();
