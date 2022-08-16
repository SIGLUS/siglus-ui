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
        .module('stock-receive-creation')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, SEARCH_OPTIONS, ADJUSTMENT_TYPE) {
        $stateProvider.state('openlmis.stockmanagement.receive.draft.creation', {
            // SIGLUS-REFACTOR: add draftId
            url: '/:draftId/create?page&size&keyword',
            // SIGLUS-REFACTOR: ends here
            views: {
                '@openlmis': {
                    // SIGLUS-REFACTOR: starts here
                    controller: 'SiglusStockReceiveCreationController',
                    templateUrl: 'stock-receive-creation/siglus-receive-creation.html',
                    // SIGLUS-REFACTOR: ends here
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
                addedLineItems: undefined,
                // SIGLUS-REFACTOR: starts here
                draft: undefined,
                orderableGroups: undefined,
                isAddProduct: undefined,
                hasLoadOrderableGroups: undefined,
                size: '50',
                initialDraftInfo: undefined
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                isMerge: function() {
                    return false;
                },
                programId: function($stateParams) {
                    return $stateParams.programId;
                },
                facility: function($stateParams, facilityFactory) {
                    if (!$stateParams.facility) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                mergedItems: function() {
                    return [];
                },
                initialDraftInfo: function($stateParams, programId, facility, siglusStockIssueService,
                    ADJUSTMENT_TYPE) {
                    if ($stateParams.initialDraftInfo) {
                        return $stateParams.initialDraftInfo;
                    }
                    return siglusStockIssueService.queryInitialDraftInfo(programId,
                        facility.id,
                        ADJUSTMENT_TYPE.RECEIVE.state);
                },
                orderablesPrice: function(siglusOrderableLotService) {
                    return siglusOrderableLotService.getOrderablesPrice();
                },
                reasons: function($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getReceiveReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.RECEIVE;
                },
                // SIGLUS-REFACTOR: starts here
                draft: function(siglusStockIssueService, $stateParams) {
                    if ($stateParams.draft) {
                        return $stateParams.draft;
                    }
                    return siglusStockIssueService.getDraftById($stateParams.draftId);
                },
                orderableGroups: function($stateParams, facility, draft, orderableGroupService) {
                    if (!$stateParams.hasLoadOrderableGroups) {
                        var allLineOrderableIds = draft.lineItems.map(function(line) {
                            return line.orderableId;
                        });
                        return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                            $stateParams.programId, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST,
                            $stateParams.draftId, allLineOrderableIds
                        );
                    }
                    return $stateParams.orderableGroups;
                },
                addedLineItems: function($stateParams, orderableGroups, stockAdjustmentFactory,
                    reasons, draft) {
                    if (_.isUndefined($stateParams.addedLineItems)) {
                        if (draft.lineItems && draft.lineItems.length > 0) {
                            return stockAdjustmentFactory.prepareLineItems(draft, orderableGroups,
                                undefined, reasons);
                        }
                        return [];
                    }
                    return $stateParams.addedLineItems;
                },
                displayItems: function($stateParams, registerDisplayItemsService, addedLineItems) {
                    if (_.isUndefined($stateParams.displayItems) && addedLineItems.length > 0) {
                        $stateParams.addedLineItems = addedLineItems;
                        $stateParams.displayItems = addedLineItems;
                    }
                    return registerDisplayItemsService($stateParams);
                }
                // SIGLUS-REFACTOR: ends here
            }
        });
    }
})();
