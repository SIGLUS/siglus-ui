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
        .module('stock-physical-inventory-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider
            .state('openlmis.stockmanagement.physicalInventory', {
                url: '/physicalInventory',
                label: 'stockPhysicalInventory.physicalInventory',
                priority: 3,
                showInNavigation: true,
                views: {
                    '@openlmis': {
                        templateUrl: 'stock-physical-inventory-list/physical-inventory-list.html',
                        controller: 'PhysicalInventoryListController',
                        controllerAs: 'vm'
                    }
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
                params: {
                    facility: undefined
                },
                resolve: {
                    user: function(authorizationService) {
                        return authorizationService.getUser();
                    },
                    facility: function($stateParams, facilityFactory) {
                        if ($stateParams.facility) {
                            return $stateParams.facility;
                        }
                        return facilityFactory.getUserHomeFacility().then(function(facility) {
                            return facility;
                        });
                    },
                    programs: function(user, $q, programService, stockProgramUtilService) {
                        return $q.all([
                            programService.getAllProductsProgram(),
                            stockProgramUtilService.getPrograms(user.user_id, STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW)
                        ]).then(function(responses) {
                            return responses[0].concat(
                                _.filter(responses[1], function(item) {
                                    return item.code !== 'ML';
                                })
                            );
                        });
                    },
                    programId: function($rootScope) {
                        return $rootScope.programId;
                    },
                    program: function(programs, programId) {
                        return programs.find(function(program) {
                            return program.id === programId;
                        }, undefined);
                    }
                }
            })
            .state('openlmis.stockmanagement.physicalInventory.selection', {
                url: '/selection?programId',
                controller: 'SiglusPhysicalInventorySelectionController',
                controllerAs: 'vm',
                templateUrl: 'stock-physical-inventory-list/' +
                    'siglus-physical-inventory-selection/siglus-physical-inventory-selection.html',
                accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
                params: {
                    programId: undefined,
                    facility: undefined
                },
                resolve: {
                    drafts: function(physicalInventoryService, programId, facility) {
                        if (!programId) {
                            return [];
                        }
                        return physicalInventoryService.getDraft(programId, facility.id)
                            .then(function(drafts) {
                                return _.isEmpty(drafts) ? [{
                                    programId: programId,
                                    isStarter: true
                                }] : drafts;
                            });
                    }
                }
            })
            .state('openlmis.stockmanagement.physicalInventory.history', {
                url: '/history?programId',
                controller: 'SiglusPhysicalInventoryHistoryController',
                controllerAs: 'vm',
                templateUrl: 'stock-physical-inventory-list/' +
                    'siglus-physical-inventory-history/siglus-physical-inventory-history.html',
                params: {
                    programId: undefined,
                    facility: undefined
                },
                resolve: {
                    facility: function($stateParams) {
                        return $stateParams.facility;
                    },
                    historyList: function() {
                        // TODO: get history list from api
                        return [{
                            program: 'MTB',
                            dateCompleted: '21/11/2023'
                        }, {
                            program: 'MTB',
                            dateCompleted: '21/11/2023'
                        }, {
                            program: 'MTB',
                            dateCompleted: '21/11/2023'
                        }];
                    }
                }
            });
    }
})();
