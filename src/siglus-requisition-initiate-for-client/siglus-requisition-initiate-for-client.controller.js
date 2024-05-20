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
     * @name SiglusRequisitionInitiateForClientController
     *
     */
    angular
        .module('siglus-requisition-initiate-for-client')
        .controller('SiglusRequisitionInitiateForClientController', controller);

    controller.$inject = [
        '$stateParams', '$state', 'REQUISITION_STATUS', 'supplyingFacilities',
        'SiglusRequisitionInitiateForClientService', 'loadingModalService'
    ];

    function controller($stateParams, $state, REQUISITION_STATUS, supplyingFacilities,
                        SiglusRequisitionInitiateForClientService, loadingModalService) {
        var vm = this;

        vm.periods = undefined;
        vm.supplyingFacilities = undefined;
        vm.supplyingFacility = undefined;

        vm.$onInit = onInit;
        vm.periodHasRequisition = periodHasRequisition;
        vm.checkProceedButton = checkProceedButton;
        vm.loadPeriods = loadPeriods;

        function onInit() {
            vm.supplyingFacilities = supplyingFacilities;
            vm.supplyingFacility = $stateParams.supplyingFacility;
        }

        function loadPeriods() {
            $stateParams.supplyingFacility = vm.supplyingFacility;
            if (vm.supplyingFacility && $stateParams.program && $stateParams.emergency) {
                loadingModalService.open();
                SiglusRequisitionInitiateForClientService.getPeriods(vm.supplyingFacility.id,
                    $stateParams.program, $stateParams.emergency)
                    .then(function(periods) {
                        vm.periods = periods;
                    })
                    .catch(function() {
                        vm.periods = [];
                    })
                    .finally(loadingModalService.close);
            }
        }

        function periodHasRequisition(period) {
            return !!period.rnrId;
        }

        function checkProceedButton(period, idx) {
            if ($stateParams.program && $stateParams.facility && period.activeForRnr) {
                if (idx > 0 || Date.now() < period.startDate.getTime()
                    || vm.periodHasRequisition(period)) {
                    return false;
                }
            }
            return true;
        }
    }
})();
