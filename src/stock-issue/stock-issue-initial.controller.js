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
    controller.$inject = ['$stateParams', 'facility', 'programs', 'adjustmentType',
        '$state', 'user', 'siglusInitialIssueModalService',
        'siglusStockIssueService', 'loadingModalService', 'siglusStockUtilsService'];
    // SIGLUS-REFACTOR: ends here

    function controller($stateParams, facility, programs, adjustmentType, $state, user,
                        siglusInitialIssueModalService, siglusStockIssueService,
                        loadingModalService, siglusStockUtilsService) {
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

        vm.initialDraftInfo = {};

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

        vm.hasExistInitialDraft = false;

        vm.draftType = adjustmentType.state;

        vm.adjustmentType = adjustmentType;

        vm.key = function(secondaryKey) {
            return adjustmentType.prefix + '.' + secondaryKey;
        };

        vm.proceedForIssue = function(program) {
            $state.go('openlmis.stockmanagement.' + vm.draftType + '.draft', {
                facility: facility,
                programId: program.id,
                initialDraftId: vm.initialDraftInfo.id,
                initialDraftInfo: vm.initialDraftInfo,
                draftType: vm.draftType
            });
        };

        vm.start = function(program) {
            siglusInitialIssueModalService.show(program.id, facility.id, vm.draftType)
                .then(function(loadIssueToInfo) {
                    if (loadIssueToInfo) {
                        loadingModalService.open();
                        siglusStockIssueService.queryInitialDraftInfo(program.id, facility.id, vm.draftType)
                            .then(function(data) {
                                vm.initialDraftInfo = data;
                            })
                            .finally(function() {
                                loadingModalService.close();
                            });
                    }
                });
        };

        vm.$onInit = function() {
            loadingModalService.open();
            siglusStockIssueService.queryInitialDraftInfo(
                _.get(programs, [0, 'id']), facility.id, vm.draftType
            ).then(function(data) {
                vm.initialDraftInfo = data;
                vm.hasExistInitialDraft = siglusStockUtilsService.isExistInitialDraft(data, vm.draftType);
            })
                .finally(function() {
                    loadingModalService.close();
                });
        };
    }
})();
