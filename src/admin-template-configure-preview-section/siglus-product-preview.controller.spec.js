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

describe('SiglusProductPreviewController', function() {

    var vm, $controller, COLUMN_SOURCES;

    beforeEach(function() {
        module('admin-template-configure-preview-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
        });

        vm = $controller('SiglusProductPreviewController');
    });

    describe('onInit', function() {

        it('should set items', function() {
            vm.$onInit();

            expect(vm.items).toEqual([{
                'orderable.fullProductName': 'Name 1',
                'orderable.productCode': 'Product 1'
            }, {
                'orderable.fullProductName': 'Name 2',
                'orderable.productCode': 'Product 2'
            }]);
        });

        it('should set product columns', function() {
            vm.columnsMap = {
                averageConsumption: {
                    name: 'averageConsumption',
                    isDisplayed: true
                },
                remarks: {
                    name: 'remarks',
                    isDisplayed: false
                }
            };
            vm.$onInit();

            var sortColumns = _.sortBy(vm.columns, 'name');

            expect(sortColumns).toEqual([vm.columnsMap.averageConsumption]);
        });
    });

    describe('isUserInput', function() {

        it('should return true if column source is user input', function() {
            var column = {
                source: COLUMN_SOURCES.USER_INPUT
            };

            expect(vm.isUserInput(column)).toBe(true);
        });

        it('should return false if column source is user input', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.isUserInput(column)).toBe(false);
        });
    });

    describe('columnDisplayName', function() {
        beforeEach(function() {
            vm.$onInit();
        });

        it('should return productCode if column name is orderable.productCode', function() {
            var column = {
                name: 'orderable.productCode',
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.columnDisplayName(column, vm.items[0])).toBe('Product 1');
        });

        it('should return fullProductName if column name is orderable.fullProductName', function() {
            var column = {
                name: 'orderable.fullProductName',
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.columnDisplayName(column, vm.items[1])).toBe('Name 2');
        });

        it('should return formatted source if column name requestedQuantity', function() {
            var column = {
                name: 'requestedQuantity',
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(vm.columnDisplayName(column, vm.items[0])).toBe('requisitionConstants.referenceData');
        });
    });
});
