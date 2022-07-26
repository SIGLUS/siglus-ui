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
                srcDstAssignments: undefined,
                isAddProduct: undefined,
                hasLoadOrderableGroups: undefined,
                size: '50',
                initialDraftInfo: undefined
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                isMerge: function() {
                    return true;
                },
                program: function($stateParams, programService) {
                    if (!$stateParams.program) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
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
                    if ($stateParams.issueToInfo) {
                        return $stateParams.issueToInfo;
                    }
                    return siglusStockIssueService.queryInitialDraftInfo($stateParams.programId,
                        facility.id,
                        ADJUSTMENT_TYPE.RECEIVE.state);
                },
                // SIGLUS-REFACTOR: starts here
                orderableGroups: function($stateParams, program, facility, orderableGroupService) {
                    if (!$stateParams.hasLoadOrderableGroups) {
                        return orderableGroupService.findAvailableProductsAndCreateOrderableGroups(
                            program.id, facility.id, true, STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST
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
                srcDstAssignments: function($stateParams, facility, sourceDestinationService) {
                    if (_.isUndefined($stateParams.srcDstAssignments)) {
                        return sourceDestinationService.getSourceAssignments($stateParams.programId, facility.id);
                    }
                    return $stateParams.srcDstAssignments;
                },
                addedLineItems: function($stateParams, orderableGroups, stockAdjustmentFactory, srcDstAssignments,
                    reasons, draft) {
                    if (_.isUndefined($stateParams.addedLineItems)) {
                        if (draft.lineItems && draft.lineItems.length > 0) {
                            return stockAdjustmentFactory.prepareLineItems(draft, orderableGroups,
                                srcDstAssignments, reasons);
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
