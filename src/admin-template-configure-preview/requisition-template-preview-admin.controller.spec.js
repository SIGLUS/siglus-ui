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

describe('RequisitionTemplatePreviewController', function() {

    //tested
    var vm;

    //mocks
    var template, initController;

    //injects
    var q, $controller, state, notificationService, rootScope, loadingModalService,
        confirmService, requisitionTemplateService, TemplateColumnDataBuilder, TemplateDataBuilder;

    beforeEach(function() {
        module('admin-template-configure-preview');

        inject(function($injector) {
            q = $injector.get('$q');
            state = $injector.get('$state');
            notificationService = $injector.get('notificationService');
            loadingModalService = $injector.get('loadingModalService');
            rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            confirmService = $injector.get('confirmService');
            requisitionTemplateService = $injector.get('requisitionTemplateService');
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn());

        initController = function() {
            vm = $controller('RequisitionTemplatePreviewController', {
                template: template,
                $state: state
            });
            vm.$onInit();
        };
    });

    describe('onInit', function() {

        it('should set template', function() {
            initController();

            expect(vm.template).toEqual(template);
        });

        it('should set columns', function() {
            initController();

            var sortColumns = _.sortBy(vm.columns, 'name');

            expect(sortColumns).toEqual([vm.template.columnsMap.averageConsumption, vm.template.columnsMap.remarks]);
        });
    });

    describe('goToTemplateList', function() {

        it('should reload state', function() {
            initController();

            spyOn(state, 'go');
            vm.goToTemplateList();

            expect(state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates',
                {}, {
                    reload: true
                });
        });
    });

    describe('save template', function() {

        var stateGoSpy = jasmine.createSpy(),
            successNotificationServiceSpy = jasmine.createSpy(),
            errorNotificationServiceSpy = jasmine.createSpy();

        beforeEach(function() {
            spyOn(notificationService, 'success').andCallFake(successNotificationServiceSpy);
            spyOn(notificationService, 'error').andCallFake(errorNotificationServiceSpy);

            spyOn(state, 'go').andCallFake(stateGoSpy);

            spyOn(loadingModalService, 'close');
            spyOn(loadingModalService, 'open');

            spyOn(confirmService, 'confirm').andReturn(q.resolve());

            spyOn(requisitionTemplateService, 'save').andReturn(q.resolve());

            template.isValid = jasmine.createSpy().andReturn(true);

            initController();
        });

        it('should display error message when template is invalid', function() {
            template.isValid.andReturn(false);

            vm.saveTemplate();

            rootScope.$apply();

            expect(stateGoSpy).not.toHaveBeenCalled();
            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(errorNotificationServiceSpy).toHaveBeenCalledWith('adminProgramTemplate.template.invalid');
            expect(confirmService.confirm).not.toHaveBeenCalled();
        });

        it('should not save template if confirm failed', function() {
            confirmService.confirm.andReturn(q.reject());

            vm.saveTemplate();

            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminProgramTemplate.templateSave.description', 'adminProgramTemplate.save',
                undefined, 'adminProgramTemplate.templateSave.title'
            );

            expect(stateGoSpy).not.toHaveBeenCalled();
            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(successNotificationServiceSpy).not.toHaveBeenCalled();
        });

        it('should save template and then display success notification and change state', function() {
            vm.saveTemplate();

            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminProgramTemplate.templateSave.description', 'adminProgramTemplate.save',
                undefined, 'adminProgramTemplate.templateSave.title'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(requisitionTemplateService.save).toHaveBeenCalledWith(template);
            expect(stateGoSpy).toHaveBeenCalled();
            expect(successNotificationServiceSpy).toHaveBeenCalledWith('adminProgramTemplate.templateSave.success');
        });

        it('should close loading modal if template save was unsuccessful', function() {
            requisitionTemplateService.save.andReturn(q.reject());

            vm.saveTemplate();
            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminProgramTemplate.templateSave.description', 'adminProgramTemplate.save',
                undefined, 'adminProgramTemplate.templateSave.title'
            );

            expect(loadingModalService.close).toHaveBeenCalled();
            expect(requisitionTemplateService.save).toHaveBeenCalledWith(template);
            expect(errorNotificationServiceSpy).toHaveBeenCalledWith('adminProgramTemplate.templateSave.failure');
        });
    });
});
