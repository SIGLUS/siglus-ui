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

describe('SiglusKitUsageTemplateController', function() {

    var vm, template, tags, collection, service, column;

    var TemplateColumnDataBuilder, TemplateDataBuilder, $controller, COLUMN_SOURCES, siglusTemplateConfigureService;

    beforeEach(function() {
        module('siglus-admin-template-configure-kit-usage');
        module('siglus-admin-template-configure-column-setting');

        inject(function($injector) {
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            siglusTemplateConfigureService = $injector.get('siglusTemplateConfigureService');
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn())
            .build();
        collection = {
            name: 'collection',
            columns: []
        };
        service = {
            name: 'service',
            columns: []
        };
        template.kitUsage = [collection, service];
        tags = [
            'tag-1',
            'tag-2',
            'tag-3'
        ];
        column = {
            name: 'kitReceived',
            source: null,
            columnDefinition: {
                sources: [],
                supportsTag: true
            }
        };
        spyOn(siglusTemplateConfigureService, 'getDefaultColumn').andReturn(column);

        vm = $controller('SiglusKitUsageTemplateController', {
            template: template,
            tags: tags
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });

        it('should set tags', function() {
            expect(vm.tags).toEqual(tags);
        });

        it('should set collection', function() {
            expect(vm.collection).toBe(collection);
        });

        it('should set service', function() {
            expect(vm.service).toBe(service);
        });
    });

    describe('addCollectionColumn', function() {

        it('should return true if column source is user input', function() {
            vm.addCollectionColumn();
            column.columnDefinition.sources = [COLUMN_SOURCES.STOCK_CARDS, COLUMN_SOURCES.USER_INPUT];

            expect(vm.collection.columns).toEqual([column]);
        });
    });

    describe('addServiceColumn', function() {

        it('should return productCode if column name is orderable.productCode', function() {
            vm.addServiceColumn();
            column.source = COLUMN_SOURCES.USER_INPUT;
            column.columnDefinition.sources = [COLUMN_SOURCES.USER_INPUT];
            column.columnDefinition.supportsTag = false;

            expect(vm.service.columns).toEqual([column]);
        });
    });
});
