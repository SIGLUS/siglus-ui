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
        .module('stock-unpack-kit-creation')
        .config(routes);

    // SIGLUS-REFACTOR: removed parameter SEARCH_OPTIONS, ADJUSTMENT_TYPE
    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];
    //SIGLUS-REFACTOR: ends here

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.kitunpack.creation', {
            //SIGLUS-REFACTOR: replaced url: '/:programId/create?page&size&keyword',
            url: '/:orderableId/create?page&size&keyword',
            //SIGLUS-REFACTOR: ends here
            views: {
                '@openlmis': {
                    // SIGLUS-REFACTOR:  replaced controller and templateUrl
                    //controller: 'StockAdjustmentCreationController',
                    //templateUrl: 'stock-adjustment-creation/adjustment-creation.html',
                    controller: 'UnpackKitCreationController',
                    templateUrl: 'stock-unpack-kit-creation/unpack-kit-creation.html',
                    controllerAs: 'vm'
                    //SIGLUS-REFACTOR: ends here
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                // SIGLUS-REFACTOR: removed program, addedLineItems, stockCardSummaries, displayItems, reasons
                // and added kit
                facility: undefined,
                kit: undefined
                //SIGLUS-REFACTOR: ends here
            },
            resolve: {
                facility: function(facilityFactory, $stateParams) {
                    if (!$stateParams.facility) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                // SIGLUS-REFACTOR: removed programs, orderableGroups, user, reasons, displayItems, srcDstAssignments
                // adjustmentType and added kit, sourceAndDestination, receivedReasons, issuedReasons
                /*program: function(programService, $stateParams) {
                    if (!$stateParams.program) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
                },
                orderableGroups: function($stateParams, existingStockOrderableGroupsFactory, program, facility,
                                          orderableGroupService) {
                    return existingStockOrderableGroupsFactory
                        .getGroupsWithoutStock($stateParams, program, facility)
                        .then(function(orderableGroups) {
                            return orderableGroupService.getKitOnlyOrderablegroup(orderableGroups);
                        });
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                reasons: function($stateParams, facility, stockReasonsFactory) {
                    if (!$stateParams.reasons) {
                        return stockReasonsFactory.getUnpackReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                displayItems: function(registerDisplayItemsService, $stateParams) {
                    return registerDisplayItemsService($stateParams);
                },
                srcDstAssignments: function() {
                    return null;
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.KIT_UNPACK;
                }*/
                kit: function($stateParams, facility, stockKitUnpackService) {
                    if (_.isUndefined($stateParams.kit)) {
                        return stockKitUnpackService.getUnpackKit(facility.id, $stateParams.orderableId);
                    }
                    return $stateParams.kit;
                },
                sourceAndDestination: function(facility, kit, kitCreationService) {
                    return kitCreationService.getSourceAndDestination(facility.id,
                        kit.parentProgramId, kit.fullProductName);
                },
                receivedReasons: function($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getReceiveReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                issuedReasons: function($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getIssueReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                }
            }
        });
    }
})();
