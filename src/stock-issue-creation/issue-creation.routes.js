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
        .module('stock-issue-creation')
        .config(routes);

    routes.$inject = [
        '$stateProvider',
        'STOCKMANAGEMENT_RIGHTS',
        'SEARCH_OPTIONS',
        'ADJUSTMENT_TYPE'
    ];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.issue.draft.creation', {
            // SIGLUS-REFACTOR: add draftId
            url: '/:draftId/create/:initialDraftId?page&size&keyword',
            // SIGLUS-REFACTOR: ends here
            views: {
                '@openlmis': {
                    // SIGLUS-REFACTOR: starts here
                    controller: 'SiglusStockIssueCreationController',
                    templateUrl: 'stock-issue-creation/siglus-issue-creation.html',
                    // SIGLUS-REFACTOR: ends here
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                facility: undefined,
                stockCardSummaries: undefined,
                reasons: undefined,
                displayItems: undefined,
                orderablesPrice: undefined,
                addedLineItems: undefined,
                draft: undefined,
                orderableGroups: undefined,
                isAddProduct: undefined,
                hasLoadOrderableGroups: undefined,
                size: '50',
                initialDraftInfo: undefined
            },
            resolve: {
                isMerge: function() {
                    return false;
                },
                program: function($stateParams) {
                    return $stateParams.programId;
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                initialDraftInfo: function($stateParams, facility, siglusStockIssueService) {
                    if ($stateParams.initialDraftInfo) {
                        return $stateParams.initialDraftInfo;
                    }
                    return siglusStockIssueService.getInitialDraftById($stateParams.initialDraftId);
                },
                // SIGLUS-REFACTOR: starts here
                orderableGroups: function($stateParams, facility, existingStockOrderableGroupsFactory) {
                    if (!$stateParams.hasLoadOrderableGroups) {
                        return existingStockOrderableGroupsFactory
                            .getGroupsWithoutStock($stateParams, {
                                id: $stateParams.programId
                            }, facility,
                            STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST, $stateParams.draftId);
                    }
                    return $stateParams.orderableGroups;
                },
                // SIGLUS-REFACTOR: ends here
                reasons: function($stateParams, stockReasonsFactory, facility) {
                    if (_.isUndefined($stateParams.reasons)) {
                        return stockReasonsFactory.getIssueReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                mergedItems: function() {
                    return [];
                },
                // SIGLUS-REFACTOR: starts here
                draft: function($stateParams, siglusStockIssueService) {
                    if ($stateParams.draft) {
                        return $stateParams.draft;
                    }
                    return siglusStockIssueService.getDraftById($stateParams.draftId);
                },
                addedLineItems: function($stateParams, orderableGroups, stockAdjustmentFactory,
                    reasons, draft) {
                    if (_.isUndefined($stateParams.addedLineItems)) {
                        draft.lineItems = filterOutOrderable(draft, orderableGroups);
                        if (draft.lineItems && draft.lineItems.length > 0) {
                            return stockAdjustmentFactory.prepareLineItems(draft, orderableGroups,
                                undefined, reasons);
                        }
                        return [];
                    }
                    return $stateParams.addedLineItems;
                },
                orderablesPrice: function($stateParams, siglusOrderableLotService) {
                    if ($stateParams.orderablesPrice) {
                        return $stateParams.orderablesPrice;
                    }
                    return siglusOrderableLotService.getOrderablesPrice();
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

    // SIGLUS-REFACTOR: starts here
    function filterOutOrderable(draft, orderableGroups) {
        var lotIds = [];
        var orderableIds = [];
        var filteredLineItems = [];
        orderableGroups.forEach(function(group) {
            if (group[0].orderable.isKit) {
                orderableIds.push(group[0].orderable.id);
            } else {
                group.forEach(function(lotItem) {
                    lotIds.push(_.get(lotItem, ['lot', 'id']));
                });
            }

        });
        if (draft !== null && draft.lineItems !== null) {
            draft.lineItems.forEach(function(lineItem) {
                if (orderableIds.includes(lineItem.orderableId) || lotIds.includes(lineItem.lotId)) {
                    filteredLineItems.push(lineItem);
                }
            });
        }
        return filteredLineItems;
    }
    // SIGLUS-REFACTOR: ends here

})();
