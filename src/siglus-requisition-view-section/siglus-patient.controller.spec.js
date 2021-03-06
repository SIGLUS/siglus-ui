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

    var vm, sections, patientLineItems, $controller, messageService;

    beforeEach(function() {
        module('siglus-requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
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

        vm = $controller('SiglusPatientController');
        vm.sections = sections;
        vm.lineItems = patientLineItems;
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should enhance lineItems with patient config date', function() {
            expect(vm.lineItems).toEqual([{
                id: '111',
                name: 'patientType',
                section: sections[0],
                columns: {
                    new: {
                        name: 'new',
                        label: 'New',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the number of new patients',
                        tag: null,
                        source: 'USER_INPUT',
                        id: '12',
                        value: null
                    },
                    total: {
                        name: 'total',
                        label: 'Total',
                        indicator: 'PD',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the total number of this group',
                        tag: null,
                        source: 'CALCULATED',
                        id: '23',
                        value: null
                    }
                }
            }]);
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

        it('should clear the last error message and calculate the new total value ' +
            'when the value of newField is null', function() {
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
