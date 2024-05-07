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
        .module('siglus-location-physical-inventory-list')
        .controller('LocationPhysicalInventorySelectionController', controller);

    controller.$inject = [
        '$stateParams', 'facility', 'programs', 'messageService', '$state', 'physicalInventoryService',
        'SiglusPhysicalInventoryCreationService', 'alertService', 'loadingModalService', 'drafts', 'program'
    ];

    function controller(
        $stateParams, facility, programs, messageService, $state, physicalInventoryService,
        SiglusPhysicalInventoryCreationService, alertService, loadingModalService, drafts, program
    ) {
        var vm = this;

        vm.programs = programs;
        vm.program = program;
        vm.drafts = drafts;

        vm.getDraftStatus = function(isStarter) {
            if (isStarter) {
                return messageService.get('stockPhysicalInventory.notStarted');
            }
            return messageService.get('stockPhysicalInventory.draft');
        };

        function getConflictDisplayName(data) {
            return _.chain(vm.programs)
                .filter(function(program) {
                    return _.include(data, program.id);
                })
                .map('name')
                .uniq()
                .value()
                .join(',');
        }

        vm.validateDraftStatus = function(draft) {
            loadingModalService.open();
            physicalInventoryService.validateConflictProgram(program.id, facility.id, draft.id)
                .then(function(data) {
                    if (data.canStartInventory) {
                        if (draft.isStarter) {
                            loadingModalService.close();
                            SiglusPhysicalInventoryCreationService.show('', 'location', facility);
                        } else {
                            var stateParamsCopy = angular.copy($stateParams);
                            stateParamsCopy.locationManagementOption = drafts[0].locationOption;
                            $state.go(
                                'openlmis.locationManagement.physicalInventory.draftList',
                                stateParamsCopy
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
