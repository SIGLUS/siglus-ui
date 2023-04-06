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
        $stateProvider.state('openlmis.stockmanagement.receive.draft.merge', {
            // SIGLUS-REFACTOR: add draftId
            url: '/merge/:initialDraftId?page&size&keyword',
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
                orderablesPrice: undefined,
                // SIGLUS-REFACTOR: starts here
                draft: undefined,
                orderableGroups: undefined,
                isAddProduct: undefined,
                size: '50',
                initialDraftInfo: undefined,
                mergedItems: undefined
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                isMerge: function() {
                    return true;
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
                // SIGLUS-REFACTOR: starts here
                mergedItems: function($stateParams, siglusStockIssueService, alertService) {
                    if ($stateParams.mergedItems) {
                        return $stateParams.mergedItems;
                    }
                    var initialDraftId = Array.isArray($stateParams.initialDraftId)
                        ? $stateParams.initialDraftId[0] : $stateParams.initialDraftId;
                    return siglusStockIssueService.getMergedDraft(initialDraftId).catch(
                        function(error) {
                            if (error.data.businessErrorExtraData === 'subDrafts not all submitted') {
                                alertService.error('PhysicalInventoryDraftList.mergeError');
                                throw 'subDrafts not all submitted';
                            }
                        }
                    );
                },
                draft: function(mergedItems, ADJUSTMENT_TYPE) {
                    return {
                        draftType: ADJUSTMENT_TYPE.RECEIVE.state,
                        lineItems: mergedItems
                    };
                },
                orderablesPrice: function($stateParams, siglusOrderableLotService) {
                    if ($stateParams.orderablesPrice) {
                        return $stateParams.orderablesPrice;
                    }
                    return siglusOrderableLotService.getOrderablesPrice();
                },
                initialDraftInfo: function($stateParams, facility, siglusStockIssueService) {
                    if ($stateParams.initialDraftInfo) {
                        return $stateParams.initialDraftInfo;
                    }
                    return siglusStockIssueService.getInitialDraftById($stateParams.initialDraftId);
                },
                // SIGLUS-REFACTOR: starts here
                orderableGroups: function($stateParams, programId, facility, mergedItems, orderableGroupService) {
                    if (!$stateParams.orderableGroups) {
                        var allLineOrderableIds = mergedItems.map(function(line) {
                            return line.orderableId;
                        });
                        return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                            programId, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST, undefined,
                            allLineOrderableIds
                        );
                    }
                    return $stateParams.orderableGroups;
                },
                // SIGLUS-REFACTOR: ends here
                reasons: function($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getReceiveReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.RECEIVE;
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
