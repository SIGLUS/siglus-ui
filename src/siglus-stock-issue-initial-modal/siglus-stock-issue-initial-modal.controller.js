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

        vm.adjustmentType = adjustmentType;

        vm.changeIssueTo = function() {
            if (!_.isEmpty(vm.destinationFacility)) {
                vm.destinationFacility = '';
            }
        };

        vm.titleMapper = {
            issue: 'stockIssueInitialModal.title',
            receive: 'stockIssueInitialModal.titleForReceive'
        };

        vm.typeLabelMapper = {
            issue: 'stockIssueInitialModal.issueTo',
            receive: 'stockIssueInitialModal.receiveFrom'
        };

        vm.submitForm = function() {
            if (vm.hasError) {
                modalDeferred.resolve(true);
            } else {
                var formInfo = {
                    issue: {
                        destinationId: vm.issueTo.id,
                        destinationName: vm.issueTo.name
                    },
                    receive: {
                        sourceId: vm.issueTo.id,
                        sourceName: vm.issueTo.name
                    }
                };
                loadingModalService.open();
                siglusStockIssueService.initDraft(_.extend({
                    programId: programId,
                    facilityId: facilityId,
                    draftType: adjustmentType.state,
                    documentNumber: vm.documentationNo,
                    locationFreeText: vm.destinationFacility
                }, formInfo[adjustmentType.state])).then(function(initialDraftInfo) {
                    modalDeferred.resolve();
                    $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.draft', {
                        programId: programId,
                        initialDraftId: initialDraftInfo.id,
                        initialDraftInfo: initialDraftInfo,
                        draftType: adjustmentType.state
                    });
                })
                    .catch(function(error) {
                        if (error.data.isBusinessError
                          && error.data.businessErrorExtraData === 'same initial draft exists') {
                            vm.hasError = true;
                        }
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });
            }

        };

        vm.$onInit = function() {
            loadingModalService.open();
            var getAssignments = adjustmentType.state === 'issue'
                ?  sourceDestinationService.getDestinationAssignments
                : sourceDestinationService.getSourceAssignments;

            getAssignments(programId, facilityId).then(function(data) {
                vm.issueToList = _.sortBy(_.uniq(data, false, function(item) {
                    return item.name;
                }), 'name');
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };
    }
})();
