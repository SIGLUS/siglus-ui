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

describe('orderRepository', function() {

    var orderRepository, OrderResponseDataBuilder, OrderDataBuilder, orderFactory, orderService, $q, $rootScope,
        PageDataBuilder, BasicOrderResponseDataBuilder, BasicOrderDataBuilder, basicOrderFactory;

    beforeEach(function() {
        module('order');

        inject(function($injector) {
            orderFactory = $injector.get('orderFactory');
            orderService = $injector.get('orderService');
            orderRepository = $injector.get('orderRepository');
            OrderDataBuilder = $injector.get('OrderDataBuilder');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            PageDataBuilder = $injector.get('PageDataBuilder');
            BasicOrderDataBuilder = $injector.get('BasicOrderDataBuilder');
            OrderResponseDataBuilder = $injector.get('OrderResponseDataBuilder');
            BasicOrderResponseDataBuilder = $injector.get('BasicOrderResponseDataBuilder');
            basicOrderFactory = $injector.get('basicOrderFactory');
        });
    });

    describe('get', function() {

        var order, orderResponse;

        beforeEach(function() {
            order = new OrderDataBuilder().build();
            orderResponse = new OrderResponseDataBuilder().build();

            spyOn(orderFactory, 'buildFromResponse');
            spyOn(orderService, 'get');
        });

        it('should return order', function() {
            orderFactory.buildFromResponse.andReturn(order);
            orderService.get.andReturn($q.resolve(orderResponse));

            var result;
            orderRepository.get(order.id)
                .then(function(order) {
                    result = order;
                });
            $rootScope.$apply();

            expect(result).toEqual(order);
            expect(orderFactory.buildFromResponse).toHaveBeenCalledWith(orderResponse);
            expect(orderService.get).toHaveBeenCalledWith(order.id);
        });

        it('should reject promise if orderFactory throws an error', function() {
            orderService.get.andReturn($q.resolve());
            orderFactory.buildFromResponse.andThrow();

            var rejected;
            orderRepository.get(order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject promise if orderService promise was rejected', function() {
            orderService.get.andReturn($q.reject());

            var rejected;
            orderRepository.get(order.id)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should throw exception if undefined was given as order id', function() {
            expect(function() {
                orderRepository.get();
            }).toThrow('Order ID must be defined');
        });

    });

    describe('search', function() {

        var basicOrders, basicOrderResponses, searchParams;

        beforeEach(function() {
            basicOrders = [
                new BasicOrderDataBuilder().build(),
                new BasicOrderDataBuilder().build()
            ];

            basicOrderResponses = [
                new BasicOrderResponseDataBuilder().build(),
                new BasicOrderResponseDataBuilder().build()
            ];

            searchParams = {
                supplyingFacility: 'some-facility-id'
            };

            spyOn(basicOrderFactory, 'buildFromResponseArray');
            spyOn(orderService, 'search');
        });

        it('should return basic orders', function() {
            var page = PageDataBuilder.buildWithContent(basicOrderResponses);

            basicOrderFactory.buildFromResponseArray.andReturn(basicOrders);
            orderService.search.andReturn($q.resolve(page));

            var result;
            orderRepository.search(searchParams)
                .then(function(page) {
                    result = page;
                });
            $rootScope.$apply();

            expect(result.content.length).toBe(2);
            expect(result.content).toEqual(basicOrders);
            expect(basicOrderFactory.buildFromResponseArray).toHaveBeenCalledWith(basicOrderResponses);
            expect(orderService.search).toHaveBeenCalledWith(searchParams);
        });

        it('should resolve if undefined was passed', function() {
            var page = PageDataBuilder.buildWithContent(basicOrderResponses);

            basicOrderFactory.buildFromResponseArray.andReturn(basicOrders);
            orderService.search.andReturn($q.resolve(page));

            var result;
            orderRepository.search(undefined)
                .then(function(page) {
                    result = page;
                });
            $rootScope.$apply();

            expect(result).toBeDefined();
        });

        it('should reject promise if basicOrderFactory throws an error', function() {
            orderService.search.andReturn($q.resolve());
            basicOrderFactory.buildFromResponseArray.andThrow();

            var rejected;
            orderRepository.search(searchParams)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject promise if orderService promise was rejected', function() {
            orderService.search.andReturn($q.reject());

            var rejected;
            orderRepository.search(searchParams)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

    });

    // #447: DDM facility can see the fulfilment which is supervised by DPM facility
    describe('searchFulfill', function() {

        var basicOrders, basicOrderResponses, searchParams;

        beforeEach(function() {
            basicOrders = [
                new BasicOrderDataBuilder().build(),
                new BasicOrderDataBuilder().build()
            ];

            basicOrderResponses = [
                new BasicOrderResponseDataBuilder().build(),
                new BasicOrderResponseDataBuilder().build()
            ];

            searchParams = {
                supplyingFacility: 'some-facility-id'
            };

            spyOn(basicOrderFactory, 'buildFromResponseArray');
            spyOn(orderService, 'searchFulfill');
        });

        it('should return basic orders', function() {
            var page = PageDataBuilder.buildWithContent(basicOrderResponses);

            basicOrderFactory.buildFromResponseArray.andReturn(basicOrders);
            orderService.searchFulfill.andReturn($q.resolve(page));

            var result;
            orderRepository.searchFulfill(searchParams)
                .then(function(page) {
                    result = page;
                });
            $rootScope.$apply();

            expect(result.content.length).toBe(2);
            expect(result.content).toEqual(basicOrders);
            expect(basicOrderFactory.buildFromResponseArray).toHaveBeenCalledWith(basicOrderResponses);
            expect(orderService.searchFulfill).toHaveBeenCalledWith(searchParams);
        });

        it('should resolve if undefined was passed', function() {
            var page = PageDataBuilder.buildWithContent(basicOrderResponses);

            basicOrderFactory.buildFromResponseArray.andReturn(basicOrders);
            orderService.searchFulfill.andReturn($q.resolve(page));

            var result;
            orderRepository.searchFulfill(undefined)
                .then(function(page) {
                    result = page;
                });
            $rootScope.$apply();

            expect(result).toBeDefined();
        });

        it('should reject promise if basicOrderFactory throws an error', function() {
            orderService.searchFulfill.andReturn($q.resolve());
            basicOrderFactory.buildFromResponseArray.andThrow();

            var rejected;
            orderRepository.searchFulfill(searchParams)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

        it('should reject promise if orderService promise was rejected', function() {
            orderService.searchFulfill.andReturn($q.reject());

            var rejected;
            orderRepository.searchFulfill(searchParams)
                .catch(function() {
                    rejected = true;
                });
            $rootScope.$apply();

            expect(rejected).toBe(true);
        });

    });
    // #447: ends here

});
