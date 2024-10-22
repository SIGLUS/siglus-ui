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
            .state('openlmis.stockmanagement.history', {
                url: '/physicalInventory/history/detail?historyId',
                label: 'stockPhysicalInventoryHistory.viewPhysicalInventory',
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-physical-inventory-history-detail/' +
                            'siglus-physical-inventory-history-detail.html',
                        controller: 'PhysicalInventoryHistoryDetailController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    facility: undefined,
                    program: undefined,
                    historyId: undefined
                },
                resolve: {
                    facility: function($stateParams) {
                        return $stateParams.facility;
                    },
                    program: function($stateParams) {
                        return $stateParams.program;
                    },
                    historyId: function($stateParams) {
                        return $stateParams.historyId;
                    },
                    orderablesPrice: function(siglusOrderableLotService) {
                        return siglusOrderableLotService.getOrderablesPrice();
                    },
                    historyData: function(historyId, SiglusPhysicalInventoryHistoryService, orderablesPrice) {
                        return SiglusPhysicalInventoryHistoryService.getHistoryDetail(historyId)
                            .then(function(detail) {
                                detail.lineItemsData.forEach(function(line) {
                                    line.price = orderablesPrice.data[_.get(line, 'orderableId')] || null;
                                });
                                return detail;
                            });
                    }
                }
            })
            .state('openlmis.locationManagement.history', {
                url: '/physicalInventory/history/detail?historyId',
                label: 'stockPhysicalInventoryHistory.viewPhysicalInventory',
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-physical-inventory-history-detail/' +
                            'siglus-physical-inventory-history-detail.html',
                        controller: 'PhysicalInventoryHistoryDetailController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    facility: undefined,
                    program: undefined,
                    historyId: undefined
                },
                resolve: {
                    facility: function($stateParams) {
                        return $stateParams.facility;
                    },
                    program: function($stateParams) {
                        return $stateParams.program;
                    },
                    historyId: function($stateParams) {
                        return $stateParams.historyId;
                    },
                    orderablesPrice: function(siglusOrderableLotService) {
                        return siglusOrderableLotService.getOrderablesPrice();
                    },
                    historyData: function(historyId, SiglusPhysicalInventoryHistoryService, orderablesPrice) {
                        return SiglusPhysicalInventoryHistoryService.getHistoryDetail(historyId)
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
