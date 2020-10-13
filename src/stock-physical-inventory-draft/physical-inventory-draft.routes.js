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
        $stateProvider.state('openlmis.stockmanagement.physicalInventory.draft', {
            url: '/:id?keyword&page&size',
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
                draft: function($stateParams, physicalInventoryFactory, physicalInventoryDataService, $q) {
                    var deferred = $q.defer();
                    if ($stateParams.draft) {
                        physicalInventoryDataService.setDraft($stateParams.draft);
                    }
                    $stateParams.draft = undefined;
                    if (_.isUndefined(physicalInventoryDataService.getDraft())) {
                        physicalInventoryFactory.getPhysicalInventory($stateParams.id)
                            .then(function(draft) {
                                physicalInventoryDataService.setDraft(draft);
                                deferred.resolve();
                            });
                    } else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                },
                /*eslint-disable */
                program: function($stateParams, programService, physicalInventoryDataService, draft) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.get(physicalInventoryDataService.getDraft().programId);
                    }
                    return $stateParams.program;
                },
                /*eslint-enable */
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                displayLineItemsGroup: function(paginationService, physicalInventoryService, $stateParams, $filter,
                    orderableGroupService, physicalInventoryDataService, draft) {
                    $stateParams.size = '@@STOCKMANAGEMENT_PAGE_SIZE';

                    var validator = function(items) {
                        return _.chain(items).flatten()
                            .every(function(item) {
                                // SIGLUS-REFACTOR: starts here
                                return !!item.$errors.quantityInvalid === false;
                                // SIGLUS-REFACTOR: ends here
                            })
                            .value();
                    };
                    draft = physicalInventoryDataService.getDraft();
                    var stateParamsCopy = _.clone($stateParams);
                    stateParamsCopy.draft = draft;
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
                                orderableGroupService.determineLotMessage(lineItem, group);
                            });
                        });

                        return groups;
                    })
                        .then(function(items) {
                            physicalInventoryDataService.setDisplayLineItemsGroup(items);
                        });
                },
                reasons: function(facility, program, stockReasonsFactory, physicalInventoryDataService) {
                    if (_.isUndefined(physicalInventoryDataService.getReasons())) {
                        return stockReasonsFactory.getReasons(
                            program.id ? program.id : program,
                            facility.type ? facility.type.id : facility
                        ).then(function(reasons) {
                            return _.chain(reasons).filter(function(reason) {
                                return reason.reasonCategory === REASON_CATEGORIES.ADJUSTMENT &&
                                    reason.name.toLowerCase().indexOf('correction') > -1;
                            })
                                .groupBy('programId')
                                .value();
                        })
                            .then(function(reasons) {
                                physicalInventoryDataService.setReasons(reasons);
                            });
                    }
                    // SIGLUS-REFACTOR: ends here
                }
            }
        });
    }
})();
