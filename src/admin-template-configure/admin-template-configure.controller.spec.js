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

describe('AdminTemplateConfigureController', function() {

    // #173: product sections for template configuration
    var configureStateRouterService;
    // #173: ends here
    beforeEach(function() {
        module('admin-template-configure');
        module('admin-template-configure-columns');

        var ProgramDataBuilder, TemplateDataBuilder;
        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            // #173: product sections for template configuration
            configureStateRouterService = $injector.get('configureStateRouterService');
            // #173: ends here
        });

        // #173: product sections for template configuration
        spyOn(configureStateRouterService, 'initialize');
        // #173: ends here

        this.template = new TemplateDataBuilder().build();
        this.program = new ProgramDataBuilder().build();

        this.vm = this.$controller('AdminTemplateConfigureController', {
            template: this.template,
            program: this.program
        });

        this.vm.$onInit();
    });

    describe('init', function() {

        it('should expose program', function() {
            expect(this.vm.program).toEqual(this.program);
        });

        it('should expose template', function() {
            expect(this.vm.template).toEqual(this.template);
        });

        it('should expose original template name', function() {
            expect(this.vm.originalTemplateName).toEqual(this.template.name);
        });

        // #173: product sections for template configuration
        it('should call initialize', function() {
            expect(configureStateRouterService.initialize).toHaveBeenCalledWith(this.vm.template);
        });
        // #173: ends here

    });

    describe('original template name', function() {

        it('should not change when user edits the template name', function() {
            this.vm.template.name = 'Different Name';

            expect(this.vm.originalTemplateName).not.toBe('Different Name');
        });

    });
});
