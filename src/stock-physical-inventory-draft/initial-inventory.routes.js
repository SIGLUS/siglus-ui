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

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS', 'REASON_CATEGORIES'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS, REASON_CATEGORIES) {
        $stateProvider.state('openlmis.stockmanagement.initialInventory', {
            url: '/initialInventory?keyword&page&size',
            label: 'stockInitialInventory.initialInventory',
            showInNavigation: true,
            views: {
                '@openlmis': {
                    controller: 'PhysicalInventoryDraftController',
                    templateUrl: 'stock-physical-inventory-draft/physical-inventory-draft.html',
                    controllerAs: 'vm'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
            params: {
                id: undefined,
                program: undefined,
                facility: undefined,
                draft: undefined,
                reasons: undefined,
                isAddProduct: undefined,
                hasChangePage: undefined,
                canInitialInventory: true
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isUndefined($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                program: function($stateParams, programService) {
                    if (_.isUndefined($stateParams.program)) {
                        return programService.getAll().then(function(programs) {
                            return _.find(programs, function(progarm) {
                                return progarm.code === 'ALL';
                            });
                        });
                    }
                    return $stateParams.program;
                },
                id: function($stateParams, physicalInventoryService, program, facility, alertService, $state,
                    currentUserService) {
                    if (_.isUndefined($stateParams.id)) {
                        return physicalInventoryService.getInitialDraft(program.id, facility.id).then(function(drafts) {
                            return _.first(drafts).id;
                        }, function(err) {
                            currentUserService.clearCache();
                            if (err.status === 406) {
                                delete $state.get('openlmis.stockmanagement.initialInventory').showInNavigation;
                                alertService.error('stockInitialInventory.initialFailed');
                            }
                            $state.go('openlmis.home', {}, {
                                reload: true
                            });
                        });
                    }
                    return $stateParams.id;
                },
                draft: function($stateParams, physicalInventoryFactory, physicalInventoryService, user, id) {
                    if (_.isUndefined($stateParams.draft && !$stateParams.hasChangePage)) {
                        return physicalInventoryFactory.getPhysicalInventory(id,
                            user.user_id, STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT);
                    }
                    return $stateParams.draft;
                },
                displayLineItemsGroup: function(paginationService, physicalInventoryService, $stateParams, $filter,
                    draft, orderableGroupService) {
                    $stateParams.size = '@@STOCKMANAGEMENT_PAGE_SIZE';

                    var validator = function(items) {
                        return _.chain(items).flatten()
                            .every(function(item) {
                                return !!item.$errors.quantityInvalid === false;
                            })
                            .value();
                    };

                    return paginationService.registerList(validator, $stateParams, function() {
                        var searchResult = physicalInventoryService.search($stateParams.keyword, draft.lineItems);
                        var lineItems = $filter('orderBy')(searchResult, 'orderable.productCode');

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
                    }, {
                        customPageParamName: 'page',
                        customSizeParamName: 'size',
                        paginationId: 'stock-management-physical-inventory'
                    });
                },
                reasons: function($stateParams, facility, program, stockReasonsFactory) {
                    if (_.isUndefined($stateParams.reasons)) {
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
                        });
                    }
                    return $stateParams.reasons;
                }
            }
        });
    }
})();
