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

describe('SiglusTestConsumptionController', function() {

    var vm, $controller, program, ProgramDataBuilder, sections, lineItems, canEdit,
        requisitionValidator;

    beforeEach(function() {
        module('siglus-requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            requisitionValidator = $injector.get('requisitionValidator');
        });

        program = new ProgramDataBuilder().build();
        sections = [{
            name: 'project',
            label: 'Test Project',
            displayOrder: 0,
            columns: [{
                name: 'hivDetermine',
                label: 'HIV Determine',
                indicator: 'TP',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the test data for HIV Determine',
                tag: null,
                columnDefinition: {},
                source: null
            }]
        }, {
            name: 'outcome',
            label: 'Test Outcome',
            displayOrder: 1,
            columns: [{
                name: 'consumo',
                label: 'Consumo',
                indicator: 'TO',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the consumo quantity for each test project',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }, {
                name: 'new',
                label: 'new',
                indicator: 'n',
                displayOrder: 2,
                isDisplayed: true,
                option: null,
                definition: 'record the new column',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }, {
                name: 'positive'
            }, {
                name: 'unjustified'
            }]
        }, {
            name: 'service',
            label: 'Services',
            displayOrder: 2,
            columns: [ {
                name: 'HF',
                label: 'HF',
                indicator: 'SV',
                displayOrder: 0,
                isDisplayed: false,
                option: null,
                definition: 'record the test outcome for my facility',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }, {
                name: 'total',
                label: 'Total',
                indicator: 'SV',
                displayOrder: 1,
                isDisplayed: true,
                option: null,
                definition: 'record the total number of each column',
                tag: null,
                columnDefinition: {},
                source: 'USER_INPUT'
            }]
        }];
        lineItems = [
            {
                service: 'total',
                projects: {
                    hivDetermine: {
                        project: 'hivDetermine',
                        outcomes: {
                            consumo: {
                                outcome: 'consumo',
                                value: null
                            },
                            positive: {
                                outcome: 'positive',
                                value: null
                            },
                            unjustified: {
                                outcome: 'unjustified',
                                value: null
                            }
                        }
                    }
                }
            }
        ];
        canEdit = true;
        vm = $controller('SiglusTestConsumptionController');
        vm.program = program;
        vm.sections = sections;
        vm.lineItems = lineItems;
        vm.canEdit = canEdit;
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should bind program to vm', function() {

            expect(vm.program).toEqual(program);
        });

        it('should bind sections to vm', function() {

            expect(vm.sections).toEqual(sections);
        });

        it('should bind canEdit to vm', function() {

            expect(vm.canEdit).toEqual(canEdit);
        });

        it('should set correct testProjectColspan and bind to vm', function() {

            expect(vm.testProjectColspan).toEqual(2);
        });

        it('should set correct programColspan and bind to vm', function() {

            expect(vm.programColspan).toEqual(3);
        });

        it('should enhance lineItems and bind to vm', function() {

            expect(vm.lineItems).toEqual([
                {
                    service: 'total',
                    name: 'total',
                    label: 'Total',
                    indicator: 'SV',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of each column',
                    tag: null,
                    columnDefinition: {},
                    source: 'USER_INPUT',
                    projects: {
                        hivDetermine: {
                            project: 'hivDetermine',
                            name: 'hivDetermine',
                            label: 'HIV Determine',
                            indicator: 'TP',
                            displayOrder: 0,
                            isDisplayed: true,
                            option: null,
                            definition: 'record the test data for HIV Determine',
                            tag: null,
                            columnDefinition: {},
                            source: null,
                            outcomes: {
                                consumo: {
                                    outcome: 'consumo',
                                    value: null,
                                    name: 'consumo',
                                    label: 'Consumo',
                                    indicator: 'TO',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the consumo quantity for each test project',
                                    tag: null,
                                    columnDefinition: {},
                                    source: 'USER_INPUT'
                                },
                                positive: {
                                    outcome: 'positive',
                                    name: 'positive',
                                    value: null
                                },
                                unjustified: {
                                    outcome: 'unjustified',
                                    name: 'unjustified',
                                    value: null
                                }
                            }
                        }
                    }
                }
            ]);
        });
    });

    describe('getTotal', function() {

        beforeEach(function() {
            var newLineItem =  {
                service: 'new',
                projects: {
                    hivDetermine: {
                        project: 'hivDetermine',
                        outcomes: {
                            consumo: {
                                outcome: 'consumo',
                                value: 100
                            },
                            positive: {
                                outcome: 'positive',
                                value: null
                            },
                            unjustified: {
                                outcome: 'unjustified',
                                value: 2147483647
                            }
                        }
                    }
                }
            };
            var anotherLineItem =  {
                service: 'another',
                projects: {
                    hivDetermine: {
                        project: 'hivDetermine',
                        outcomes: {
                            consumo: {
                                outcome: 'consumo',
                                value: 120
                            },
                            positive: {
                                outcome: 'positive',
                                value: null
                            },
                            unjustified: {
                                outcome: 'unjustified',
                                value: 1
                            }
                        }
                    }
                }
            };
            vm.lineItems.push(newLineItem, anotherLineItem);
        });

        it('should return total value 220 when the consumo value of newLineItem is 100 ' +
            'and the consumo value of anotherLineItem is 120', function() {
            var project = lineItems[0].projects['hivDetermine'];
            var outcome = lineItems[0].projects['hivDetermine'].outcomes['consumo'];

            vm.getTotal(project, outcome);

            expect(outcome.value).toBe(220);
        });

        it('should return total value null when the positive value of newLineItem is null ' +
            'and the positive value of anotherLineItem is null', function() {
            var project = lineItems[0].projects['hivDetermine'];
            var outcome = lineItems[0].projects['hivDetermine'].outcomes['positive'];

            vm.getTotal(project, outcome);

            expect(outcome.value).toBeUndefined();
        });

        it('should get error message when the unjustified value of newLineItem is 2147483647 ' +
            'and the unjustified value of anotherLineItem is 1', function() {
            var project = lineItems[0].projects['hivDetermine'];
            var outcome = lineItems[0].projects['hivDetermine'].outcomes['unjustified'];

            vm.getTotal(project, outcome);

            expect(outcome.value).toBe(2147483648);
            expect(outcome.$error).toBe('requisitionValidation.numberTooLarge');
        });
    });

    describe('validateOnUpdate', function() {

        beforeEach(function() {
            spyOn(requisitionValidator, 'validateTestConsumptionLineItems');
        });

        it('should call the validateTestConsumptionLineItems', function() {
            vm.validateOnUpdate();

            expect(requisitionValidator.validateTestConsumptionLineItems).toHaveBeenCalled();
        });
    });
});
