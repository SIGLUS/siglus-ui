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
     * @name openlmis-facility-program-select.controller:OpenlmisFacilityProgramSelectController
     *
     * @description
     * Controller responsible for facilities and programs for the openlmis-facility-program-select
     * component.
     */
    angular
        .module('openlmis-facility-program-select')
        .controller('OpenlmisFacilityProgramSelectController', controller);

    controller.$inject = ['$q', '$stateParams', '$filter', 'facilityProgramCacheService', '$scope'];

    function controller($q, $stateParams, $filter, facilityProgramCacheService, $scope) {

        var vm = this;

        vm.$onInit = onInit;
        vm.updateForm = updateForm;
        vm.updateFacilities = updateFacilities;

        /**
         * @ngdoc method
         * @methodOf openlmis-facility-program-select.controller:OpenlmisFacilityProgramSelectController
         * @name $onInit
         *
         * @description
         * Initialization method of the controller.
         */
        function onInit() {
            // SIGLUS-REFACTOR: starts here
            vm.forRequisitionInit = vm.module === 'requisition-initiate';
            // SIGLUS-REFACTOR: ends here
            facilityProgramCacheService.loadData(vm.module)
                .then(function() {
                    vm.homeFacility = facilityProgramCacheService.getUserHomeFacility();
                    vm.supervisedPrograms = facilityProgramCacheService.getUserPrograms(true);
                    vm.isSupervised = $stateParams.supervised === 'true' || !vm.homeFacility;
                    vm.programs = facilityProgramCacheService.getUserPrograms(vm.isSupervised);
                    if ($stateParams.program) {
                        vm.program = $filter('filter')(vm.programs,
                            {
                                id: $stateParams.program
                            })[0];
                    }
                    vm.updateFacilities();
                    $scope.$emit('$programListChange', vm.programs);
                });
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-facility-program-select.controller:OpenlmisFacilityProgramSelectController
         * @name updateForm
         *
         * @description
         * Updates the form by clearing program and facility selection and setting appropriate
         * lists.
         */
        function updateForm() {
            vm.program = undefined;
            vm.programs = facilityProgramCacheService.getUserPrograms(vm.isSupervised);
            vm.updateFacilities();
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-facility-program-select.controller:OpenlmisFacilityProgramSelectController
         * @name updateFacilities
         *
         * @description
         * Updates the facility list by clearing the facility selection and setting appropriate
         * facility list.
         */
        function updateFacilities() {
            vm.facility = undefined;

            if (!vm.isSupervised) {
                vm.facilities = [vm.homeFacility];
                vm.facility = vm.facilities[0];
            } else if (vm.program) {
                vm.facilities = facilityProgramCacheService.getSupervisedFacilities(vm.program.id);
                if ($stateParams.facility) {
                    vm.facility = $filter('filter')(vm.facilities,
                        {
                            id: $stateParams.facility
                        })[0];
                }
            } else {
                vm.facilities = [];
            }
        }
    }

})();
