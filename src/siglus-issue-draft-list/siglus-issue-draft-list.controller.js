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

    controller.$inject = ['issueTo', 'documentationNo', 'alertService', 'confirmService'];

    var index = 0;

    function controller(issueTo, documentationNo, alertService, confirmService) {
        var vm = this;

        vm.issueTo = issueTo;

        vm.documentationNo = documentationNo;

        vm.drafts = [];

        vm.addDraft = function() {
            if (vm.drafts.length >= 10) {
                alertService.error('issueDraft.exceedTenDraftHint');
            } else {
                vm.drafts.push({
                    draftNumber: '000000123123120' + index++,
                    status: 'Not Yet Start',
                    operator: ''
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
            });
        };

    }
})();
