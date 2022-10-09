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

describe('PodViewController', function() {

    var vm, $controller, ProofOfDeliveryDataBuilder, OrderDataBuilder,
        proofOfDelivery, order, reasons, $rootScope, $q,
        ReasonDataBuilder, VVM_STATUS, messageService, orderLineItems,
        UserDataBuilder, userDataBuilder, orderablesPrice;

    beforeEach(function() {
        module('proof-of-delivery-view');
        module('proof-of-delivery');
        module('referencedata-orderable-fulfills');
        module('stock-confirm-discard');
        module('referencedata-user');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');

            $controller = $injector.get('$controller');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            ProofOfDeliveryDataBuilder = $injector.get('ProofOfDeliveryDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            VVM_STATUS = $injector.get('VVM_STATUS');
            messageService = $injector.get('messageService');
            UserDataBuilder = $injector.get('UserDataBuilder');
        });
        orderablesPrice = {
            '5f655d74-1213-46e0-9009-38a01e39c503': 66.66,
            '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': 55,
            '0fe4e147-714e-4bf0-9e5b-921e3f6d608d': 10
        };
        proofOfDelivery = new ProofOfDeliveryDataBuilder().build();
        order = new OrderDataBuilder().build();
        reasons = [
            new ReasonDataBuilder().build(),
            new ReasonDataBuilder().build(),
            new ReasonDataBuilder().build()
        ];
        // SIGLUS-REFACTOR: starts here
        userDataBuilder = new UserDataBuilder().asNew();
        _.extend(reasons[0], {
            tags: ['rejection']
        });
        _.extend(reasons[1], {
            tags: ['rejection']
        });
        _.extend(reasons[2], {
            tags: ['rejection']
        });
        // SIGLUS-REFACTOR: ends here
        orderLineItems = [
            {
                groupedLineItems: [
                    proofOfDelivery.lineItems
                ]
            }
        ];

        spyOn(messageService, 'get');
        spyOn(proofOfDelivery, 'save').andReturn($q.resolve(proofOfDelivery));
        spyOn(proofOfDelivery, 'isInitiated');

        vm = $controller('ProofOfDeliveryViewController', {
            proofOfDelivery: proofOfDelivery,
            order: order,
            reasons: reasons,
            orderLineItems: orderLineItems,
            canEdit: true,
            $scope: $rootScope.$new(),
            user: userDataBuilder.build(),
            orderablesPrice: orderablesPrice
        });
    });

    it('it should expose Proof of Delivery', function() {
        vm.$onInit();

        expect(vm.proofOfDelivery).toBe(proofOfDelivery);
    });

    it('it should expose Order', function() {
        vm.$onInit();

        expect(vm.order).toBe(order);
    });

    // it('should expose reasons', function() {
    //     vm.$onInit();
    //
    //     expect(vm.reasons).toBe(reasons);
    // });

    it('should check if VVM Status column should be shown', function() {
        vm.$onInit();

        expect(vm.showVvmColumn).toEqual(proofOfDelivery.hasProductsUseVvmStatus());
    });

    it('should expose map of fulfilling line items', function() {
        vm.$onInit();

        expect(vm.orderLineItems).toEqual(orderLineItems);
    });

    it('should expose canEdit', function() {
        vm.$onInit();

        expect(vm.canEdit).toEqual(true);

        vm = $controller('ProofOfDeliveryViewController', {
            proofOfDelivery: proofOfDelivery,
            order: order,
            reasons: reasons,
            orderLineItems: orderLineItems,
            canEdit: false,
            $scope: $rootScope.$new(),
            user: userDataBuilder.build(),
            orderablesPrice: orderablesPrice
        });
        vm.$onInit();

        expect(vm.canEdit).toEqual(false);
    });

    describe('getStatusDisplay', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return translated message', function() {
            messageService.get.andReturn('translated message');

            var result = vm.getStatusDisplayName(VVM_STATUS.STAGE_1);

            expect(result).toBe('translated message');
            expect(messageService.get)
                .toHaveBeenCalledWith(VVM_STATUS.$getDisplayName(VVM_STATUS.STAGE_1));
        });

    });

    describe('getReasonName', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return name for reason ID', function() {
            var result = vm.getReasonName(reasons[2].id);

            expect(result).toEqual(reasons[2].name);
        });

        it('should return undefined if ID is not given', function() {
            expect(vm.getReasonName()).toBeUndefined();
        });

        it('should throw exception if reason with the given ID does not exist', function() {
            expect(function() {
                vm.getReasonName('some-other-id');
            }).toThrow();
        });

    });
});
