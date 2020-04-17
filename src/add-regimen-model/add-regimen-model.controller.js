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
        .module('add-regimen-model')
        .controller('AddRegimenModelController', controller);

    controller.$inject = ['modalDeferred', 'Regimes', 'alertService', '$filter'];

    function controller(modalDeferred, Regimes, alertService, $filter) {
        var vm = this;

        vm.$onInit = onInit;
        vm.selectRegimes = selectRegimes;
        vm.close = modalDeferred.reject;
        vm.search = search;

        vm.Regimes = undefined;

        vm.searchText = undefined;

        vm.selections = undefined;

        function onInit() {
            vm.Regimes = $filter('orderBy')(Regimes, 'regimen.name');
            vm.searchText = '';
            vm.selections = {};
            vm.search();
        }

        function selectRegimes() {
            var selectedRegimes = vm.Regimes.filter(function(regimen) {
                return vm.selections[regimen.regimen.id];
            });

            if (selectedRegimes.length < 1) {
                alertService.error('addRegimesModal.addRegimes.emptyList');
            } else {
                modalDeferred.resolve(selectedRegimes);
            }
        }

        function search() {
            if (vm.searchText) {
                vm.filteredRegimes = vm.Regimes.filter(searchByName);
            } else {
                vm.filteredRegimes = vm.Regimes;
            }
        }

        function searchByName(regimen) {
            var searchText = vm.searchText.toLowerCase();
            var foundInFullRegimenName;

            if (regimen.regimen.name !== undefined) {
                foundInFullRegimenName = regimen.regimen.name.toLowerCase().contains(searchText);
            }
            return foundInFullRegimenName;
        }
    }

})();
