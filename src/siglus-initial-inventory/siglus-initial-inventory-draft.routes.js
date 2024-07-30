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
        .module('stock-physical-inventory-draft')
        .config(routes);

    // SIGLUS-REFACTOR: add REASON_CATEGORIES
    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'REASON_CATEGORIES'];
    // SIGLUS-REFACTOR: ends here

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, REASON_CATEGORIES) {
        $stateProvider.state('openlmis.stockmanagement.initialInventory.draft', {
            url: '/:id?keyword&page&size&subDraftIds&draftNum&isMerged&actionType',
            views: {
                '@openlmis': {
                    controller: 'PhysicalInventoryDraftController',
                    templateUrl: 'stock-physical-inventory-draft/physical-inventory-draft.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
            params: {
                program: undefined,
                facility: undefined,
                draft: undefined,
                // SIGLUS-REFACTOR: add reasons, isAddProduct
                reasons: undefined,
                isAddProduct: undefined,
                canInitialInventory: true
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                facility: function($stateParams, facilityFactory) {
                    return $stateParams.facility || facilityFactory.getUserHomeFacility();
                },
                program: function($stateParams, programService) {
                    return $stateParams.program || programService.get($stateParams.programId);
                },
                subDraftIds: function($stateParams) {
                    return $stateParams.subDraftIds ? $stateParams.subDraftIds.split(',') : [];
                },
                draft: function($state, facility, $stateParams, physicalInventoryFactory, program, subDraftIds) {
                    var draft = $state.params.draft;
                    $stateParams.draft = undefined;
                    $state.params.draft = undefined;
                    if (draft) {
                        return draft;
                    }

                    return physicalInventoryFactory.getPhysicalInventorySubDraftWithoutSummary(subDraftIds)
                        .then(function(subDraft) {
                            return subDraft;
                        });
                },
                rawLineItems: function(draft) {
                    return _.sortBy(draft.lineItems, function(lineItem) {
                        return _.get(lineItem, ['orderable', 'productCode']);
                    });
                },
                groupedLineItems: function($stateParams, physicalInventoryService, rawLineItems) {
                    var matchedLineItems = physicalInventoryService.search(
                        $stateParams.keyword, rawLineItems
                    );
                    return _.chain(matchedLineItems)
                        .groupBy(function(lineItem) {
                            return _.get(lineItem, ['orderable', 'id']);
                        })
                        .values()
                        .value();
                },
                displayLineItemsGroup: function(paginationService, $stateParams, groupedLineItems) {
                    var validator = function(items) {
                        return _.chain(items).flatten()
                            .every(function(item) {
                                // SIGLUS-REFACTOR: starts here
                                return !!item.$errors.quantityInvalid === false &&
                                    !!item.$errors.reasonFreeTextInvalid === false &&
                                    !!item.$errors.lotCodeInvalid === false &&
                                    !!item.$errors.lotDateInvalid === false;
                                // SIGLUS-REFACTOR: ends here
                            })
                            .value();
                    };
                    var pageParams = {
                        size: '@@STOCKMANAGEMENT_PAGE_SIZE',
                        page: $stateParams.page || 0
                    };
                    return paginationService.registerList(validator, pageParams, function() {
                        return groupedLineItems;
                    });
                },
                reasons: function(facility, program, stockReasonsFactory, $stateParams) {
                    if ($stateParams.reasons) {
                        return $stateParams.reasons;
                    }
                    return stockReasonsFactory.getReasons(program.id, facility.type.id)
                        .then(function(reasons) {
                            return _.chain(reasons).filter(function(reason) {
                                return reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT &&
                                reason.name.toLowerCase().indexOf('correcção') > -1;
                            })
                                .groupBy('programId')
                                .value();
                        });
                }
            }
        });
    }
})();
