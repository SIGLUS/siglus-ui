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
   * @name issue-draft-initial-modal.controller:IssueDraftInitialModalController
   *
   * @description
   * Manages issue draft initital modal
   */
    angular
        .module('siglus-stock-issue-initial-modal')
        .controller('SiglusInitialIssueModalController', controller);

    controller.$inject = ['programId', 'facilityId', 'adjustmentType', '$state', 'siglusInitialIssueModalService',
        'modalDeferred', 'siglusStockIssueService', 'sourceDestinationService', 'loadingModalService'];

    function controller(programId, facilityId, adjustmentType, $state, siglusInitialIssueModalService, modalDeferred,
                        siglusStockIssueService, sourceDestinationService, loadingModalService) {
        var vm = this;

        vm.issueTo = undefined;

        vm.hasError = false;

        vm.documentationNo = '';

        vm.destinationFacility = '';

        vm.issueToList = [];

        vm.changeIssueTo = function() {
            if (!_.isEmpty(vm.destinationFacility)) {
                vm.destinationFacility = '';
            }
        };

        vm.submitForm = function() {
            if (vm.hasError) {
                modalDeferred.resolve(true);
            } else {
                siglusStockIssueService.initIssueDraft({
                    programId: programId,
                    facilityId: facilityId,
                    destinationId: vm.issueTo.id,
                    draftType: adjustmentType.state,
                    destinationName: vm.issueTo.name,
                    documentNumber: vm.documentationNo,
                    locationFreeText: vm.destinationFacility
                }).then(function(issueToInfo) {
                    modalDeferred.resolve();
                    $state.go('openlmis.stockmanagement.issue.draft', {
                        facilityId: facilityId,
                        programId: programId,
                        initialDraftId: issueToInfo.id,
                        issueToInfo: issueToInfo
                    });
                })
                    .catch(function(error) {
                        if (error.data.isBusinessError
                          && error.data.businessErrorExtraData === 'same initial draft exists') {
                            vm.hasError = true;
                        }
                    });
            }

        };

        vm.$onInit = function() {
            loadingModalService.open();
            sourceDestinationService.getDestinationAssignments(programId, facilityId).then(function(data) {
                vm.issueToList = data;
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };
    }
})();
