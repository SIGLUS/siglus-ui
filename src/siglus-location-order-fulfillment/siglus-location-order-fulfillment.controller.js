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
        .module('siglus-location-order-fulfillment')
        .controller('SiglusLocationOrderFulfillmentController', controller);

    controller.$inject = [
        'orderingFacilities', 'programs', 'loadingModalService', 'orders',
        '$stateParams', '$state', 'ORDER_STATUS'
    ];

    function controller(orderingFacilities, programs, loadingModalService, orders,
                        $stateParams, $state, ORDER_STATUS) {

        var vm = this;

        vm.$onInit = onInit;
        vm.loadOrders = loadOrders;

        vm.orderingFacilities = undefined;

        vm.programs = undefined;

        vm.orderStatuses = undefined;

        vm.orders = undefined;

        vm.options = {
            'orderFulfillment.createdDateDesc': ['createdDate,desc'],
            'orderFulfillment.createdDateAsc': ['createdDate,asc']
        };

        function onInit() {
            vm.orderingFacilities = orderingFacilities;
            vm.orderStatuses = [ORDER_STATUS.FULFILLING, ORDER_STATUS.ORDERED, ORDER_STATUS.PARTIALLY_FULFILLED];
            vm.programs = programs;

            vm.orders = orders;

            if ($stateParams.requestingFacilityId) {
                vm.orderingFacility = vm.orderingFacilities.filter(function(facility) {
                    return facility.id === $stateParams.requestingFacilityId;
                })[0];
            }

            if ($stateParams.status) {
                vm.orderStatus = $stateParams.status;
            }

            if ($stateParams.programId) {
                vm.program = vm.programs.filter(function(program) {
                    return program.id === $stateParams.programId;
                })[0];
            }
        }

        function loadOrders() {
            var stateParams = angular.copy($stateParams);

            stateParams.status = vm.orderStatus ? vm.orderStatus : null;
            stateParams.requestingFacilityId = vm.orderingFacility ? vm.orderingFacility.id : null;
            stateParams.programId = vm.program ? vm.program.id : null;
            stateParams.page = 0;
            $state.go('openlmis.locationManagement.fulfillOrder', stateParams, {
                reload: true
            });
        }

    }

})();
