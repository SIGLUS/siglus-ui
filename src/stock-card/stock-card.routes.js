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

    angular
        .module('stock-card')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        // SIGLUS-REFACTOR: starts here
        var VIEW_PRODUCT_STOCK_CARD = 'viewProductStockCard';

        $stateProvider.state('openlmis.stockmanagement.stockCardSummaries.singleCard', {
            url: '/:stockCardId?orderable?isViewProductCard',
            showInNavigation: false,
            views: {
                '@openlmis': {
                    controller: 'StockCardController',
                    templateUrl: 'stock-card/stock-card.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
            resolve: {
                stockCard: function($stateParams, stockCardService, paginationService, StockCard, localStorageService) {
                    var stockCardResource;
                    var isViewProductCard = String($stateParams.isViewProductCard) === 'true';
                    var viewProductStockCard = angular.fromJson(localStorageService.get(VIEW_PRODUCT_STOCK_CARD));

                    if (isViewProductCard) {
                        stockCardResource = stockCardService.getProductStockCard(
                            $stateParams.orderable,
                            getVirtualProgramId(viewProductStockCard.orderable)
                        );
                    } else {
                        stockCardResource = stockCardService.getStockCard($stateParams.stockCardId);
                    }
                    return stockCardResource
                        .then(function(json) {
                            var stockCard = new StockCard(json);
                            //display new line item on top
                            stockCard.lineItems.reverse();
                            $stateParams.page = $stateParams.page ? $stateParams.page : 0;
                            $stateParams.size = '@@STOCKMANAGEMENT_PAGE_SIZE';
                            paginationService.registerList(null, $stateParams, function() {
                                return stockCard.lineItems;
                            }, {
                                customPageParamName: 'page',
                                customSizeParamName: 'size',
                                paginationId: 'stock-management-stock-card'
                            });
                            if (isViewProductCard) {
                                // use soh, orderable from Stock on Hand page which store in local storage
                                stockCard.stockOnHand = viewProductStockCard.stockOnHandOfOneProduct;
                                stockCard.orderable = viewProductStockCard.orderable;
                                stockCard.isViewProductCard = $stateParams.isViewProductCard;
                                delete stockCard.lot;
                            }
                            return stockCard;
                        });
                }
            }
        });
    }

    function getVirtualProgramId(orderable) {
        var program = _.find(orderable.programs, function(program) {
            return !!program.parentId;
        });
        return program && program.parentId;
    }
    // SIGLUS-REFACTOR: ends here
})();

