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
        .module('siglus-location-archived-product')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.archivedProductSummaries', {
            // eslint-disable-next-line max-len
            url: '/archivedProduct?facility&program&supervised&archivedStockCardListPage&archivedStockCardListSize&keyword',
            label: 'stockCardSummaryList.archivedProduct',
            priority: -1,
            showInNavigation: true,
            params: {
                isArchivedProducts: true,
                isLocationManagement: true
            },
            views: {
                '@openlmis': {
                    controller: 'StockCardSummaryListController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-archived-product/siglus-location-archived-product-summary-list.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW],
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                programs: function(user, $q, programService, stockProgramUtilService) {
                    return $q.all([
                        programService.getAllProductsProgram(),
                        stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW)
                    ]).then(function(responses) {
                        return responses[0].concat(responses[1]);
                    });
                },
                stockCardSummaries: function(user, paginationService, StockCardSummaryRepository,
                    StockCardSummaryRepositoryImpl, $stateParams, STOCKMANAGEMENT_RIGHTS, stockCardDataService) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        if (stateParams.program) {
                            var paramsCopy = angular.copy(stateParams);

                            paramsCopy.facilityId = stateParams.facility;
                            paramsCopy.programId = stateParams.program;
                            paramsCopy.nonEmptyOnly = true;
                            paramsCopy.archivedOnly = true;
                            paramsCopy.rightName = STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW;

                            var savedSummary = stockCardDataService.getSummary(paramsCopy);
                            if (savedSummary) {
                                return savedSummary;
                            }
                            paramsCopy.page = 0;
                            paramsCopy.size = 2147483647;

                            delete paramsCopy.facility;
                            delete paramsCopy.program;
                            delete paramsCopy.supervised;
                            delete paramsCopy.isArchivedProducts;
                            delete paramsCopy.isLocationManagement;

                            return new StockCardSummaryRepository(new StockCardSummaryRepositoryImpl())
                                .query(paramsCopy)
                                .then(function(result) {
                                    var summary = result.content;
                                    stockCardDataService.setSummary(paramsCopy, {
                                        content: summary,
                                        totalElements: summary.length
                                    });
                                    return stockCardDataService.getDisplaySummary(stateParams);
                                });
                        }
                        return [];
                    }, {
                        paginationId: 'archivedStockCardList'
                    });
                }
            }
        });
    }
})();
