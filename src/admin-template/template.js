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
     * @name admin-template.Template
     *
     * @description
     * Represents a single requisition template.
     */
    angular
        .module('admin-template')
        .factory('Template', Template);

    Template.$inject = ['$q', 'templateValidator', 'COLUMN_SOURCES', 'TemplateColumn', 'RequisitionColumn'];

    function Template($q, templateValidator, COLUMN_SOURCES, TemplateColumn, RequisitionColumn) {
        Template.prototype.moveColumn = moveColumn;
        Template.prototype.findCircularCalculatedDependencies = findCircularCalculatedDependencies;
        Template.prototype.changePopulateStockOnHandFromStockCards = changePopulateStockOnHandFromStockCards;
        Template.prototype.isValid = isValid;
        Template.prototype.hasColumns = hasColumns;
        Template.prototype.removeColumn = removeColumn;
        Template.prototype.addColumn = addColumn;
        Template.prototype.create = create;
        Template.prototype.canAssignTag = canAssignTag;

        return Template;

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name Template
         *
         * @description
         * Creates a new instance of the Template.
         *
         * @param  {Object}             template   the JSON representation of the Template
         * @param  {TemplateRepository} repository the Template Repository
         * @return {Reason}                        the Reason object
         */
        function Template(template, repository) {
            this.createdDate = template.createdDate;
            this.id = template.id;
            this.numberOfPeriodsToAverage = template.numberOfPeriodsToAverage;
            this.program = template.program;
            this.populateStockOnHandFromStockCards = template.populateStockOnHandFromStockCards;
            this.columnsMap = {};
            this.facilityTypes = template.facilityTypes;
            this.name = template.name;
            this.extension = template.extension;
            // #163: add associate program
            this.associatePrograms = template.associatePrograms;
            // #163: ends here
            // #248: kit usage section configure
            this.kitUsage = _.forEach(template.kitUsage, function(section) {
                section.columns = _.sortBy(section.columns, 'displayOrder');
            });
            // #248: ends here

            for (var columnName in template.columnsMap) {
                this.columnsMap[columnName] = new TemplateColumn(template.columnsMap[columnName]);
            }

            var columns = this.columnsMap;
            angular.forEach(this.columnsMap, function(column) {
                addDependentColumnValidation(column, columns);
            });

            this.repository = repository;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name create
         *
         * @description
         * Saves new Template using Template Repository.
         *
         * @return {Promise} the promise resolving to created Template, rejected if save was unsuccessful
         */
        function create() {
            return this.repository.create(this);
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name hasColumns
         *
         * @description
         * Checks if Template has any column.
         *
         * @return {boolean} true if Template has column, false otherwise
         */
        function hasColumns() {
            for (var prop in this.columnsMap) {
                if (this.columnsMap.hasOwnProperty(prop)) {
                    return true;
                }
            }
            return false;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name removeColumn
         *
         * @description
         * Removes column from Template based on name.
         *
         * @param  {String} columnName name of the column to be removed
         * @return {Promise}           resolved if column was removed successfully, rejected otherwise
         */
        function removeColumn(columnName) {
            var template = this;
            if (template.columnsMap.hasOwnProperty(columnName)) {
                var removedDisplayOrder = template.columnsMap[columnName].displayOrder;
                delete template.columnsMap[columnName];
                Object.keys(template.columnsMap).forEach(function(column) {
                    if (template.columnsMap[column].displayOrder >= removedDisplayOrder) {
                        template.columnsMap[column].displayOrder--;
                    }
                });
                return $q.resolve();
            }
            return $q.reject();
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name addColumn
         *
         * @description
         * Add new column to Template based on given Available Requisition Column
         *
         * @param  {Object}  availableColumn Available Requisition Column to be added
         * @param  {boolean} isDisplayed     True if new column should be displayed
         */
        function addColumn(availableColumn, isDisplayed) {
            if (availableColumn) {
                this.columnsMap[availableColumn.name] = {
                    name: availableColumn.name,
                    label: availableColumn.label,
                    indicator: availableColumn.indicator,
                    displayOrder: getNewDisplayOrder(this),
                    isDisplayed: isDisplayed,
                    // SIGLUS-REFACTOR: starts here
                    source: getSource(availableColumn.sources, availableColumn.defaultSource),
                    // SIGLUS-REFACTOR: ends here
                    columnDefinition: availableColumn,
                    option: availableColumn.options[0],
                    definition: availableColumn.definition,
                    // SIGLUS-REFACTOR: starts here
                    tag: availableColumn.defaultTag
                    // SIGLUS-REFACTOR: ends here
                };
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name canAssignTag
         *
         * @description
         * Checks if template has stock based flag set to true and column supports tag.
         * If there is no column with given name error will be thrown.
         *
         * @param  {String}  columnName name of the column to be verified
         * @return {boolean}            true if template has stock based flag set to true and column supports tag
         */
        function canAssignTag(columnName) {
            if (this.columnsMap.hasOwnProperty(columnName)) {
                return this.populateStockOnHandFromStockCards &&
                    this.columnsMap[columnName].columnDefinition.supportsTag;
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name isValid
         *
         * @description
         * Checks if template is valid using template validator.
         *
         * @return {boolean} true if template is valid
         */
        function isValid() {
            return templateValidator.isTemplateValid(this);
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name moveColumn
         *
         * @description
         * Checks if column can be dropped in area and if so,
         * changes display order of columns between old and new position of dropped column.
         *
         * @param {Object} droppedItem   the column to be moved
         * @param {Number} dropSpotIndex the index on which column was dropped
         */
        function moveColumn(droppedItem, dropSpotIndex) {
            var maxNumber = 999999999999999,
                // columns that position can't be changed
                pinnedColumns = [],
                // all columns
                columns = [],
                newDisplayOrder,
                // the lowest column displayOrder value in droppable area
                min,
                // the highest column displayOrder value in droppable area
                max,
                // indicates if column is going down or up the list
                isMovingUpTheList;

            convertListToArray(this.columnsMap);
            isMovingUpTheList = getArrayIndexForColumn(droppedItem) > dropSpotIndex;

            if (isMovingUpTheList) {
                newDisplayOrder = columns[dropSpotIndex].displayOrder;
            // new displayOrder value depends on if column was dropped below or above
            } else {
                newDisplayOrder = columns[dropSpotIndex - 1].displayOrder;
            }

            setMinMaxDisplayOrder(droppedItem.displayOrder);

            if (isInDroppableArea(newDisplayOrder) && droppedItem.columnDefinition.canChangeOrder) {
                angular.forEach(columns, function(column) {
                    if (isInDroppableArea(column.displayOrder) && column.columnDefinition.canChangeOrder) {
                        if (droppedItem.name === column.name) {
                            column.displayOrder = newDisplayOrder;
                        // setting new displayOrder for dropped column
                        } else if (shouldIncrementDisplayOrder(
                            column, droppedItem, newDisplayOrder, isMovingUpTheList
                        )) {
                            column.displayOrder++;
                        // columns between old and new position must be
                        } else if (shouldDecrementDisplayOrder(column, droppedItem, newDisplayOrder)) {
                            // incremented or decremented
                            column.displayOrder--;
                        }
                    }
                });
                return true;
            }
            return false;

            // Converts list of columns to array, copies "pinned" columns to another array and sorts both.
            function convertListToArray(list) {
                angular.forEach(list, function(column) {
                    if (!column.columnDefinition.canChangeOrder) {
                        pinnedColumns.push(column);
                    }
                    columns.push(column);
                });

                pinnedColumns.sort(sort);
                columns.sort(sort);
            }

            // Returns current index in array of given column.
            function getArrayIndexForColumn(column) {
                var index;

                angular.forEach(columns, function(item, idx) {
                    if (column.name === item.name) {
                        index = idx;
                    }
                });

                return index;
            }

            // Sets min and max display order value.
            // In other words it tells you between which "pinned" columns was our dropped column located.
            // This column can be dropped only in this area.
            function setMinMaxDisplayOrder(displayOrder) {
                min = 0;
                max = undefined;
                angular.forEach(pinnedColumns, function(pinnedColumn) {
                    if (displayOrder > pinnedColumn.displayOrder) {
                        min = pinnedColumn.displayOrder;
                    }
                    if (!max && displayOrder < pinnedColumn.displayOrder) {
                        max = pinnedColumn.displayOrder;
                    }
                });
                if (!max) {
                    max = maxNumber;
                }
            }

            // Based on mix and max from function above checks if column was dropped in proper area
            function isInDroppableArea(displayOrder) {
                return displayOrder > min && displayOrder < max;
            }
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name moveColumn
         *
         * @description
         * Check if a column has a calculated dependency that is dependent on this columns
         *
         * @param  {Object} columnName column we want circular dependencies
         * @return {Array}             circular dependencies for given column
         */
        function findCircularCalculatedDependencies(columnName) {
            var circularDependencies = [];
            checkForCircularCalculatedDependencies(null, columnName, [], null,
                this.columnsMap, circularDependencies);
            return circularDependencies;
        }

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name changePopulateStockOnHandFromStockCards
         *
         * @description
         * Changes stock columns display and sources based on populateStockOnHandFromStockCards flag.
         */
        function changePopulateStockOnHandFromStockCards() {
            if (this.populateStockOnHandFromStockCards) {
                setColumnsForStockBasedTemplate(this.columnsMap);
            } else {
                restoreStockBasedColumns(this.columnsMap);
            }
        }

        function setColumnsForStockBasedTemplate(columns) {
            for (var columnName in columns) {
                if (columns.hasOwnProperty(columnName)) {
                    var column = columns[columnName];

                    if (column.isStockBasedColumn()) {
                        column.source = COLUMN_SOURCES.STOCK_CARDS;
                    }
                }
            }
        }

        function restoreStockBasedColumns(columns) {
            for (var columnName in columns) {
                if (columns.hasOwnProperty(columnName)) {
                    var column = columns[columnName];

                    if (!column.isStockBasedColumn()) {
                        continue;
                    }

                    var userInputId = column.columnDefinition.sources.indexOf(COLUMN_SOURCES.USER_INPUT);
                    if (userInputId > -1) {
                        column.source = column.columnDefinition.sources[userInputId];
                    } else if (column.columnDefinition.sources[0] === COLUMN_SOURCES.STOCK_CARDS) {
                        column.source = column.columnDefinition.sources[1];
                    } else {
                        column.source = column.columnDefinition.sources[0];
                    }
                }
            }
        }

        function checkForCircularCalculatedDependencies(columnNameToCheck, columnNameToFind, columnsVisited,
                                                        directParent, columnsMap, circularDependencies) {
            // already visited this column in a different dependency chain, skip
            if (columnsVisited.indexOf(columnNameToCheck) > -1) {
                return;
            }

            if (columnNameToCheck === columnNameToFind) {
                // bingo, this is in the dependency chain and depends on the original column
                // the direct parent has the dependency, since this is the original column
                circularDependencies.push(directParent);
                return;
            }

            var currentColumnName;
            if (columnNameToCheck) {
                // mark column as already visited
                // we won't get here for the original column
                columnsVisited.push(columnNameToCheck);
                currentColumnName = columnNameToCheck;
            } else {
                // first run, start at our column

                currentColumnName = columnNameToFind;
            }

            var column = columnsMap[currentColumnName];
            // ignore if doesn't exist
            if (!column) {
                return;
            }

            // check all dependencies recursively
            var dependencies = RequisitionColumn.columnDependencies(column);
            if (dependencies) {
                angular.forEach(dependencies, function(dependency) {
                    // only check calculated dependencies
                    var dependencyColumn = columnsMap[dependency];
                    if (dependencyColumn && dependencyColumn.source === COLUMN_SOURCES.CALCULATED) {
                        checkForCircularCalculatedDependencies(dependency, columnNameToFind, columnsVisited,
                            currentColumnName, columnsMap, circularDependencies);
                    }
                });
            }
        }

        function addDependentColumnValidation(column, columns) {
            var dependencies = RequisitionColumn.columnDependencies(column);
            if (dependencies && dependencies.length > 0) {
                angular.forEach(dependencies, function(dependency) {
                    if (columns[dependency]) {
                        if (!columns[dependency].$dependentOn) {
                            columns[dependency].$dependentOn = [];
                        }
                        columns[dependency].$dependentOn.push(column.name);
                    }
                });
            }
        }

        function getNewDisplayOrder(template) {
            var newDisplayOrder = 0;
            Object.keys(template.columnsMap).forEach(function(templateName) {
                if (template.columnsMap[templateName].displayOrder >= newDisplayOrder) {
                    newDisplayOrder = template.columnsMap[templateName].displayOrder + 1;
                }
            });
            return newDisplayOrder;
        }

        // SIGLUS-REFACTOR: starts here
        function getSource(sources, defaultSource) {
            if (defaultSource && sources.indexOf(defaultSource) > -1) {
                return defaultSource;
            }
            return sources.indexOf(COLUMN_SOURCES.STOCK_CARDS) > -1 ? COLUMN_SOURCES.STOCK_CARDS : sources[0];
        }
        // SIGLUS-REFACTOR: ends here

        function shouldIncrementDisplayOrder(column, droppedItem, newDisplayOrder, isMovingUpTheList) {
            return isMovingUpTheList
                && column.displayOrder >= newDisplayOrder
                && column.displayOrder < droppedItem.displayOrder;
        }

        function shouldDecrementDisplayOrder(column, droppedItem, newDisplayOrder) {
            return column.displayOrder <= newDisplayOrder
                && column.displayOrder > droppedItem.displayOrder;
        }

        // Sorting function for column arrays
        function sort(a, b) {
            a = parseInt(a.displayOrder);
            b = parseInt(b.displayOrder);
            return a - b;
        }
    }
})();
