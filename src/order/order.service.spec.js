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

describe('orderService', function() {

    var orderService, $rootScope, $httpBackend, fulfillmentUrlFactory, OrderResponseDataBuilder,
        PageDataBuilder, BasicOrderResponseDataBuilder;

    beforeEach(function() {
        module('order');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            orderService = $injector.get('orderService');
            fulfillmentUrlFactory = $injector.get('fulfillmentUrlFactory');
            OrderResponseDataBuilder = $injector.get('OrderResponseDataBuilder');
            PageDataBuilder = $injector.get('PageDataBuilder');
            BasicOrderResponseDataBuilder = $injector.get('BasicOrderResponseDataBuilder');
        });
    });

    describe('get', function() {

        var order;

        beforeEach(function() {
            order = new OrderResponseDataBuilder().build();

            // #264: warehouse clerk can add product to orders
            $httpBackend.whenGET(fulfillmentUrlFactory('/api/siglusapi/orders/' + order.id))
                .respond(200, {
                    order: order
                });
            // #264: ends here
        });

        // #264: warehouse clerk can add product to orders
        it('should call /api/siglusapi/orders endpoint', function() {
            $httpBackend.expectGET(fulfillmentUrlFactory('/api/siglusapi/orders/' + order.id));
            // #264: ends here

            orderService.get(order.id);

            $httpBackend.flush();
        });

        it('should return response', function() {
            var result;
            orderService.get(order.id)
                .then(function(order) {
                    result = order;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(order));
        });
    });

    describe('retry', function() {

        var order;

        beforeEach(function() {
            order = new OrderResponseDataBuilder().build();

            $httpBackend.whenGET(fulfillmentUrlFactory('/api/orders/' + order.id + '/retry'))
                .respond(200, {});
        });

        it('should call /api/orders/{id}/retry endpoint', function() {
            $httpBackend.expectGET(fulfillmentUrlFactory('/api/orders/' + order.id + '/retry'));

            var result;
            orderService.retryTransfer(order.id).then(function(response) {
                result = response;
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });
    });

    describe('search', function() {

        var searchParams, someId, page;

        beforeEach(function() {
            someId = 'some-facility-id';

            searchParams = {
                supplyingFacility: someId
            };

            page = PageDataBuilder.buildWithContent([
                new BasicOrderResponseDataBuilder().build(),
                new BasicOrderResponseDataBuilder().build()
            ]);

            $httpBackend.whenGET(
                fulfillmentUrlFactory('/api/orders?supplyingFacility=' + someId)
            ).respond(200, page);
        });

        it('should call /api/orders endpoint', function() {
            $httpBackend.expectGET(
                fulfillmentUrlFactory('/api/orders?supplyingFacility=' + someId)
            );

            orderService.search(searchParams);
            $httpBackend.flush();
        });

        it('should return page', function() {
            var result;
            orderService.search(searchParams)
                .then(function(page) {
                    result = page;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(page));
        });
    });

    // #264: warehouse clerk can add product to orders
    describe('getOrderableLineItem', function() {

        var order, createLineItemResult;

        beforeEach(function() {
            order = new OrderResponseDataBuilder().build();
            createLineItemResult = [{
                orderLineItem: {},
                lots: {}
            }];

            $httpBackend.whenPOST(
                fulfillmentUrlFactory('/api/siglusapi/orders/createLineItem?orderId=' + order.id)
            ).respond(200, createLineItemResult);
        });

        it('should call /api/siglusapi/orders/createLineItem endpoint', function() {
            $httpBackend.expectPOST(
                fulfillmentUrlFactory('/api/siglusapi/orders/createLineItem?orderId='+ order.id)
            );

            orderService.getOrderableLineItem(order.id, []);

            $httpBackend.flush();
        });

        it('should return response', function() {
            var result;
            orderService.getOrderableLineItem(order.id, [])
                .then(function(response) {
                    result = response;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(createLineItemResult));
        });
    });
    // #264: ends here

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
