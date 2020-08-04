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

describe('SiglusColumnSettingDetailController', function() {

    var vm, template;
    var $state, $controller, COLUMN_SOURCES, siglusTemplateConfigureService;

    beforeEach(function() {
        module('siglus-admin-template-configure-column-setting-detail');
        module('siglus-admin-template-configure-column-setting');

        inject(function($injector) {
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            siglusTemplateConfigureService = $injector.get('siglusTemplateConfigureService');
        });

        template = {
            regimen: []
        };
        spyOn(siglusTemplateConfigureService, 'getDefaultColumn').andReturn({
            name: 'newColumn0',
            source: COLUMN_SOURCES.USER_INPUT,
            displayOrder: 2,
            columnDefinition: {}
        });

        vm = $controller('SiglusColumnSettingDetailController', {
            template: template,
            $state: $state
        });
        $state.params.section = 'regimen';
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.sections).toEqual([]);
        });
    });

    describe('addColumn', function() {

        it('should add a new column and its column source is user input', function() {
            var section = {
                columns: []
            };
            vm.addColumn(section);

            expect(section.columns.length).toEqual(1);
            expect(section.columns[0].source).toEqual(COLUMN_SOURCES.USER_INPUT);
        });
    });
});
