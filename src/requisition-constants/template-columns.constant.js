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

    /**
     * @ngdoc object
     * @name requisition-constants.TEMPLATE_COLUMNS
     *
     * @description
     * This is constant for all requisition columns.
     */
    angular
        .module('requisition-constants')
        .constant('TEMPLATE_COLUMNS', columns());

    function columns() {
        return {
            APPROVED_QUANTITY: 'approvedQuantity',
            BEGINNING_BALANCE: 'beginningBalance',
            REMARKS: 'remarks',
            REQUESTED_QUANTITY: 'requestedQuantity',
            // SIGLUS-REFACTOR: starts here
            AUTHORIZED_QUANTITY: 'authorizedQuantity',
            // SIGLUS-REFACTOR: ends here
            REQUESTED_QUANTITY_EXPLANATION: 'requestedQuantityExplanation',
            STOCK_ON_HAND: 'stockOnHand',
            SKIPPED: 'skipped',
            TOTAL_RECEIVED_QUANTITY: 'totalReceivedQuantity',
            TOTAL_CONSUMED_QUANTITY: 'totalConsumedQuantity',
            TOTAL_LOSSES_AND_ADJUSTMENTS: 'totalLossesAndAdjustments',
            // SIGLUS-REFACTOR: starts here
            DIFFERENCE: 'difference',
            // SIGLUS-REFACTOR: ends here
            TOTAL: 'total',
            PACKS_TO_SHIP: 'packsToShip',
            PRODUCT_CODE: 'orderable.productCode',
            PRICE_PER_PACK: 'pricePerPack',
            PRODUCT_NAME: 'orderable.fullProductName',
            // SIGLUS-REFACTOR: starts here
            UNIT_UNIT_OF_ISSUE: 'orderable.dispensable.displayUnit',
            // SIGLUS-REFACTOR: ends here
            TOTAL_COST: 'totalCost',
            ADJUSTED_CONSUMPTION: 'adjustedConsumption',
            NUMBER_OF_NEW_PATIENTS_ADDED: 'numberOfNewPatientsAdded',
            TOTAL_STOCKOUT_DAYS: 'totalStockoutDays',
            AVERAGE_CONSUMPTION: 'averageConsumption',
            MAXIMUM_STOCK_QUANTITY: 'maximumStockQuantity',
            CALCULATED_ORDER_QUANTITY: 'calculatedOrderQuantity',
            CALCULATED_ORDER_QUANTITY_ISA: 'calculatedOrderQuantityIsa',
            ADDITIONAL_QUANTITY_REQUIRED: 'additionalQuantityRequired',
            IDEAL_STOCK_AMOUNT: 'idealStockAmount',
            // SIGLUS-REFACTOR: starts here
            THEORETICAL_QUANTITY_TO_REQUEST: 'theoreticalQuantityToRequest',
            THEORETICAL_STOCK_AT_END_OF_PERIOD: 'theoreticalStockAtEndofPeriod',
            // SIGLUS-REFACTOR: ends here
            getStockBasedColumns: getStockBasedColumns
        };

        function getStockBasedColumns() {
            return [
                this.BEGINNING_BALANCE,
                this.STOCK_ON_HAND,
                this.TOTAL_LOSSES_AND_ADJUSTMENTS,
                this.TOTAL_CONSUMED_QUANTITY,
                this.TOTAL_RECEIVED_QUANTITY,
                this.TOTAL_STOCKOUT_DAYS,
                this.AVERAGE_CONSUMPTION
            ];
        }
    }

})();
