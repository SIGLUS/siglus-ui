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
        .module('stock-issue')
        .controller('StockIssueInitialController', controller);

    // SIGLUS-REFACTOR: add user, drafts
    controller.$inject = ['$stateParams', 'issueToInfo', 'facility', 'programs', 'adjustmentType',
        '$state', 'user', 'siglusInitialIssueModalService',
        'siglusStockIssueService', 'loadingModalService'];
    // SIGLUS-REFACTOR: ends here

    function controller($stateParams, issueToInfo, facility, programs, adjustmentType, $state, user,
                        siglusInitialIssueModalService, siglusStockIssueService,
                        loadingModalService) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        vm.issueToInfo = issueToInfo || {};

        /**
         * @ngdoc property
         * @propertyOf stock-adjustment.controller:StockAdjustmentController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = programs;

        vm.adjustmentType = adjustmentType;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + '.' + secondaryKey;
        };

        vm.proceedForIssue = function(program) {
            $state.go('openlmis.stockmanagement.issue.draft', {
                facility: facility,
                programId: program.id,
                initialDraftId: vm.issueToInfo.id,
                issueToInfo: vm.issueToInfo
            });
        };

        vm.start = function(program) {
            siglusInitialIssueModalService.show(program.id, facility.id, adjustmentType)
                .then(function(loadIssueToInfo) {
                    if (loadIssueToInfo) {
                        loadingModalService.open();
                        siglusStockIssueService.queryIssueToInfo(program.id, facility.id, adjustmentType.state)
                            .then(function(data) {
                                vm.issueToInfo = data;
                            })
                            .finally(function() {
                                loadingModalService.close();
                            });
                    }
                });
        };
    }
})();
