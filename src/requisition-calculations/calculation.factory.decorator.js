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
     * @ngdoc service
     * @name requisition-calculations.calculationFactory
     *
     * @description
     * Decorates calculationFactory with additional method.
     */

    angular.module('requisition-calculations')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('calculationFactory', decorator);
    }

    decorator.$inject = ['$delegate', 'TEMPLATE_COLUMNS'];

    function decorator($delegate, TEMPLATE_COLUMNS) {
        var A = TEMPLATE_COLUMNS.BEGINNING_BALANCE,
            B = TEMPLATE_COLUMNS.TOTAL_RECEIVED_QUANTITY,
            C = TEMPLATE_COLUMNS.TOTAL_CONSUMED_QUANTITY,
            E = TEMPLATE_COLUMNS.STOCK_ON_HAND;

        $delegate.theoreticalQuantityToRequest = calculateTheoreticalQuantityToRequest;
        $delegate.theoreticalStockAtEndofPeriod = calculateTheoreticalStockAtEndOfPeriod;
        $delegate.difference = calculateDifference;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateTheoreticalQuantityToRequest
         *
         * @description
         * Calculates the value of the Theoretical Quantity to request based on the given line item.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Total Theoretical Quantity to request
         */
        function calculateTheoreticalQuantityToRequest(lineItem) {
            var result = 2 * getItem(lineItem, C) - getItem(lineItem, E);
            return result >= 0 ? result : 0;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateTheoreticalStockAtEndOfPeriod
         *
         * @description
         * Calculates the value of the Theoretical Stock at end of period based on the given line item.
         *
         * @param  {Object} lineItem the line item to calculate the value from
         * @return {Number}          the calculated Theoretical Stock at end of period
         */
        function calculateTheoreticalStockAtEndOfPeriod(lineItem) {
            var result = getItem(lineItem, A) + getItem(lineItem, B) - getItem(lineItem, C);
            return result >= 0 ? result : 0;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name totalLossesAndAdjustments
         *
         * @description
         * Calculates the value of the Total Losses and Adjustments column based on the
         * given line item and adjustment reasons.
         *
         * @param  {Array}  adjustments     the list of adjustments to sum up
         * @param  {Array}  reasons         the list of stock adjustment reasons
         * @return {Number}                 the calculated Total Losses and Adjustments value
         */
        function calculateDifference(lineItem) {
            return getItem(lineItem, E) - (getItem(lineItem, A) + getItem(lineItem, B) - getItem(lineItem, C));
        }

        function getItem(lineItem, name) {
            return lineItem[name] === undefined ? 0 : lineItem[name];
        }
    }
})();
