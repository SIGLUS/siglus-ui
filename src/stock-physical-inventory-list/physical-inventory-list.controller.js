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
        .module('stock-physical-inventory-list')
        .controller('PhysicalInventoryListController', controller);

    controller.$inject = [
        '$state', '$scope', 'programs', 'facility', 'program', 'programId'
    ];

    function controller($state, $scope, programs, facility, program) {
        var vm = this;

        vm.facility = facility;
        vm.programs = programs;
        vm.program = program;

        vm.$onInit = onInit;
        vm.searchProgram = searchProgram;

        function onInit() {
            navigateToChildState();

            $scope.$on('$stateChangeSuccess', function(event, toState) {
                if (toState.name === 'openlmis.stockmanagement.physicalInventory') {
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

        function searchProgram() {
            $state.go($state.current.name, {
                programId: vm.program.id
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
