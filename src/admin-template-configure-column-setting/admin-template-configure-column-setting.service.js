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

    angular.module('admin-template-configure-column-setting')
        .service('templateConfigureService', service);

    service.$inject = ['COLUMN_TYPES'];

    function service(COLUMN_TYPES) {
        this.getDefaultColumn = getDefaultColumn;
        this.getCollection = getCollection;
        this.getService = getService;
        this.getSectionColumnsMap = getSectionColumnsMap;
        this.getInformation = getInformation;
        this.getSectionByName = getSectionByName;
        function getDefaultColumn() {
            return {
                id: null,
                name: null,
                label: null,
                indicator: 'N',
                displayOrder: null,
                isDisplayed: true,
                source: null,
                option: null,
                definition: null,
                tag: null,
                columnDefinition: {
                    canChangeOrder: true,
                    columnType: COLUMN_TYPES.NUMERIC,
                    name: null,
                    sources: [],
                    options: [],
                    label: null,
                    indicator: null,
                    mandatory: false,
                    isDisplayRequired: false,
                    canBeChangedByUser: false,
                    supportsTag: true,
                    definition: null
                }
            };
        }

        function getCollection(sections) {
            return _.find(sections, function(section) {
                return section.name === 'collection';
            });
        }

        function getService(sections) {
            return _.find(sections, function(section) {
                return section.name === 'service';
            });
        }

        function getSectionColumnsMap(section) {
            return _.reduce(section.columns, function(columnMap, column) {
                columnMap[column.name] = column;
                return columnMap;
            }, {});
        }

        function getInformation(sections) {
            return _.find(sections, function(section) {
                return section.name === 'information';
            });
        }

        function getSectionByName(sections, name) {
            return _.find(sections, function(section) {
                return section.name === name;
            });
        }
    }

})();
