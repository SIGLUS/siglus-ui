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

describe('templateConfigureService', function() {

    beforeEach(function() {
        module('admin-template-configure-column-setting');

        inject(function($injector) {
            this.templateConfigureService = $injector.get('templateConfigureService');
            this.COLUMN_TYPES = $injector.get('COLUMN_TYPES');
        });
    });

    it('should get default column',
        function() {
            var column = this.templateConfigureService.getDefaultColumn();

            expect(column).toEqual({
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
                    columnType: this.COLUMN_TYPES.NUMERIC,
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
            });
        });

    it('should get collection section',
        function() {
            var collection = this.templateConfigureService.getCollection([{
                name: 'collection'
            }, {
                name: 'service'
            }]);

            expect(collection).toEqual({
                name: 'collection'
            });
        });

    it('should get service section',
        function() {
            var service = this.templateConfigureService.getService([{
                name: 'collection'
            }, {
                name: 'service'
            }]);

            expect(service).toEqual({
                name: 'service'
            });
        });

    it('should get column map',
        function() {
            var columnsMap = this.templateConfigureService.getSectionColumnsMap({
                name: 'collection',
                columns: [ {
                    name: 'kitReceived',
                    label: 'No. of Kit Received',
                    indicator: 'KD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of how many KIT received',
                    tag: 'received',
                    source: 'STOCK_CARDS',
                    id: 'f02aab7b-6b83-4447-a293-0486b958cf9c'
                }]
            });

            expect(columnsMap).toEqual({
                kitReceived: {
                    name: 'kitReceived',
                    label: 'No. of Kit Received',
                    indicator: 'KD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of how many KIT received',
                    tag: 'received',
                    source: 'STOCK_CARDS',
                    id: 'f02aab7b-6b83-4447-a293-0486b958cf9c'
                }
            });
        });
});
