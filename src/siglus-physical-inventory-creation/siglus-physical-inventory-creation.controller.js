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
        'programId'
    ];

    function controller(
        loadingModalService,
        modalDeferred,
        $state,
        facilityFactory,
        $stateParams,
        physicalInventoryService,
        programId
    ) {
        var vm = this;
        vm.showConflictStatus = false;
        vm.userInputSplitNum = '';
        vm.confirm = confirm;
        vm.showError = false;
        facilityFactory.getUserHomeFacility().then(function(res) {
            vm.facility = res;
        });

        vm.changeShowError = function() {
            if (vm.isValid(vm.userInputSplitNum)) {
                vm.showError = undefined;
            }
        };

        vm.isValid = function(val) {
            return val > 0 && val <= 10;
        };

        vm.confirm = function() {
            if (vm.showConflictStatus) {
                $state.reload();
                modalDeferred.reject();
                return;
            }
            if (vm.isValid(vm.userInputSplitNum)) {
                loadingModalService.open();
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
                        $state.go(
                            'openlmis.stockmanagement.physicalInventory.draftList'
                        );
                    }
                })
                    .catch(function(err) {
                        if (err.status === 400) {
                            loadingModalService.close();
                            vm.showConflictStatus = true;
                        }
                    });
            } else {
                vm.showError = true;
            }
        };
    }

})();