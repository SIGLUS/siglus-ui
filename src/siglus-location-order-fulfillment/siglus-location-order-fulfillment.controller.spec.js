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

describe('SiglusLocationOrderFulfillmentController', function() {

    var vm, orderingFacilities, programs, orders, $controller, $stateParams, $state,
        BasicOrderResponseDataBuilder, ORDER_STATUS, ProgramDataBuilder, FacilityDataBuilder;

    beforeEach(function() {
        module('order-fulfillment');
        module('siglus-location-order-fulfillment');
        module('referencedata-facility');
        module('referencedata-program');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $stateParams = $injector.get('$stateParams');
            $state = $injector.get('$state');
            BasicOrderResponseDataBuilder = $injector.get('BasicOrderResponseDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ORDER_STATUS = $injector.get('ORDER_STATUS');
        });

        orderingFacilities = [
            new FacilityDataBuilder().withId('facility-three')
                .build(),
            new FacilityDataBuilder().withId('facility-four')
                .build(),
            new FacilityDataBuilder().withId('facility-five')
                .build()
        ];

        programs = [
            new ProgramDataBuilder().withId('program-one')
                .build()
        ];

        orders = [
            new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.ORDERED)
                .withId('order-one')
                .build(),
            new BasicOrderResponseDataBuilder()
                .withStatus(ORDER_STATUS.FULFILLING)
                .withId('order-two')
                .build()
        ];
    });

    describe('initialization', function() {

        beforeEach(function() {
            vm = $controller('SiglusLocationOrderFulfillmentController', {
                orderingFacilities: orderingFacilities,
                programs: programs,
                orders: orders
            });
        });

        it('should expose requesting facilities', function() {
            vm.$onInit();

            expect(vm.orderingFacilities).toEqual(orderingFacilities);
        });

        it('should expose programs', function() {
            vm.$onInit();

            expect(vm.programs).toEqual(programs);
        });

        it('should set orderStatus if status from was passed through the URL', function() {
            $stateParams.status = ORDER_STATUS.ORDERED;

            vm.$onInit();

            expect(vm.orderStatus).toEqual(ORDER_STATUS.ORDERED);
        });

        it('should not set program if programId was not passed through the URL', function() {
            $stateParams.programId = undefined;

            vm.$onInit();

            expect(vm.program).toBeUndefined();
        });

        it('should set orderingFacility if requesting facility id was not passed through the URL', function() {
            $stateParams.requestingFacilityId = undefined;

            vm.$onInit();

            expect(vm.orderingFacility).toBeUndefined();
        });

        it('should not set orderStatus if status was not passed through the URL', function() {
            $stateParams.status = undefined;

            vm.$onInit();

            expect(vm.orderStatus).toBeUndefined();
        });

        it('should expose sort options', function() {
            expect(vm.options).toEqual({
                'orderFulfillment.createdDateDesc': ['createdDate,desc'],
                'orderFulfillment.createdDateAsc': ['createdDate,asc']
            });
        });

    });

    describe('loadOrders', function() {

        beforeEach(function() {
            initController();
            vm.$onInit();
            spyOn($state, 'go').andReturn();
        });

        it('should set program id', function() {
            vm.program = programs[0];

            vm.loadOrders();

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.fulfillOrder', {
                status: null,
                requestingFacilityId: null,
                page: 0,
                programId: vm.program.id
            }, {
                reload: true
            });
        });

        it('should set status', function() {
            vm.orderStatus = ORDER_STATUS.FULFILLING;

            vm.loadOrders();

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.fulfillOrder', {
                status: ORDER_STATUS.FULFILLING,
                requestingFacilityId: null,
                page: 0,
                programId: null
            }, {
                reload: true
            });
        });

        it('should set requesting facility id', function() {
            vm.orderingFacility = orderingFacilities[0];

            vm.loadOrders();

            expect($state.go).toHaveBeenCalledWith('openlmis.locationManagement.fulfillOrder', {
                status: null,
                requestingFacilityId: vm.orderingFacility.id,
                page: 0,
                programId: null
            }, {
                reload: true
            });
        });

        it('should reload state', function() {
            vm.loadOrders();

            expect($state.go).toHaveBeenCalled();
        });

    });

    function initController() {
        vm = $controller('SiglusLocationOrderFulfillmentController', {
            orderingFacilities: orderingFacilities,
            programs: programs,
            orders: orders
        });
        vm.$onInit();
    }
});
