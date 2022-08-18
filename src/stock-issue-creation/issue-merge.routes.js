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

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'SEARCH_OPTIONS', 'ADJUSTMENT_TYPE'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.issue.draft.merge', {
            // SIGLUS-REFACTOR: add draftId
            url: '/merge?page&size&keyword',
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
                program: undefined,
                facility: undefined,
                orderablesPrice: undefined,
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
                initialDraftInfo: undefined,
                mergedItems: undefined
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                isMerge: function() {
                    return true;
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
                orderablesPrice: function($stateParams, siglusOrderableLotService) {
                    if ($stateParams.orderablesPrice) {
                        return $stateParams.orderablesPrice;
                    }
                    return siglusOrderableLotService.getOrderablesPrice();
                },
                // SIGLUS-REFACTOR: starts here
                mergedItems: function($stateParams, siglusStockIssueService, alertService) {
                    if ($stateParams.mergedItems) {
                        return $stateParams.mergedItems;
                    }
                    return siglusStockIssueService.getMergedDraft($stateParams.initialDraftId).catch(
                        function(error) {
                            if (error.data.businessErrorExtraData === 'subDrafts not all submitted') {
                                alertService.error('PhysicalInventoryDraftList.mergeError');
                                throw 'subDrafts not all submitted';
                            }
                        }
                    );
                },
                draft: function(mergedItems) {
                    return {
                        lineItems: mergedItems
                    };
                },
                initialDraftInfo: function($stateParams, facility, siglusStockIssueService, ADJUSTMENT_TYPE) {
                    if ($stateParams.initialDraftInfo) {
                        return $stateParams.initialDraftInfo;
                    }
                    return siglusStockIssueService.queryInitialDraftInfo($stateParams.programId,
                        facility.id,
                        ADJUSTMENT_TYPE.ISSUE.state);
                },
                // SIGLUS-REFACTOR: starts here
                orderableGroups: function($stateParams, program, facility, existingStockOrderableGroupsFactory) {
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
                addedLineItems: function($stateParams, orderableGroups, stockAdjustmentFactory,
                    reasons, draft) {
                    if (_.isUndefined($stateParams.addedLineItems)) {
                        draft.lineItems = filterOutOrderable(draft, orderableGroups);
                        if (draft.lineItems && draft.lineItems.length > 0) {
                            return stockAdjustmentFactory.prepareLineItems(draft, orderableGroups, undefined, reasons);
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
