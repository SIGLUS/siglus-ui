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
        .module('stock-unpack-kit')
        .config(routes);

    // SIGLUS-REFACTOR: removed parameter ADJUSTMENT_TYPE
    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];
    // SIGLUS-REFACTOR: ends here

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.kitunpack', {
            url: '/unpack',
            label: 'stockUnpackKit.unpack',
            priority: 7,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    // SIGLUS-REFACTOR:  replaced controller and templateUrl
                    // controller: 'StockAdjustmentController'
                    // templateUrl: 'stock-adjustment/stock-adjustment.html
                    controller: 'SiglusKitUnpackController',
                    controllerAs: 'vm',
                    templateUrl: 'stock-unpack-kit/siglus-stock-kit-unpack.html'
                    // SIGLUS-REFACTOR: ends here
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            resolve: {
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },

                // SIGLUS-REFACTOR: removed user，programs，adjustmentType and added unpackKits
                /*user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programs: function(user, stockProgramUtilService) {
                    return stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST);
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.KIT_UNPACK;
                }*/
                unpackKits: function(facility, siglusStockKitUnpackService) {
                    return siglusStockKitUnpackService.getUnpackKits(facility.id);
                }
                // SIGLUS-REFACTOR: ends here
            }
        });
    }
})();
