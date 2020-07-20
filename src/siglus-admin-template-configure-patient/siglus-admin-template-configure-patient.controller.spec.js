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

describe('SiglusPatientTemplateController', function() {

    var vm, template;

    var TemplateColumnDataBuilder, TemplateDataBuilder, $controller, COLUMN_SOURCES, COLUMN_TYPES;

    beforeEach(function() {
        module('siglus-admin-template-configure-patient');
        module('admin-template-configure-column-setting');

        inject(function($injector) {
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            COLUMN_TYPES = $injector.get('COLUMN_TYPES');
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn())
            .build();
        vm = $controller('SiglusPatientTemplateController', {
            template: template
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });
    });

    describe('addColumn', function() {

        it('should add new column', function() {
            var section = {
                columns: []
            };
            vm.addColumn(section);

            expect(section.columns[0]).toEqual({
                id: null,
                name: null,
                label: null,
                indicator: 'N',
                displayOrder: null,
                isDisplayed: true,
                source: COLUMN_SOURCES.USER_INPUT,
                option: null,
                definition: null,
                tag: null,
                columnDefinition: {
                    canChangeOrder: true,
                    columnType: COLUMN_TYPES.NUMERIC,
                    name: null,
                    sources: [COLUMN_SOURCES.USER_INPUT],
                    options: [],
                    label: null,
                    indicator: null,
                    mandatory: false,
                    isDisplayRequired: false,
                    canBeChangedByUser: false,
                    supportsTag: false,
                    definition: null
                }
            });
        });
    });
});
