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

describe('requisitionValidator', function() {

    // SIGLUS-REFACTOR: add requisitionUtils, kitUsageLineItems
    var validator, TEMPLATE_COLUMNS, COLUMN_SOURCES, MAX_INTEGER_VALUE, COLUMN_TYPES, validationFactory, lineItem,
        lineItems, column, columns, requisition, requisitionUtils, kitUsageLineItems, testConsumptionLineItems;
    // SIGLUS-REFACTOR: ends here

    beforeEach(function() {
        module('requisition-validation', function($provide) {
            var methods = [
                'stockOnHand',
                'totalConsumedQuantity',
                'requestedQuantityExplanation'
            ];
            validationFactory = jasmine.createSpyObj('validationFactory', methods);
            // SIGLUS-REFACTOR: add requisitionUtils
            requisitionUtils = jasmine.createSpyObj('requisitionUtils', [
                'isEmpty', 'calculateTotal', 'clearTestConsumptionError'
            ]);
            // SIGLUS-REFACTOR: ends here

            $provide.service('validationFactory', function() {
                return validationFactory;
            });
            // SIGLUS-REFACTOR: add requisitionUtils
            $provide.factory('requisitionUtils', function() {
                return requisitionUtils;
            });
            // SIGLUS-REFACTOR: ends here
        });

        inject(function(_requisitionValidator_, _TEMPLATE_COLUMNS_, _COLUMN_SOURCES_,
            _calculationFactory_, _MAX_INTEGER_VALUE_, _COLUMN_TYPES_) {
            validator = _requisitionValidator_;
            TEMPLATE_COLUMNS = _TEMPLATE_COLUMNS_;
            COLUMN_SOURCES = _COLUMN_SOURCES_;
            MAX_INTEGER_VALUE = _MAX_INTEGER_VALUE_;
            COLUMN_TYPES = _COLUMN_TYPES_;
        });

        lineItem = lineItemSpy('One');

        var template = jasmine.createSpyObj('template', ['getColumns', 'extension']);
        template.getColumns.andCallFake(function(nonFullSupply) {
            return nonFullSupply ? nonFullSupplyColumns() : fullSupplyColumns();
        });

        lineItems = [{
            $program: {
                fullSupply: true
            }
        }, {
            $program: {
                fullSupply: false
            }
        }, {
            $program: {
                fullSupply: true
            }
        }, {
            $program: {
                fullSupply: false
            }
        }];

        // #251: Facility user can create requisition with KIT section
        kitUsageLineItems = [ {
            collection: 'kitReceived',
            services: {
                CHW: {
                    id: '1',
                    value: 10
                },
                HF: {
                    id: '2',
                    value: 0
                }
            }
        } ];
        // #251: ends here

        // #375: Facility user can create requisition with test consumption section
        testConsumptionLineItems = [{
            service: 'HF',
            name: 'HF',
            projects: {
                hivDetermine: {
                    project: 'hivDetermine',
                    name: 'hivDetermine',
                    outcomes: {
                        consumo: {
                            outcome: 'consumo',
                            name: 'consumo',
                            value: 10
                        },
                        positive: {
                            outcome: 'positive',
                            name: 'positive',
                            value: 10
                        },
                        unjustified: {
                            outcome: 'unjustified',
                            name: 'unjustified',
                            value: 10
                        }
                    }
                }
            }
        }, {
            service: 'total',
            name: 'total',
            projects: {
                hivDetermine: {
                    project: 'hivDetermine',
                    name: 'hivDetermine',
                    outcomes: {
                        consumo: {
                            outcome: 'consumo',
                            name: 'consumo',
                            value: 10
                        },
                        positive: {
                            outcome: 'positive',
                            name: 'positive',
                            value: 10
                        },
                        unjustified: {
                            outcome: 'unjustified',
                            name: 'unjustified',
                            value: 10
                        }
                    }
                }
            }
        }, {
            service: 'APES',
            name: 'APES',
            projects: {
                hivDetermine: {
                    project: 'hivDetermine',
                    name: 'hivDetermine',
                    outcomes: {
                        consumo: {
                            outcome: 'consumo',
                            name: 'consumo',
                            value: 10
                        },
                        positive: {
                            outcome: 'positive',
                            name: 'positive',
                            value: 10
                        },
                        unjustified: {
                            outcome: 'unjustified',
                            name: 'unjustified',
                            value: 10
                        }
                    }
                }
            }
        }];
        // #375: ends here

        requisition = {
            template: template,
            requisitionLineItems: lineItems,
            // #251: Facility user can create requisition with KIT section
            kitUsageLineItems: kitUsageLineItems,
            // #251: ends here
            // #375: Facility user can create requisition with test consumption section
            testConsumptionLineItems: testConsumptionLineItems,
            // #375: ends here
            // SIGLUS-REFACTOR: starts here
            extraData: {
                consultationNumber: 1,
                openedKitByCHW: 7,
                openedKitByHF: 4,
                receivedKitByCHW: 4,
                receivedKitByHF: 2
            }
            // SIGLUS-REFACTOR: ends here
        };
    });

    // #251: Facility user can create requisition with KIT section
    describe('areAllLineItemsSkipped', function() {

        it('should return false if product is not enabled', function() {
            requisition.template.extension.enableProduct = false;

            expect(validator.areAllLineItemsSkipped(requisition)).toBe(false);
        });

        it('should return false if product is enabled and lineItems are not skipped', function() {
            requisition.template.extension.enableProduct = true;

            expect(validator.areAllLineItemsSkipped(requisition)).toBe(false);
        });
    });
    // #251: ends here

    describe('validateRequisition', function() {

        it('should return true if requisition is valid', function() {
            spyOn(validator, 'validateLineItem').andReturn(true);

            var result = validator.validateRequisition(requisition);

            expect(result).toBe(true);

            [lineItems[0], lineItems[2]].forEach(function(lineItem) {
                expect(validator.validateLineItem).toHaveBeenCalledWith(
                    lineItem,
                    requisition.template.getColumns(),
                    requisition
                );
            });

            [lineItems[1], lineItems[3]].forEach(function(lineItem) {
                expect(validator.validateLineItem).toHaveBeenCalledWith(
                    lineItem,
                    requisition.template.getColumns(true),
                    requisition
                );
            });
        });

        it('should return false if any of the line items is invalid', function() {
            spyOn(validator, 'validateLineItem').andCallFake(function(lineItem) {
                return lineItem !== lineItems[0];
            });

            var result = validator.validateRequisition(requisition);

            expect(result).toBe(false);

            [lineItems[0], lineItems[2]].forEach(function(lineItem) {
                expect(validator.validateLineItem).toHaveBeenCalledWith(
                    lineItem,
                    requisition.template.getColumns(),
                    requisition
                );
            });

            [lineItems[1], lineItems[3]].forEach(function(lineItem) {
                expect(validator.validateLineItem).toHaveBeenCalledWith(
                    lineItem,
                    requisition.template.getColumns(true),
                    requisition
                );
            });
        });

        it('should return true if requisition comment is longer than 255 chars', function() {
            spyOn(validator, 'validateLineItem').andReturn(true);

            for (var i = 0; i < 26; i++) {
                requisition.draftStatusMessage += '1234567890';
            }

            expect(validator.validateRequisition(requisition)).toBe(true);
        });

        // #251: Facility user can create requisition with KIT section
        it('should return true if kitUsageLineItems are valid', function() {
            requisition.template.extension.enableKitUsage = true;

            expect(validator.validateRequisition(requisition)).toBe(true);
        });

        it('should return false if CHW value is empty', function() {
            requisition.template.extension.enableKitUsage = true;
            requisition.kitUsageLineItems[0].services.CHW.value = '';

            expect(validator.validateRequisition(requisition)).toBe(false);
        });

        it('should return false if kitReceived is invalid', function() {
            requisition.template.extension.enableKitUsage = true;
            requisition.kitUsageLineItems.push({
                collection: 'kitOpened',
                services: {
                    CHW: {
                        id: '1',
                        value: ''
                    },
                    HF: {
                        id: '2',
                        value: 0
                    }
                }
            });

            expect(validator.validateRequisition(requisition)).toBe(false);
        });
        // #251: ends here

        // #375: Facility user can create requisition with test consumption section
        it('should return true if testConsumptionLineItems are valid', function() {
            requisition.template.extension.enableRapidTestConsumption = true;

            expect(validator.validateRequisition(requisition)).toBe(true);
        });

        it('should return true if test project is empty', function() {
            requisition.template.extension.enableKitUsage = true;

            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.consumo.value = null;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.positive.value = null;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.unjustified.value = null;

            expect(validator.validateRequisition(requisition)).toBe(true);
        });
        // #375: ends here
    });

    describe('validateSiglusLineItemField', function() {
        it('should return true if field is valid', function() {
            var result = validator.validateSiglusLineItemField(kitUsageLineItems[0].services.CHW);

            expect(result).toBe(true);
        });

        it('should return false if field is no set', function() {
            kitUsageLineItems[0].services.CHW.value = undefined;

            var result = validator.validateSiglusLineItemField(kitUsageLineItems[0].services.CHW);

            expect(result).toBe(false);
        });

        it('should return false if field has value greater than max int value', function() {
            kitUsageLineItems[0].services.CHW.value = MAX_INTEGER_VALUE + 1;

            var result = validator.validateSiglusLineItemField(kitUsageLineItems[0].services.CHW);

            expect(kitUsageLineItems[0].services.CHW.$error).toBe('requisitionValidation.numberTooLarge');
            expect(result).toBe(false);
        });
    });

    describe('validateLineItem', function() {

        beforeEach(function() {
            columns = [
                mockColumn(TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY),
                mockColumn(TEMPLATE_COLUMNS.BEGINNING_BALANCE),
                mockColumn(TEMPLATE_COLUMNS.STOCK_ON_HAND)
            ];
        });

        it('should return true if all fields are valid', function() {
            spyOn(validator, 'validateLineItemField').andReturn(true);

            var result = validator.validateLineItem(lineItem, columns, requisition);

            expect(result).toBe(true);
            columns.forEach(function(column) {
                expect(validator.validateLineItemField)
                    .toHaveBeenCalledWith(lineItem, column, requisition);
            });
        });

        it('should return false if any field is invalid', function() {
            spyOn(validator, 'validateLineItemField').andCallFake(function(lineItem, column) {
                return column !== columns[1];
            });

            var result = validator.validateLineItem(lineItem, columns, requisition);

            expect(result).toBe(false);
            columns.forEach(function(column) {
                expect(validator.validateLineItemField)
                    .toHaveBeenCalledWith(lineItem, column, requisition);
            });
        });

    });

    describe('validateLineItemField', function() {

        beforeEach(function() {
            column = {};
            column.$display = true;
            columns = [column];
            requisition.template.columnsMap = columns;

        });

        it('should return true if field is valid', function() {
            column.name = TEMPLATE_COLUMNS.BEGINNING_BALANCE;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(true);
        });

        it('should return true if column is Total Losses and Adjustments', function() {
            column.name = TEMPLATE_COLUMNS.TOTAL_LOSSES_AND_ADJUSTMENTS;

            var result = validator.validateLineItemField(lineItem, column);

            expect(result).toBe(true);
        });

        it('should return false if field is required but no set', function() {
            lineItem['requiredButNotSet'] = undefined;
            column.$required = true;
            column.name = 'requiredButNotSet';

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(false);
        });

        it('should not validate hidden fields', function() {
            lineItem['requiredButNotSet'] = undefined;
            column.$required = true;
            column.name = 'requiredButNotSet';
            column.$display = false;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(true);
        });

        it('should not validate stock based columns', function() {
            var columnsSpy = jasmine.createSpyObj('columns', ['includes']);
            spyOn(TEMPLATE_COLUMNS, 'getStockBasedColumns').andReturn(columnsSpy);

            columnsSpy.includes.andReturn(true);
            requisition.template.populateStockOnHandFromStockCards = true;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(true);
        });

        it('should return false if any validation fails', function() {
            lineItem[TEMPLATE_COLUMNS.STOCK_ON_HAND] = -10;
            column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
            column.$required = true;
            column.source = COLUMN_SOURCES.CALCULATED;
            validationFactory.stockOnHand.andReturn('negative');

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(false);
            expect(lineItem.$errors[TEMPLATE_COLUMNS.STOCK_ON_HAND]).toBe('negative');
        });

        it('should return false if calculation validation fails', function() {
            var name = TEMPLATE_COLUMNS.STOCK_ON_HAND;

            column.source = COLUMN_SOURCES.USER_INPUT;
            column.name = name;

            columns = {
                stockOnHand: column,
                totalConsumedQuantity: {
                    name: TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY,
                    source: COLUMN_SOURCES.USER_INPUT
                }
            };
            requisition.template.columnsMap = columns;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(false);
        });

        it('should skip calculation validation if counterpart is calculated', function() {
            column.source = COLUMN_SOURCES.CALCULATED;
            column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
            columns.push({
                name: TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY,
                source: COLUMN_SOURCES.CALCULATED
            });

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(true);
        });

        it('should return false if field has value greater than max int value', function() {
            lineItem[TEMPLATE_COLUMNS.STOCK_ON_HAND] = MAX_INTEGER_VALUE + 1;
            column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
            column.$type = COLUMN_TYPES.NUMERIC;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(lineItem.$errors[column.name]).toBe('requisitionValidation.numberTooLarge');
            expect(result).toBe(false);
        });

        it('should return true if field has value equal or lower than max int value', function() {
            lineItem[TEMPLATE_COLUMNS.STOCK_ON_HAND] = MAX_INTEGER_VALUE;
            column.name = TEMPLATE_COLUMNS.STOCK_ON_HAND;
            column.$type = COLUMN_TYPES.NUMERIC;

            var result = validator.validateLineItemField(lineItem, column, requisition);

            expect(result).toBe(true);
        });

    });

    describe('isLineItemValid', function() {

        beforeEach(function() {
            lineItem = lineItemSpy('One');
        });

        it('should return true if no field has error', function() {
            lineItem.$errors[TEMPLATE_COLUMNS.STOCK_ON_HAND] = undefined;

            var result = validator.isLineItemValid(lineItem);

            expect(result).toBe(true);
        });

        it('should return false if any field has error', function() {
            lineItem.$errors[TEMPLATE_COLUMNS.STOCK_ON_HAND] = 'invalid';
            lineItem.$errors[TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY] = undefined;

            var result = validator.isLineItemValid(lineItem);

            expect(result).toBe(false);
        });

    });

    describe('areLineItemsValid', function() {

        var lineItems;

        beforeEach(function() {
            lineItems = [
                lineItemSpy('one'),
                lineItemSpy('two')
            ];

            spyOn(validator, 'isLineItemValid').andReturn(true);
        });

        it('should return true if all line items are valid', function() {
            expect(validator.areLineItemsValid(lineItems)).toBe(true);
        });

        it('should return false if any of the line items is invalid', function() {
            validator.isLineItemValid.andCallFake(function(lineItem) {
                return lineItem !== lineItems[1];
            });

            expect(validator.areLineItemsValid(lineItems)).toBe(false);
        });

    });

    function nonFullSupplyColumns() {
        return [
            mockColumn('Three'),
            mockColumn('Four')
        ];
    }

    function fullSupplyColumns() {
        return [
            mockColumn('One'),
            mockColumn('Two')
        ];
    }

    function mockColumn(name) {
        return {
            name: name
        };
    }

    function lineItemSpy(suffix) {
        var lineItemSpy = jasmine.createSpyObj('lineItem' + suffix, ['areColumnsValid']);
        lineItemSpy.areColumnsValid.andReturn(true);
        lineItemSpy.$errors = {};
        return lineItemSpy;
    }

});
