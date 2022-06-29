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
        .module('stock-adjustment')
        .controller('StockAdjustmentController', controller);

    // SIGLUS-REFACTOR: add user, drafts
    controller.$inject = ['facility', 'programs', 'adjustmentType', '$state', 'user', 'drafts',
        'stockAdjustmentService', 'stockAdjustmentFactory', 'siglusInitialIssueModalService',
        'siglusStockIssueService'];
    // SIGLUS-REFACTOR: ends here

    function controller(facility, programs, adjustmentType, $state, user, drafts, stockAdjustmentService,
                        stockAdjustmentFactory, siglusInitialIssueModalService, siglusStockIssueService) {
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

        // SIGLUS-REFACTOR: starts here
        vm.proceed = function(program) {
            stockAdjustmentFactory.getDraft(user.user_id, program.id, facility.id, adjustmentType.state)
                .then(function(draft) {
                    if (_.isUndefined(draft)) {
                        stockAdjustmentService.createDraft(user.user_id, program.id, facility.id, adjustmentType.state)
                            .then(function(draft) {
                                $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.creation', {
                                    programId: program.id,
                                    program: program,
                                    facility: facility,
                                    draft: draft,
                                    draftId: draft && draft.id
                                });
                            });
                    }
                    $state.go('openlmis.stockmanagement.' + adjustmentType.state + '.creation', {
                        programId: program.id,
                        program: program,
                        facility: facility,
                        draft: draft,
                        draftId: draft && draft.id
                    });
                });

        };

        vm.proceedForIssue = function(program) {
            $state.go('openlmis.stockmanagement.issue.draft', {
                facilityId: facility.id,
                programId: program.id
            });
        };

        vm.start = function(program) {
            siglusStockIssueService.baseParams = {
                userId: user.user_id,
                programId: program.id,
                adjustmentTypeState: adjustmentType.state,
                facilityId: facility.id
            };
            siglusInitialIssueModalService.show(program.id, facility.id).then(function(data) {
                vm.setDraftAttribute(data);
            });
        };

        vm.setDraftAttribute = function(data) {
            if (data.length > 0) {
                vm.programs = _.map(programs, function(program) {
                    program.draft = !_.isEmpty(_.find(data, function(draft) {
                        return draft.programId === program.id;
                    }));
                    return program;
                });
            } else {
                vm.programs = _.map(programs, function(program) {
                    program.draft = false;
                    return program;
                });
            }
        };

        vm.$onInit = function() {
            drafts = _.filter(drafts, function(draft) {
                return draft;
            });
            vm.setDraftAttribute(drafts);
        };
        // SIGLUS-REFACTOR: ends here
    }
})();
