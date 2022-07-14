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

    controller.$inject = ['$scope', '$stateParams', 'adjustmentType', 'user', 'programId', 'facility', '$state',
        'alertService', 'confirmService', 'loadingModalService', 'siglusStockIssueService', 'alertConfirmModalService'];

    //NOSONAR at the end of the line of the issue. This will suppress all issues - now and in the future
    function controller($scope, $stateParams, adjustmentType, user, programId, facility, $state,
                        alertService, confirmService, loadingModalService, siglusStockIssueService,
                        alertConfirmModalService)  {
        var vm = this;

        vm.drafts = [];

        vm.showToolBar = false;

        vm.issueToInfo = undefined;

        vm.actionMapper = {
            NOT_YET_STARTED: 'stockPhysicalInventory.start',
            DRAFT: 'stockPhysicalInventory.continue',
            SUBMITTED: 'stockIssue.view'
        };

        vm.statusMapperMapper = {
            NOT_YET_STARTED: 'stockIssue.notStarted',
            DRAFT: 'stockIssue.draft',
            SUBMITTED: 'stockIssue.submitted'
        };

        vm.addDraft = function() {
            if (vm.drafts.length >= 10) {
                alertService.error('issueDraft.exceedTenDraftHint');
            } else {
                var params = {
                    programId: programId,
                    facilityId: facility.id,
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
                vm.showToolBar = true;
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };

        function isAllDraftSubmitted() {
            return _.size(_.filter(vm.drafts, function(item) {
                return item.status !== 'SUBMITTED';
            })) === 0;
        }

        vm.mergeDrafts = function() {
            if (isAllDraftSubmitted()) {
                $state.go('openlmis.stockmanagement.issue.draft.merge', {
                    programId: programId,
                    draftId: '',
                    issueToInfo: vm.issueToInfo,
                    facility: facility
                });
            } else {
                alertService.error('PhysicalInventoryDraftList.mergeError');
            }
        };

        vm.deleteDrafts = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                siglusStockIssueService.deleteAllDraft()
                    .then(function() {
                        $state.go('openlmis.stockmanagement.issue');
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });
            });
        };

        vm.updateIssueAndDraftList = function(issueToInfo) {
            vm.issueToInfo = issueToInfo;
            vm.destinationName = vm.getDestinationName();
            vm.refreshDraftList();
        };

        vm.isAllowedClick = function(drafts) {
            return drafts.length === 0;
        };

        vm.$onInit = function() {
            if ($stateParams.issueToInfo) {
                vm.updateIssueAndDraftList($stateParams.issueToInfo);
            } else {
                loadingModalService.open();
                siglusStockIssueService.queryIssueToInfo(programId, facility.id, adjustmentType.state)
                    .then(function(issueToInfo) {
                        vm.updateIssueAndDraftList(issueToInfo);
                    })
                    .catch(function() {
                        loadingModalService.close();
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
                issueToInfo: vm.issueToInfo,
                facility: facility
            });
        };

    }
})();
