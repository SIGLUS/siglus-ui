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
     * @name admin-template.siglusColumnUtils
     *
     * @description
     * Responsible for retrieving dates.
     */
    angular
        .module('admin-template')
        .factory('siglusColumnUtils', siglusColumnUtils);

    siglusColumnUtils.$inject = ['COLUMN_SOURCES', 'SERVICE_TYPES', 'messageService'];

    function siglusColumnUtils(COLUMN_SOURCES, SERVICE_TYPES, messageService) {
        return {
            isUserInput: isUserInput,
            isStockCards: isStockCards,
            isCalculated: isCalculated,
            isTotal: isTotal,
            columnDisplayName: columnDisplayName,
            isAPES: isAPES,
            isPositive: isPositive,
            isConsumo: isConsumo
        };

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isUserInput
         *
         * @description
         * If column source is user input.
         *
         * @param {Object} column
         * @return {Boolean} true if column source is user input
         */
        function isUserInput(column) {
            return column.source === COLUMN_SOURCES.USER_INPUT;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isStockCards
         *
         * @description
         * If column source is stock card.
         *
         * @param {Object} column
         * @return {Boolean} true if column source is stock card
         */
        function isStockCards(column) {
            return column.source === COLUMN_SOURCES.STOCK_CARDS;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isCalculated
         *
         * @description
         * If column source calculated.
         *
         * @param {Object} column
         * @return {Boolean} true if column source is calculated
         */
        function isCalculated(column) {
            return column.source === COLUMN_SOURCES.CALCULATED;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isTotal
         *
         * @description
         * If column name is total.
         *
         * @param {Object} column
         * @return {Boolean} true if column name is total
         */
        function isTotal(column) {
            return column.name === SERVICE_TYPES.TOTAL;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name columnDisplayName
         *
         * @description
         * Get column display name.
         *
         * @param {Object} column
         * @return {String} column display name
         */
        function columnDisplayName(column) {
            return messageService.get(COLUMN_SOURCES.getLabel(column.source));
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isAPES
         *
         * @description
         * If column name is APES.
         *
         * @param {Object} column
         * @return {Boolean} true if column name is APES
         */
        function isAPES(column) {
            return column.name === SERVICE_TYPES.APES;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isPositive
         *
         * @description
         * If column name is positive.
         *
         * @param {Object} column
         * @return {Boolean} true if column name is positive
         */
        function isPositive(column) {
            return column.name === SERVICE_TYPES.POSITIVE;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.siglusColumnUtils
         * @name isConsumo
         *
         * @description
         * If column name is consumo.
         *
         * @param {Object} column
         * @return {Boolean} true if column name is consumo
         */
        function isConsumo(column) {
            return column.name === SERVICE_TYPES.CONSUMO;
        }
    }

})();
