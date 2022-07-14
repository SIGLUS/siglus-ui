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
        .module('stock-issue')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.stockmanagement.issue', {
            url: '/issue',
            label: 'stockIssue.issue',
            priority: 5,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'StockIssueInitialController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-issue/stock-issue-initial.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            resolve: {
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programs: function(programService) {
                    // SIGLUS-REFACTOR: get all products
                    return programService.getAllProductsProgram();
                    // SIGLUS-REFACTOR: ends here
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ISSUE;
                },
                issueToInfo: function(programs, facility, adjustmentType, siglusStockIssueService) {
                    return siglusStockIssueService.queryIssueToInfo(
                        _.get(programs, [0, 'id']), facility.id, adjustmentType.state
                    );
                }
                // SIGLUS-REFACTOR: starts here
            }
        });
    }
})();
