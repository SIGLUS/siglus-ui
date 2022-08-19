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
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                program: function($stateParams, programService) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get($stateParams.programId).then(function(programs) {
                            return programs;
                        });
                    }
                    return $stateParams.program;
                },
                subDraftIds: function($stateParams) {
                    return $stateParams.subDraftIds.indexOf(',')
                        ? $stateParams.subDraftIds.split(',')
                        : [$stateParams.subDraftIds];
                },
                draft: function(
                    facility,
                    $stateParams,
                    physicalInventoryFactory,
                    physicalInventoryDataService,
                    $q,
                    program
                ) {
                    var deferred = $q.defer();
                    if ($stateParams.draft) {
                        physicalInventoryDataService.setDraft(facility.id, $stateParams.draft);
                    }
                    $stateParams.draft = undefined;
                    if (_.isUndefined(physicalInventoryDataService.getDraft(facility.id))) {
                        if ($stateParams.subDraftIds && !$stateParams.isMerged) {
                            var id = $stateParams.subDraftIds.length > 1
                                ? $stateParams.subDraftIds.split(',')
                                : [$stateParams.subDraftIds];
                            var flag = $stateParams.isMerged === 'true';
                            physicalInventoryFactory.getPhysicalInventorySubDraft(id, flag)
                                .then(function(draft) {
                                    physicalInventoryDataService.setDraft(facility.id, draft);
                                    deferred.resolve();
                                });
                        } else {
                            physicalInventoryFactory.getInitialInventory(program.id, facility.id)
                                .then(function(draft) {
                                    physicalInventoryDataService.setDraft(facility.id, draft);
                                    deferred.resolve();
                                });
                        }
                    } else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                },
                displayLineItemsGroup: function(paginationService, physicalInventoryService, $stateParams, $filter,
                    orderableGroupService, physicalInventoryDataService, draft, facility) {
                    $stateParams.size = '@@STOCKMANAGEMENT_PAGE_SIZE';

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
                    var stateParamsCopy = _.clone($stateParams);
                    stateParamsCopy.draft = physicalInventoryDataService.getDraft(facility.id);
                    return paginationService.registerList(validator, stateParamsCopy, function() {
                        var searchResult = physicalInventoryService.search(stateParamsCopy.keyword,
                            stateParamsCopy.draft.lineItems);
                        var lineItems = $filter('orderBy')(searchResult, 'orderable.productCode');
                        // SIGLUS-REFACTOR: starts here
                        var groups = _.chain(lineItems)
                            .groupBy(function(lineItem) {
                                return lineItem.orderable.id;
                            })
                            .values()
                            .value();
                        groups.forEach(function(group) {
                            group.forEach(function(lineItem) {
                                orderableGroupService
                                    .determineLotMessage(lineItem, group, $stateParams.canInitialInventory);
                            });
                        });

                        return groups;
                    })
                        .then(function(items) {
                            physicalInventoryDataService.setDisplayLineItemsGroup(facility.id, items);
                        });
                },
                /*eslint-enable */
                reasons: function(facility, program, stockReasonsFactory, physicalInventoryDataService) {
                    if (_.isUndefined(physicalInventoryDataService.getReasons(facility.id))) {
                        return stockReasonsFactory.getReasons(
                            program.id ? program.id : program,
                            facility.type ? facility.type.id : facility
                        ).then(function(reasons) {
                            return _.chain(reasons).filter(function(reason) {
                                return reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT &&
                                    reason.name.toLowerCase().indexOf('correcção') > -1;
                            })
                                .groupBy('programId')
                                .value();
                        })
                            .then(function(reasons) {
                                physicalInventoryDataService.setReasons(facility.id, reasons);
                            });
                    }
                    // SIGLUS-REFACTOR: ends here
                }
            }
        });
    }
})();
