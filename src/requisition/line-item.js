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
     * @name requisition.LineItem
     *
     * @description
     * Responsible for adding required methods for line items.
     */
    angular
        .module('requisition')
        .factory('LineItem', lineItem);

    lineItem.$inject = ['calculationFactory', 'COLUMN_SOURCES', 'COLUMN_TYPES'];

    function lineItem(calculationFactory, COLUMN_SOURCES, COLUMN_TYPES) {

        LineItem.prototype.getFieldValue = getFieldValue;
        LineItem.prototype.updateFieldValue = updateFieldValue;
        LineItem.prototype.updateDependentFields = updateDependentFields;
        LineItem.prototype.canBeSkipped = canBeSkipped;
        LineItem.prototype.isNonFullSupply = isNonFullSupply;

        return LineItem;

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name LineItem
         *
         * @description
         * Adds needed properties and methods to line items based on it and requisition parent.
         *
         * @param {Object} lineItem Requisition line item to be updated
         * @param {Object} requisition Requisition that has given line item
         */
        function LineItem(lineItem, requisition) {
            angular.copy(lineItem, this);

            this.orderable = lineItem.orderable;
            this.stockAdjustments = lineItem.stockAdjustments;

            this.$errors = {};
            // SIGLUS-REFACTOR: starts here
            this.$program = this.orderable.$program ? this.orderable.$program : lineItem.orderable.programs[0];
            // SIGLUS-REFACTOR: ends here

            var newLineItem = this;
            // #227: user can add both full supply & non-fully supply product
            requisition.template.getColumns().forEach(function(column) {
                newLineItem.updateFieldValue(column, requisition);
            });
            // #227: ends here
        }

        function getFieldValue(name) {
            var value = this;

            if (name === 'pricePerPack') {
                name = '$program.pricePerPack';
            }

            angular.forEach(name.split('.'), function(property) {
                value = value[property];
            });
            return value;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name updateFieldValue
         *
         * @description
         * Updates column value in the line item based on column type and source.
         *
         * @param {Object} column Requisition template column
         * @param {Object} requisition Requisition to which line item belongs
         */
        function updateFieldValue(column, requisition) {
            var fullName = column.name,
                object = getObject(this, fullName),
                propertyName = getPropertyName(column.name);

            if (object) {
                if (column.source === COLUMN_SOURCES.CALCULATED) {
                    object[propertyName] = calculationFactory[fullName] ?
                        calculationFactory[fullName](this, requisition) :
                        null;
                // SIGLUS-REFACTOR: remove useless code to fix SonarQube
                // } else if (column.$type === COLUMN_TYPES.NUMERIC || column.$type === COLUMN_TYPES.CURRENCY) {
                    // checkIfNullOrZero(object[propertyName]);
                } else if (column.$type !== COLUMN_TYPES.NUMERIC && column.$type !== COLUMN_TYPES.CURRENCY) {
                    object[propertyName] = object[propertyName] ? object[propertyName] : '';
                }
                // SIGLUS-REFACTOR: ends here
            }
        }

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name updateDependentFields
         *
         * @description
         * This field kicks off updating each of a columns dependancies. The
         * actual work done by the updateDependentFieldsHelper function, this
         * function just starts the process.
         *
         * @param {Object} column Requisition template column
         * @param {Object} requisition Requisition to which line item belongs
         */
        function updateDependentFields(column, requisition) {
            updateDependentFieldsHelper(this, column, requisition, []);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name updateDependentFieldsHelper
         *
         * @description
         * Recursively goes through a column's dependencies, updating their
         * values. All columns are only updated once, because of the updated
         * columns field that recursively tracks dependencies.
         *
         * @param {Object} lineItem Reference to the lineItem being updated
         * @param {Object} column Requisition template column
         * @param {Object} requisition Requisition to which line item belongs
         * @param {Array} updatedColumns Array of column names that have already been updated
         *
         */
        function updateDependentFieldsHelper(lineItem, column, requisition, updatedColumns) {

            // Protecting against circular dependencies, by keeping track of the
            // fields that we have already updated.
            if (updatedColumns.indexOf(column.name) >= 0) {
                return;
            }
            updatedColumns.push(column.name);

            // Update the dependencies for the column
            angular.forEach(requisition.template.columnsMap, function(dependantColumn) {
                var dependencies = [];
                if (dependantColumn.$dependencies && Array.isArray(dependantColumn.$dependencies)) {
                    dependencies = dependantColumn.$dependencies;
                }

                if (dependencies.indexOf(column.name) >= 0) {
                    lineItem.updateFieldValue(dependantColumn, requisition);
                    updateDependentFieldsHelper(lineItem, dependantColumn, requisition, updatedColumns);
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name canBeSkipped
         *
         * @description
         * Determines whether the line item from given requisition can be marked as skipped.
         *
         * @param {Object} requisition Requisition to which line item belongs
         * @return {Boolean} true if line item can be skipped
         */
        // #286 high level approver can skip some products in requisition
        function canBeSkipped() {
            return isEmpty(this.approvedQuantity) && isEmpty(this.remarks);
        }
        // #286 ends here

        /**
         * @ngdoc method
         * @methodOf requisition.LineItem
         * @name isNonFullSupply
         *
         * @description
         * Determines whether line item is full or non full supply.
         *
         * @return  {Boolean}   true if line item is non full supply, false otherwise
         */
        function isNonFullSupply() {
            return !this.$program.fullSupply;
        }

        // #286 high level approver can skip some products in requisition
        // function isInputDisplayedAndNotEmpty(column, lineItem) {
        //     return column.$display
        //         && column.source === COLUMN_SOURCES.USER_INPUT
        //         && column.$type !== COLUMN_TYPES.BOOLEAN
        //         && !isEmpty(lineItem[column.name]);
        // }
        // #286 ends here

        function isEmpty(value) {
            return !value || !value.toString().trim();
        }

        // SIGLUS-REFACTOR: starts here
        // function getProgramById(programs, programId) {
        //     var match;
        //     programs.forEach(function(program) {
        //         if (program.programId === programId) {
        //             match = program;
        //         }
        //     });
        //     return match;
        // }
        // SIGLUS-REFACTOR: ends here

        function getObject(from, path) {
            var object = from;
            if (path.indexOf('.') > -1) {
                var properties = path.split('.');
                properties.pop();
                properties.forEach(function(property) {
                    object = object[property];
                });
            }
            return object;
        }

        function getPropertyName(fullPath) {
            var id = fullPath.lastIndexOf('.');
            return id > -1 ? fullPath.substr(id) : fullPath;
        }

        // SIGLUS-REFACTOR: remove useless code to fix SonarQube
        // function checkIfNullOrZero(value) {
        //     if (value === 0) {
        //         value = 0;
        //     } else if (value === null) {
        //         value = null;
        //     }
        // }
        // SIGLUS-REFACTOR: ends here
    }

})();
