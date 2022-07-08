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
     * @name siglus-issue-draft-list.controller:SiglusIssueDraftListController
     *
     * @description
     * Controller for siglus issue draft list.
     */
    angular
        .module('siglus-issue-draft-list')
        .controller('SiglusIssueDraftListController', controller);

    controller.$inject = ['$scope', '$stateParams', 'adjustmentType', 'user', 'programId', 'facilityId', '$state',
        'alertService', 'confirmService', 'loadingModalService', 'siglusStockIssueService',
        'stockAdjustmentFactory', 'stockAdjustmentService'];

    //NOSONAR at the end of the line of the issue. This will suppress all issues - now and in the future
    function controller($scope, $stateParams, adjustmentType, user, programId, facilityId, $state,
                        alertService, confirmService, loadingModalService, siglusStockIssueService)  {
        var vm = this;

        vm.drafts = [];

        vm.issueToInfo = undefined;

        vm.actionMapper = {
            NOT_YET_STARTED: 'stockPhysicalInventory.start',
            DRAFT: 'stockPhysicalInventory.continue'
        };

        vm.statusMapperMapper = {
            NOT_YET_STARTED: 'stockIssue.notStarted',
            DRAFT: 'stockIssue.draft'
        };

        vm.addDraft = function() {
            if (vm.drafts.length >= 10) {
                alertService.error('issueDraft.exceedTenDraftHint');
            } else {
                var params = {
                    programId: programId,
                    facilityId: facilityId,
                    userId: user.user_id,
                    initialDraftId: _.get(vm.issueToInfo, 'id'),
                    draftType: adjustmentType.state
                };
                siglusStockIssueService.createIssueDraft(params).then(function() {
                    vm.refreshDraftList();
                })
                    .catch(function(error) {
                        if (error.data.isBusinessError
                          && error.data.businessErrorExtraData === 'same drafts more than limitation') {
                            alertService.error('issueDraft.exceedTenDraftHint');
                        }
                    });
            }
        };

        vm.getDestinationName = function() {
            var destinationName = _.get(vm.issueToInfo, 'destinationName');
            return destinationName === 'Outros'
                ? 'Outros: ' + _.get(vm.issueToInfo, 'locationFreeText')
                : destinationName;
        };

        vm.refreshDraftList = function() {
            loadingModalService.open();
            siglusStockIssueService.getIssueDrafts({
                initialDraftId: _.get(vm.issueToInfo, 'id')
            }).then(function(data) {
                vm.drafts = data;
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        vm.updateIssueAndDraftList = function(issueToInfo) {
            vm.issueToInfo = issueToInfo;
            vm.destinationName = vm.getDestinationName();
            vm.refreshDraftList();
        };

        vm.$onInit = function() {
            if ($stateParams.issueToInfo) {
                vm.updateIssueAndDraftList($stateParams.issueToInfo);
            } else {
                siglusStockIssueService.queryIssueToInfo(programId, facilityId, adjustmentType.state)
                    .then(function(issueToInfo) {
                        vm.updateIssueAndDraftList(issueToInfo);
                    });
            }
        };

        vm.removeDraft = function(draft) {
            confirmService.confirmDestroy(
                'issueDraft.confirmRemove',
                'issueDraft.remove'
            ).then(function() {
                loadingModalService.open();
                siglusStockIssueService.removeIssueDraft(draft.id).then(function() {
                    loadingModalService.close();
                    vm.refreshDraftList();
                })
                    .catch(function() {
                        loadingModalService.close();
                    });

            });
        };

        vm.proceed = function(draft) {
            if (draft.status === 'NOT_YET_STARTED') {
                siglusStockIssueService.updateDraftStatus(draft.id, user.username);
            }

            $state.go('openlmis.stockmanagement.issue.draft.creation', {
                programId: programId,
                draftId: _.get(draft, 'id', ''),
                issueToInfo: vm.issueToInfo
            });
        };

    }
})();
