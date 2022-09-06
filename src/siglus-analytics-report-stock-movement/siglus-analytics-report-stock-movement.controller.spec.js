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

describe('siglusAnalyticsReportStockMovementController', function() {
    beforeEach(function() {
        module('siglus-analytics-report-stock-movement');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$stateParams = $injector.get('$stateParams');
        });

        this.facility = {
            name: 'test'
        };

        this.vm = this.$controller('siglusAnalyticsReportStockMovementController', {
            $stateParams: this.$stateParams,
            stockMovements: this.stockMovements,
            facility: this.facility
        });
    });

    describe('concatStockMovementItemArrByType', function() {
        it('should expose [null, null, null, null]', function() {
            var item = {
                type: 'PHYSICAL_INVENTORY'
            };

            expect(this.vm.concatStockMovementItemArrByType(item)).toEqual([null, null, null, null]);
        });

        it('should expose [null, null, null, Math]', function() {
            var item = {
                type: 'ISSUE',
                movementQuantity: 1
            };

            expect(this.vm.concatStockMovementItemArrByType(item)).toEqual([null, null, null, 1]);
        });

        it('should expose [Math.abs(item.movementQuantity), null, null, null ]', function() {
            var item = {
                type: 'RECEIVE',
                movementQuantity: 1
            };

            expect(this.vm.concatStockMovementItemArrByType(item)).toEqual([1, null, null, null]);
        });

        it('should expose [null, null, Math.abs(item.movementQuantity), null ] when movementQuantity > 0', function() {
            var item = {
                type: 'ADJUSTMENT',
                movementQuantity: 1
            };

            expect(this.vm.concatStockMovementItemArrByType(item)).toEqual([null, null, 1, null]);
        });

        it('should expose [null, Math.abs(item.movementQuantity), null, null ] when movementQuantity < 0', function() {
            var item = {
                type: 'ADJUSTMENT',
                movementQuantity: -1
            };

            expect(this.vm.concatStockMovementItemArrByType(item)).toEqual([null, 1, null, null]);
        });
    });
});