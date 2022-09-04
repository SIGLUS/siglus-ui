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
     * @name siglus-location-adjustment.controller:SiglusLocationAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('siglus-location-adjustment')
        .controller('SiglusLocationAdjustmentController', controller);

    controller.$inject = ['facility', 'programs', 'adjustmentType', '$state', 'user',
        'siglusLocationAdjustmentService', 'loadingModalService'];

    function controller(facility, programs, adjustmentType, $state, user, siglusLocationAdjustmentService,
                        loadingModalService) {
        var vm = this;

        vm.facility = facility;

        vm.user = user;

        vm.programs = programs;

        vm.drafts = [];

        vm.programId = undefined;

        vm.adjustmentType = adjustmentType.state;

        vm.hasExistInitialDraft = false;

        vm.proceed = function() {
            $state.go('openlmis.locationManagement.adjustment.creation', {
                draftId: _.get(vm.drafts, [0, 'id']),
                programId: vm.programId
            });
        };

        vm.start = function() {
            siglusLocationAdjustmentService
                .createDraft(vm.programId, vm.adjustmentType, vm.facility.id, vm.user.user_id)
                .then(function(draft) {
                    $state.go('openlmis.locationManagement.adjustment.creation', {
                        programId: vm.programId,
                        draftId: draft.id
                    });
                });
        };

        vm.$onInit = function() {
            loadingModalService.open();
            vm.programId = _.get(programs, [0, 'id']);
            siglusLocationAdjustmentService.getDraft(vm.programId, vm.adjustmentType, vm.facility.id, vm.user.user_id)
                .then(function(data) {
                    vm.drafts = data;
                    vm.hasExistInitialDraft = data.length > 0;
                })
                .finally(function() {
                    loadingModalService.close();
                });
        };
    }
})();
