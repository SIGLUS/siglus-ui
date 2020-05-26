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
     * @name stock-card-summary-list.controller:StockCardSummaryListController
     *
     * @description
     * Controller responsible displaying Stock Card Summaries.
     */
    angular
        .module('stock-card-summary-list')
        .controller('StockCardSummaryListController', controller);

    // SIGLUS-REFACTOR: add 'user', 'facility', 'programs', 'localStorageService'
    controller.$inject = [
        'loadingModalService', '$state', '$stateParams', 'StockCardSummaryRepositoryImpl', 'stockCardSummaries',
        'user', 'facility', 'programs', 'localStorageService'
    ];
    // SIGLUS-REFACTOR: ends here

    function controller(loadingModalService, $state, $stateParams, StockCardSummaryRepositoryImpl, stockCardSummaries,
                        user, facility, programs, localStorageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.loadStockCardSummaries = loadStockCardSummaries;
        vm.viewSingleCard = viewSingleCard;
        vm.print = print;

        // SIGLUS-REFACTOR: starts here
        var VIEW_PRODUCT_STOCK_CARD = 'viewProductStockCard';
        vm.viewProductStockCard = viewProductStockCard;

        vm.programs = [];
        vm.program = null;
        vm.facility = facility;
        vm.isArchivedProducts = false;

        /**
         * @ngdoc property
         * @propertyOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name stockCardSummaries
         * @type {Array}
         *
         * @description
         * List of Stock Card Summaries.
         */
        vm.stockCardSummaries = [];

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name getStockSummaries
         *
         * @description
         * Initialization method for StockCardSummaryListController.
         */
        function onInit() {
            vm.stockCardSummaries = stockCardSummaries;
            vm.programs = programs;
            vm.program = _.find(programs, function(p) {
                return p.id === $stateParams.program;
            });
            vm.isArchivedProducts = $stateParams.isArchivedProducts;
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name loadStockCardSummaries
         *
         * @description
         * Responsible for retrieving Stock Card Summaries based on selected program and facility.
         */
        function loadStockCardSummaries() {
            var stateParams = angular.copy($stateParams);

            stateParams.facility = vm.facility && vm.facility.id;
            stateParams.program = vm.program && vm.program.id;
            stateParams.supervised = vm.isSupervised;

            $state.go(
                vm.isArchivedProducts
                    ? 'openlmis.stockmanagement.archivedProductSummaries'
                    : 'openlmis.stockmanagement.stockCardSummaries',
                stateParams,
                {
                    reload: true
                }
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name viewSingleCard
         *
         * @description
         * Go to the clicked stock card's page to view its details.
         *
         * @param {string} stockCardId the Stock Card UUID
         */
        function viewSingleCard(stockCardId) {
            $state.go(
                vm.isArchivedProducts
                    ? 'openlmis.stockmanagement.archivedProductSummaries.singleCard'
                    : 'openlmis.stockmanagement.stockCardSummaries.singleCard',
                {
                    stockCardId: stockCardId,
                    isViewProductCard: false,
                    page: 0
                }
            );
        }

        /**
         * @ngdoc method
         * @methodOf stock-card-summary-list.controller:StockCardSummaryListController
         * @name print
         *
         * @description
         * Print SOH summary of current selected program and facility.
         */
        function print() {
            new StockCardSummaryRepositoryImpl().print(vm.program.id, vm.facility.id);
        }

        function viewProductStockCard(viewProductCardObject) {
            var stateParams = angular.copy($stateParams);

            // store the view product stock card object in local storage
            localStorageService.add(VIEW_PRODUCT_STOCK_CARD, angular.toJson(viewProductCardObject));
            stateParams.orderable = viewProductCardObject.orderable && viewProductCardObject.orderable.id;
            stateParams.isViewProductCard = true;
            stateParams.page = 0;
            $state.go(
                vm.isArchivedProducts
                    ? 'openlmis.stockmanagement.archivedProductSummaries.singleCard'
                    : 'openlmis.stockmanagement.stockCardSummaries.singleCard',
                stateParams
            );
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
