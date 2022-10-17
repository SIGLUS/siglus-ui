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
        .module('siglus-stock-card-print')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.stockmanagement.stockCardSummaries.print', {
            url: '/print?pragram',
            showInNavigation: false,
            priority: 99,
            views: {
                '@openlmis': {
                    controller: 'StockCardPrintController',
                    templateUrl: 'stock-card/'
                    + 'siglus-stock-card-print/siglus-stock-card-print.html',
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
                displayTableLineItems: function(localStorageService) {
                    return localStorageService.get('stockCardSummariesPrint');
                }
            }
        });
    }
})();

