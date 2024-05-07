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
        .module('siglus-location-physical-inventory-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.locationManagement.physicalInventory', {
            url: '/physicalInventory',
            label: 'stockPhysicalInventory.physicalInventory',
            priority: 3,
            showInNavigation: true,
            views: {
                '@openlmis': {
                    templateUrl: 'siglus-location-physical-inventory-list/physical-inventory-list.html',
                    controller: 'LocationPhysicalInventoryListController',
                    controllerAs: 'vm'
                }
            },
            params: {
                drafts: undefined,
                programId: undefined
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function(facilityFactory) {
                    return facilityFactory.getUserHomeFacility();
                },
                // // SIGLUS-REFACTOR: starts here
                programs: function(user, $q, programService, stockProgramUtilService) {
                    return $q.all([
                        programService.getAllProductsProgram(),
                        stockProgramUtilService.getPrograms(user.user_id,
                            STOCKMANAGEMENT_RIGHTS.STOCK_CARDS_VIEW)
                    ]).then(function(responses) {
                        return responses[0].concat(
                            _.filter(responses[1], function(item) {
                                return item.code !== 'ML';
                            })
                        );
                    });
                },
                programId: function($stateParams) {
                    return $stateParams.programId;
                },
                program: function(programs, programId) {
                    return programs.find(function(program) {
                        return program.id === programId;
                    }, undefined);
                },
                drafts: function(physicalInventoryService, $stateParams, facility, programId) {
                    if (!programId) {
                        return [];
                    }
                    return physicalInventoryService.getDraftByLocation(facility.id, programId)
                        .then(function(drafts) {
                            var vmDrafts = _.isEmpty(drafts) ?  [{
                                programId: programId,
                                isStarter: true
                            }] : drafts;
                            $stateParams.programId = programId;
                            $stateParams.locationManagementOption = !_.isEmpty(drafts) && drafts[0].locationOption;
                            $stateParams.drafts = _.clone(vmDrafts);
                            return vmDrafts;
                        });
                },
                historyList: function(SiglusPhysicalInventoryHistoryService, program) {
                    if (!program) {
                        return [];
                    }
                    return SiglusPhysicalInventoryHistoryService.getHistoryList().then(function(historyList) {
                        return historyList;
                    });
                }
            }
        })
            .state('openlmis.locationManagement.physicalInventory.selection', {
                url: '/selection?programId',
                templateUrl: 'siglus-location-physical-inventory-list/' +
                'siglus-location-physical-inventory-selection/physical-inventory-selection.html',
                controller: 'LocationPhysicalInventorySelectionController',
                controllerAs: 'vm',
                params: {
                    programId: undefined
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
                resolve: {
                    program: function(programs, $stateParams) {
                        return programs.find(function(program) {
                            return program.id === $stateParams.programId;
                        }, undefined);
                    }
                }
            })
            .state('openlmis.locationManagement.physicalInventory.history', {
                url: '/history?programId',
                templateUrl: 'siglus-location-physical-inventory-list/' +
                    'siglus-location-physical-inventory-history/physical-inventory-history.html',
                controller: 'LocationPhysicalInventoryHistoryController',
                controllerAs: 'vm',
                params: {
                    programId: undefined
                },
                resolve: {
                    program: function(programs, $stateParams) {
                        return programs.find(function(program) {
                            return program.id === $stateParams.programId;
                        }, undefined);
                    },
                    filteredHistoryList: function(SiglusPhysicalInventoryHistoryService, program, historyList) {
                        return program ? SiglusPhysicalInventoryHistoryService.filterHistoryByProgram(
                            program.name, historyList
                        ) : [];
                    }
                }
            });
    }
})();
