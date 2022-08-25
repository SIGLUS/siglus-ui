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
        .module('siglus-physical-inventory-creation')
        .controller('SiglusPhysicalInventoryCreationController', controller);

    controller.$inject = [
        'loadingModalService',
        'modalDeferred',
        '$state',
        'facilityFactory',
        '$stateParams',
        'physicalInventoryService',
        'programId',
        'type'
    ];

    function controller(
        loadingModalService,
        modalDeferred,
        $state,
        facilityFactory,
        $stateParams,
        physicalInventoryService,
        programId,
        type
    ) {
        var vm = this;
        var debounceTime = 50;
        vm.creationType = type;
        vm.showConflictStatus = false;
        vm.userInputSplitNum = null;
        vm.confirm = _.throttle(confirm, debounceTime);
        vm.showError = false;
        vm.showRequired = false;
        facilityFactory.getUserHomeFacility().then(function(res) {
            vm.facility = res;
        });

        vm.changeShowError = function() {
            if (vm.isValid(vm.userInputSplitNum)) {
                vm.showError = false;
            }
            if (!_.isNull(vm.userInputSplitNum)) {
                vm.showRequired = false;
            }
        };

        vm.inventoryType = 'product';

        vm.isInitialInventory = !!programId;

        vm.isValid = function(val) {
            return val > 0 && val <= 10;
        };

        function confirm() {
            if (vm.showConflictStatus) {
                $state.reload();
                modalDeferred.reject();
                return;
            }
            if (_.isNull(vm.userInputSplitNum)) {
                vm.showRequired = true;
                vm.showError = false;
                return;
            }

            if (vm.isValid(vm.userInputSplitNum)) {
                loadingModalService.open();
                var locationManagementOption = '';
                if (vm.creationType === 'location') {
                    locationManagementOption = vm.inventoryType;
                    physicalInventoryService.createLocationDraft(
                        $stateParams.programId ? $stateParams.programId : programId,
                        vm.facility.id,
                        vm.userInputSplitNum,
                        !!programId,
                        locationManagementOption
                    ).then(function() {
                        modalDeferred.resolve();
                        loadingModalService.close();
                        if (programId) {
                            $state.go(
                                'openlmis.stockmanagement.initialInventory', {
                                    programId: programId
                                }
                            );
                        } else {
                            $stateParams.drafts = null;
                            var stateParamsCopy = angular.copy($stateParams);
                            stateParamsCopy.creationType = 'location';
                            vm.creationType === 'location' ? $state.go(
                                'openlmis.locationManagement.physicalInventory.draftList',
                                stateParamsCopy
                            ) : $state.go(
                                'openlmis.stockmanagement.physicalInventory.draftList'
                            );
                        }
                    })
                        .catch(function(err) {
                            catchError(err);
                        });
                    return;
                }
                physicalInventoryService.createDraft(
                    $stateParams.programId ? $stateParams.programId : programId,
                    vm.facility.id,
                    vm.userInputSplitNum,
                    !!programId
                ).then(function() {
                    modalDeferred.resolve();
                    loadingModalService.close();
                    if (programId) {
                        $state.go(
                            'openlmis.stockmanagement.initialInventory', {
                                programId: programId
                            }
                        );
                    } else {
                        $stateParams.drafts = null;
                        var stateParamsCopy = angular.copy($stateParams);
                        stateParamsCopy.creationType = 'location';
                        vm.creationType === 'location' ? $state.go(
                            'openlmis.locationManagement.physicalInventory.draftList',
                            stateParamsCopy
                        ) : $state.go(
                            'openlmis.stockmanagement.physicalInventory.draftList'
                        );
                    }
                })
                    .catch(function(err) {
                        catchError(err);
                    });
            } else {
                vm.showError = true;
            }
        }

        function catchError(err) {
            if (err.status === 400 && err.data.isBusinessError) {
                loadingModalService.close();
                vm.showConflictStatus = true;
            }
        }
    }

})();
