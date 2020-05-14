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
     * @ngdoc service
     * @name select-products-modal.selectProductsModalService
     *
     * @description
     * Modal for selecting products.
     */
    angular
        .module('requisition-view-tab')
        .service('selectProductsModalEmergencyService', service);

    service.$inject = ['openlmisModalService', 'paginationService', '$stateParams'];

    function service(openlmisModalService, paginationService, $stateParams) {
        var dialog;

        this.show = show;

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name show
         *
         * @description
         * Opens a modal responsible for selecting products.
         *
         * @param  {Array}   products the list of available products
         * @return {promise}          the promise resolving to a list of selected products
         */
        function show(products, amountCanAdd) {
            if (dialog) {
                return dialog.promise;
            }

            dialog = openlmisModalService.createDialog({
                controller: 'SelectProductsModalEmergencyController',
                controllerAs: 'vm',
                templateUrl: 'requisition-view-tab/select-products-modal-emergency.html',
                show: true,
                resolve: {
                    products: function() {
                        return paginationService.registerList(null, $stateParams,
                            function() {
                                return products;
                            });
                    },
                    amountCanAdd: function() {
                        return  amountCanAdd;
                    }
                }
            });

            dialog.promise.finally(function() {
                dialog = undefined;
            });

            return dialog.promise;
        }
    }

})();
