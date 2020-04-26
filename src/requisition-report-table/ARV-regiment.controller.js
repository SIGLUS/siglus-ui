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
        .module('requisition-report-table')
        .controller('ARVRegimentController', controller);

    controller.$inject = ['requisitionUtils', 'addRegimenModalService', 'REGIMEN_CATEGORY'];

    function controller(requisitionUtils, addRegimenModalService, REGIMEN_CATEGORY) {

        var vm = this;
        vm.$onInit = onInit;
        vm.category = [{
            code: REGIMEN_CATEGORY.ADULTS,
            name: 'Adults'
        }, {
            code: REGIMEN_CATEGORY.PAEDIATRICS,
            name: 'Paediatrics'
        }];
        vm.REGIMEN_CATEGORY = REGIMEN_CATEGORY;
        vm.addedRegimes = {};

        vm.calculateTotal = requisitionUtils.calculateTotal;

        vm.addRegimen = function(category) {
            var regimes = _.filter(vm.customRegimes, function(regimen) {
                return regimen.regimen.regimenCategory.code === category &&
                    !vm.addedRegimes[regimen.regimen.id];
            });
            addRegimenModalService.show(regimes).then(function(addRegimes) {
                _.forEach(addRegimes, function(regime) {
                    vm.addedRegimes[regime.regimen.id] = true;
                    vm.lineItems.push(regime);
                });
            });
        };

        vm.removeRegime = function(regime) {
            var index = _.findIndex(vm.lineItems, regime);
            if (index >= 0) {
                regime.hfPatients = undefined;
                regime.chwPatients = undefined;
                vm.addedRegimes[regime.regimen.id] = false;
                vm.lineItems.splice(index, 1);
            }
        };

        vm.validateHFPatients = function(item) {
            item.isRequiredHFPatients = true;
        };

        vm.validateCHWPatients = function(item) {
            item.isRequiredCHWPatients = true;
        };

        function onInit() {
            _.forEach(vm.lineItems, function(item) {
                if (item.regimen.isCustom) {
                    vm.addedRegimes[item.regimen.id] = true;
                }
            });
            vm.customRegimes = _.map(vm.customRegimes, function(regime) {
                return {
                    regimen: regime
                };
            });
        }
    }

})();
