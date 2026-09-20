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

describe('SiglusPatientController', function() {

    var vm, sections, patientLineItems, $controller, messageService, $interval, $scope;

    beforeEach(function() {
        module('siglus-requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
            $interval = $injector.get('$interval');
            $scope = $injector.get('$rootScope').$new();
        });

        sections = [{
            id: '7467b211-b38b-4122-a91e-4bc2476b7eb5',
            name: 'patientType',
            label: 'Type of Patient',
            displayOrder: 0,
            columns: [{
                name: 'new',
                label: 'New',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the number of new patients',
                tag: null,
                source: 'USER_INPUT',
                id: '60a3a5ab-7f59-45f8-af98-e79ff8c1818d'
            }, {
                name: 'total',
                label: 'Total',
                indicator: 'PD',
                displayOrder: 1,
                isDisplayed: true,
                option: null,
                definition: 'record the total number of this group',
                tag: null,
                source: 'CALCULATED',
                id: '30d4e767-a206-4eb1-bea0-1ff3a48da633'
            }]
        }];

        patientLineItems = [{
            id: '111',
            name: 'patientType',
            columns: {
                new: {
                    id: '12',
                    value: null
                },
                total: {
                    id: '23',
                    value: null
                }
            }
        }];

        spyOn(messageService, 'get').andReturn('This field is required');

        vm = $controller('SiglusPatientController', {
            $scope: $scope,
            $interval: $interval
        });
        vm.sections = sections;
        vm.lineItems = patientLineItems;
        vm.$onInit();
    });

    afterEach(function() {
        if (vm.$onDestroy) {
            vm.$onDestroy();
        }
    });

    describe('calculatePatientValues and $interval', function() {

        it('should set vm.adjustmentValue to 0 when calculation results in NaN or division by zero', function() {
            // When sections/columns aren't present for newSection2/newSection4, totalWithInThisMonth evaluates to 0 (0 / 0 = NaN)
            expect(vm.adjustmentValue).toBe(0);
        });

        it('should recalculate patient values every 3 seconds', function() {
            // Set up line items and merged patient map for valid calculations
            vm.mergedPatientMap = {
                newSection2: { columns: { col5: { value: 10 }, col6: { value: 20 } }, column: { columns: [{}, {}, {}, {}, {}, { name: 'col5' }, { name: 'col6' }] } },
                newSection3: { columns: { col2: { value: 5 }, col3: { value: 10 } }, column: { columns: [{}, {}, { name: 'col2' }, { name: 'col3' }] } },
                newSection4: { columns: { col0: { value: 5 }, col1: { value: 10 } }, column: { columns: [{ name: 'col0' }, { name: 'col1' }] } },
                newSection9: { columns: { col1: { value: 0 }, col2: { value: 0 } }, column: { columns: [{}, { name: 'col1' }, { name: 'col2' }] } }
            };

            // Flush 3000ms forward on $interval
            $interval.flush(3000);

            // totalWithTreatment = 20 + 10 + 0 + 10 = 40
            // totalWithInThisMonth = 10 + 5 + 0 + 5 = 20
            // adjustmentValue = (40 / 20).toFixed(2) = "2.00"
            expect(vm.adjustmentValue).toBe('2.00');
        });

        it('should cancel $interval on $onDestroy to prevent memory leaks', function() {
            spyOn($interval, 'cancel').andCallThrough();
            vm.$onDestroy();
            expect($interval.cancel).toHaveBeenCalled();
        });
    });

    describe('getTotal', function() {

        it('should clear the last total value and return undefined if noting is input', function() {
            vm.lineItems[0].columns.total.value = 100;

            expect(vm.getTotal(vm.lineItems[0], vm.lineItems[0].columns.total)).toBeUndefined();
        });

        it('should return calculated total', function() {
            vm.lineItems[0].columns.new.value = 100;

            expect(vm.getTotal(vm.lineItems[0], vm.lineItems[0].columns.total)).toBe(100);
        });

        it('validateSiglusLineItemField should be called', function() {
            vm.lineItems[0].columns.new.value = 2147483648;
            vm.getTotal(vm.lineItems[0], vm.lineItems[0].columns.total);

            expect(vm.lineItems[0].columns.total.$error).not.toBeUndefined();
        });

        it('should clear the last error message and calculate the new total value when the value of newField is null', function() {
            var total = vm.lineItems[0].columns.total;
            total.value = 2147483648;
            total.$error = 'This number is larger than what can be saved';
            vm.lineItems[0].columns.new.value = null;

            vm.getTotal(vm.lineItems[0], total);

            expect(total.value).toBeUndefined();
            expect(total.$error).toBeUndefined();
        });
    });
});
