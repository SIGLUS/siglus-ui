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
   * @ngdoc controller
   * @name siglus-physical-inventory-creation.controller:SiglusPhysicalInventoryCreationController
   *
   * @description
   * Manages physical inventory creation Modal.
   */
    angular
        .module('siglus-physical-inventory-creation')
        .controller('SiglusPhysicalInventoryCreationController', controller);

    controller.$inject = [
        'draft',
        'loadingModalService',
        'modalDeferred',
        '$state',
        'physicalInventoryDraftListService',
        'facilityFactory',
        '$stateParams',
        'physicalInventoryService'
    ];

    function controller(
        draft,
        loadingModalService,
        modalDeferred,
        $state,
        physicalInventoryDraftListService,
        facilityFactory,
        $stateParams,
        physicalInventoryService
    ) {
        var vm = this;
        vm.input = '';
        vm.drafts = [];
        vm.confirm = confirm;
        vm.draft = draft;
        vm.showError = undefined;
        facilityFactory.getUserHomeFacility().then(function(res) {
            vm.facility = res;
        });
        vm.inputValue = function() {
            modalDeferred.resolve(vm.input);
        };

        vm.changeShowError = function() {
            if (vm.validate(vm.input)) {
                vm.showError = undefined;
            }
        };

        vm.validate = function(input) {
            console.log('#### input', input, typeof input);
            return !(input > 10 || input <= 0);
        };

        vm.confirm = function() {
            if (vm.validate(vm.input)) {
                // console.log('输入', vm.input, vm.facility, $stateParams);
                loadingModalService.open();
                physicalInventoryService.createDraft(
                    $stateParams.programId,
                    vm.facility.id,
                    vm.input
                ).then(function() {
                    // console.log('返回值', res);
                    modalDeferred.resolve();
                    loadingModalService.close();
                    $state.go(
                        'openlmis.stockmanagement.physicalInventory.draftList'
                    );
                })
                    .catch(function(err) {
                        console.log('err --->>>', err);
                    });
                // console.log(physicalInventoryDraftListService);
                // loadingModalService.open();
                // physicalInventoryDraftListService.getDraftList(draft.programId,
                //     draft.facilityId, draft.isDraft, vm.input).then(function() {
                //     loadingModalService.close();
                //     $state.go(
                //         'openlmis.stockmanagement.physicalInventory.draftList'
                //     );
                // });
            } else {
                vm.showError = 1;
            }
        };
    }

})();