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
        'requisitionService', '$state', '$scope', 'PROGRAM_TYPE'
        // SIGLUS-REFACTOR: starts here
        // 'loadingModalService', 'notificationService', 'REQUISITION_RIGHTS',
        // 'permissionService', 'authorizationService', '$stateParams', 'periods', 'canInitiateRnr', 'UuidGenerator'
        // SIGLUS-REFACTOR: ends here
    ];

    function RequisitionInitiateController(requisitionService, $state, $scope, PROGRAM_TYPE) {
        var vm = this;
        // SIGLUS-REFACTOR: starts here
        // uuidGenerator = new UuidGenerator(),
        // key = uuidGenerator.generate();
        // SIGLUS-REFACTOR: ends here

        vm.$onInit = onInit;
        vm.loadPeriods = loadPeriods;
        // SIGLUS-REFACTOR: starts here
        // vm.initRnr = initRnr;
        // vm.periodHasRequisition = periodHasRequisition;
        // vm.goToRequisition = goToRequisition;
        // SIGLUS-REFACTOR: ends here

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

        // SIGLUS-REFACTOR: starts here
        // /**
        //  * @ngdoc property
        //  * @propertyOf requisition-initiate.controller:RequisitionInitiateController
        //  * @name periods
        //  * @type {List}
        //  *
        //  * @description
        //  * The list of all periods displayed in the table.
        //  */
        // vm.periods = undefined;
        //
        // /**
        //  * @ngdoc property
        //  * @propertyOf requisition-initiate.controller:RequisitionInitiateController
        //  * @name canInitiateRnr
        //  * @type {boolean}
        //  *
        //  * @description
        //  * True if user has permission to initiate requisition.
        //  */
        // vm.canInitiateRnr = undefined;
        // SIGLUS-REFACTOR: ends here

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
        });

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
        function loadPeriods() {
            // SIGLUS-REFACTOR: starts here
            $state.go($state.current.name, vm.getMLProgramParam({
            // SIGLUS-REFACTOR: ends here
                supervised: vm.isSupervised,
                program: vm.program.id,
                facility: vm.facility.id,
                emergency: vm.emergency

            }), {
                // SIGLUS-REFACTOR: starts here
                reload: $state.current.name
                // SIGLUS-REFACTOR: ends here
            });
        }

        // SIGLUS-REFACTOR: delete method
        // /**
        //  * @ngdoc method
        //  * @methodOf requisition-initiate.controller:RequisitionInitiateController
        //  * @name initRnr
        //  *
        //  * @description
        //  * Responsible for initiating a requisition for a specified period. If
        //  * creating the requisition is successful, then the user is sent to the
        //  * requisition view page. Otherwise an error message is shown.
        //  *
        //  * @param {Object} selectedPeriod a period to initiate or proceed with the requisition for
        //  */
        // function initRnr(selectedPeriod) {
        //     var user = authorizationService.getUser();
        //
        //     vm.error = '';
        //
        //     loadingModalService.open();
        //     permissionService.hasPermission(user.user_id, {
        //         right: REQUISITION_RIGHTS.REQUISITION_CREATE,
        //         programId: vm.program.id,
        //         facilityId: vm.facility.id
        //     })
        //         .then(function() {
        //             requisitionService.initiate(vm.facility.id, vm.program.id, selectedPeriod.id, vm.emergency, key)
        //                 .then(function(data) {
        //                     goToInitiatedRequisition(data);
        //                 })
        //                 .catch(function() {
        //                     notificationService.error('requisitionInitiate.couldNotInitiateRequisition');
        //                     loadingModalService.close();
        //                     key = uuidGenerator.generate();
        //                 });
        //         })
        //         .catch(function() {
        //             notificationService.error('requisitionInitiate.noPermissionToInitiateRequisition');
        //             loadingModalService.close();
        //         });
        // }
        //
        // /**
        //  * @ngdoc method
        //  * @methodOf requisition-initiate.controller:RequisitionInitiateController
        //  * @name periodHasRequisition
        //  *
        //  * @description
        //  * Checks a period object to make sure no requisition is associated with
        //  * the period.
        //  *
        //  * @param {Object} period a period to check if it has a requisition
        //  */
        // function periodHasRequisition(period) {
        //     if (period.rnrId) {
        //         return true;
        //     }
        //     return false;
        //
        // }
        //
        // /**
        //  * @ngdoc method
        //  * @methodOf requisition-initiate.controller:RequisitionInitiateController
        //  * @name goToRequisition
        //  *
        //  * @description
        //  * Directs a user to the requisition view data for a specific period
        //  *
        //  * @param {Object} id A requisition id
        //  */
        // function goToRequisition(id) {
        //     $state.go('openlmis.requisitions.requisition.fullSupply', {
        //         rnr: id
        //     });
        // }
        //
        // function goToInitiatedRequisition(requisition) {
        //     $state.go('openlmis.requisitions.requisition.fullSupply', {
        //         rnr: requisition.id,
        //         requisition: requisition
        //     });
        // }
        // SIGLUS-REFACTOR: ends here

        // SIGLUS-REFACTOR: add new method
        vm.goToHistory = function() {
            $state.go('openlmis.requisitions.initRnr.history', $state.params);
        };

        vm.isHistory = function() {
            return $state.current.name === 'openlmis.requisitions.initRnr.history';
        };

        vm.goToRequsition = function() {
            $state.go('openlmis.requisitions.initRnr.requisition', vm.getMLProgramParam($state.params));
        };

        vm.isRequisition = function() {
            return $state.current.name === 'openlmis.requisitions.initRnr.requisition';
        };

        vm.getMLProgramParam = function(stateParams) {
            var viaOption = _.find(vm.programs, function(item) {
                return item.code === PROGRAM_TYPE.VC;
            });
            var params = {
                replaceId: (_.get(vm.program, 'code') === PROGRAM_TYPE.ML) ? viaOption.id : ''
            };
            return Object.assign({}, stateParams, params);
        };
    }
})();
