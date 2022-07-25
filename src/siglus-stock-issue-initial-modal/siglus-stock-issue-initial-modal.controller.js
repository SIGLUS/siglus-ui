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

    controller.$inject = ['programId', 'facilityId', 'draftType', '$state', 'siglusInitialIssueModalService',
        'modalDeferred', 'siglusStockIssueService', 'sourceDestinationService', 'loadingModalService'];

    function controller(programId, facilityId, draftType, $state, siglusInitialIssueModalService, modalDeferred,
                        siglusStockIssueService, sourceDestinationService, loadingModalService) {
        var vm = this;

        vm.location = undefined;

        vm.hasError = false;

        vm.documentNumber = '';

        vm.locationFreeText = '';

        vm.locationList = [];

        vm.draftType = draftType;

        vm.changeIssueTo = function() {
            if (!_.isEmpty(vm.locationFreeText)) {
                vm.locationFreeText = '';
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
                        destinationId: vm.location.node.id,
                        destinationName: vm.location.name
                    },
                    receive: {
                        sourceId: vm.location.node.id,
                        sourceName: vm.location.name
                    }
                };
                loadingModalService.open();
                siglusStockIssueService.initDraft(_.extend({
                    programId: programId,
                    facilityId: facilityId,
                    draftType: draftType,
                    documentNumber: vm.documentNumber,
                    locationFreeText: vm.locationFreeText
                }, formInfo[draftType])).then(function(initialDraftInfo) {
                    modalDeferred.resolve();
                    $state.go('openlmis.stockmanagement.' + draftType + '.draft', {
                        programId: programId,
                        initialDraftId: initialDraftInfo.id,
                        draftType: draftType
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
            var getAssignments = draftType === 'issue'
                ?  sourceDestinationService.getDestinationAssignments
                : sourceDestinationService.getSourceAssignments;

            getAssignments(programId, facilityId).then(function(data) {
                vm.locationList = _.sortBy(_.uniq(data, false, function(item) {
                    return item.name;
                }), 'name');
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };
    }
})();
