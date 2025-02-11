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
        '$stateParams', '$state', 'REQUISITION_STATUS', 'localStorageService',
        'SiglusRequisitionInitiateForClientService', 'loadingModalService', 'notificationService', 'moment',
        'requisitionService'
    ];

    function controller($stateParams, $state, REQUISITION_STATUS, localStorageService,
                        SiglusRequisitionInitiateForClientService, loadingModalService, notificationService, moment,
                        requisitionService) {
        var vm = this;
        var CREATE_FOR_CLIENT_ID = 'create_for_client_facility_id';

        vm.periods = undefined;
        vm.supplyingFacilities = undefined;
        vm.supplyingFacility = undefined;

        vm.$onInit = onInit;
        vm.selectedClientChanged = selectedClientChanged;
        vm.periodHasRequisition = periodHasRequisition;
        vm.periodHasRequisitionInitiated = periodHasRequisitionInitiated;
        vm.checkProceedButton = checkProceedButton;
        vm.loadPeriods = loadPeriods;
        vm.initRnr = initRnr;

        function onInit() {
            if ($stateParams.facility && $stateParams.program) {
                SiglusRequisitionInitiateForClientService.getClients($stateParams.facility, $stateParams.program)
                    .$promise.then(function(clients) {
                        vm.supplyingFacilities = clients;
                        var clientId = localStorageService.get(CREATE_FOR_CLIENT_ID);
                        if (clientId) {
                            vm.supplyingFacility = clients.find(function(facility) {
                                return facility.id === clientId;
                            });
                        }
                        loadPeriods();
                    });
            }
        }

        function loadPeriods() {
            if (vm.supplyingFacility && $stateParams.program && $stateParams.emergency) {
                loadingModalService.open();
                SiglusRequisitionInitiateForClientService.getPeriods(vm.supplyingFacility.id,
                    $stateParams.program, $stateParams.emergency)
                    .then(function(periods) {
                        periods.forEach(function(period) {
                            period.facility = angular.copy(vm.supplyingFacility.id);
                            period.program = angular.copy($stateParams.program);
                            period.emergency = angular.copy($stateParams.emergency);
                        });
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

        function periodHasRequisitionInitiated(period) {
            return !!period.rnrId && period.rnrStatus === REQUISITION_STATUS.INITIATED;
        }

        function checkProceedButton(period, idx) {
            return idx === 0
                && (!vm.periodHasRequisition(period) || vm.periodHasRequisitionInitiated(period))
                && vm.isAfterSubmitStartDate(period);
        }

        vm.isAfterSubmitStartDate = function(period) {
            var today = moment();
            return today.isSameOrAfter(period.submitStartDate, 'day');
        };

        function selectedClientChanged() {
            if (vm.supplyingFacility) {
                localStorageService.add(CREATE_FOR_CLIENT_ID, vm.supplyingFacility.id);
            }
            loadPeriods();
        }

        function initRnr(selectedPeriod) {
            if (periodHasRequisition(selectedPeriod)) {
                return $state.go('openlmis.requisitions.requisition.fullSupply', {
                    rnr: selectedPeriod.rnrId,
                    forClient: true
                });
            }
            loadingModalService.open();
            return requisitionService.buildDraftWithoutSaving(selectedPeriod.facility,
                selectedPeriod.id, selectedPeriod.program).then(function(requisition) {
                loadingModalService.close();
                return $state.go('openlmis.requisitions.requisition.fullSupply', {
                    rnr: requisition.id,
                    forClient: true
                });
            });
        }
    }
})();
