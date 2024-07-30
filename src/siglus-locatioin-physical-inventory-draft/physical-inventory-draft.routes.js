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
        .module('siglus-locatioin-physical-inventory-draft')
        .config(routes);

    // SIGLUS-REFACTOR: add REASON_CATEGORIES
    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'REASON_CATEGORIES'];
    // SIGLUS-REFACTOR: ends here

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, REASON_CATEGORIES) {
        $stateProvider.state('openlmis.locationManagement.physicalInventory.draftList.draft', {
            url: '/:id?keyword&page&size&subDraftIds&draftNum&isMerged&actionType',
            views: {
                '@openlmis': {
                    controller: 'LocationPhysicalInventoryDraftController',
                    templateUrl: 'siglus-locatioin-physical-inventory-draft/physical-inventory-draft.html',
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
                    return $stateParams.program ? $stateParams.program :
                        programService.get($stateParams.programId).then(function(programs) {
                            return programs;
                        });
                },
                subDraftIds: function($stateParams) {
                    return $stateParams.subDraftIds ? $stateParams.subDraftIds.split(',') : [];
                },
                rawDraft: function($stateParams, physicalInventoryFactory, subDraftIds) {
                    var locationManagementOption = $stateParams.locationManagementOption;
                    var draft = $stateParams.draft;
                    $stateParams.draft = undefined;
                    if (draft) {
                        return draft;
                    }
                    return physicalInventoryFactory.getLocationPhysicalInventorySubDraftWithoutSummary(
                        subDraftIds, locationManagementOption
                    )
                        .then(function(draft) {
                            return draft;
                        });
                },
                lotsMapByLocation: function(rawDraft, physicalInventoryService) {
                    var orderableIds = _.uniq(_.map(rawDraft.lineItems, function(item) {
                        return _.get(item, ['orderable', 'id']);
                    }));
                    if (orderableIds.length === 0) {
                        return {};
                    }

                    return physicalInventoryService.getSohByLocation(orderableIds)
                        .then(function(lotsLocationInfo) {
                            _.reduce(lotsLocationInfo, function(lotsMapByLocation, lotsData) {
                                lotsMapByLocation[lotsData.location] = {
                                    values: lotsData.lots,
                                    area: lotsData.area
                                };
                                return lotsMapByLocation;
                            });
                        }, {});
                },
                lotsMapByOrderableId: function(rawDraft, siglusOrderableLotListService, facility) {
                    var orderableIdList = _.uniq(
                        _.filter(rawDraft.lineItems, function(lineItem) {
                            return !lineItem.stockCardId && _.get(lineItem, ['orderable', 'id']);
                        }).map(function(item) {
                            return _.get(item, ['orderable', 'id']);
                        })
                    );
                    if (orderableIdList.length > 0) {
                        return siglusOrderableLotListService.getOrderableLots(facility.id, orderableIdList)
                            .then(function(lotList) {
                                return siglusOrderableLotListService.getSimplifyLotsMapByOrderableId(lotList);
                            });
                    }
                    return [];
                },
                draft: function(rawDraft, lotsMapByLocation, lotsMapByOrderableId) {
                    _.forEach(rawDraft.lineItems, function(lineItem) {
                        var currentOrderableId = _.get(lineItem, ['orderable', 'id']);
                        var currentLocationCode =  _.get(lineItem, ['locationCode']);
                        var lotsInCurrentLocation = _.get(lotsMapByLocation, [currentLocationCode], []);
                        var currentLotInfo = _.find(lotsInCurrentLocation, function(lotInCurrentLocation) {
                            return lotInCurrentLocation.orderableId === currentOrderableId &&
                                lotInCurrentLocation.lotCode === _.get(lineItem, ['lot', 'lotCode']);
                        });

                        if (_.get(currentLotInfo, ['stockOnHand'])) {
                            lineItem.stockOnHand = _.get(currentLotInfo, ['stockOnHand']);
                        }
                        lineItem.area = lineItem.area ?
                            lineItem.area : _.get(lotsMapByLocation, [lineItem.locationCode, 'area'], null);
                        lineItem.lotOptions = lotsMapByOrderableId[currentOrderableId] || [];
                    });
                    return rawDraft;
                },
                allLocationAreaMap: function(siglusLocationAreaFactory) {
                    return siglusLocationAreaFactory.getAllLocationAreaInfoMap();
                },
                groupedLineItems: function($stateParams, physicalInventoryService, draft) {
                    var searchedLineItems =  physicalInventoryService.search(
                        $stateParams.keyword, draft.lineItems
                    );
                    return _.chain(searchedLineItems)
                        .groupBy(function(lineItem) {
                            return $stateParams.locationManagementOption === 'product' ?
                                lineItem.orderable.id : lineItem.locationCode;
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
                                    !!item.$errors.lotDateInvalid === false &&
                                    !!item.$errors.skippedInvalid === false;
                                // SIGLUS-REFACTOR: ends here
                            })
                            .value();
                    };
                    var paginationParams = {
                        size: '@@STOCKMANAGEMENT_PAGE_SIZE',
                        page: $stateParams.page || 0
                    };

                    return paginationService.registerList(validator, paginationParams, function() {
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
