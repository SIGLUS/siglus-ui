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
        .module('siglus-soh-product-print')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.locationManagement.stockOnHand.print', {
            url: '/print?program',
            showInNavigation: false,
            views: {
                '@openlmis': {
                    controller: 'SiglusSohPrintController',
                    templateUrl: 'siglus-location-stock-on-hand/'
                    + 'siglus-soh-product-print/siglus-soh-product-print.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                program: function(programService, $stateParams) {
                    return programService.get($stateParams.program);
                },
                stockCardSummaries: function($stateParams, siglusLocationStockOnHandService, facility) {
                    if (_.isEmpty($stateParams.program)) {
                        return [];
                    }
                    if ($stateParams.stockCardSummaries) {
                        return $stateParams.stockCardSummaries;
                    }
                    return siglusLocationStockOnHandService.getStockOnHandInfo(facility.id, $stateParams.program)
                        .then(function(stockCardSummaries) {
                            _.forEach(stockCardSummaries, function(stockCardSummary) {
                                stockCardSummary.stockCardDetails = _.filter(stockCardSummary.stockCardDetails,
                                    function(item) {
                                        return item.stockOnHand !== 0;
                                    });
                            });
                            return stockCardSummaries;
                        });
                },
                stockCardLineItems: function(prepareStockOnHandRowService, stockCardSummaries, $stateParams) {
                    if ($stateParams.stockCardLineItems) {
                        return $stateParams.stockCardLineItems;
                    }
                    return prepareStockOnHandRowService.prepareLines(stockCardSummaries);

                }
            }
        });
    }
})();

