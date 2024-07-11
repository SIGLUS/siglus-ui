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
        $stateProvider.state('openlmis.stockmanagement.physicalInventory.draftList.draft', {
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
                isAddProduct: undefined
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                facility: function($stateParams, facilityFactory) {
                    return $stateParams.facility ? $stateParams.facility : facilityFactory.getUserHomeFacility();
                },
                program: function($stateParams, programService) {
                    if ($stateParams.program) {
                        return $stateParams.program;
                    }
                    return programService.get($stateParams.programId).then(function(programs) {
                        return programs;
                    });
                },
                subDraftIds: function($stateParams) {
                    return $stateParams.subDraftIds.split(',');
                },
                draft: function(facility, $stateParams, physicalInventoryFactory, program) {
                    var draft = $stateParams.draft;
                    var subDraftIds = $stateParams.subDraftIds;
                    $stateParams.draft = undefined;
                    if (draft) {
                        return draft;
                    }
                    // no existedDraft, call api to get/init draft
                    if (subDraftIds) {
                        var idList = subDraftIds.split(',');
                        return physicalInventoryFactory.getPhysicalInventorySubDraftWithoutSummary(idList)
                            .then(function(draft) {
                                return draft;
                            });
                    }
                    return physicalInventoryFactory.getInitialInventory(program.id, facility.id)
                        .then(function(draft) {
                            return draft;
                        });
                },
                lotsMapByOrderableId: function(draft, siglusOrderableLotListService, facility) {
                    var orderableIds = _.uniq(
                        _.filter(draft.lineItems, function(lineItem) {
                            return !lineItem.stockCardId;
                        }).map(function(lineItem) {
                            return lineItem.orderable.id;
                        })
                    );
                    if (orderableIds.length > 0) {
                        return siglusOrderableLotListService.getOrderableLots(facility.id, orderableIds)
                            .then(function(lotList) {
                                return siglusOrderableLotListService.getSimplifyLotsMapByOrderableId(lotList);
                            });
                    }
                    return [];
                },
                rawLineItems: function(draft, lotsMapByOrderableId) {
                    var draftCopy = angular.copy(draft);
                    draftCopy.lineItems = _.filter(draftCopy.lineItems, function(item) {
                        return !(item.stockCardId && item.stockOnHand === 0);
                    });
                    var sortedLineItems = _.sortBy(draftCopy.lineItems, function(lineItem) {
                        return _.get(lineItem, ['orderable', 'productCode']);
                    });
                    // set lot options
                    sortedLineItems.forEach(function(lineItem) {
                        var orderableId = lineItem.orderableId;
                        lineItem.lotOptions = lotsMapByOrderableId[orderableId] || [];
                    });
                    return sortedLineItems;
                },
                groupedLineItems: function($stateParams, physicalInventoryService, rawLineItems) {
                    var matchedLineItems = physicalInventoryService.search(
                        $stateParams.keyword, rawLineItems
                    );
                    // SIGLUS-REFACTOR: starts here
                    return _.chain(matchedLineItems)
                        .groupBy(function(lineItem) {
                            return lineItem.orderable.id;
                        })
                        .values()
                        .value();
                },
                displayLineItemsGroup: function(paginationService, draft, groupedLineItems) {
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
                        page: 0
                    };
                    return paginationService.registerList(validator, pageParams, function() {
                        return groupedLineItems;
                    });
                },
                reasons: function(facility, program, stockReasonsFactory) {
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
