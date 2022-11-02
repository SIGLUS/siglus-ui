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
        'siglusLocationMovementService', 'siglusLocationMovementUpgradeService', 'currentUserHomeFacilityService',
        'alertConfirmModalService', 'loginService'
    ];

    function siglusInitialInventoryNavigationInterceptor(
        $q, $rootScope, loadingModalService, confirmService, $state,
        stockmanagementUrlFactory, $http, programService,
        facilityFactory, physicalInventoryFactory,
        currentUserService, authorizationService, alertService, $stateParams,
        SiglusPhysicalInventoryCreationService, SiglusInitialInventoryResource, navigationStateService,
        siglusLocationMovementService, siglusLocationMovementUpgradeService, currentUserHomeFacilityService,
        alertConfirmModalService, loginService
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

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
            // TODO RENAME FILE, NOT JUST FOR INITIAL INVENTORY, NOT WORKING WHEN PUT LOGIC IN OTHER PLACE
            if ((!toState.name.contains('movement.creation')
                && toState.showInNavigation
                && toState.url !== '/home')) {
                var user = currentUserService.getUserInfo().$$state.value;
                if (user) {
                    var shouldUpgradeMoveProduct = siglusLocationMovementUpgradeService.checkShouldUpgradeMoveProduct();
                    if (shouldUpgradeMoveProduct) {
                        loadingModalService.close();
                        event.preventDefault();
                        if (fromState.name !== 'openlmis.locationManagement.movement.creation') {
                            if (toState.name === 'openlmis.locationManagement.movement') {
                                return siglusLocationMovementUpgradeService.startVirtualMovement();
                            }
                            siglusLocationMovementUpgradeService.showConfirmAndStartVirtualMovement();
                        }
                    }
                }

            }
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.url === '/home') {
                var initUser = currentUserService.getUserInfo().$$state.value;

                var doInitialMoveProduct = function() {
                    siglusLocationMovementUpgradeService.getNeedInitiallyMoveProduct(initUser.homeFacilityId)
                        .then(function() {
                            if (checkInitialInventoryStatus()) {
                                event.preventDefault();
                                checkDraftIsStarter();
                            } else if (siglusLocationMovementUpgradeService.checkInited()) {
                                var shouldUpgradeMoveProduct =
                                    siglusLocationMovementUpgradeService.checkShouldUpgradeMoveProduct();
                                if (shouldUpgradeMoveProduct) {
                                    return siglusLocationMovementUpgradeService
                                        .showConfirmAndStartVirtualMovement();
                                }
                            } else {
                                var user = currentUserService.getUserInfo().$$state.value;
                                if (user) {
                                    siglusLocationMovementUpgradeService.init(user.homeFacilityId);
                                }
                            }
                        });
                };

                $q.all([facilityFactory.getUserHomeFacility(), currentUserHomeFacilityService.getHomeFacility()])
                    .then(function(response) {
                        var currentEnableStatus = _.get(response[0], 'enableLocationManagement');
                        var cachedEnableStatus = _.get(response[1], 'enableLocationManagement');
                        if (currentEnableStatus === cachedEnableStatus) {
                            if (initUser.homeFacilityId && currentEnableStatus) {
                                doInitialMoveProduct();
                            } else if (checkInitialInventoryStatus()) {
                                event.preventDefault();
                                checkDraftIsStarter();
                            }
                        } else {
                            var message = currentEnableStatus ? 'interceptor.currentIsNotStockManagement'
                                : 'interceptor.currentIsNotLocationManagement';
                            alertConfirmModalService.error(
                                message,
                                '',
                                ['', 'PhysicalInventoryDraftList.confirm']
                            ).then(function() {
                                loginService.logout()
                                    .then(function() {
                                        $rootScope.$emit('openlmis-auth.logout');
                                        $state.go('auth.login');
                                    });
                            });
                        }
                    });

            }
        });

        function checkInitialInventoryStatus() {
            var user = currentUserService.getUserInfo().$$state.value;
            if (_.isUndefined(user) || _.isUndefined(user.canInitialInventory)) {
                return false;
            }
            return user.canInitialInventory;
        }

        function checkInitialInventoryStatusByQuery() {
            var defered = $q.defer();
            var user = currentUserService.getUserInfo().$$state.value;
            new SiglusInitialInventoryResource().query({
                facility: user.homeFacilityId
            })
                .then(function(res) {
                    defered.resolve(res);
                });

            return defered.promise;
        }

        function checkDraftIsStarter(shouldNotPopComfirm) {
            var promise = checkInitialInventoryStatusByQuery();
            promise.then(function(res) {
                if (res.canInitialInventory) {
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
                                        .show(responses[0][0].id, false, responses[1]);
                                } else {
                                    loadingModalService.close();
                                    if (shouldNotPopComfirm) {
                                        $state.go('openlmis.stockmanagement.initialInventory', {
                                            programId: responses[0][0].id
                                        });
                                    } else {
                                        propopConfirm(responses[0][0].id, responses[1]);
                                    }

                                }
                            })
                            .finally(loadingModalService.close);

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

        function propopConfirm(programId, facility) {

            confirmService.confirm('stockInitialDiscard.initialInventory', 'stockInitialInventory.initialInventory')
                .then(function() {
                    if (cannotViewState()) {
                        alertService.error('openlmisAuth.authorization.error',
                            'stockInitialInventory.authorization.message');
                    } else {
                        var url = facility.enableLocationManagement
                            ? 'openlmis.locationManagement.initialInventory'
                            : 'openlmis.stockmanagement.initialInventory';
                        var params = facility.enableLocationManagement ? {
                            locationManagementOption: 'location',
                            programId: programId
                        } : {
                            programId: programId
                        };
                        $state.go(url, params);
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
