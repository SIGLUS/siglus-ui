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
describe('templateValidator', function() {

    var templateValidator, template;

    beforeEach(function() {
        module('admin-template');

        inject(function($injector) {
            templateValidator = $injector.get('templateValidator');
        });

        template = jasmine.createSpyObj('template', ['findCircularCalculatedDependencies']);
        template.columnsMap = {};
    });

    describe('isTemplateValid', function() {

        var columns;

        beforeEach(function() {
            columns = [{
                valid: true
            }, {
                valid: true
            }, {
                valid: true
            }];

            template.columnsMap = columns;

            // SIGLUS-REFACTOR: starts here
            template.enableProductModule = true;
            // SIGLUS-REFACTOR: ends here

            spyOn(templateValidator, 'getColumnError').andCallFake(function(column) {
                return !column.valid;
            });
        });

        it('should return true if all columns are valid', function() {
            var result = templateValidator.isTemplateValid(template);

            expect(result).toBe(true);
        });

        it('should return false if at least one column is not valid', function() {
            columns[1].valid = false;

            var result = templateValidator.isTemplateValid(template);

            expect(result).toBe(false);
        });

        it('should validate all columns', function() {
            templateValidator.isTemplateValid(template);

            expect(templateValidator.getColumnError).toHaveBeenCalledWith(columns[0], template);
            expect(templateValidator.getColumnError).toHaveBeenCalledWith(columns[1], template);
            expect(templateValidator.getColumnError).toHaveBeenCalledWith(columns[2], template);
        });

    });

    describe('getColumnError', function() {

        var TEMPLATE_COLUMNS, COLUMN_SOURCES, column;

        beforeEach(function() {
            inject(function($injector) {
                TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
                COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            });

            column = {
                label: 'someLabel',
                definition: 'Some not too short definition of the column...',
                source: COLUMN_SOURCES.USER_INPUT,
                isDisplayed: true,
                columnDefinition: {
                    options: [
                        'optionOne'
                    ],
                    sources: [
                        COLUMN_SOURCES.USER_INPUT
                    ]
                },
                option: 'optionOne'
            };
        });

        it('should return undefined if column is valid', function() {
            var result = templateValidator.getColumnError(column, template);

            expect(result).toBeUndefined();
        });

        it('should return error if label is undefined', function() {
            column.label = undefined;

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnLabelEmpty');
        });

        it('should return error if label is empty', function() {
            column.label = '';

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnLabelEmpty');
        });

        it('should return error if label is too short', function() {
            column.label = 'a';

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnLabelToShort');
        });

        it('should return error if label starts with a space', function() {
            column.label = ' abe';

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnLabelNotAllowedCharacters');
        });

        it('should return error if label has not allowed characters', function() {
            column.label = 'happy face 😊';

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnLabelNotAllowedCharacters');
        });

        it('should return error if column definition is too long', function() {
            column.definition = 'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij' +
                'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij' +
                'a';

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.columnDescriptionTooLong');
        });

        it('should return error if column source is not selected', function() {
            column.source = undefined;

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.emptyColumnSource');
        });

        it('should return error if column is visible but option is not selected', function() {
            column.option = undefined;

            var result = templateValidator.getColumnError(column, template);

            expect(result).toBe('adminProgramTemplate.emptyColumnOption');
        });

        describe('validateTag', function() {

            beforeEach(function() {
                column.tag = undefined;
                column.columnDefinition.supportsTag = true;
                template.populateStockOnHandFromStockCards = true;
            });

            it('should return error if tag is required and not set', function() {
                expect(templateValidator.getColumnError(column, template)).toBe('adminProgramTemplate.columnTagEmpty');
            });

            it('should return false if column does not supports tag', function() {
                column.columnDefinition.supportsTag = false;

                expect(templateValidator.getColumnError(column, template)).toBeUndefined();
            });

            it('should return false if template is not stock based', function() {
                template.populateStockOnHandFromStockCards = false;

                expect(templateValidator.getColumnError(column, template)).toBeUndefined();
            });

            it('should return undefined if tag is valid', function() {
                column.tag = 'some-tag';

                expect(templateValidator.getColumnError(column, template)).toBeUndefined();
            });
        });

        describe('for average consumption', function() {

            beforeEach(function() {
                column.name = TEMPLATE_COLUMNS.AVERAGE_CONSUMPTION;
            });

            it('should return error if number of periods is lesser than 2', function() {
                template.numberOfPeriodsToAverage = 1;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.invalidNumberOfPeriods');
            });

            it('should return error if number of periods is empty', function() {
                template.numberOfPeriodsToAverage = undefined;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.emptyNumberOfPeriods');
            });
        });

        describe('for requested quantity', function() {

            beforeEach(function() {
                column.name = TEMPLATE_COLUMNS.REQUESTED_QUANTITY;
                column.isDisplayed = true;

                template.columnsMap = {};
                template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY] = column;
                template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION] = {
                    name: TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION,
                    isDisplayed: true,
                    label: 'Requested Quantity Explanation'
                };
            });

            it('should return undefined if displayed with explanation', function() {
                var result = templateValidator.getColumnError(column, template);

                expect(result).toBeUndefined();
            });

            // SIGLUS-REFACTOR: delete requestedQuantity relevant
            // it('should return error if displayed without explanation', function() {
            //     template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION].isDisplayed = false;
            //
            //     var result = templateValidator.getColumnError(column, template);
            //
            //     expect(result).toBe('adminProgramTemplate.columnDisplayMismatchRequested Quantity Explanation');
            // });
            // SIGLUS-REFACTOR: ends here

        });

        describe('for requested quantity explanation', function() {

            beforeEach(function() {
                column.name = TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION;
                column.isDisplayed = true;

                template.columnsMap = {};
                template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION] = column;
                template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY] = {
                    name: TEMPLATE_COLUMNS.REQUESTED_QUANTITY,
                    isDisplayed: true,
                    label: 'Requested Quantity'
                };
            });

            it('should return undefined if displayed with requested quantity', function() {
                var result = templateValidator.getColumnError(column, template);

                expect(result).toBeUndefined();
            });

            it('should return error if displayed without requested quantity', function() {
                template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY].isDisplayed = false;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.columnDisplayMismatchRequested Quantity');
            });

        });

        describe('for circular dependencies', function() {

            beforeEach(function() {
                column = {
                    $dependentOn: ['stockOnHand'],
                    source: 'CALCULATED',
                    label: 'column',
                    definition: '',
                    columnDefinition: {
                        sources: ['USER_INPUT', 'CALCULATED'],
                        options: []
                    }
                };

                template.columnsMap = {
                    total: {
                        displayOrder: 2,
                        isDisplayed: true,
                        label: 'Total'
                    },
                    stockOnHand: {
                        displayOrder: 3,
                        isDisplayed: true,
                        label: 'Stock on Hand'
                    }
                };
            });

            it('should validate for circular dependencies', function() {
                template.findCircularCalculatedDependencies.andReturn(['stockOnHand']);

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.calculatedError Stock on Hand');
            });

            it('should validate for circular dependencies and return error for multiple columns', function() {
                template.findCircularCalculatedDependencies.andReturn(['stockOnHand', 'total']);

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.calculatedError Stock on Hand, Total');
            });
        });

        describe('for calculated column', function() {

            beforeEach(function() {
                template.columnsMap.stockOnHand = {
                    name: 'stockOnHand',
                    displayOrder: 5,
                    isDisplayed: false,
                    source: COLUMN_SOURCES.USER_INPUT,
                    definition: '',
                    label: 'Stock on Hand',
                    columnDefinition: {
                        options: [],
                        sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.CALCULATED]
                    }
                };
            });

            it('should validate if column is not displayed when has USER_INPUT source', function() {
                var result = templateValidator.getColumnError(template.columnsMap.stockOnHand, template);

                expect(result)
                    .toEqual('adminProgramTemplate.shouldBeDisplayedadminProgramTemplate.isUserInput');
            });
        });

        describe('for total stockout days', function() {

            var messageService, nColumn, pColumn;

            beforeEach(function() {
                inject(function($injector) {
                    messageService = $injector.get('messageService');
                });

                column.name = TEMPLATE_COLUMNS.TOTAL_STOCKOUT_DAYS;
                nColumn = {
                    label: 'Adjusted Consumption',
                    isDisplayed: true,
                    source: COLUMN_SOURCES.CALCULATED,
                    columnDefinition: {
                        sources: [
                            COLUMN_SOURCES.CALCULATED
                        ]
                    }
                };

                template.columnsMap.adjustedConsumption = nColumn;

                pColumn = {
                    label: 'Average Consumption',
                    isDisplayed: true,
                    source: COLUMN_SOURCES.CALCULATED,
                    columnDefinition: {
                        sources: [
                            COLUMN_SOURCES.CALCULATED
                        ]
                    }
                };

                template.columnsMap.averageConsumption = pColumn;

                spyOn(messageService, 'get').andCallThrough();

                messageService.get.andCallFake(function(message, params) {
                    if (message === 'adminProgramTemplate.shouldBeDisplayedIfOtherIsCalculated' && params &&
                        params.column === pColumn.label) {

                        return message + ' ' + params.column;
                    }
                });
            });

            it('should return undefined if column is visible and consumptions are visible', function() {
                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe(undefined);
            });

            it('should return error if the column is hidden and average consumption is visible', function() {
                column.isDisplayed = false;
                nColumn.isDisplayed = false;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.shouldBeDisplayedIfOtherIsCalculated ' + pColumn.label);
            });

            it('should return undefined if the column is hidden and consumptions are hidden', function() {
                column.isDisplayed = false;
                nColumn.isDisplayed = false;
                pColumn.isDisplayed = false;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBeUndefined();
            });

        });

        describe('for additional quantity required', function() {

            var messageService, adjustedConsumptionColumn, stockOutDaysColumn, additionalQuantityRequiredColumn;

            beforeEach(function() {
                inject(function($injector) {
                    messageService = $injector.get('messageService');
                });

                adjustedConsumptionColumn = {
                    label: 'Adjusted Consumption',
                    definition: 'Adjusted Consumption',
                    name: TEMPLATE_COLUMNS.ADJUSTED_CONSUMPTION,
                    isDisplayed: true,
                    source: COLUMN_SOURCES.CALCULATED,
                    columnDefinition: {
                        options: [],
                        sources: [
                            COLUMN_SOURCES.CALCULATED
                        ]
                    }
                };

                template.columnsMap.adjustedConsumption = adjustedConsumptionColumn;

                stockOutDaysColumn = {
                    label: 'Stock Out Days',
                    definition: 'Stock Out Days',
                    name: TEMPLATE_COLUMNS.TOTAL_STOCKOUT_DAYS,
                    isDisplayed: true,
                    source: COLUMN_SOURCES.USER_INPUT,
                    columnDefinition: {
                        options: [],
                        sources: [
                            COLUMN_SOURCES.USER_INPUT
                        ]
                    }
                };

                template.columnsMap.totalStockoutDays = stockOutDaysColumn;

                additionalQuantityRequiredColumn = {
                    label: 'Additional Quantity Required',
                    definition: 'Additional Quantity Required',
                    name: TEMPLATE_COLUMNS.ADDITIONAL_QUANTITY_REQUIRED,
                    isDisplayed: true,
                    source: COLUMN_SOURCES.USER_INPUT,
                    columnDefinition: {
                        options: [],
                        sources: [
                            COLUMN_SOURCES.USER_INPUT
                        ]
                    }
                };

                template.columnsMap.additionalQuantityRequired = additionalQuantityRequiredColumn;

                spyOn(messageService, 'get').andCallThrough();

                messageService.get.andCallFake(function(message) {
                    return message;
                });
            });

            it('should return error if the column is visible and adjusted consumption is hidden', function() {
                additionalQuantityRequiredColumn.isDisplayed = true;
                adjustedConsumptionColumn.isDisplayed = false;

                var result = templateValidator.getColumnError(additionalQuantityRequiredColumn, template);

                expect(result)
                    .toBe('adminProgramTemplate.columnDisplayMismatch' + adjustedConsumptionColumn.label);
            });

            it('should return undefined if the column is hidden and adjusted consumption is hidden', function() {
                additionalQuantityRequiredColumn.isDisplayed = false;
                adjustedConsumptionColumn.isDisplayed = false;

                var result = templateValidator.getColumnError(additionalQuantityRequiredColumn, template);

                expect(result).toBeUndefined();
            });

        });

        describe('for calculated order quantity', function() {

            beforeEach(function() {
                template.columnsMap.requestedQuantity = {
                    label: 'Requested Quantity',
                    isDisplayed: false,
                    source: COLUMN_SOURCES.USER_INPUT,
                    columnDefinition: {
                        sources: [
                            COLUMN_SOURCES.USER_INPUT
                        ]
                    }
                };
                template.columnsMap.requestedQuantityExplanation = {
                    label: 'Requested Quantity Explanation',
                    isDisplayed: false,
                    source: COLUMN_SOURCES.USER_INPUT,
                    columnDefinition: {
                        sources: [
                            COLUMN_SOURCES.USER_INPUT
                        ]
                    }
                };

                column.name = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY;
            });

            it('should return error if both requested quantity and calculated order quantity are hidden', function() {
                column.isDisplayed = false;
                template.columnsMap.requestedQuantityExplanation.isDisplayed = true;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.shouldDisplayRequestedQuantity');
            });

            // SIGLUS-REFACTOR: delete requestedQuantity relevant
            // it('should return error if both requested quantity explanation and calculated order quantity are hidden',
            //     function() {
            //         column.isDisplayed = false;
            //         template.columnsMap.requestedQuantity.isDisplayed = true;
            //
            //         var result = templateValidator.getColumnError(column, template);
            //
            //         expect(result).toBe('adminProgramTemplate.shouldDisplayRequestedQuantity');
            //     });
            // SIGLUS-REFACTOR: ends here

        });

        describe('for calculated order quantity isa', function() {

            it('should return error if populateStockOnHandFromStockCards is false and calculatedOrderQuantityIsa is' +
                ' displayed', function() {
                column.name = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA;
                column.isDisplayed = true;
                template.populateStockOnHandFromStockCards = false;

                var result = templateValidator.getColumnError(column, template);

                expect(result).toBe('adminProgramTemplate.calculatedOrderQuantityIsaCannotBeDisplayed');
            });
        });

        describe('for cannot select stock card', function() {

            it('should return error if populateStockOnHandFromStockCards is false and when has STOCK_CARDS source',
                function() {
                    column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
                    column.source = COLUMN_SOURCES.STOCK_CARDS;
                    column.isDisplayed = true;
                    template.populateStockOnHandFromStockCards = false;

                    var result = templateValidator.getColumnError(column, template);

                    expect(result).toBe('adminProgramTemplate.cannotSelectStockCard');
                });

            it('should return undefined if populateStockOnHandFromStockCards is true and when has STOCK_CARDS source',
                function() {
                    column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
                    column.source = COLUMN_SOURCES.STOCK_CARDS;
                    column.isDisplayed = true;
                    template.populateStockOnHandFromStockCards = true;

                    var result = templateValidator.getColumnError(column, template);

                    expect(result).toBeUndefined();
                });
        });
    });
});
