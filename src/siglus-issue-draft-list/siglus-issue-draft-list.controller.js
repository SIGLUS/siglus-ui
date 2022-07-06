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
        'draftInfo', 'alertService', 'confirmService', 'siglusStockIssueService', 'stockAdjustmentFactory',
        'stockAdjustmentService'];

    var index = 0;

    function controller($scope, $stateParams, adjustmentType, user, programId, facilityId, $state, draftInfo,
                        alertService, confirmService, siglusStockIssueService, stockAdjustmentFactory,
                        stockAdjustmentService) {
        var vm = this;

        vm.drafts = _.get(draftInfo, 'drafts', []);

        vm.issueToInfo = undefined;

        vm.addDraft = function() {
            if (vm.drafts.length >= 10) {
                alertService.error('issueDraft.exceedTenDraftHint');
            } else {
                // todo remove mock data
                vm.drafts.push({
                    draftNumber: '000000123123120' + index++,
                    status: 'Not Yet Start',
                    isStarter: false,
                    operator: ''
                });
                var params = {
                    programId: programId,
                    facilityId: facilityId,
                    userId: user.user_id,
                    initialDraftId: _.get(vm.issueToInfo, 'id'),
                    draftType: adjustmentType.state,
                    operator: user.username
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

        $scope.$watch(vm.issueToInfo, function() {
            var destinationName = _.get(vm.issueToInfo, 'destinationName');
            vm.destinationName = destinationName === 'Outros'
                ? 'Outros: ' + _.get(vm.issueToInfo, 'locationFreeText')
                : destinationName;
        });

        vm.refreshDraftList = function() {
            siglusStockIssueService.getIssueDrafts({
                initialDraftId: _.get(vm.issueToInfo, 'id')
            }).then(function(data) {
                vm.drafts = data;
            });
        };

        vm.$onInit = function() {
            if ($stateParams.issueToInfo) {
                vm.issueToInfo = $stateParams.issueToInfo;
            } else {
                siglusStockIssueService.queryIssueToInfo(programId, adjustmentType.state)
                    .then(function(data) {
                        vm.issueToInfo = data;
                    });
            }
        };

        vm.removeDraft = function(draft) {
            confirmService.confirmDestroy(
                'issueDraft.confirmRemove',
                'issueDraft.remove'
            ).then(function() {
                vm.drafts = _.filter(vm.drafts, function(item) {
                    return draft.draftNumber !== item.draftNumber;
                });

                siglusStockIssueService.removeIssueDraft(draft.id).then(function() {
                    vm.refreshDraftList();
                });

            });
        };

        vm.proceed = function() {
            stockAdjustmentFactory.getDraft(user.user_id, programId, facilityId, 'issue')
                .then(function(draft) {
                    if (_.isEmpty(draft)) {
                        stockAdjustmentService.createDraft(user.user_id, programId, facilityId, 'issue')
                            .then(function(draft) {
                                $state.go('openlmis.stockmanagement.issue.draft.creation', {
                                    programId: programId,
                                    draftId: _.get(draft, 'id', ''),
                                    issueToInfo: vm.issueToInfo
                                });
                            });
                    }
                    $state.go('openlmis.stockmanagement.issue.draft.creation', {
                        programId: programId,
                        draftId: _.get(draft, 'id', ''),
                        issueToInfo: vm.issueToInfo
                    });
                });
        };

    }
})();
