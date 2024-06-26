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
     * @name requisition-template.RequisitionTemplate
     *
     * @description
     * Represents a template of a single requisition. Provides methods for retrieving columns.
     */
    angular
        .module('requisition-template')
        .factory('RequisitionTemplate', template);
    template.$inject = ['RequisitionColumn'];

    function template(RequisitionColumn) {

        RequisitionTemplate.prototype.getColumns = getColumns;
        RequisitionTemplate.prototype.getColumn = getColumn;
        RequisitionTemplate.prototype.hasSkipColumn = hasSkipColumn;
        RequisitionTemplate.prototype.hideSkippedLineItems = hideSkippedLineItems;
        RequisitionTemplate.prototype.getColumnsByNames = getColumnsByNames;

        return RequisitionTemplate;

        /**
         * @ngdoc method
         * @methodOf requisition-template.RequisitionTemplate
         * @name RequisitionTemplate
         *
         * @description
         * Adds all needed methods and information to requisition template.
         *
         * @param  {String}              template    the requisition template object
         * @param  {String}              requisition the requisition object
         * @return {RequisitionTemplate}             the requisition template with methods
         */
        function RequisitionTemplate(template, requisition) {
            angular.copy(template, this);

            this.emergency = requisition.emergency;

            var columnsMap = {};
            angular.forEach(template.columnsMap, function(column) {
                columnsMap[column.name] = new RequisitionColumn(column, requisition);
            });
            this.columnsMap = columnsMap;
            // #251: Facility user can create requisition with KIT section
            this.extension = template.extension || {};
            // #251: ends here
        }

        /**
         * @ngdoc method
         * @methodOf requisition-template.RequisitionTemplate
         * @name getColumns
         *
         * @description
         * Retrieves all non-full/full supply columns from requisition template.
         *
         * @param  {Boolean} nonFullSupply indicates if user wants to get full/non-full supply columns
         * @return {Array}                 the matching columns
         */
        function getColumns(nonFullSupply) {
            var columns = [],
                columnsMap = this.columnsMap;
            // SIGLUS-REFACTOR: starts here, enable columns for emergency
            if (nonFullSupply) {
            // SIGLUS-REFACTOR: ends here
                var columnName;
                for (columnName in columnsMap) {
                    if (columnsMap.hasOwnProperty(columnName) &&
                        columnsMap[columnName].$display && !columnsMap[columnName].$fullSupplyOnly) {
                        columns.push(columnsMap[columnName]);
                    }
                }
            } else {
                for (columnName in columnsMap) {
                    if (columnsMap.hasOwnProperty(columnName) &&
                        columnsMap[columnName].$display) {
                        columns.push(columnsMap[columnName]);
                    }
                }
            }
            return columns;
        }

        function getColumnsByNames(names) {
            var columns = [],
                columnsMap = this.columnsMap;
            var columnName;
            for (columnName in columnsMap) {
                if (columnsMap.hasOwnProperty(columnName) && _.include(names, columnName)) {
                    columns.push(columnsMap[columnName]);
                }
            }
            return columns;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-template.RequisitionTemplate
         * @name getColumn
         *
         * @description
         * Retrieves a column with the given name. If it doesn't exist undefined will be returned.
         *
         * @param  {String} name the name of the column
         * @return {Object}      the matching column
         */
        function getColumn(name) {
            return this.columnsMap[name];
        }

        /**
         * @ngdoc method
         * @methodOf requisition-template.RequisitionTemplate
         * @name hasSkipColumn
         *
         * @description
         * Return true if template has Skip column or false if it does not.
         *
         * @return {boolean} true if template has Skip column, false otherwise
         */
        function hasSkipColumn() {
            var hasSkipColumn = false;

            for (var column in this.columnsMap) {
                if (this.columnsMap.hasOwnProperty(column)) {
                    hasSkipColumn = hasSkipColumn || this.columnsMap[column].isSkipColumn();
                }
            }

            return hasSkipColumn;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-template.RequisitionTemplate
         * @name hideSkippedLineItems
         *
         * @description
         * Return true if template has Skip column with hide skipped line item
         * selected or false if it does not.
         *
         * @return {boolean} true if template has Skip column, and the column option selected
         * is 'hideSkippedLineItems'
         */
        function hideSkippedLineItems() {
            if (!this.hasSkipColumn()) {
                return false;
            }
            return this.getColumn('skipped').option.optionName === 'hideSkippedLineItems';
        }
    }

})();
