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

    angular
        .module('stock-issue')
        .controller('StockReceiveInitialController', controller);

    controller.$inject = ['$stateParams', 'facility', 'programs', 'adjustmentType',
        '$state', 'user', 'siglusInitialIssueModalService',
        'siglusStockIssueService', 'DRAFT_TYPE', 'loadingModalService', 'siglusStockUtilsService',
        'siglusStockDispatchService', 'moduleType', 'siglusStockIssueService'];

    function controller($stateParams, facility, programs, adjustmentType, $state, user,
                        siglusInitialIssueModalService, siglusStockIssueService,
                        DRAFT_TYPE, loadingModalService, siglusStockUtilsService,
                        siglusStockDispatchService, moduleType) {
        var vm = this;

        vm.facility = facility;
        vm.programs = programs;
        vm.program = programs[0];

        vm.drafts = [{}];

        vm.hasExistInitialDraft = false;

        vm.draftType = DRAFT_TYPE[moduleType][adjustmentType.state];

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + '.' + secondaryKey;
        };

        vm.proceedForIssue = function(draft) {
            $state.go('openlmis.' + moduleType + '.' + adjustmentType.state + '.draft', {
                facility: facility,
                programId: vm.program.id,
                initialDraftId: draft.id,
                initialDraftInfo: draft,
                draftType: adjustmentType.state,
                moduleType: moduleType
            });
        };

        vm.start = function() {
            siglusInitialIssueModalService.show(vm.program.id, facility.id, adjustmentType.state, moduleType);
        };

        vm.refreshDraftList = function() {
            siglusStockDispatchService.queryInitialDraftInfo(
                _.get(programs, [0, 'id']), vm.draftType, moduleType, facility.id
            ).then(function(data) {
                if (data.length === 0) {
                    vm.initialDraftInfo = [{}];
                } else {
                    vm.initialDraftInfo = data;
                }
                vm.initialDraftInfo.forEach(function(draft) {
                    draft.hasExistInitialDraft = siglusStockUtilsService
                        .isExistInitialDraft(draft, adjustmentType.state);
                });
                loadingModalService.close();
            })
                .catch(function() {
                    loadingModalService.close();
                });
        };

        vm.$onInit = function() {
            loadingModalService.open();
            vm.initialDraftInfo = [];
            vm.refreshDraftList();
        };

        vm.addNewIssue = function() {
            vm.initialDraftInfo.push({});
        };
    }
})();
