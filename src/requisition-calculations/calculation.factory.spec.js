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

describe('calculationFactory', function() {

    var calculationFactory, TEMPLATE_COLUMNS, COLUMN_SOURCES, lineItem, requisitionMock, RequisitionColumnDataBuilder,
        ReasonDataBuilder, StockAdjustmentDataBuilder, templateMock, stockOnHandColumn, requestedQuantityColumn,
        isaColumn, maximumStockQuantityColumn, averageConsumptionColumn,
        calculatedOrderQuantityColumn, additionalQuantityRequiredColumn, totalConsumedQuantityColumn,
        calculatedOrderQuantityIsaColumn;

    beforeEach(function() {
        module('admin-template');
        module('stock-reason');
        module('requisition-calculations');
        module('referencedata-facility-type-approved-product');

        inject(function($injector) {
            calculationFactory = $injector.get('calculationFactory');
            TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            RequisitionColumnDataBuilder = $injector.get('RequisitionColumnDataBuilder');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
            StockAdjustmentDataBuilder = $injector.get('StockAdjustmentDataBuilder');
            this.RequisitionLineItemV2DataBuilder = $injector.get('RequisitionLineItemV2DataBuilder');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            this.FacilityTypeApprovedProductDataBuilder = $injector.get('FacilityTypeApprovedProductDataBuilder');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
        });

        calculatedOrderQuantityIsaColumn = new RequisitionColumnDataBuilder().buildCalculatedOrderQuantityIsaColumn();
        calculatedOrderQuantityColumn = new RequisitionColumnDataBuilder().buildCalculatedOrderQuantityColumn();
        totalConsumedQuantityColumn = new RequisitionColumnDataBuilder().buildTotalConsumedQuantityColumn();
        additionalQuantityRequiredColumn = new RequisitionColumnDataBuilder().buildAdditionalQuantityRequiredColumn();
        maximumStockQuantityColumn = new RequisitionColumnDataBuilder().buildMaximumStockQuantityColumn();
        averageConsumptionColumn = new RequisitionColumnDataBuilder().buildAverageConsumptionColumn();
        requestedQuantityColumn = new RequisitionColumnDataBuilder().buildRequestedQuantityColumn();
        stockOnHandColumn = new RequisitionColumnDataBuilder()
            .asStockOnHand()
            .asUserInput()
            .build();
        isaColumn = new RequisitionColumnDataBuilder().buildIdealStockAmountColumn();
        this.programOrderable = new this.ProgramOrderableDataBuilder().buildJson();
        lineItem = new this.RequisitionLineItemV2DataBuilder()
            .withTotalLossesAndAdjustments(25)
            .withBeginningBalance(20)
            .withTotalConsumedQuantity(15)
            .withTotalReceivedQuantity(10)
            .withStockOnHand(5)
            .withOrderable(new this.OrderableDataBuilder()
                .withPrograms([this.programOrderable])
                .buildJson())
            .buildJson();

        lineItem.isNonFullSupply = jasmine.createSpy('isNonFullSupply');
        requisitionMock = jasmine.createSpyObj('requisition', ['$isAfterAuthorize']);
        templateMock = jasmine.createSpyObj('template', ['getColumn']);
        requisitionMock.template = templateMock;
        lineItem.$program = new this.ProgramDataBuilder()
            .withId(this.programOrderable.id)
            .build();

        templateMock.getColumn.andCallFake(function(name) {
            if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY) {
                return calculatedOrderQuantityColumn;
            }
            if (name === TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY) {
                return totalConsumedQuantityColumn;
            }
            if (name === TEMPLATE_COLUMNS.MAXIMUM_STOCK_QUANTITY) {
                return maximumStockQuantityColumn;
            }
            if (name === TEMPLATE_COLUMNS.AVERAGE_CONSUMPTION) {
                return averageConsumptionColumn;
            }
            if (name === TEMPLATE_COLUMNS.REQUESTED_QUANTITY) {
                return requestedQuantityColumn;
            }
            if (name === TEMPLATE_COLUMNS.STOCK_ON_HAND) {
                return stockOnHandColumn;
            }
            if (name === TEMPLATE_COLUMNS.IDEAL_STOCK_AMOUNT) {
                return isaColumn;
            }
            if (name === TEMPLATE_COLUMNS.ADDITIONAL_QUANTITY_REQUIRED) {
                return additionalQuantityRequiredColumn;
            }
        });
    });

    describe('Calculate packs to ship', function() {

        it('should return zero if pack size is zero', function() {
            lineItem.orderable.netContent = 0;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(0);
        });

        it('should return zero if approved quantity is zero', function() {
            requisitionMock.$isAfterAuthorize.andReturn(true);

            lineItem.approvedQuantity = 0;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(0);
        });

        it('should return zero if requested quantity is zero', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = 0;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(0);
        });

        it('should not round packs to ship if threshold is not exceeded', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = 15;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 6;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(1);
        });

        it('should round packs to ship if threshold is exceeded', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = 15;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(2);
        });

        it('should return zero if round to zero is set', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = 1;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 5;
            lineItem.orderable.roundToZero = true;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(0);
        });

        it('should return one if round to zero is not set', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = 1;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 5;
            lineItem.orderable.roundToZero = false;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(1);
        });

        it('should calculate total properly', function() {
            expect(calculationFactory.total(lineItem)).toBe(30);
        });

        it('should calculate stock on hand properly', function() {
            expect(calculationFactory.stockOnHand(lineItem)).toBe(40);
        });

        it('should calculate total consumed quantity', function() {
            expect(calculationFactory.totalConsumedQuantity(lineItem)).toBe(50);
        });

        it('should calculate total cost', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.$program.pricePerPack = 30.20;
            lineItem.requestedQuantity = 15;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.totalCost(lineItem, requisitionMock)).toBe(60.4);
        });

        it('should calculate zero total cost if price per pack value missing', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.$program.pricePerPack = undefined;
            lineItem.requestedQuantity = 15;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.totalCost(lineItem, requisitionMock)).toBe(0);
        });

        it('should calculate total cost based on line item pricePerPack if $program value missing', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);
            requisitionMock.requisitionLineItems = [lineItem];

            lineItem.$program = undefined;
            lineItem.pricePerPack = 30.20;
            lineItem.requestedQuantity = 15;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.totalCost(lineItem, requisitionMock)).toBe(60.4);
        });

        it('should use ordered quantity when requested quantity is no present', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            requestedQuantityColumn.$display = false;
            lineItem.stockOnHand = 10;
            lineItem.$program.pricePerPack = 30.20;
            lineItem.requestedQuantity = null;
            lineItem.maximumStockQuantity = 100;

            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(9);
        });

        it('should use ordered quantity when requested quantity is empty', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.requestedQuantity = null;
            lineItem.stockOnHand = 10;
            lineItem.$program.pricePerPack = 30.20;
            lineItem.maximumStockQuantity = 100;

            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(9);
        });

        it('should use requested quantity even if it is empty for non full supply products', function() {
            requisitionMock.$isAfterAuthorize.andReturn(false);
            lineItem.isNonFullSupply.andReturn(true);

            lineItem.requestedQuantity = null;
            lineItem.stockOnHand = 10;
            lineItem.$program.pricePerPack = 30.20;
            lineItem.requestedQuantity = null;
            lineItem.maximumStockQuantity = 100;

            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            expect(calculationFactory.packsToShip(lineItem, requisitionMock)).toBe(0);
        });

        it('should always use requested quantity column if requisition is emergency', function() {
            requisitionMock.emergency = true;

            lineItem.requestedQuantity = undefined;
            lineItem.stockOnHand = 55;
            lineItem.maximumStockQuantity = 100;
            lineItem.orderable.netContent = 10;
            lineItem.orderable.packRoundingThreshold = 4;

            var result = calculationFactory.packsToShip(lineItem, requisitionMock);

            expect(result).not.toBe(5);
            expect(result).toBe(0);
        });

    });

    describe('Calculate total losses and adjustments', function() {
        var adjustments, reasons;

        it('should return zero when calculating totalLossesAndAdjustments and no reason present', function() {
            expect(calculationFactory.totalLossesAndAdjustments([], [])).toBe(0);
        });

        it('should use positive values when calculating totalLossesAndAdjustments and additive parameter is CREDIT',
            function() {
                reasons = [
                    new ReasonDataBuilder().buildCreditReason(),
                    new ReasonDataBuilder().buildCreditReason()
                ];

                adjustments = [
                    new StockAdjustmentDataBuilder()
                        .withReasonId(reasons[0].id)
                        .withQuantity(10)
                        .build(),
                    new StockAdjustmentDataBuilder()
                        .withReasonId(reasons[1].id)
                        .withQuantity(1)
                        .build()
                ];

                expect(calculationFactory.totalLossesAndAdjustments(adjustments, reasons)).toBe(11);
            });

        it('should use negative values when calculating totalLossesAndAdjustments and additive parameter is DEBIT',
            function() {
                reasons = [
                    new ReasonDataBuilder().buildDebitReason(),
                    new ReasonDataBuilder().buildDebitReason()
                ];

                adjustments = [
                    new StockAdjustmentDataBuilder()
                        .withReasonId(reasons[0].id)
                        .withQuantity(10)
                        .build(),
                    new StockAdjustmentDataBuilder()
                        .withReasonId(reasons[1].id)
                        .withQuantity(1)
                        .build()
                ];

                expect(calculationFactory.totalLossesAndAdjustments(adjustments, reasons)).toBe(-11);
            });
    });

    describe('Calculate adjusted consumption', function() {

        beforeEach(function() {
            requisitionMock.processingPeriod = {
                durationInMonths: 1
            };
        });

        it('should return total consumed quantity when non-stockout days is zero', function() {
            lineItem.totalStockoutDays = 30;

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock))
                .toBe(lineItem.totalConsumedQuantity);
        });

        it('should return zero when consumed quantity is not defined', function() {
            lineItem.totalConsumedQuantity = 0;

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock)).toBe(0);
        });

        it('should calculate adjusted consumption', function() {
            lineItem.totalStockoutDays = 15;

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock)).toBe(30);
        });

        it('should add additionalQuantityRequired to adjusted consumption', function() {
            lineItem.totalStockoutDays = 15;
            lineItem.additionalQuantityRequired = 15;

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock)).toBe(45);
        });

        it('should not add additionalQtyRequired to adjusted cons. when not displayed', function() {
            additionalQuantityRequiredColumn.isDisplayed = false;
            lineItem.totalStockoutDays = 15;
            lineItem.additionalQuantityRequired = 15;

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock)).toBe(30);
        });

        it('should not add additionalQtyRequired to adjusted consumption if the column does not exist', function() {
            lineItem.totalStockoutDays = 15;
            lineItem.additionalQuantityRequired = 15;
            templateMock.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY) {
                    return totalConsumedQuantityColumn;
                }
            });

            expect(calculationFactory.adjustedConsumption(lineItem, requisitionMock)).toBe(30);
        });
    });

    describe('Calculate Maximum Stock Quantity', function() {

        it('should return zero if requisition template does not contain maximumStockQuantity column', function() {
            templateMock.getColumn.andReturn(undefined);

            expect(calculationFactory.maximumStockQuantity(lineItem, requisitionMock)).toBe(0);
        });

        it('should return zero if selected option is not equal to default', function() {
            maximumStockQuantityColumn.option.optionName = 'test_option';

            expect(calculationFactory.maximumStockQuantity(lineItem, requisitionMock)).toBe(0);
        });

        it('should return maximum stock quantity when default option was selected', function() {
            lineItem.approvedProduct.maxPeriodsOfStock = 7.25;
            lineItem.averageConsumption = 2;

            maximumStockQuantityColumn.option.optionName = 'default';

            expect(calculationFactory.maximumStockQuantity(lineItem, requisitionMock)).toBe(15);
        });
    });

    describe('calculatedOrderQuantity', function() {

        beforeEach(function() {
            spyOn(calculationFactory, TEMPLATE_COLUMNS.STOCK_ON_HAND);
            spyOn(calculationFactory, TEMPLATE_COLUMNS.MAXIMUM_STOCK_QUANTITY);
        });

        it('should return null if stock on hand column is not present', function() {
            templateMock.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.MAXIMUM_STOCK_QUANTITY) {
                    return maximumStockQuantityColumn;
                }
            });

            expect(calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock)).toBe(null);
        });

        it('should return null if maximum stock quantity column is not present', function() {
            templateMock.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.STOCK_ON_HAND) {
                    return stockOnHandColumn;
                }
            });

            expect(calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock)).toBe(null);
        });

        it('should not call calculation if the stockOnHand is not calculated', function() {
            calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(calculationFactory.stockOnHand).not.toHaveBeenCalled();
        });

        it('should not call calculation if the maximum stock quantity is not calculated', function() {
            calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(calculationFactory.maximumStockQuantity).not.toHaveBeenCalled();
        });

        it('should call calculation if stockOnHand is calculated', function() {
            stockOnHandColumn.source = COLUMN_SOURCES.CALCULATED;

            calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(calculationFactory.stockOnHand).toHaveBeenCalledWith(lineItem, requisitionMock);
        });

        it('should call calculation if maximum stock quantity is calculated', function() {
            maximumStockQuantityColumn.source = COLUMN_SOURCES.CALCULATED;

            calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(calculationFactory.maximumStockQuantity).toHaveBeenCalledWith(lineItem, requisitionMock);
        });

        it('should calculate properly if both fields are user inputs', function() {
            lineItem.stockOnHand = 5;
            lineItem.maximumStockQuantity = 12;

            var result = calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(result).toBe(7);
        });

        it('should calculate properly if both fields are calculate', function() {
            stockOnHandColumn.source = COLUMN_SOURCES.CALCULATED;
            maximumStockQuantityColumn.source = COLUMN_SOURCES.CALCULATED;
            calculationFactory.stockOnHand.andReturn(6);
            calculationFactory.maximumStockQuantity.andReturn(14);

            var result = calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(result).toBe(8);
        });

        it('should calculate properly if on field is calculated', function() {
            maximumStockQuantityColumn.source = COLUMN_SOURCES.CALCULATED;
            lineItem.stockOnHand = 9;
            calculationFactory.maximumStockQuantity.andReturn(145);

            var result = calculationFactory.calculatedOrderQuantity(lineItem, requisitionMock);

            expect(result).toBe(136);
        });

    });

    describe('calculatedOrderQuantityIsa', function() {

        beforeEach(function() {
            spyOn(calculationFactory, TEMPLATE_COLUMNS.STOCK_ON_HAND);
        });

        it('should return null if isa column is not present', function() {
            expect(calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock)).toBe(null);
        });

        it('should not call calculation if the stockOnHand is not calculated', function() {
            calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock);

            expect(calculationFactory.stockOnHand).not.toHaveBeenCalled();
        });

        it('should call calculation if stockOnHand is calculated', function() {
            stockOnHandColumn.source = COLUMN_SOURCES.CALCULATED;

            calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock);

            expect(calculationFactory.stockOnHand).toHaveBeenCalledWith(lineItem, requisitionMock);
        });

        it('should calculate properly if both fields are user inputs', function() {
            lineItem.stockOnHand = 5;
            lineItem.idealStockAmount = 12;

            var result = calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock);

            expect(result).toBe(7);
        });

        it('should calculate properly if both fields are calculated', function() {
            stockOnHandColumn.source = COLUMN_SOURCES.CALCULATED;
            calculationFactory.stockOnHand.andReturn(6);
            lineItem.idealStockAmount = 14;

            var result = calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock);

            expect(result).toBe(8);
        });

        it('should return null if the idea stock amount is null', function() {
            lineItem.stockOnHand = 5;
            lineItem.idealStockAmount = null;

            var result = calculationFactory.calculatedOrderQuantityIsa(lineItem, requisitionMock);

            expect(result).toBe(null);
        });
    });

    describe('getOrderQuantity', function() {

        beforeEach(function() {
            spyOn(calculationFactory, TEMPLATE_COLUMNS.STOCK_ON_HAND);

            templateMock.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.STOCK_ON_HAND) {
                    return stockOnHandColumn;
                }
                if (name === TEMPLATE_COLUMNS.IDEAL_STOCK_AMOUNT) {
                    return isaColumn;
                }
                if (name === TEMPLATE_COLUMNS.REQUESTED_QUANTITY) {
                    return requestedQuantityColumn;
                }
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY) {
                    return null;
                }
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA) {
                    return calculatedOrderQuantityIsaColumn;
                }
            });

            requisitionMock.$isAfterAuthorize.andReturn(false);

            lineItem.stockOnHand = 5;
            lineItem.idealStockAmount = 12;
        });

        it('should use requested quantity if not null', function() {
            lineItem.requestedQuantity = 20;

            var result = calculationFactory.getOrderQuantity(lineItem, requisitionMock);

            expect(result).toBe(20);
        });

        it('should use calculatedOrderQuantityIsa if requested quantity is null', function() {
            lineItem.requestedQuantity = null;

            var result = calculationFactory.getOrderQuantity(lineItem, requisitionMock);

            expect(result).toBe(7);
        });

    });

    // #517: admin can set details of suggested quantity
    describe('calculateSuggestedQuantity', function() {
        it('should return suggested quantity 100', function() {
            lineItem.suggestedQuantity = 100;

            var result = calculationFactory.suggestedQuantity(lineItem);

            expect(result).toBe(100);
        });

        it('should return suggested quantity 0 if it is undefined', function() {
            lineItem.suggestedQuantity = undefined;

            var result = calculationFactory.suggestedQuantity(lineItem, requisitionMock);

            expect(result).toBe(0);
        });

    });
    // #517: ends here
});