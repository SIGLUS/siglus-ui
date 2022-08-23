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
     * @name stock-adjustment.controller:StockAdjustmentController
     *
     * @description
     * Controller for making adjustment.
     */
    angular
        .module('siglus-location-movement')
        .controller('SiglusLocationMovementController', controller);

    controller.$inject = ['$stateParams', 'user', 'facility', 'programs', '$state',
        'siglusLocationMovementService', 'loadingModalService'];

    function controller($stateParams, user, facility, programs, $state,
                        siglusLocationMovementService, loadingModalService) {
        var vm = this;

        vm.facility = facility;

        vm.drafts = [];

        vm.programs = programs;

        vm.programId = undefined;

        vm.hasExistInitialDraft = false;

        vm.key = function(secondaryKey) {
            return 'stockIssue' + '.' + secondaryKey;
        };

        vm.proceed = function() {
            $state.go('openlmis.locationManagement.movement.creation', {
                draftId: _.get(vm.drafts, [0, 'id']),
                programId: vm.programId
            });
        };

        vm.start = function() {
            var params = {
                programId: vm.programId,
                facilityId: facility.id,
                userId: user.user_id
            };
            siglusLocationMovementService.createMovementDraft(params).then(function(draft) {
                $state.go('openlmis.locationManagement.movement.creation', {
                    programId: vm.programId,
                    draftId: draft.id
                });
            });
        };

        vm.$onInit = function() {
            loadingModalService.open();
            vm.programId = _.get(programs, [0, 'id']);
            siglusLocationMovementService.getMovementDrafts(vm.programId)
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
