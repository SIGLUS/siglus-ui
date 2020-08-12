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

describe('SiglusConsultationNumberViewController', function() {

    var vm, $controller, program, ProgramDataBuilder, sections, lineItems, canEdit, isEmergency;

    beforeEach(function() {
        module('siglus-requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        program = new ProgramDataBuilder().build();
        sections = [{
            name: 'number',
            label: 'Consultation Number',
            displayOrder: 0,
            columns: [{
                name: 'consultationNumber',
                label: 'No.of External Consultations Performed',
                indicator: 'CN',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the number of consultations performed in this period',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }, {
                name: 'total',
                label: 'Total',
                indicator: 'CN',
                displayOrder: 1,
                isDisplayed: true,
                option: null,
                definition: 'record the total number',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }]
        }];
        lineItems = [{
            name: 'number',
            columns: {
                consultationNumber: {
                    value: 16
                },
                total: {
                    value: 12
                }
            }
        }];
        canEdit = true;
        isEmergency = false;
        vm = $controller('SiglusConsultationNumberViewController');
        vm.program = program;
        vm.sections = sections;
        vm.lineItems = lineItems;
        vm.canEdit = canEdit;
        vm.isEmergency = isEmergency;
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should bind isEmergency to vm', function() {

            expect(vm.isEmergency).toEqual(isEmergency);
        });

        it('should bind sections to vm', function() {

            expect(vm.sections).toEqual(sections);
        });

        it('should bind canEdit to vm', function() {

            expect(vm.canEdit).toEqual(canEdit);
        });

        it('should enhance lineItems and bind to vm', function() {

            expect(vm.lineItems).toEqual([
                {
                    name: 'number',
                    columns: {
                        consultationNumber: {
                            value: 16,
                            name: 'consultationNumber',
                            label: 'No.of External Consultations Performed',
                            indicator: 'CN',
                            displayOrder: 0,
                            isDisplayed: true,
                            option: null,
                            definition: 'record the number of consultations performed in this period',
                            tag: null,
                            columnDefinition: {},
                            source: 'USER_INPUT'
                        },
                        total: {
                            value: 12,
                            name: 'total',
                            label: 'Total',
                            indicator: 'CN',
                            displayOrder: 1,
                            isDisplayed: true,
                            option: null,
                            definition: 'record the total number',
                            tag: null,
                            columnDefinition: {},
                            source: 'USER_INPUT'
                        }
                    },
                    section: sections[0]
                }
            ]);
        });
    });

    describe('getTotal', function() {

        beforeEach(function() {
            vm.lineItems[0].columns['new'] = {
                value: null
            };
            vm.lineItems[0].columns['total'].source = 'CALCULATED';
        });

        it('should return total value 220 when the value of consultationNumberField is 100 ' +
            'and the value of newField is 120', function() {
            vm.lineItems[0].columns['consultationNumber'].value = 100;
            vm.lineItems[0].columns['new'].value = 120;
            var total = lineItems[0].columns['total'];

            vm.getTotal(lineItems[0], total);

            expect(total.value).toBe(220);
        });

        it('should clear the last total value and return total value undefined ' +
            'when the value of consultationNumberField is null ' +
            'and the value of newField is null', function() {
            var total = lineItems[0].columns['total'];
            total.value = 100;
            vm.lineItems[0].columns['consultationNumber'].value = null;
            vm.lineItems[0].columns['new'].value = null;

            vm.getTotal(lineItems[0], total);

            expect(total.value).toBeUndefined();
        });

        it('should get error message when the value of consultationNumberField is 2147483647 ' +
            'and the value of newField is 1', function() {
            vm.lineItems[0].columns['consultationNumber'].value = 2147483647;
            vm.lineItems[0].columns['new'].value = 1;
            var total = lineItems[0].columns['total'];

            vm.getTotal(lineItems[0], total);

            expect(total.value).toBe(2147483648);
            expect(total.$error).toBe('requisitionValidation.numberTooLarge');
        });

        it('should clear the last error message and calculate the new total value ' +
            'when the value of consultationNumberField is is 100' +
            'and the value of newField is 150', function() {
            var total = lineItems[0].columns['total'];
            total.value = 2147483648;
            total.$error = 'requisitionValidation.numberTooLarge';
            vm.lineItems[0].columns['consultationNumber'].value = 100;
            vm.lineItems[0].columns['new'].value = 150;

            vm.getTotal(lineItems[0], total);

            expect(total.value).toBe(250);
            expect(total.$error).toBeUndefined();
        });
    });
});
