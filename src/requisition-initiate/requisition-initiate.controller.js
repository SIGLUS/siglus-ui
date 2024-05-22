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
     * @name requisition-initiate.controller:RequisitionInitiateController
     *
     * @description
     * Controller responsible for actions connected with displaying available periods and
     * initiating or navigating to an existing requisition.
     */
    angular
        .module('requisition-initiate')
        .controller('RequisitionInitiateController', RequisitionInitiateController);

    RequisitionInitiateController.$inject = [
        'requisitionService', '$state', '$scope', 'PROGRAM_TYPE',
        'requisitionInitiateFactory'
    ];

    function RequisitionInitiateController(requisitionService, $state, $scope, PROGRAM_TYPE,
                                           requisitionInitiateFactory) {
        var vm = this;

        vm.$onInit = onInit;
        vm.loadPeriods = onSearch;

        /**
         * @ngdoc property
         * @propertyOf requisition-initiate.controller:RequisitionInitiateController
         * @name emergency
         * @type {Boolean}
         *
         * @description
         * Holds a boolean indicating if the currently selected requisition type is standard or emergency
         */
        vm.emergency = undefined;

        vm.programs = undefined;

        vm.showCreateForClient = false;

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name $onInit
         *
         * @description
         * Initialization method of the RequisitionInitiateController controller.
         */
        // SIGLUS-REFACTOR: starts here
        function onInit() {
            vm.emergency = $state.params.emergency === 'true';
        }
        // SIGLUS-REFACTOR: ends here

        $scope.$on('$programListChange', function(event, programs) {
            vm.programs = programs;
            onSearch();
        });

        function onSearch() {
            if (!vm.programs) {
                return;
            }
            var programId;
            var programCode;
            if (vm.program) {
                programCode = _.get(vm.program, 'code');
                programId = _.get(vm.program, 'id');
            } else {
                var selectedProgram = vm.programs.find(function(program) {
                    return program.id === $state.params.program;
                });
                if (selectedProgram) {
                    programCode = selectedProgram.code;
                    programId = selectedProgram.id;
                }
            }
            var homeFacilityId = $state.params.facility;
            if (vm.facility) {
                homeFacilityId = vm.facility.id;
            }
            if (programId && homeFacilityId) {
                requisitionInitiateFactory.canInitiate(programId, homeFacilityId)
                    .then(function(canInitiate) {
                        loadPeriods(canInitiate, programCode);
                    });
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition-initiate.controller:RequisitionInitiateController
         * @name loadPeriods
         *
         * @description
         * Responsible for displaying and updating a grid, containing available periods for the
         * selected program, facility and type. It will set an error message if no periods have
         * been found for the given parameters. It will also filter out periods for which there
         * already exists a requisition with an AUTHORIZED, APPROVED, IN_APPROVAL or RELEASED
         * status.
         */
        function loadPeriods(hasCreatePermission, programCode) {
            vm.showCreateForClient = canShowCreateForClientTab(hasCreatePermission, programCode);
            var reloadState = $state.current.name;
            if (vm.isCreateForClient() && !vm.showCreateForClient) {
                reloadState = 'openlmis.requisitions.initRnr.requisition';
            }
            $state.go(reloadState, vm.getMLProgramParam({
                supervised: vm.isSupervised,
                program: vm.program.id,
                facility: vm.facility.id,
                emergency: vm.emergency
            }), {
                reload: reloadState
            });
        }

        vm.getErrorMsg = function() {
            if (!vm.program) {
                return 'requisitionInitiate.noProgram';
            }
        };

        // SIGLUS-REFACTOR: add new method
        vm.goToHistory = function() {
            $state.go('openlmis.requisitions.initRnr.history', $state.params);
        };

        vm.isHistory = function() {
            return $state.current.name === 'openlmis.requisitions.initRnr.history';
        };

        vm.goToRequisition = function() {
            $state.go('openlmis.requisitions.initRnr.requisition', vm.getMLProgramParam($state.params));
        };

        vm.isRequisition = function() {
            return $state.current.name === 'openlmis.requisitions.initRnr.requisition';
        };

        vm.goToCreateForClient = function() {
            $state.go('openlmis.requisitions.initRnr.forClient', vm.getMLProgramParam($state.params));
        };

        vm.isCreateForClient = function() {
            return $state.current.name === 'openlmis.requisitions.initRnr.forClient';
        };

        vm.getMLProgramParam = function(stateParams) {
            var viaOption = _.find(vm.programs, function(item) {
                return item.code === PROGRAM_TYPE.VC;
            });
            var params = {
                // eslint-disable-next-line max-len
                replaceId: (_.get(vm.program, 'code') === PROGRAM_TYPE.ML) ? viaOption.id : ''
            };
            return Object.assign({}, stateParams, params);
        };

        function canShowCreateForClientTab(hasCreatePermission, programCode) {
            if (!hasCreatePermission) {
                return false;
            }
            var supportedPrograms = ['VC', 'T', 'TB', 'TR'];
            if (!supportedPrograms.includes(programCode)) {
                return false;
            }
            return !vm.emergency;
        }
    }
})();
