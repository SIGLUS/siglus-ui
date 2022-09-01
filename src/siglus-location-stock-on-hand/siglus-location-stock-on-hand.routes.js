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
        .module('siglus-location-stock-on-hand')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.stockOnHand', {
            url: '/stock-on-hand?program&pageNumber&pageSize&keyword',
            label: 'stockCardSummaryList.stockOnHand',
            priority: 3,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'SiglusLocationStockOnHandController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-location-stock-on-hand/siglus-location-stock-on-hand.html'
                }
            },
            params: {
                pageNumber: '0',
                pageSize: '10',
                user: undefined,
                facility: undefined,
                programs: undefined,
                stockCardSummaries: undefined,
                stockCardLineItems: undefined
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            resolve: {
                user: function(authorizationService, $stateParams) {
                    if ($stateParams.user) {
                        return $stateParams.user;
                    }
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory, $stateParams) {
                    if ($stateParams.facility) {
                        return $stateParams.facility;
                    }
                    return facilityFactory.getUserHomeFacility();
                },
                programs: function(user, $q, programService, stockProgramUtilService, $stateParams) {
                    if ($stateParams.programs) {
                        return $stateParams.programs;
                    }
                    return $q.all([
                        programService.getAllProductsProgram(),
                        stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW)
                    ]).then(function(responses) {
                        return responses[0].concat(responses[1]);
                    });
                },
                stockCardSummaries: function($stateParams, siglusLocationStockOnHandService, facility) {
                    if (_.isEmpty($stateParams.program)) {
                        return [];
                    }
                    if ($stateParams.stockCardSummaries) {
                        return $stateParams.stockCardSummaries;
                    }
                    return siglusLocationStockOnHandService.getStockOnHandInfo(facility.id, $stateParams.program);
                },
                stockCardLineItems: function(prepareStockOnHandRowService, stockCardSummaries, $stateParams) {
                    if ($stateParams.stockCardLineItems) {
                        return $stateParams.stockCardLineItems;
                    }
                    return prepareStockOnHandRowService.prepareLines(stockCardSummaries);

                },
                displayItems: function(stockCardLineItems, siglusLocationCommonFilterService,
                    $stateParams, paginationService) {
                    return paginationService.registerList(null, $stateParams, function() {
                        return  siglusLocationCommonFilterService
                            .filterList($stateParams.keyword, stockCardLineItems);
                    }, {
                        customPageParamName: 'pageNumber',
                        customSizeParamName: 'pageSize'
                    });
                }
            }
        });
    }
})();
