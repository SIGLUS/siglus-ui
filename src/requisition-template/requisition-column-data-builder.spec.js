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

(function() {

    'use strict';

    angular
        .module('requisition-template')
        .factory('RequisitionColumnDataBuilder', RequisitionColumnDataBuilder);

    RequisitionColumnDataBuilder.$inject = ['COLUMN_TYPES', 'COLUMN_SOURCES', 'RequisitionColumn'];

    function RequisitionColumnDataBuilder(COLUMN_TYPES, COLUMN_SOURCES, RequisitionColumn) {

        RequisitionColumnDataBuilder.prototype.build = build;
        RequisitionColumnDataBuilder.prototype.buildProductCodeColumn = buildProductCodeColumn;
        RequisitionColumnDataBuilder.prototype.buildProductNameColumn = buildProductNameColumn;
        RequisitionColumnDataBuilder.prototype.buildStockOnHandColumn = buildStockOnHandColumn;
        RequisitionColumnDataBuilder.prototype.buildSkipColumn = buildSkipColumn;
        RequisitionColumnDataBuilder.prototype.buildRequestedQuantityColumn =
            buildRequestedQuantityColumn;
        RequisitionColumnDataBuilder.prototype.buildRequestedQuantityExplanationColumn =
            buildRequestedQuantityExplanationColumn;
        RequisitionColumnDataBuilder.prototype.buildBeginningBalanceColumn =
            buildBeginningBalanceColumn;
        RequisitionColumnDataBuilder
            .prototype.buildTotalLossesAndAdjustmentsColumn = buildTotalLossesAndAdjustmentsColumn;
        RequisitionColumnDataBuilder.prototype.buildCalculatedOrderQuantityIsaColumn =
            buildCalculatedOrderQuantityIsaColumn;
        RequisitionColumnDataBuilder.prototype.buildCalculatedOrderQuantityColumn = buildCalculatedOrderQuantityColumn;
        RequisitionColumnDataBuilder.prototype.buildTotalConsumedQuantityColumn = buildTotalConsumedQuantityColumn;
        RequisitionColumnDataBuilder.prototype.buildAdditionalQuantityRequiredColumn =
            buildAdditionalQuantityRequiredColumn;
        RequisitionColumnDataBuilder.prototype.buildMaximumStockQuantityColumn = buildMaximumStockQuantityColumn;
        RequisitionColumnDataBuilder.prototype.buildAverageConsumptionColumn = buildAverageConsumptionColumn;
        RequisitionColumnDataBuilder.prototype.buildIdealStockAmountColumn = buildIdealStockAmountColumn;
        RequisitionColumnDataBuilder.prototype.buildTotalCostColumn = buildTotalCostColumn;
        RequisitionColumnDataBuilder.prototype.buildApprovedQuantityColumn = buildApprovedQuantityColumn;
        RequisitionColumnDataBuilder.prototype.buildRemarksColumn = buildRemarksColumn;
        RequisitionColumnDataBuilder.prototype.asStockOnHand = asStockOnHand;
        RequisitionColumnDataBuilder.prototype.asUserInput = asUserInput;

        return RequisitionColumnDataBuilder;

        function RequisitionColumnDataBuilder() {
            RequisitionColumnDataBuilder.instanceNumber =
                (RequisitionColumnDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = RequisitionColumnDataBuilder.instanceNumber;

            this.name = 'columnName' + instanceNumber;
            this.label = 'Column ' + instanceNumber + ' Label';
            this.indicator = 'X';
            this.displayOrder = instanceNumber;
            this.isDisplayed = true;
            this.source = COLUMN_SOURCES.REFERENCE_DATA;
            this.option = null;
            this.definition = 'Column Definition';
            this.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.TEXT
            };
        }

        function build(requisition) {
            return new RequisitionColumn({
                name: this.name,
                label: this.label,
                indicator: this.indicator,
                displayOrder: this.displayOrder,
                isDisplayed: this.isDisplayed,
                source: this.source,
                option: this.option,
                definition: this.definition,
                columnDefinition: this.columnDefinition
            }, requisition);
        }

        function asStockOnHand() {
            this.name = 'stockOnHand';
            this.label = 'Stock on hand';
            this.indicator = 'E';
            this.displayOrder = 9;
            this.isDisplayed = true;
            this.source = 'CALCULATED';
            this.option = null;
            this.definition = 'Current physical count of stock on hand. This is quantified in dispensing units.';
            this.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.NUMERIC
            };

            return this;
        }

        function asUserInput() {
            this.source = 'USER_INPUT';
            return this;
        }

        function buildProductCodeColumn() {
            var builder = this;
            builder.name = 'orderable.productCode';
            builder.label = 'Product code';
            builder.indicator = 'O';
            builder.displayOrder = 2;
            builder.isDisplayed = true;
            builder.source = 'REFERENCE_DATA';
            builder.option = null;
            builder.definition = 'Unique identifier for each commodity/product.';
            builder.columnDefinition = {
                canChangeOrder: false,
                columnType: COLUMN_TYPES.TEXT
            };
            return builder.build();
        }

        function buildProductNameColumn() {
            var builder = this;
            builder.name = 'orderable.fullProductName';
            builder.label = 'Product';
            builder.indicator = 'R';
            builder.displayOrder = 3;
            builder.isDisplayed = true;
            builder.source = 'REFERENCE_DATA';
            builder.option = null;
            builder.definition = 'Primary name of the product.';
            builder.columnDefinition = {
                canChangeOrder: false,
                columnType: COLUMN_TYPES.TEXT
            };
            return builder.build();
        }

        function buildRequestedQuantityColumn() {
            var builder = this;
            builder.name = 'requestedQuantity';
            builder.label = 'Requested quantity';
            builder.indicator = 'J';
            builder.displayOrder = 15;
            builder.isDisplayed = true;
            builder.source = 'USER_INPUT';
            builder.option = null;
            builder.definition = 'Requested override of calculated quantity. This is quantified in dispensing units.';
            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.NUMERIC
            };
            return builder.build();
        }

        function buildRequestedQuantityExplanationColumn() {
            var builder = this;
            builder.name = 'requestedQuantityExplanation';
            builder.label = 'Requested quantity explanation';
            builder.indicator = 'W';
            builder.displayOrder = 16;
            builder.isDisplayed = true;
            builder.source = 'USER_INPUT';
            builder.option = null;
            builder.definition = 'Explanation of request for a quantity other than calculated order quantity.';
            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.TEXT
            };
            return builder.build();
        }

        function buildStockOnHandColumn() {
            return this
                .asStockOnHand()
                .build();
        }

        function buildBeginningBalanceColumn() {
            var builder = this;

            builder.name = 'beginningBalance';
            builder.label = 'Beginning balance';
            builder.indicator = 'A';
            builder.displayOrder = 4;
            builder.isDisplayed = true;
            builder.source = 'USER_INPUT';
            builder.option = null;
            builder.definition = 'Based on the Stock On Hand from the previous period. This is quantified in' +
                ' dispensing units.';
            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.NUMERIC
            };
            return builder.build();
        }

        function buildSkipColumn(hideOptionSelected) {
            var builder = this;

            builder.name = 'skipped';
            builder.label = 'Skip';
            builder.indicator = 'S';
            builder.displayOrder = 1;
            builder.isDisplayed = true;
            builder.source = 'USER_INPUT';
            if (hideOptionSelected !== undefined && hideOptionSelected === true) {
                builder.option = {
                    optionName: 'hideSkippedLineItems'
                };
            } else {
                builder.option = {
                    optionName: 'disableSkippedLineItems'
                };
            }
            builder.definition = 'Select the check box below to skip a single product. Remove all data from the row' +
                ' prior to selection.';
            builder.columnDefinition = {
                canChangeOrder: false,
                columnType: 'BOOLEAN'
            };
            // SIGLUS-REFACTOR: Only external approval can see APPROVED_QUANTITY, REMARKS, SUGGESTED_QUANTITY,
            // SKIPPED and PACKS_TO_SHIP if it's showPackToShipInApprovalPage
            var requisition = {
                $isAuthorized: function() {
                    return true;
                },
                $isInApproval: function() {
                    return false;
                },
                $isApproved: function() {
                    return false;
                },
                $isReleased: function() {
                    return false;
                },
                isExternalApproval: true
            };
            // SIGLUS-REFACTOR: ends here

            return builder.build(requisition);
        }

        function buildTotalLossesAndAdjustmentsColumn() {
            var builder = this;

            builder.name = 'totalLossesAndAdjustments';
            builder.label = 'Total Losses and Adjustments';
            builder.indicator = 'D';
            builder.displayOrder = 7;
            builder.isDisplayed = true;
            builder.source = 'STOCK_CARDS';
            builder.option = null;
            builder.definition = 'All kind of losses/adjustments made at the facility.';
            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: COLUMN_TYPES.NUMERIC
            };
            return builder.build();
        }

        function buildCalculatedOrderQuantityColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Actual quantity needed after deducting stock in hand. This is quantified in ' +
                'dispensing units.';
            builder.displayOrder = 11;
            builder.indicator = 'I';
            builder.isDisplayed = true;
            builder.label = 'Calculated order quantity';
            builder.name = 'calculatedOrderQuantity';
            builder.option = null;
            builder.source = 'CALCULATED';
            builder.tag = null;

            return builder.build();
        }

        function buildTotalConsumedQuantityColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Quantity dispensed/consumed in the reporting period. This is quantified in ' +
                'dispensing units.';
            builder.displayOrder = 6;
            builder.indicator = 'C';
            builder.isDisplayed = true;
            builder.label = 'Total consumed quantity';
            builder.name = 'totalConsumedQuantity';
            builder.option = null;
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build();
        }

        function buildAdditionalQuantityRequiredColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Additional quantity required for new patients';
            builder.displayOrder = 24;
            builder.indicator = 'Z';
            builder.isDisplayed = true;
            builder.label = 'Additional quantity required';
            builder.name = 'additionalQuantityRequired';
            builder.option = null;
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build();
        }

        function buildMaximumStockQuantityColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Maximum stock calculated based on consumption and max stock amounts. Quantified in ' +
                'dispensing units.';
            builder.displayOrder = 23;
            builder.indicator = 'H';
            builder.isDisplayed = false;
            builder.label = 'Maximum stock quantity';
            builder.name = 'maximumStockQuantity';
            builder.option = {
                id: 'ff2b350c-37f2-4801-b21e-27ca12c12b3c',
                optionLabel: 'requisitionConstants.default',
                optionName: 'default'
            };
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build();
        }

        function buildAverageConsumptionColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Average consumption over a specified number of periods/months. Quantified in ' +
                'dispensing units.';
            builder.displayOrder = 10;
            builder.indicator = 'P';
            builder.isDisplayed = true;
            builder.label = 'Average consumption';
            builder.name = 'averageConsumption';
            builder.option = null;
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build();
        }

        function buildIdealStockAmountColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'The Ideal Stock Amount is the target quantity for a specific commodity type, ' +
                'facility, and period.';
            builder.displayOrder = 10;
            builder.indicator = 'G';
            builder.isDisplayed = true;
            builder.label = 'Ideal Stock Amount';
            builder.name = 'idealStockAmount';
            builder.option = null;
            builder.source = 'REFERENCE_DATA';
            builder.tag = null;

            return builder.build();
        }

        function buildCalculatedOrderQuantityIsaColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'NUMERIC';
            builder.definition = 'Calculated Order Quantity ISA is based on an ISA configured by commodity type, and ' +
                'several trade items may fill for one commodity type.';
            builder.displayOrder = 11;
            builder.indicator = 'S';
            builder.isDisplayed = true;
            builder.label = 'Calc Order Qty ISA';
            builder.name = 'calculatedOrderQuantityIsa';
            builder.option = null;
            builder.source = 'CALCULATED';
            builder.tag = null;

            return builder.build();
        }

        function buildTotalCostColumn() {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'CURRENCY'
            };
            builder.canChangeOrder = true;
            builder.columnType = 'CURRENCY';
            builder.definition = 'Total cost of the product based on quantity requested. Will be blank if price is ' +
                'not defined.';
            builder.displayOrder = 21;
            builder.indicator = 'Q';
            builder.isDisplayed = false;
            builder.label = 'Total cost';
            builder.name = 'totalCost';
            builder.option = null;
            builder.source = 'CALCULATED';
            builder.tag = null;

            return builder.build();
        }

        function buildApprovedQuantityColumn(requisition) {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'NUMERIC'
            };
            builder.definition = 'Final approved quantity. This is quantified in dispensing units.';
            builder.displayOrder = 17;
            builder.indicator = 'K';
            builder.isDisplayed = true;
            builder.label = 'Approved quantity';
            builder.name = 'approvedQuantity';
            builder.option = null;
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build(requisition);
        }

        function buildRemarksColumn(requisition) {
            var builder = this;

            builder.columnDefinition = {
                canChangeOrder: true,
                columnType: 'TEXT'
            };
            builder.definition = 'Any additional remarks.';
            builder.displayOrder = 18;
            builder.indicator = 'L';
            builder.isDisplayed = true;
            builder.label = 'Remarks';
            builder.name = 'remarks';
            builder.option = null;
            builder.source = 'USER_INPUT';
            builder.tag = null;

            return builder.build(requisition);
        }
    }

})();
