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

    var validator, TEMPLATE_COLUMNS, COLUMN_SOURCES, MAX_INTEGER_VALUE, COLUMN_TYPES, validationFactory, lineItem,
        lineItems, column, columns, requisition,
        // SIGLUS-REFACTOR: add new variable
        requisitionUtils, kitUsageLineItems, testConsumptionLineItems, testProject, patientLineItems,
        consultationNumberLineItems;
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

        // #251, #375: requisition template
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

        testProject = {
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
        };
        testConsumptionLineItems = [{
            service: 'HF',
            name: 'HF',
            projects: testProject
        }, {
            service: 'total',
            name: 'total',
            projects: testProject
        }, {
            service: 'APES',
            name: 'APES',
            projects: testProject
        }];

        patientLineItems = [{
            columns: {
                new: {
                    value: 1
                }
            }
        }];
        consultationNumberLineItems = [
            {
                columns: {
                    consultationNumber: {
                        value: 1,
                        isDisplayed: true
                    }
                }
            }
        ];
        // #251, #375: ends here

        requisition = {
            template: template,
            requisitionLineItems: lineItems,
            // #251, #375, #399: requisition template
            kitUsageLineItems: kitUsageLineItems,
            testConsumptionLineItems: testConsumptionLineItems,
            patientLineItems: patientLineItems,
            consultationNumberLineItems: consultationNumberLineItems,
            // #251, #375, #399: ends here
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

    // #431: alert before signature pop up
    describe('siglusValidRequisition', function() {
        beforeEach(function() {
            requisition.$isAuthorized = jasmine.createSpy().andReturn(false);
            requisition.$isInApproval = jasmine.createSpy().andReturn(false);
        });

        // #251: Facility user can create requisition with KIT section
        it('should return false if product is enabled and lineItems are skipped', function() {
            requisition.template.extension.enableProduct = true;
            requisition.requisitionLineItems = [{
                skipped: true
            }];

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.allLineItemsSkipped');
        });

        it('should return false if product is enabled and lineItems are empty', function() {
            requisition.template.extension.enableProduct = true;
            requisition.requisitionLineItems = [];

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.allLineItemsSkipped');
        });

        it('should return true if kitUsageLineItems are valid', function() {
            requisition.template.extension.enableKitUsage = true;

            expect(validator.siglusValidRequisition(requisition)).toBe(true);
        });

        it('should return false if CHW value is empty', function() {
            requisition.template.extension.enableKitUsage = true;
            requisition.kitUsageLineItems[0].services.CHW.value = '';

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
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

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });
        // #251: ends here

        // #375: Facility user can create requisition with test consumption section
        it('should return true if testConsumptionLineItems are valid', function() {
            requisition.template.extension.enableRapidTestConsumption = true;

            expect(validator.siglusValidRequisition(requisition)).toBe(true);
        });

        it('should return false if test project is empty', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            testProject.hivDetermine.outcomes.consumo.value = null;
            testProject.hivDetermine.outcomes.positive.value = null;
            testProject.hivDetermine.outcomes.unjustified.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionValidation.emptyTestConsumption');
        });

        it('should return false if test outcomes of a test project are not completed', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.consumo.value = null;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.positive.value = 1;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });

        it('should return false if consumo is less than positive', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.consumo.value = 1;
            requisition.testConsumptionLineItems[0].projects.hivDetermine.outcomes.positive.value = 2;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });

        it('should return false if total is filled and apes not filled', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[2].projects = angular.copy(testProject);
            requisition.testConsumptionLineItems[2].projects.hivDetermine.outcomes.consumo.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });

        it('should return false if just apes filled', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[2].projects = angular.copy(testProject);
            testProject.hivDetermine.outcomes.consumo.value = null;
            testProject.hivDetermine.outcomes.positive.value = null;
            testProject.hivDetermine.outcomes.unjustified.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionValidation.apeOnly');
        });
        // #375: ends here

        // #445: total service need to record the test result data for services
        it('should return false if total is user input and not filled when has test result data', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[1].source = 'USER_INPUT';
            requisition.testConsumptionLineItems[0].projects = angular.copy(testProject);
            testProject.hivDetermine.outcomes.consumo.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });

        it('should return false if total is user input and filled without test result data', function() {
            requisition.template.extension.enableRapidTestConsumption = true;
            requisition.testConsumptionLineItems[1].source = 'USER_INPUT';
            requisition.testConsumptionLineItems[1].projects = angular.copy(testProject);
            requisition.testConsumptionLineItems[2].projects = angular.copy(testProject);
            testProject.hivDetermine.outcomes.consumo.value = null;
            testProject.hivDetermine.outcomes.positive.value = null;
            testProject.hivDetermine.outcomes.unjustified.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionValidation.totalWithoutServices');
        });
        // #445: ends here

        // #399: Facility user can create requisition with patient section
        it('should return true if patientLineItems are valid', function() {
            requisition.template.extension.enablePatient = true;

            expect(validator.siglusValidRequisition(requisition)).toBe(true);
        });

        it('should return false if new value is empty', function() {
            requisition.template.extension.enablePatient = true;
            requisition.patientLineItems[0].columns.new.value = '';

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });
        // #399: ends here

        // #442: create requisition with consultation number section
        it('should return true if consultationNumberLineItems are valid', function() {
            requisition.template.extension.enableConsultationNumber = true;

            expect(validator.siglusValidRequisition(requisition)).toBe(true);
        });

        it('should return false if consultation number section is empty', function() {
            requisition.template.extension.enableConsultationNumber = true;
            consultationNumberLineItems[0].columns.consultationNumber.value = null;

            expect(validator.siglusValidRequisition(requisition)).toBe(false);
            expect(requisition.$error).toBe('requisitionView.rnrHasErrors');
        });
        // #442: ends here
    });

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

            // #431: string is like hex encoded texts
            for (var i = 0; i < 26; i++) {
                requisition.draftStatusMessage += 'abcdefghijk';
            }
            // #431: ends here

            expect(validator.validateRequisition(requisition)).toBe(true);
        });
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
