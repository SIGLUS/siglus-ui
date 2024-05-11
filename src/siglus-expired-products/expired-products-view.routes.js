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
        .module('siglus-expired-products')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider
            .state('openlmis.locationManagement.expiredProducts', {
                url: '/expiredProducts',
                label: 'expiredProducts.title',
                priority: -1,
                showInNavigation: true,
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-expired-products/expired-products-view.html',
                        controller: 'ExpiredProductsViewController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pageNumber: '0',
                    pageSize: '10',
                    keyword: undefined,
                    orderablesPrice: undefined,
                    expiredProducts: undefined
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
                resolve: {
                    user: function(authorizationService) {
                        return authorizationService.getUser();
                    },
                    facility: function(facilityFactory) {
                        return facilityFactory.getUserHomeFacility();
                    },
                    orderablesPrice: function($stateParams, siglusOrderableLotService) {
                        if ($stateParams.orderablesPrice) {
                            return $stateParams.orderablesPrice;
                        }
                        return siglusOrderableLotService.getOrderablesPrice();
                    },
                    expiredProducts: function(facility, $stateParams, expiredProductsViewService) {
                        if ($stateParams.expiredProducts) {
                            return $stateParams.expiredProducts;
                        }
                        return expiredProductsViewService.getExpiredProducts(facility.id,
                            facility.enableLocationManagement);
                    },
                    displayItems: function(expiredProducts, orderablesPrice, $stateParams, paginationService,
                        expiredProductsViewService) {
                        $stateParams.orderablesPrice = orderablesPrice;
                        $stateParams.expiredProducts = expiredProducts;
                        var paginationParams = {
                            pageNumber: $stateParams.pageNumber,
                            pageSize: $stateParams.pageSize
                        };
                        return paginationService.registerList(null, paginationParams, function() {
                            return expiredProductsViewService.filterList($stateParams.keyword, expiredProducts);
                        }, {
                            customPageParamName: 'pageNumber',
                            customSizeParamName: 'pageSize'
                        });
                    }
                }
            })
            .state('openlmis.stockmanagement.expiredProducts', {
                url: '/expiredProducts',
                label: 'expiredProducts.title',
                priority: -1,
                showInNavigation: true,
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-expired-products/expired-products-view.html',
                        controller: 'ExpiredProductsViewController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    pageNumber: '0',
                    pageSize: '20',
                    keyword: undefined,
                    orderablesPrice: undefined,
                    expiredProducts: undefined
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
                resolve: {
                    user: function(authorizationService) {
                        return authorizationService.getUser();
                    },
                    facility: function(facilityFactory) {
                        return facilityFactory.getUserHomeFacility();
                    },
                    orderablesPrice: function($stateParams, siglusOrderableLotService) {
                        if ($stateParams.orderablesPrice) {
                            return $stateParams.orderablesPrice;
                        }
                        return siglusOrderableLotService.getOrderablesPrice();
                    },
                    expiredProducts: function(facility, $stateParams, expiredProductsViewService) {
                        if ($stateParams.expiredProducts) {
                            return $stateParams.expiredProducts;
                        }
                        return expiredProductsViewService.getExpiredProducts(facility.id,
                            facility.enableLocationManagement);
                    },
                    displayItems: function(expiredProducts, orderablesPrice, $stateParams, paginationService,
                                           expiredProductsViewService) {
                        $stateParams.orderablesPrice = orderablesPrice;
                        $stateParams.expiredProducts = expiredProducts;
                        var paginationParams = {
                            pageNumber: $stateParams.pageNumber,
                            pageSize: $stateParams.pageSize
                        };
                        return paginationService.registerList(null, paginationParams, function() {
                            return expiredProductsViewService.filterList($stateParams.keyword, expiredProducts);
                        }, {
                            customPageParamName: 'pageNumber',
                            customSizeParamName: 'pageSize'
                        });
                    }
                }
            });
    }
})();
