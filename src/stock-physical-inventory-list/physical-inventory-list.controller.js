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

    controller.$inject = [
        '$state', '$rootScope', 'programs', 'facility', 'program', 'programId'
    ];

    function controller($state, $rootScope, programs, facility, program) {
        var vm = this;

        vm.facility = facility;
        vm.programs = programs;
        vm.program = program;

        vm.$onInit = onInit;
        vm.searchProgram = searchProgram;

        function onInit() {
            $state.go('openlmis.stockmanagement.physicalInventory.selection');
        }

        /**
         * @ngdoc method
         * @propertyOf PhysicalInventoryListController
         * @name searchProgram
         *
         * @description
         * To reload page with selected program and current facility.
         * Physical inventory list will be retrieved in reloading.
         */
        function searchProgram() {
            $rootScope.programId = vm.program.id;
            $state.go($state.current.name, {
                programId: vm.program.id,
                facility: vm.facility
            }, {
                reload: true
            });
        }

        vm.isHistory = function() {
            return $state.current.name === 'openlmis.stockmanagement.physicalInventory.history';
        };

        vm.goToHistory = function() {
            $state.go('openlmis.stockmanagement.physicalInventory.history', $state.params);
        };

        vm.isInventory = function() {
            return $state.current.name === 'openlmis.stockmanagement.physicalInventory.selection';
        };

        vm.goToInventory = function() {
            $state.go('openlmis.stockmanagement.physicalInventory.selection', $state.params);
        };
    }
})();
