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
        .module('siglus-physical-inventory-history-detail')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider) {
        $stateProvider
            .state('openlmis.stockmanagement.print', {
                url: '/physicalInventory/history/detail/print/:historyId',
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-physical-inventory-history-detail/' +
                            'siglus-physical-inventory-history-print/siglus-physical-inventory-history-print.html',
                        controller: 'PhysicalInventoryHistoryPrintController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    orderablesPrice: function(siglusOrderableLotService) {
                        return siglusOrderableLotService.getOrderablesPrice();
                    },
                    historyData: function($stateParams, SiglusPhysicalInventoryHistoryService, localStorageService,
                        orderablesPrice) {
                        var historyData = JSON.parse(localStorageService.get('historyData'));
                        return historyData ? historyData :
                            SiglusPhysicalInventoryHistoryService.getHistoryDetail($stateParams.historyId)
                                .then(function(detail) {
                                    detail.lineItemsData.forEach(function(line) {
                                        line.price = orderablesPrice.data[_.get(line, 'orderableId')] || null;
                                    });
                                    return detail;
                                });
                    }
                }
            });
    }
})();
