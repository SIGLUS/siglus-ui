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
        .module('siglus-issue-draft-list')
        .controller('SiglusIssueDraftListController', controller);

    controller.$inject = ['user', 'programId', 'facilityId', '$state', 'draftInfo', 'alertService',
        'confirmService', 'siglusStockIssueService', 'stockAdjustmentFactory', 'stockAdjustmentService'];

    var index = 0;

    function controller(user, programId, facilityId, $state, draftInfo, alertService, confirmService,
                        siglusStockIssueService, stockAdjustmentFactory, stockAdjustmentService) {
        var vm = this;

        vm.issueTo = '';

        vm.documentationNo =  _.get(draftInfo, 'documentationNo', '');

        vm.drafts = _.get(draftInfo, 'drafts', []);

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
                // todo set params
                siglusStockIssueService.createIssueDraft().then(function() {
                    vm.refreshDraftList();
                })
                    .catch(function() {
                        alertService.error('issueDraft.exceedTenDraftHint');
                    });
            }
        };

        vm.$onInit = function() {
            var destinationFacility = _.get(draftInfo, 'destinationFacility', '');
            var issueTo = _.get(draftInfo, 'issueTo', '');
            vm.issueTo = issueTo === 'Outros' ? 'Outros: ' + destinationFacility : issueTo;
        };

        vm.refreshDraftList = function() {
            // todo set params
            siglusStockIssueService.getIssueDrafts().then(function(data) {
                vm.drafts = data;
            });
        };

        vm.removeDraft = function(draft) {
            confirmService.confirmDestroy(
                'issueDraft.confirmRemove',
                'issueDraft.remove'
            ).then(function() {
                vm.drafts = _.filter(vm.drafts, function(item) {
                    return draft.draftNumber !== item.draftNumber;
                });
                // todo set params
                siglusStockIssueService.removeIssueDraft().then(function() {
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
                                    draftId: _.get(draft, 'id', '')
                                });
                            });
                    }
                    $state.go('openlmis.stockmanagement.issue.draft.creation', {
                        programId: programId,
                        draftId: _.get(draft, 'id', '')
                    });
                });
        };

    }
})();
