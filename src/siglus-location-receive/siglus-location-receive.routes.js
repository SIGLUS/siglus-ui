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
        .module('siglus-location-receive')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'ADJUSTMENT_TYPE', 'MODULE_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, ADJUSTMENT_TYPE, MODULE_TYPE) {
        $stateProvider.state('openlmis.locationManagement.receive', {
            url: '/receive',
            label: 'stockReceive.receive',
            priority: 5,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'StockIssueInitialController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-receive/stock-receive-initial.html'
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
                    return programService.getAllProductsProgram();
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.RECEIVE;
                },
                moduleType: function() {
                    return MODULE_TYPE.LOCATION_MANAGEMENT;
                }
            }
        });
    }
})();
