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

    controller.$inject = ['$scope', '$stateParams', 'user', 'programId', 'facility', '$state',
        'alertService', 'confirmService', 'loadingModalService', 'siglusStockIssueService',
        'alertConfirmModalService', 'siglusStockUtilsService', 'DRAFT_TYPE', 'siglusStockDispatchService'];

    function controller($scope, $stateParams, user, programId, facility, $state,
                        alertService, confirmService, loadingModalService, siglusStockIssueService,
                        alertConfirmModalService, siglusStockUtilsService, DRAFT_TYPE,
                        siglusStockDispatchService)  {
        var vm = this;

        vm.drafts = [];

        vm.showToolBar = false;

        vm.initialDraftInfo = undefined;

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

        vm.titleMapper = {
            issue: 'issueDraft.issueToTitle',
            receive: 'issueDraft.receiveFromTitle'
        };

        vm.noDataInfoMapper = {
            issue: 'issueDraft.selectFirst',
            receive: 'issueDraft.selectFirstForReceive'
        };

        vm.draftType = $stateParams.draftType;

        vm.addDraft = function() {
            if (vm.drafts.length >= 10) {
                alertService.error('issueDraft.exceedTenDraftHint');
            } else {
                var params = {
                    programId: programId,
                    facilityId: facility.id,
                    userId: user.user_id,
                    initialDraftId: _.get(vm.initialDraftInfo, 'id'),
                    draftType: DRAFT_TYPE[$stateParams.moduleType][vm.draftType]
                };
                siglusStockDispatchService.createDraft(params, $stateParams.moduleType).then(function() {
                    vm.refreshDraftList();
                })
                    .catch(function(error) {
                        if (error.data.isBusinessError
                          && error.data.businessErrorExtraData === 'subDrafts are more than limitation') {
                            alertService.error('issueDraft.exceedTenDraftHint');
                        }
                    });
            }
        };

        vm.refreshDraftList = function() {
            loadingModalService.open();
            siglusStockDispatchService.getDrafts({
                initialDraftId: _.get(vm.initialDraftInfo, 'id')
            }, $stateParams.moduleType).then(function(data) {
                vm.drafts = data;
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
                $state.go('openlmis.stockmanagement.' +  vm.draftType + '.draft.merge', {
                    programId: programId,
                    initialDraftInfo: vm.initialDraftInfo,
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
                siglusStockDispatchService.deleteAllDraft($stateParams.initialDraftId, $stateParams.moduleType)
                    .then(function() {
                        $state.go('openlmis.' + $stateParams.moduleType + '.' + vm.draftType);
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });
            });
        };

        vm.updateDraftList = function(initialDraftInfo) {
            vm.initialDraftInfo = initialDraftInfo;
            vm.initialDraftName = siglusStockUtilsService.getInitialDraftName(initialDraftInfo, vm.draftType);
            vm.showToolBar = initialDraftInfo.canMergeOrDeleteSubDrafts;
            vm.refreshDraftList();
        };

        vm.$onInit = function() {
            if ($stateParams.initialDraftInfo) {
                vm.updateDraftList($stateParams.initialDraftInfo);
            } else {
                loadingModalService.open();
                siglusStockDispatchService.queryInitialDraftInfo(programId,
                    DRAFT_TYPE[$stateParams.moduleType][vm.draftType], $stateParams.moduleType, facility.id)
                    .then(function(initialDraftInfo) {
                        vm.updateDraftList(initialDraftInfo);
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
                siglusStockDispatchService.removeIssueDraft(draft.id, $stateParams.initialDraftId,
                    $stateParams.moduleType).then(function() {
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
                siglusStockDispatchService.updateDraftStatus(draft.id, user.username).then(function() {
                    $state.go('openlmis.' + $stateParams.moduleType + '.' + vm.draftType + '.draft.creation', {
                        programId: programId,
                        draftId: _.get(draft, 'id', ''),
                        initialDraftInfo: vm.initialDraftInfo,
                        facility: facility
                    });
                });
                return;
            }

            $state.go('openlmis.' + $stateParams.moduleType + '.' + vm.draftType + '.draft.creation', {
                programId: programId,
                draftId: _.get(draft, 'id', ''),
                initialDraftInfo: vm.initialDraftInfo,
                facility: facility
            });
        };

        vm.view = function(draft) {
            $state.go('openlmis.' + $stateParams.moduleType + '.' + vm.draftType + '.draft.view', {
                programId: programId,
                draftId: _.get(draft, 'id', ''),
                initialDraftInfo: vm.initialDraftInfo,
                facility: facility
            });
        };

    }
})();
