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
        .module('siglus-location-stock-on-hand')
        .controller('SiglusLocationStockOnHandController', controller);

    controller.$inject = ['$window', 'stockCardSummaries', 'facility',
        'displayItems', 'user', 'siglusLocationCommonFilterService',
        'programs', 'paginationService',
        '$stateParams', '$state', 'stockCardLineItems'];

    function controller($window, stockCardSummaries, facility, displayItems, user, siglusLocationCommonFilterService,
                        programs, paginationService, $stateParams, $state, stockCardLineItems) {
        var vm = this;

        vm.stockCardSummaries = null;

        vm.displayItems = [];

        vm.program = null;

        vm.keyword = '';

        vm.facility = facility;

        vm.stockCardLineItems = null;

        vm.print = print;

        vm.$onInit = function() {
            vm.stockCardSummaries = stockCardSummaries;
            vm.keyword = $stateParams.keyword;
            vm.programs = programs;
            vm.program = _.find(vm.programs, function(item) {
                return $stateParams.program === item.id;
            });
            vm.stockCardLineItems = stockCardLineItems;
            vm.displayItems = displayItems;
            updateStateParams();
        };

        vm.viewDetail = function(lineItem) {
            if (lineItem.type === 'PRODUCT') {
                $state.go('openlmis.locationManagement.stockOnHand.productDetail', _.extend($stateParams, {
                    orderable: lineItem.orderableId
                }));
            } else if (lineItem.type === 'LOT') {
                $state.go('openlmis.locationManagement.stockOnHand.lotDetail', _.extend($stateParams, {
                    stockCardId: lineItem.stockCardId
                }));
            } else if (lineItem.type === 'LOCATION') {
                $state.go('openlmis.locationManagement.stockOnHand.locationDetail', _.extend($stateParams, {
                    stockCardId: lineItem.stockCardId,
                    locationCode: lineItem.locationCode
                }));
            }

        };

        function print() {
            var PRINT_URL = $window.location.href.split('!/')[0]
            + '!/'
            + 'locationManagement/stock-on-hand/print?program='
            + $stateParams.program;
            $window.open(
                PRINT_URL,
                '_blank'
            );
        }

        function updateStateParams() {
            $stateParams.programs = programs;
            $stateParams.facility = facility;
            $stateParams.stockCardSummaries = vm.stockCardSummaries;
            $stateParams.stockCardLineItems = vm.stockCardLineItems;
            $stateParams.user = user;
            $stateParams.program = _.get(vm.program, 'id');
            $stateParams.keyword = vm.keyword;
            $stateParams.pageNumber = getPageNumber();

        }

        function reloadPage() {
            updateStateParams();
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        function getPageNumber() {
            var items = siglusLocationCommonFilterService.filterList(vm.keyword, stockCardLineItems);
            var totalPages = Math.ceil(items.length / parseInt($stateParams.pageSize));
            var pageNumber = parseInt($stateParams.pageNumber || 0);
            if (pageNumber > totalPages - 1) {
                return totalPages > 0 ? totalPages - 1 : 0;
            }
            return pageNumber;
        }

        vm.searchProgram = function() {
            $stateParams.programs = programs;
            $stateParams.facility = facility;
            $stateParams.stockCardSummaries = null;
            $stateParams.stockCardLineItems = null;
            $stateParams.user = user;
            $stateParams.program = vm.program.id;
            $stateParams.keyword = vm.keyword;
            $stateParams.pageNumber = 0;
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        };

        vm.filterList = function() {
            reloadPage();
        };

        vm.cancelFilter = function() {
            vm.keyword = '';
            reloadPage();
        };
    }
})();
