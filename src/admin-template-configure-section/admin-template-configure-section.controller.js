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
     * @ngdoc controller
     * @name admin-template-configure-section.controller:TemplateConfigureSectionController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('admin-template-configure-section')
        .controller('TemplateConfigureSectionController', TemplateConfigureSectionController);

    TemplateConfigureSectionController.$inject = [
        'messageService', 'templateValidator', 'columnUtils', 'COLUMN_SOURCES', 'MAX_COLUMN_DESCRIPTION_LENGTH',
        'MAX_ADD_COLUMNS_LENGTH'
    ];

    function TemplateConfigureSectionController(messageService, templateValidator, columnUtils, COLUMN_SOURCES,
                                                MAX_COLUMN_DESCRIPTION_LENGTH, MAX_ADD_COLUMNS_LENGTH) {
        var vm = this;

        vm.$onInit = onInit;
        vm.movedCallback = movedCallback;
        // vm.dropCallback = dropCallback;
        vm.canChangeSource = canChangeSource;
        vm.sourceDisplayName = sourceDisplayName;
        vm.canAssignTag = canAssignTag;
        vm.getSiglusColumnError = templateValidator.getSiglusColumnError;
        vm.refreshAvailableTags = refreshAvailableTags;
        vm.addColumn = addColumn;
        vm.removeColumn = removeColumn;
        vm.overMaxColumnsLength = overMaxColumnsLength;

        vm.maxColumnDescriptionLength = undefined;

        vm.availableTags = {};

        vm.columnMap = {};

        function onInit() {
            vm.maxColumnDescriptionLength = MAX_COLUMN_DESCRIPTION_LENGTH;
            vm.columnMap = _.groupBy(vm.section.columns, function(column) {
                return column.name;
            });
            refreshAvailableTags();
        }

        function movedCallback(index) {
            vm.section.columns.splice(index, 1);
            updateDisplayOrder();
        }

        // function dropCallback(event, dropSpotIndex, droppedItem) {
        //     vm.section.columns.splice(index, 1);
        //     angular.forEach(vm.section.columns, function(column, idx) {
        //         column.displayOrder = idx;
        //     });
        // }

        function canChangeSource(column) {
            return column.columnDefinition.sources.length > 1;
        }

        function sourceDisplayName(name) {
            return messageService.get(COLUMN_SOURCES.getLabel(name));
        }

        function canAssignTag(column) {
            return columnUtils.isStockCards(column) && column.columnDefinition.supportsTag;
        }

        function refreshAvailableTags() {
            var filteredTags = filterUnusedTags();

            angular.forEach(vm.section.columns, function(column) {
                if (column.columnDefinition.supportsTag) {
                    vm.availableTags[column.name] = angular.copy(filteredTags);
                    if (column.tag) {
                        vm.availableTags[column.name].push(column.tag);
                    }
                }
            });
        }

        function filterUnusedTags() {
            return vm.tags.filter(function(tag) {
                return _.reduce(vm.section.columns, function(isNotSelected, column) {
                    return isNotSelected && column.tag !== tag;
                }, true);
            });
        }

        function addColumn() {
            if (!overMaxColumnsLength()) {
                vm.onAddColumn();
                var addedColumn = _.last(vm.section.columns);
                setDefaultName(addedColumn);
                updateLabel(addedColumn);
            }
        }

        function setDefaultName(column) {
            var defaultName = 'newColumn';
            var i = 0;
            while (vm.columnMap[defaultName + i] && i < MAX_ADD_COLUMNS_LENGTH) {
                i++;
            }
            column.name = defaultName + i;
            vm.columnMap[column.name] = column;
        }

        function updateLabel(column) {
            if (column.columnDefinition.supportsTag) {
                vm.availableTags[column.name] = angular.copy(filterUnusedTags());
                if (column.tag) {
                    vm.availableTags[column.name].push(column.tag);
                }
            }
        }

        function removeColumn(index) {
            var removedColumn = vm.section.columns.splice(index, 1)[0];
            if (removedColumn) {
                vm.columnMap[removedColumn.name] = undefined;
                updateDisplayOrder();
            }
            if (removedColumn && removedColumn.columnDefinition.supportsTag && removedColumn.tag) {
                refreshAvailableTags();
            }
        }

        function updateDisplayOrder() {
            angular.forEach(vm.section.columns, function(column, idx) {
                column.displayOrder = idx;
            });
        }

        function overMaxColumnsLength() {
            var addedColumns = _.filter(vm.section.columns, function(column) {
                return !column.columnDefinition.id;
            });
            return addedColumns.length >= MAX_ADD_COLUMNS_LENGTH;
        }
    }
})();
