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
     * @name siglus-remaining-products-modal.siglusRemainingProductsModalService
     *
     * @description
     * Modal for selecting products.
     */
    angular
        .module('siglus-remaining-products-modal')
        .service('siglusRemainingProductsModalService', service);

    service.$inject = ['$state', 'openlmisModalService'];

    function service($state, openlmisModalService) {
        var deferred,
            selections,
            products;

        this.show = show;
        this.getSelections = getSelections;
        this.getOrderables = getOrderables;
        // SIGLUS-REFACTOR: starts here
        // SIGLUS-REFACTOR: ends here
        this.reject = reject;

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name show
         *
         * @description
         * Opens a modal responsible for selecting products and cleans out searching.
         *
         * @param  {Array}   products the list of available products
         * @return {promise}          the promise resolving to a list of selected products
         */
        function show(items) {
            return openlmisModalService.createDialog(
                {
                    controller: 'siglusRemainingProductsModalController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-remaining-products-modal/siglus-remaining-products-modal.html',
                    show: true,
                    resolve: {
                        items: function() {
                            return items;
                        }
                    }
                }
            ).promise.finally(function() {
                angular.element('.popover').popover('destroy');
            });
        }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name getSelections
         *
         * @description
         * Returns a list of selected products.
         *
         * @return {promise}          the promise resolving to a list of selected products
         */
        function getSelections() {
            return selections;
        }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name getOrderables
         *
         * @description
         * Returns all products.
         *
         * @return {promise}          the promise resolving to a list of all products
         */
        function getOrderables() {
            return products;
        }

        // function close() {
        //     openlmisModalService.$hide();
        // }

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name reject
         *
         * @description
         * Rejects changes. Returns to the parent state without reloading it.
         */
        function reject() {
            $state.go('^', {}, {
                notify: false
            });
            deferred.reject();
        }
    }

})();
