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
   * @name siglus-location-physical-inventory-list.controller:LocationPhysicalInventoryListController
   *
   * @description
   * Controller for managing physical inventory.
   */
    angular
        .module('siglus-location-physical-inventory-list')
        .controller('LocationPhysicalInventoryListController', controller);

    controller.$inject = ['$scope', 'facility', 'programs', 'programId', 'program', '$state', 'drafts'];

    function controller($scope, facility, programs, programId, program, $state, drafts) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf siglus-location-physical-inventory-list.controller:LocationPhysicalInventoryListController
         * @name facility
         * @type {Object}
         *
         * @description
         * Holds user's home facility.
         */
        vm.facility = facility;

        /**
         * @ngdoc property
         * @propertyOf siglus-location-physical-inventory-list.controller:LocationPhysicalInventoryListController
         * @name programs
         * @type {Array}
         *
         * @description
         * Holds available programs for home facility.
         */
        vm.programs = programs;
        // SIGLUS-REFACTOR: starts here

        vm.program = program;
        vm.drafts = drafts;
        vm.$onInit = onInit;

        /**
         * @ngdoc method
         * @propertyOf siglus-location-physical-inventory-list.controller:LocationPhysicalInventoryListController
         * @name onInit
         *
         * @description
         * Responsible for oninit physical inventory status.
         *
         */
        function onInit() {
            navigateToChildState();

            $scope.$on('$stateChangeSuccess', function(event, toState) {
                if (toState.name === 'openlmis.locationManagement.physicalInventory') {
                    navigateToChildState();
                }
            });
        }

        function navigateToChildState() {
            if (vm.isHistory()) {
                vm.goToHistory();
            } else {
                vm.goToInventory();
            }
        }

        /**
         * @ngdoc method
         * @methodOf siglus-location-physical-inventory-list.controller:LocationPhysicalInventoryListController
         * @name searchProgram
         *
         * @description
         * Responsible for retrieving Stock Card Summaries based on selected program and facility.
         */
        // SIGLUS-REFACTOR: starts here
        vm.searchProgram = function searchProgram() {
            $state.go($state.current.name, {
                programId: vm.program.id
            }, {
                reload: true
            });
        };
        // SIGLUS-REFACTOR: ends here

        vm.isHistory = function() {
            return $state.current.name === 'openlmis.locationManagement.physicalInventory.history';
        };

        vm.goToHistory = function() {
            $state.go('openlmis.locationManagement.physicalInventory.history', $state.params);
        };

        vm.isInventory = function() {
            return $state.current.name === 'openlmis.locationManagement.physicalInventory.selection';
        };

        vm.goToInventory = function() {
            $state.go('openlmis.locationManagement.physicalInventory.selection', $state.params);
        };

    }
})();
