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

    /**
     * @ngdoc service
     * @name siglus-initial-inventory.siglusInitialInventoryNavigationInterceptor
     *
     * @description
     * Check if state being transitioned is able to be viewed initial inventory, if the
     * initial inventory hasn't been finished.
     */
    angular.module('siglus-initial-inventory')
        .run(siglusInitialInventoryNavigationInterceptor);

    siglusInitialInventoryNavigationInterceptor.$inject = [
        '$q', '$rootScope', 'loadingModalService', 'confirmService', '$state', 'stockmanagementUrlFactory',
        '$http', 'programService', 'facilityFactory', 'physicalInventoryFactory', 'currentUserService',
        'authorizationService', 'alertService', '$stateParams',
        'SiglusPhysicalInventoryCreationService', 'SiglusInitialInventoryResource', 'navigationStateService',
        'siglusLocationMovementService'
    ];

    function siglusInitialInventoryNavigationInterceptor(
        $q, $rootScope, loadingModalService, confirmService, $state,
        stockmanagementUrlFactory, $http, programService,
        facilityFactory, physicalInventoryFactory,
        currentUserService, authorizationService, alertService, $stateParams,
        SiglusPhysicalInventoryCreationService, SiglusInitialInventoryResource, navigationStateService,
        siglusLocationMovementService
    ) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
            if (checkInitialInventoryStatus() && !toState.name.contains('initialInventory')
                && toState.showInNavigation && toState.url !== '/home') {
                event.preventDefault();
                if ($state.current.url === '/home') {
                    checkDraftIsStarter();
                } else {
                    $state.go('openlmis.home');
                }
            } else if (checkInitialInventoryStatus()
            && toState.name === 'openlmis.stockmanagement.initialInventory'
            && toState.showInNavigation) {
                if (_.isEmpty(toParams.programId)) {
                    event.preventDefault();
                    checkDraftIsStarter(true);
                }
            }
        });

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
            // TODO RENAME FILE, NOT JUST FOR INITIAL INVENTORY
            if ((!toState.name.contains('movement.creation')
                && toState.showInNavigation
                && toState.url !== '/home'
                && !toParams.hasCheckedMoveProduct)) {

                // check async first disable then continue
                event.preventDefault();
                checkUpgradeMoveProduct().then(function(shouldUpgradeMoveProduct) {
                    if (shouldUpgradeMoveProduct) {
                        loadingModalService.close();
                        if (toState.name === 'openlmis.locationManagement.movement') {
                            return startVirtualMovement();
                        }
                        return confirmService.confirm('locationMovement.upgradePopup')
                            .then(function() {
                                return startVirtualMovement();
                            });
                    }
                    var params = angular.copy(toParams);
                    params.hasCheckedMoveProduct = true;
                    $state.go(toState.name, params);
                });
            }
        });

        function startVirtualMovement() {
            loadingModalService.open();
            programService.getAllProductsProgram().then(function(programs) {
                var programId = _.get(programs, [0, 'id']);
                return siglusLocationMovementService.getMovementDrafts(programId).then(function(drafts) {
                    if (drafts.length > 0) {
                        var draftId = _.get(drafts, [0, 'id']);
                        $stateParams.draftId = draftId;
                        return $state.go('openlmis.locationManagement.movement.creation', {
                            programId: programId,
                            draftId: draftId,
                            isVirtual: true
                        });
                    }
                    var user = currentUserService.getUserInfo().$$state.value;
                    var params = {
                        programId: programId,
                        facilityId: user.homeFacilityId,
                        userId: user.id
                    };
                    return siglusLocationMovementService.createMovementDraft(params).then(function(draft) {
                        var draftId = draft.id;
                        return siglusLocationMovementService.initVirtualMovementDrafts(draft).then(function() {
                            return $state.go('openlmis.locationManagement.movement.creation', {
                                programId: programId,
                                draftId: draftId,
                                isVirtual: true
                            });
                        });
                    });
                });
            });
        }

        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.url === '/home') {
                if (checkInitialInventoryStatus()) {
                    event.preventDefault();
                    checkDraftIsStarter();
                } else {
                    checkUpgradeMoveProduct().then(function(shouldUpgradeMoveProduct) {
                        if (shouldUpgradeMoveProduct) {
                            loadingModalService.close();
                            return confirmService.confirm('locationMovement.upgradePopup')
                                .then(function() {
                                    return startVirtualMovement();
                                });
                        }
                    });
                }
            }

        });

        function checkInitialInventoryStatus() {
            var user = currentUserService.getUserInfo().$$state.value;
            if (_.isUndefined(user) || _.isUndefined(user.canInitialInventory)) {
                return false;
            }
            return user.canInitialInventory;
        }

        function checkUpgradeMoveProduct() {
            var user = currentUserService.getUserInfo().$$state.value;
            if (user && user.homeFacilityId) {
                return facilityFactory.getUserHomeFacility().then(function(facility) {
                    return facility.needInitiallyMoveProduct;
                });
            }
            return $q.resolve(false);
        }

        function checkInitialInventoryStatusByQuery() {
            var defered = $q.defer();
            var user = currentUserService.getUserInfo().$$state.value;

            new SiglusInitialInventoryResource().query({
                facility: user.homeFacilityId
            })
                .then(function(res) {
                    defered.resolve(res.canInitialInventory);
                });

            return defered.promise;
        }

        function checkDraftIsStarter(shouldNotPopComfirm) {
            var promise = checkInitialInventoryStatusByQuery();
            promise.then(function(res) {
                if (res) {
                    loadingModalService.open();
                    $q.all([
                        programService.getAllProductsProgram(),
                        facilityFactory.getUserHomeFacility()
                    ]).then(function(responses) {
                        physicalInventoryFactory.
                            getDrafts([responses[0][0].id], responses[1].id).then(function(response) {
                                if (response[0].isStarter) {
                                    loadingModalService.close();
                                    SiglusPhysicalInventoryCreationService
                                        .show(responses[0][0].id);
                                } else {
                                    loadingModalService.close();
                                    if (shouldNotPopComfirm) {
                                        $state.go('openlmis.stockmanagement.initialInventory', {
                                            programId: responses[0][0].id
                                        });
                                    } else {
                                        propopConfirm(responses[0][0].id);
                                    }

                                }
                            })
                            .catch(function() {
                                loadingModalService.close();
                            })
                            .finally(loadingModalService.close);

                    })
                        .catch(function() {
                            loadingModalService.close();
                        })
                        .finally(loadingModalService.close);
                } else {
                    currentUserService.clearCache();
                    navigationStateService.clearStatesAvailability();
                    $state.go('openlmis.home', {}, {
                        reload: true
                    });
                }
            });
        }

        function propopConfirm(programId) {

            confirmService.confirm('stockInitialDiscard.initialInventory', 'stockInitialInventory.initialInventory')
                .then(function() {
                    if (cannotViewState()) {
                        alertService.error('openlmisAuth.authorization.error',
                            'stockInitialInventory.authorization.message');
                    } else {
                        $state.go('openlmis.stockmanagement.initialInventory', {
                            programId: programId
                        });
                    }
                });
        }

        function cannotViewState() {
            var toState = $state.get('openlmis.stockmanagement.initialInventory');
            return toState.accessRights &&
                !authorizationService.hasRights(toState.accessRights, toState.areAllRightsRequired);
        }
    }

})();
