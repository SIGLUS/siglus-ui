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
            E = TEMPLATE_COLUMNS.STOCK_ON_HAND,
            SQ = TEMPLATE_COLUMNS.SUGGESTED_QUANTITY,
            EQ = TEMPLATE_COLUMNS.ESTIMATED_QUANTITY,
            EX = TEMPLATE_COLUMNS.EXPIRATION_DATE,
            J = TEMPLATE_COLUMNS.REQUESTED_QUANTITY,
            M = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY,
            S = TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA,
            K = TEMPLATE_COLUMNS.APPROVED_QUANTITY;

        $delegate.theoreticalQuantityToRequest = calculateTheoreticalQuantityToRequest;
        $delegate.theoreticalStockAtEndofPeriod = calculateTheoreticalStockAtEndOfPeriod;
        $delegate.difference = calculateDifference;
        $delegate.suggestedQuantity = calculateSuggestedQuantity;
        $delegate.estimatedQuantity = calculateEstimatedQuantity;
        $delegate.expirationDate = calculateExpirationDate;
        $delegate.packsToShip = calculatePacksToShip;
        var helper = {
            isDisplayed: isDisplayed,
            isFilled: isFilled,
            getOrderQuantity: getOrderQuantity,
            getItem: getItem,
            shouldReturnRequestedQuantity: shouldReturnRequestedQuantity,
            getOrderQuantityFromColumnJMS: getOrderQuantityFromColumnJMS
        };
        $delegate.__ = helper;

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
            return _.max([result, 0]);
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
            return _.max([result, 0]);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateDifference
         *
         * @description
         * Calculates the value of the difference.
         *
         * @param  {Object}  lineItem     the line item object
         * @return {Number}               the calculated difference value
         */
        function calculateDifference(lineItem) {
            return getItem(lineItem, E) - (getItem(lineItem, A) + getItem(lineItem, B) - getItem(lineItem, C));
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateSuggestedQuantity
         *
         * @description
         * Calculates the value of the suggested quantity.
         * The suggested quantity is calculated by the back end,
         * but it's source is calculated, so return it directly.
         *
         * @param  {Object}  lineItem     the line item object
         * @return {Number}               the suggested quantity value
         */
        function calculateSuggestedQuantity(lineItem) {
            return getItem(lineItem, SQ);
        }

        function calculateEstimatedQuantity(lineItem) {
            return getItem(lineItem, EQ);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-calculations.calculationFactory
         * @name calculateExpiration
         *
         * @description
         * Calculates the value of the expiration.
         * The expiration is calculated by the back end,
         * but it's source is calculated, so return it directly.
         *
         * @param  {Object}  lineItem     the line item object
         * @return {String}               the expiration
         */
        function calculateExpirationDate(lineItem) {
            return _.get(lineItem, EX, null);
        }

        function getItem(lineItem, name) {
            return _.get(lineItem, name, 0);
        }

        function calculatePacksToShip(lineItem, requisition) {
            var orderQuantity = helper.getOrderQuantity(lineItem, requisition),
                netContent = lineItem.orderable.netContent;

            if (_.any([!orderQuantity, !netContent])) {
                return 0;
            }
            var remainderQuantity = orderQuantity % netContent,
                packsToShip = (orderQuantity - remainderQuantity) / netContent;

            if (_.all([remainderQuantity > 0, remainderQuantity > lineItem.orderable.packRoundingThreshold])) {
                packsToShip += 1;
            }

            if (_.all([packsToShip === 0, !lineItem.orderable.roundToZero])) {
                packsToShip = 1;
            }

            return packsToShip;

        }

        function getOrderQuantityFromColumnJMS(requisition, lineItem, orderQuantity) {
            var jColumn = requisition.template.getColumn(J),
                mColumn = requisition.template.getColumn(M),
                sColumn = requisition.template.getColumn(S);

            if (helper.shouldReturnRequestedQuantity(lineItem, jColumn, requisition)) {
                orderQuantity = lineItem[J];
            } else if (helper.isDisplayed(mColumn)) {
                orderQuantity = $delegate.calculatedOrderQuantity(lineItem, requisition);
            } else if (sColumn) {
                orderQuantity = $delegate.calculatedOrderQuantityIsa(lineItem, requisition);
            }
            return orderQuantity;
        }

        function getOrderQuantity(lineItem, requisition) {
            var orderQuantity = null;
            var kColumn = requisition.template.getColumn(K);

            if (_.all([requisition.$isAfterAuthorize(), helper.isDisplayed(kColumn)])) {
                orderQuantity = lineItem[K];
            } else {
                orderQuantity = helper.getOrderQuantityFromColumnJMS(requisition, lineItem, orderQuantity);
            }

            return orderQuantity;
        }

        function shouldReturnRequestedQuantity(lineItem, jColumn, requisition) {
            return _.any([
                lineItem.isNonFullSupply(),
                _.all([
                    helper.isDisplayed(jColumn),
                    helper.isFilled(lineItem[J])
                ]),
                requisition.emergency
            ]);
        }

        function isFilled(value) {
            //We want to treat 0 as a valid value thus not using return value
            return _.all([value !== null, value !== undefined]);
        }

        function isDisplayed(column) {
            return _.get(column, '$display', false);
        }
    }
})();
