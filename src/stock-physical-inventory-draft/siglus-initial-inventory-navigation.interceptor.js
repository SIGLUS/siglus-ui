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
     * @name stock-physical-inventory-draft.siglusInitialInventoryNavigationInterceptor
     *
     * @description
     * Check if state being transitioned is able to be viewed initial inventory, if the
     * initial inventory hasn't been finished.
     */
    angular.module('stock-physical-inventory-draft')
        .run(siglusInitialInventoryNavigationInterceptor);

    siglusInitialInventoryNavigationInterceptor.$inject = [
        '$rootScope', 'loadingModalService', 'confirmService', '$state', 'stockmanagementUrlFactory',
        '$http', 'programService', 'facilityFactory', 'physicalInventoryFactory', 'currentUserService',
        'authorizationService', 'alertService'
    ];

    function siglusInitialInventoryNavigationInterceptor($rootScope, loadingModalService, confirmService, $state,
                                                         stockmanagementUrlFactory, $http, programService,
                                                         facilityFactory, physicalInventoryFactory,
                                                         currentUserService, authorizationService, alertService) {
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (checkInitialInventoryStatus() && !toState.url.contains('/initialInventory')
                && toState.showInNavigation && toState.url !== '/home') {
                event.preventDefault();
                loadingModalService.close();
                if ($state.current.url === '/home') {
                    propopConfirm();
                } else {
                    $state.go('openlmis.home');
                }
            }
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            if (checkInitialInventoryStatus() && toState.url === '/home') {
                event.preventDefault();
                loadingModalService.close();
                propopConfirm();
            }
        });

        function checkInitialInventoryStatus() {
            currentUserService.getUserInfo().then(function() {
                return;
            });
            var user = currentUserService.getUserInfo().$$state.value;

            if (_.isUndefined(user) || _.isUndefined(user.canInitialInventory)) {
                return false;
            }
            return user.canInitialInventory;
        }

        function propopConfirm() {
            confirmService.confirm('stockInitialDiscard.initialInventory', 'stockInitialInventory.initialInventory')
                .then(function() {
                    if (cannotViewState()) {
                        alertService.error('openlmisAuth.authorization.error',
                            'stockInitialInventory.authorization.message');
                    } else {
                        $state.go('openlmis.stockmanagement.initialInventory');
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
