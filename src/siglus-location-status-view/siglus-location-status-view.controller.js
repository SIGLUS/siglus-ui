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
     * @name shipment-view.controller:ShipmentViewController
     *
     * @description
     * Responsible for managing shipment view screen.
     */
    angular
        .module('siglus-location-status-view')
        .controller('SiglusLocationStatusController', SiglusLocationStatusController);

    SiglusLocationStatusController.$inject = [
        '$scope', '$state', '$stateParams', '$window', 'facility',
        'locationStatus', 'displayLocationStatus', 'messageService'
    ];

    function SiglusLocationStatusController(
        $scope, $state, $stateParams, $window, facility,
        locationStatus, displayLocationStatus, messageService
    ) {
        var vm = this;

        vm.$onInit = onInit;
        vm.keyword = '';
        vm.selectedStatus = undefined;
        vm.facility = undefined;
        vm.locationStatus = null;
        vm.displayLocationStatus = [];

        function onInit() {
            vm.keyword = $stateParams.keyword;
            vm.selectedStatus = $stateParams.selectedStatus;
            vm.facility = facility;
            vm.locationStatus = locationStatus;
            vm.displayLocationStatus = displayLocationStatus;
        }

        vm.getStatusDisplay = function(status) {
            if (true === status) {
                return messageService.get('locationStatus.status.occupied');
            }
            if (false === status) {
                return messageService.get('locationStatus.status.empty');
            }
            return status;
        };

        vm.itemLocationOccupied = function(item) {
            var status = _.get(item, ['locationStatus']);
            return status === 'Occupied';
        };

        function reloadPage() {
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
            $stateParams.selectedStatus = vm.selectedStatus;
            $stateParams.locationStatus = vm.locationStatus;
            $stateParams.pageNumber = 0;
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        vm.search = function() {
            reloadPage();
        };

        vm.cancelFilter = function() {
            vm.keyword = null;
            vm.selectedStatus = null;
            reloadPage();
        };

        vm.printLocations = function() {
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'locationManagement/locationStatusPrint';
            $window.open(PRINT_URL, '_blank');
        };
    }
})();
