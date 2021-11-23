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
                addedLineItems: undefined,
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
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get($stateParams.programId);
                    }
                    return $stateParams.program;
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                user: function(authorizationService) {
                    return authorizationService.getUser();
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
                        return stockReasonsFactory.getAdjustmentReasons($stateParams.programId, facility.type.id);
                    }
                    return $stateParams.reasons;
                },
                adjustmentType: function() {
                    return ADJUSTMENT_TYPE.ADJUSTMENT;
                },
                srcDstAssignments: function() {
                    return undefined;
                },
                // SIGLUS-REFACTOR: starts here
                draft: function($stateParams, stockAdjustmentFactory, user, program, facility, adjustmentType) {
                    if (_.isUndefined($stateParams.draft)) {
                        return stockAdjustmentFactory.getDraftById(user.user_id, program.id, facility.id,
                            adjustmentType.state, $stateParams.draftId);
                    }
                    return $stateParams.draft;
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
