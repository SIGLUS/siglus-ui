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
        .module('select-products-modal')
        .service('selectProductsModalService', service);

    service.$inject = ['$q', '$state'];

    function service($q, $state) {
        var deferred,
            selections,
            products,
            // SIGLUS-REFACTOR: starts here
            limit;
            // SIGLUS-REFACTOR: ends here

        this.show = show;
        this.getSelections = getSelections;
        this.getOrderables = getOrderables;
        // SIGLUS-REFACTOR: starts here
        this.getLimit = getLimit;
        // SIGLUS-REFACTOR: ends here
        this.resolve = resolve;
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
        function show(config) {
            deferred = $q.defer();

            products = config ? config.products : undefined;
            selections = config && config.selections ? angular.copy(config.selections) : {};
            // SIGLUS-REFACTOR: starts here
            limit = config && config.limit ? config.limit : undefined;
            // SIGLUS-REFACTOR: ends here

            var stateParams = {};
            stateParams.productName = undefined;
            stateParams.productCode = undefined;
            $state.go('.addOrderables', stateParams, {
                notify: false
            });

            return deferred.promise;
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

        // SIGLUS-REFACTOR: starts here
        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name getLimit
         *
         * @description
         * Returns selection limit.
         *
         * @return {promise}          the promise resolving to a limit
         */
        function getLimit() {
            return limit;
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf select-products-modal.selectProductsModalService
         * @name resolve
         *
         * @description
         * Resolves selected products. Returns to the parent state without reloading it.
         *
         * @param  {Array}   products the list of available products
         * @return {promise}          the promise resolving to a list of selected products
         */
        function resolve() {
            $state.go('^', {}, {
                notify: false
            });
            deferred.resolve(_.values(selections).filter(function(selection) {
                return selection;
            }));
        }

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
