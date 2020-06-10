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
     * @name admin-template.columnUtils
     *
     * @description
     * Responsible for retrieving dates.
     */
    angular
        .module('admin-template')
        .factory('columnUtils', columnUtils);

    columnUtils.$inject = ['COLUMN_SOURCES'];

    function columnUtils(COLUMN_SOURCES) {
        return {
            isUserInput: isUserInput,
            isStockCards: isStockCards,
            formatSource: formatSource
        };

        /**
         * @ngdoc method
         * @methodOf admin-template.columnUtils
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
         * @methodOf admin-template.columnUtils
         * @name isUserInput
         *
         * @description
         * If column source is user input.
         *
         * @param {Object} column
         * @return {Boolean} true if column source is user input
         */
        function isStockCards(column) {
            return column.source === COLUMN_SOURCES.STOCK_CARDS;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.columnUtils
         * @name formatSource
         *
         * @description
         * Format column source.
         *
         * @param {Object} column
         * @return {String} Formatted source
         */
        function formatSource(column) {
            return column.source
                .split('_')
                .join(' ')
                .toLocaleLowerCase();
        }
    }

})();
