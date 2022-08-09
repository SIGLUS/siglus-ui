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

describe('calculationFactoryDecorator', function() {

    var calculationFactory, TEMPLATE_COLUMNS;
    var A, B, C, E, J, M, S, SQ, EX, K;

    beforeEach(function() {
        module('requisition-calculations');
        inject(function($injector) {
            calculationFactory = $injector.get('calculationFactory');
            TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
            A = TEMPLATE_COLUMNS.BEGINNING_BALANCE;
            B = TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY;
            C = TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY;
            E = TEMPLATE_COLUMNS.STOCK_ON_HAND;
            SQ = TEMPLATE_COLUMNS.SUGGESTED_QUANTITY;
            EX = TEMPLATE_COLUMNS.EXPIRATION_DATE;
            K = TEMPLATE_COLUMNS.APPROVED_QUANTITY;
            J = TEMPLATE_COLUMNS.REQUESTED_QUANTITY;
            M = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY;
            S = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA;
        });
    });

    describe('helpers', function() {
        var lineItem;
        var requisition;

        beforeEach(function() {
            lineItem = {};
            requisition = {
                template: {
                    getColumn: function(columnName) {
                        return columnName;
                    }
                }
            };
        });

        describe('getOrderQuantityFromColumnJMS', function() {
            it('should return default order quantity given shouldReturnRequestedQuantity is false and' +
                'M column is not displayed and' +
                'S column not exists', function() {
                spyOn(calculationFactory.__, 'shouldReturnRequestedQuantity')
                    .andReturn(false);
                spyOn(calculationFactory.__, 'isDisplayed')
                    .andCallFake(function() {
                        return false;
                    });
                requisition.template.getColumn = function() {
                    return undefined;
                };
                var defaultOrderQuantity = -999;

                // when
                var quantity = calculationFactory.__.getOrderQuantityFromColumnJMS(
                    requisition, lineItem, defaultOrderQuantity
                );

                // then
                expect(quantity)
                    .toBe(defaultOrderQuantity);
            });

            it('should call $delegate.calculatedOrderQuantityIsa given shouldReturnRequestedQuantity is false and' +
                'M column is not displayed and' +
                'S Column exists', function() {
                spyOn(calculationFactory.__, 'shouldReturnRequestedQuantity')
                    .andReturn(false);
                spyOn(calculationFactory.__, 'isDisplayed')
                    .andCallFake(function(col) {
                        return col === S;
                    });
                spyOn(calculationFactory, 'calculatedOrderQuantityIsa');
                var defaultOrderQuantity = 0;

                // when
                calculationFactory.__.getOrderQuantityFromColumnJMS(
                    requisition, lineItem, defaultOrderQuantity
                );

                // then
                expect(calculationFactory.calculatedOrderQuantityIsa)
                    .toHaveBeenCalled();
            });

            it('should $delegate.calculatedOrderQuantity given shouldReturnRequestedQuantity is false and' +
                'M Column is displayed', function() {
                spyOn(calculationFactory.__, 'shouldReturnRequestedQuantity')
                    .andReturn(false);
                spyOn(calculationFactory.__, 'isDisplayed')
                    .andCallFake(function(col) {
                        return col === M;
                    });
                spyOn(calculationFactory, 'calculatedOrderQuantity');
                var defaultOrderQuantity = 0;

                // when
                calculationFactory.__.getOrderQuantityFromColumnJMS(
                    requisition, lineItem, defaultOrderQuantity
                );

                // then
                expect(calculationFactory.calculatedOrderQuantity)
                    .toHaveBeenCalled();
            });

            it('should return value of column J given shouldReturnRequestedQuantity is true', function() {
                spyOn(calculationFactory.__, 'shouldReturnRequestedQuantity')
                    .andReturn(true);
                lineItem[J] = 999;
                var defaultOrderQuantity = 0;

                var orderQuantity = calculationFactory.__.getOrderQuantityFromColumnJMS(
                    requisition, lineItem, defaultOrderQuantity
                );

                expect(orderQuantity)
                    .toBe(lineItem[J]);
            });
        });

        describe('shouldReturnRequestedQuantity', function() {
            it('should return true given lineItem isNonFullSupply', function() {
                var lineItem = {
                    isNonFullSupply: function() {
                        return true;
                    }
                };
                var requisition = {
                    emergency: false
                };

                expect(calculationFactory.__.shouldReturnRequestedQuantity(lineItem, {}, requisition))
                    .toBeTruthy();
            });

            it('should return false given ' +
                'lineItem isFullSupply and ' +
                'requisition is not emergency and' +
                'lineItem J is not filled and column J is not displayed', function() {
                var lineItem = {
                    isNonFullSupply: function() {
                        return false;
                    }
                };
                var requisition = {
                    emergency: false
                };

                var jColumn = {
                    $display: false
                };

                expect(calculationFactory.__.shouldReturnRequestedQuantity(lineItem, jColumn, requisition))
                    .toBeFalsy();
            });
        });

        describe('isFilled', function() {
            it('should return false given value is undefined', function() {
                expect(calculationFactory.__.isFilled(undefined))
                    .toBeFalsy();
            });

            it('should return false given value is null', function() {
                expect(calculationFactory.__.isFilled(null))
                    .toBeFalsy();
            });

            it('should return true given value is neither null nor undefined', function() {
                expect(calculationFactory.__.isFilled(0))
                    .toBeTruthy();
            });
        });

        describe('isDisplayed', function() {
            it('should return true given column.$display can be evaluated true', function() {
                expect(calculationFactory.__.isDisplayed({
                    $display: true
                }))
                    .toBeTruthy();
            });

            it('should return false given column.$display can be evaluated false', function() {
                expect(calculationFactory.__.isDisplayed({
                    $display: undefined
                }))
                    .toBeFalsy();
            });
        });
    });

    describe('packsToShip', function() {
        it('should return 0 given netContent is null', function() {
            spyOn(calculationFactory.__, 'getOrderQuantity').andReturn(999);
            var lineItem = {
                orderable: {
                    netContent: null
                }
            };

            expect(calculationFactory.packsToShip(lineItem)).toBe(0);
        });

        it('should return (orderQuantity - remainderQuantity) / netContent ' +
            'given remainderQuantity <= packRoundingThreshold', function() {
            var orderQuantity = 9;
            spyOn(calculationFactory.__, 'getOrderQuantity').andReturn(orderQuantity);
            var lineItem = {
                orderable: {
                    netContent: 2,
                    packRoundingThreshold: 999
                }
            };
            lineItem[K] = orderQuantity;
            var requisition = {};

            var packsToShip = calculationFactory.packsToShip(lineItem, requisition);

            expect(packsToShip)
                .toBe(4);
        });
    });

    describe('expirationDate', function() {
        it('should return null given EX is undefined', function() {
            var lineItem = {};

            var expirationDate = calculationFactory.expirationDate(lineItem);

            expect(expirationDate)
                .toBe(null);
        });

        it('should return EX given EX is not undefined', function() {
            var lineItem = {};
            var actualExpireDate = '2022-01-01';
            lineItem[EX] = actualExpireDate;

            var expirationDate = calculationFactory.expirationDate(lineItem);

            expect(expirationDate)
                .toBe(actualExpireDate);
        });
    });

    describe('suggestedQuantity', function() {
        it('should return value of SQ', function() {
            var lineItem = {};
            var valueOfSQ = 999;
            lineItem[SQ] = valueOfSQ;

            var suggestedQuantity = calculationFactory.suggestedQuantity(lineItem);

            expect(suggestedQuantity)
                .toBe(valueOfSQ);
        });
    });

    describe('difference', function() {
        it('should return E-(A+B-C)', function() {
            var lineItem = {};
            lineItem[A] = 10;
            lineItem[B] = 10;
            lineItem[C] = 11;
            lineItem[E] = 15;

            var difference = calculationFactory.difference(lineItem);

            expect(difference)
                .toBe(6);
        });
    });

    describe('theoreticalStockAtEndofPeriod', function() {
        it('should return A+B-C given A+B >= C', function() {
            var lineItem = {};
            lineItem[A] = 10;
            lineItem[B] = 10;
            lineItem[C] = 15;

            var stock = calculationFactory.theoreticalStockAtEndofPeriod(lineItem);

            expect(stock)
                .toBe(5);
        });

        it('should return 0 given A+B < C', function() {
            var lineItem = {};
            lineItem[A] = 10;
            lineItem[B] = 10;
            lineItem[C] = 30;

            var stock = calculationFactory.theoreticalStockAtEndofPeriod(lineItem);

            expect(stock)
                .toBe(0);
        });
    });

    describe('theoreticalQuantityToRequest', function() {

        var lineItem = {};

        it('should return 2C-E given 2C >= E', function() {
            // given
            lineItem[C] = 10;
            lineItem[E] = 15;

            // when
            var quantityToRequest = calculationFactory.theoreticalQuantityToRequest(lineItem);

            // then
            expect(quantityToRequest)
                .toBe(5);
        });

        it('should return 0 given 2C<E', function() {
            // given
            lineItem[C] = 10;
            lineItem[E] = 100;

            // when
            var quantityToRequest = calculationFactory.theoreticalQuantityToRequest(lineItem);

            // then
            expect(quantityToRequest)
                .toBe(0);
        });
    });
});