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
     * @name order-fulfillment.controller:OrderFulfillmentController
     *
     * @description
     * Responsible for managing Order Fulfillment screen.
     */
    angular
        .module('order-fulfillment')
        .controller('OrderFulfillmentController', controller);

    controller.$inject = [
        'orderingFacilities', 'programs', 'loadingModalService', 'orders',
        '$stateParams', '$state', 'ORDER_STATUS', 'homeFacility', 'confirmService',
        'orderRepository', 'orderList', 'siglusFacilityViewRadioConfirmModalService'
    ];

    function controller(
        orderingFacilities, programs, loadingModalService, orders,
        $stateParams, $state, ORDER_STATUS, homeFacility, confirmService,
        orderRepository, orderList, siglusFacilityViewRadioConfirmModalService
    ) {

        var vm = this;

        vm.$onInit = onInit;
        vm.loadOrders = loadOrders;
        vm.closeFulfillment = closeFulfillment;
        vm.batchCloseFulfillment = batchCloseFulfillment;

        /**
         * @ngdoc property
         * @propertyOf order-fulfillment.controller:OrderFulfillmentController
         * @name requestingFacilities
         * @type {Array}
         *
         * @description
         * The list of requesting facilities available to the user.
         */
        vm.orderingFacilities = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-fulfillment.controller:OrderFulfillmentController
         * @name programs
         * @type {Array}
         *
         * @description
         * The list of all programs available to the user.
         */
        vm.programs = undefined;

        vm.enableLocationModule = _.get(homeFacility, 'enableLocationManagement');

        /**
         * @ngdoc property
         * @propertyOf order-fulfillment.controller:OrderFulfillmentController
         * @name orderStatuses
         * @type {Array}
         *
         * @description
         * The list of available order statuses.
         */
        vm.orderStatuses = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-fulfillment.controller:OrderFulfillmentController
         * @name orders
         * @type {Array}
         *
         * @description
         * Holds orders that will be displayed on screen.
         */
        vm.orders = undefined;

        /**
         * @ngdoc property
         * @propertyOf order-fulfillment.controller:OrderFulfillmentController
         * @name options
         * @type {Object}
         *
         * @description
         * Holds options for sorting order list.
         */
        vm.options = {
            'orderFulfillment.createdDateDesc': ['createdDate,desc'],
            'orderFulfillment.createdDateAsc': ['createdDate,asc']
        };

        vm.fulFill = function(url, order) {
            if (order.showWarningPopup) {
                siglusFacilityViewRadioConfirmModalService.error(
                    'orderFulfillment.startFulFillConfirm',
                    '',
                    ['adminFacilityView.close',
                        'adminFacilityView.confirm']
                ).then(function() {
                    $state.go(url, _.extend({
                        id: order.id
                    }, $stateParams));
                });
            } else {
                $state.go(url, _.extend({
                    id: order.id
                }, $stateParams));
            }
        };

        /**
         * @ngdoc method
         * @methodOf order-fulfillment.controller:OrderFulfillmentController
         * @name $onInit
         *
         * @description
         * Initialization method called after the controller has been created. Responsible for
         * setting data to be available on the view.
         */
        function onInit() {
            console.log('fulfill reload3');
            $state.go('openlmis.orders.fulfillment', $stateParams, {
                notify: false
            });

            vm.orderingFacilities = orderingFacilities;
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            vm.orderStatuses = [ORDER_STATUS.FULFILLING, ORDER_STATUS.ORDERED, ORDER_STATUS.PARTIALLY_FULFILLED];
            // #400: ends here
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

        /**
         * @ngdoc method
         * @methodOf order-fulfillment.controller:OrderFulfillmentController
         * @name loadOrders
         *
         * @description
         * Retrieves the list of orders matching the selected status, ordering facility and program.
         */
        function loadOrders() {
            var stateParams = angular.copy($stateParams);
            stateParams.orderList  = orderList;
            stateParams.programs  = programs;
            stateParams.homeFacility = homeFacility;
            stateParams.status = vm.orderStatus ? vm.orderStatus : null;
            stateParams.requestingFacilityId = vm.orderingFacility ? vm.orderingFacility.id : null;
            stateParams.programId = vm.program ? vm.program.id : null;
            // SIGLUS-REFACTOR: starts here
            stateParams.page = 0;
            // SIGLUS-REFACTOR: ends here
            $state.go('openlmis.orders.fulfillment', stateParams, {
                reload: true
            });
        }

        function closeFulfillment(orderId) {
            confirmService.confirm('orderFulfillment.closeConfirm',
                'PhysicalInventoryDraftList.confirm',
                'PhysicalInventoryDraftList.cancel').then(function() {
                loadingModalService.open();
                orderRepository.closeOrder(orderId).then(function() {
                    console.log('fulfill reload1');
                    loadOrders();
                    $state.reload();
                })
                    .finally(loadingModalService.close);
            });
        }

        function batchCloseFulfillment() {
            loadingModalService.open();
            orderRepository.batchClose().then(function() {
                loadOrders();
                $state.reload();
            })
                .finally(loadingModalService.close);
        }
    }
})();
