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
        .module('siglus-analytics-report-stock-movement')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {

        $stateProvider.state('openlmis.analyticsReport.stockStatus.stockMovement', {
            url: '/stockMovement?facilityId&orderableId&productName&productCode',
            showInNavigation: false,
            label: 'stock.movement.title',
            priority: 9,
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportStockMovementController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-stock-movement/siglus-analytics-report-stock-movement.html'
                }
            },
            resolve: {
                facility: function(facilityService, $stateParams) {
                    return facilityService.get($stateParams.facilityId);
                },
                stockMovements: function($stateParams, siglusLocationStockOnHandService) {
                    var stockMovementResource = siglusLocationStockOnHandService
                        .getStockCardForProduct($stateParams.orderableId,
                            $stateParams.facilityId);
                    return stockMovementResource.then(function(data) {
                        return data.lineItems;
                    });
                }

            }
        });
    }

})();
