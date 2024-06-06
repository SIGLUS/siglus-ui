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
        .module('stock-adjustment-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, SEARCH_OPTIONS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.stockmanagement.adjustment.creation', {
            // SIGLUS-REFACTOR: add draftId
            url: '/:programId/create?page&size&keyword&draftId',
            // SIGLUS-REFACTOR: ends here
            views: {
                '@openlmis': {
                    controller: 'StockAdjustmentCreationController',
                    templateUrl: 'stock-adjustment-creation/adjustment-creation.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                program: undefined,
                facility: undefined,
                stockCardSummaries: undefined,
                reasons: undefined,
                displayItems: undefined,
                allLineItemsAdded: undefined,
                // SIGLUS-REFACTOR: starts here
                draft: undefined,
                orderableGroups: undefined,
                isAddProduct: undefined,
                hasLoadOrderableGroups: undefined,
                size: '50'
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                program: function($stateParams, programService) {
                    return $stateParams.program ? $stateParams.program : programService.get($stateParams.programId);
                },
                facility: function($stateParams, facilityFactory) {
                    return $stateParams.facility ? $stateParams.facility : facilityFactory.getUserHomeFacility();
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                reasons: function($stateParams, stockReasonsFactory, facility) {
                    return $stateParams.reasons ? $stateParams.reasons :
                        stockReasonsFactory.getAdjustmentReasons($stateParams.programId, facility.type.id);
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ADJUSTMENT;
                },
                srcDstAssignments: function() {
                    return undefined;
                },
                // SIGLUS-REFACTOR: starts here
                draft: function($stateParams, stockAdjustmentFactory, user, program, facility, adjustmentType) {
                    return $stateParams.draft ? $stateParams.draft :
                        stockAdjustmentFactory.getDraftById(
                            user.user_id, program.id, facility.id, adjustmentType.state, $stateParams.draftId
                        );
                },
                orderablesPrice: function($stateParams, siglusOrderableLotService) {
                    return $stateParams.orderablesPrice ? $stateParams.orderablesPrice :
                        siglusOrderableLotService.getOrderablesPrice();
                },
                orderableGroups: function($stateParams, program, facility, draft, orderableGroupService) {
                    if ($stateParams.hasLoadOrderableGroups) {
                        return $stateParams.orderableGroups;
                    }
                    var allLineOrderableIds = _.map(draft.lineItems, function(line) {
                        return line.orderableId;
                    });
                    return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                        program.id, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST, null,
                        allLineOrderableIds
                    );
                },
                allLineItemsAdded: function($stateParams, orderableGroups, stockAdjustmentFactory, srcDstAssignments,
                    reasons, draft) {
                    if ($stateParams.allLineItemsAdded) {
                        return $stateParams.allLineItemsAdded;
                    }

                    if (draft.lineItems && draft.lineItems.length > 0) {
                        return stockAdjustmentFactory.prepareLineItems(draft, orderableGroups,
                            srcDstAssignments, reasons);
                    }
                    return [];
                },
                displayItems: function($stateParams, registerDisplayItemsService, allLineItemsAdded) {
                    if (_.isUndefined($stateParams.displayItems) && allLineItemsAdded.length > 0) {
                        $stateParams.allLineItemsAdded = allLineItemsAdded;
                        $stateParams.displayItems = allLineItemsAdded;
                    }
                    return registerDisplayItemsService($stateParams);
                }
                // SIGLUS-REFACTOR: ends here
            }
        });
    }
})();
