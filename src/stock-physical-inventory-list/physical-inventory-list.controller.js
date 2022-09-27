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
   * @name stock-physical-inventory-list.controller:PhysicalInventoryListController
   *
   * @description
   * Controller for managing physical inventory.
   */
    angular
        .module('stock-physical-inventory-list')
        .controller('PhysicalInventoryListController', controller);
    controller.$inject = ['$stateParams', 'facility', 'programs', 'programId',
        'messageService',
        '$state', 'physicalInventoryService', 'physicalInventoryFactory',
        'FunctionDecorator', 'SiglusPhysicalInventoryCreationService', 'alertService',
        'loadingModalService'];

    function controller($stateParams, facility, programs, programId, messageService,
                        $state, physicalInventoryService, physicalInventoryFactory,
                        FunctionDecorator, SiglusPhysicalInventoryCreationService, alertService,
                        loadingModalService) {
        var vm = this;

        /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name facility
     * @type {Object}
     *
     * @description
     * Holds user's home facility.
     */
        vm.facility = facility;
        vm.$onInit = onInit;
        /**
     * @ngdoc property
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name programs
     * @type {Array}
     *
     * @description
     * Holds available programs for home facility.
     */
        vm.programs = programs;
        // SIGLUS-REFACTOR: starts here
        vm.drafts = $stateParams.drafts || [];

        // SIGLUS-REFACTOR: ends here
        vm.editDraft = new FunctionDecorator()
            .decorateFunction(editDraft)
            .withLoading(true)
            .getDecoratedFunction();

        /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name getProgramName
     *
     * @description
     * Responsible for getting program name based on id.
     *
     * @param {String} id Program UUID
     */
        vm.getProgramName = function(id) {
            return _.find(vm.programs, function(program) {
                return program.id === id;
            }).name;
        };

        /**
     * @ngdoc method
     * @methodOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name searchProgram
     *
     * @description
     * Responsible for retrieving Stock Card Summaries based on selected program and facility.
     */

        // SIGLUS-REFACTOR: starts here
        vm.searchProgram = function searchProgram() {
            $state.go('openlmis.stockmanagement.physicalInventory', {
                programId: vm.program.id,
                drafts: _.clone(vm.drafts)
            });
        };
        // SIGLUS-REFACTOR: ends here

        /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name getDraftStatus
     *
     * @description
     * Responsible for getting physical inventory status.
     *
     * @param {Boolean} isStarter Indicates starter or saved draft.
     */
        vm.getDraftStatus = function(isStarter) {
            if (isStarter) {
                return messageService.get('stockPhysicalInventory.notStarted');
            }
            return messageService.get('stockPhysicalInventory.draft');

        };

        /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name onInit
     *
     * @description
     * Responsible for oninit physical inventory status.
     *
     */

        function onInit() {
            vm.program = _.find(programs, function(program) {
                return program.id === programId;
            });
            if (programId) {
                loadingModalService.open();
                physicalInventoryService.getDraft(programId, facility.id)
                    .then(function(drafts) {
                        vm.drafts = _.isEmpty(drafts) ?  [{
                            programId: programId,
                            isStarter: true
                        }] : drafts;
                    })
                    .finally(function() {
                        loadingModalService.close();
                    });
            }

        }

        /**
     * @ngdoc method
     * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
     * @name editDraft
     *
     * @description
     * Navigating to draft physical inventory.
     *
     * @param {Object} draft Physical inventory draft
     */
        function editDraft(draft) {
            var program = _.find(vm.programs, function(programItem) {
                return programItem.id === draft.programId;
            });
            return physicalInventoryFactory.getDraft(draft.programId,
                draft.facilityId).then(function(draft) {
                if (draft.id) {
                    $state.go(
                        'openlmis.stockmanagement.physicalInventory.draft', {
                            id: draft.id,
                            draft: draft,
                            program: program,
                            facility: facility
                        }
                    );
                } else {
                    physicalInventoryService.createDraft(program.id,
                        facility.id).then(
                        function(data) {
                            draft.id = data.id;
                            $state.go(
                                'openlmis.stockmanagement.physicalInventory.draft',
                                {
                                    id: draft.id,
                                    draft: draft,
                                    program: program,
                                    facility: facility
                                }
                            );
                        }
                    );
                }
            });
        }

        function getConflictDisplayName(data) {
            var conflictProgramNames = _.chain(vm.programs)
                .filter(function(program) {
                    return _.include(data, program.id);
                })
                .map('name')
                .uniq()
                .value();
            return conflictProgramNames.join(',');
        }

        vm.validateDraftStatus = function(isStarter) {
            loadingModalService.open();
            physicalInventoryService.validateConflictProgram(programId, facility.id)
                .then(function(data) {
                    if (data.canStartInventory) {
                        if (isStarter) {
                            loadingModalService.close();
                            SiglusPhysicalInventoryCreationService.show();
                        } else {
                            $state.go(
                                'openlmis.stockmanagement.physicalInventory.draftList'
                            );
                        }
                    } else {
                        loadingModalService.close();
                        alertService.error(
                            'stockPhysicalInventory.conflictProgram',
                            '',
                            '',
                            {
                                programName: getConflictDisplayName(data.containDraftProgramsList)
                            }
                        );
                    }
                });

        };

    }
})();