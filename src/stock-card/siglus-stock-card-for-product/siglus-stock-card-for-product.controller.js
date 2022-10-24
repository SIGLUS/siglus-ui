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
     * @name stock-card.controller:StockCardController
     *
     * @description
     * Controller in charge of displaying one single stock card.
     */
    angular
        .module('siglus-stock-card-for-product')
        .controller('StockCardForProductController', controller);

    controller.$inject = ['$scope', 'stockCard', '$state', '$window', 'stockCardService', 'confirmService',
        'loadingModalService', 'notificationService', '$stateParams', 'paginationService', 'stockCardDataService',
        'localStorageService'];

    function controller($scope, stockCard, $state, $window, stockCardService, confirmService, loadingModalService,
                        notificationService, $stateParams, paginationService, stockCardDataService,
                        localStorageService) {
        var vm = this;

        vm.$onInit = onInit;

        vm.stockCard = [];

        vm.displayItems = [];

        vm.canArchive = false;

        vm.print = function() {
            localStorageService.add('stockCardInfoForPrint', angular.toJson(stockCard));
            var PRINT_URL = $window.location.href.split('!/')[0] +
                '!/stockmanagement/productPrint';
            if ($stateParams.isArchivedProducts) {
                PRINT_URL += '?isArchived=true';
            }
            $window.open(PRINT_URL, '_blank');
        };

        vm.getProductName = function() {
            var unit = vm.stockCard.displayUnit;
            return _.isEmpty(unit) ? vm.stockCard.productName : vm.stockCard.productName + ' - ' + unit;
        };

        vm.archive = function() {
            confirmService.confirmDestroy('stockCard.archiveProduct', 'stockCard.archive', 'stockCard.cancel')
                .then(function() {
                    loadingModalService.open();
                    stockCardService.archiveProduct(stockCard.orderableId).then(function() {
                        notificationService.success('stockCard.archiveProduct.success');
                        delete $state.params.keyword;
                        $state.go('openlmis.stockmanagement.archivedProductSummaries', Object.assign($state.params, {
                            program: stockCard.programId,
                            page: 0
                        }));
                    }, function() {
                        loadingModalService.close();
                        notificationService.error('stockCard.archiveProduct.failure');
                    });
                });
        };

        // #105: activate product
        vm.activate = function() {
            confirmService.confirm('stockCard.activateProduct', 'stockCard.activate', 'stockCard.cancel')
                .then(function() {
                    loadingModalService.open();
                    stockCardService.activateProduct(stockCard.orderableId).then(function() {
                        notificationService.success('stockCard.activateProduct.success');
                        delete $state.params.keyword;
                        $state.go('openlmis.stockmanagement.stockCardSummaries', Object.assign($state.params, {
                            program: stockCard.programId,
                            page: 0
                        }));
                    }, function() {
                        loadingModalService.close();
                        notificationService.error('stockCard.activateProduct.failure');
                    });
                });
        };
        // #105: ends here

        function onInit() {
            $state.current.label = stockCard.productName;
            vm.stockCard = stockCard;
            vm.displayItems = stockCard.lineItems;
            $stateParams.stockCard = vm.stockCard;
            vm.canArchive = stockCard.stockOnHand === 0 && stockCard.lineItems[0].productSoh === 0 && !stockCard.inKit;
            paginationService.registerList(null, angular.copy($stateParams), function() {
                return vm.displayItems;
            });

            $scope.$on('$stateChangeStart', function(_e, toState, _toParams, fromState) {
                if (toState.name !== fromState.name) {
                    stockCardDataService.clear();
                }
            });
        }
    }
})();
