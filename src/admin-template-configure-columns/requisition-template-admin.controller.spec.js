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

describe('RequisitionTemplateAdminController', function() {

    //tested
    var vm;

    //mocks
    var template, program, tags, loadingModalService;

    //injects
    var q, $controller, state, notificationService, COLUMN_SOURCES, rootScope, MAX_COLUMN_DESCRIPTION_LENGTH,
        confirmService, requisitionTemplateService, TemplateColumnDataBuilder, TemplateDataBuilder;

    // #173: product sections for template configuration
    var scope, originalTemplate, refreshConfirmService;
    // #173: ends here

    beforeEach(function() {
        module('admin-template-configure-columns');

        inject(function($injector) {
            q = $injector.get('$q');
            state = $injector.get('$state');
            notificationService = $injector.get('notificationService');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            loadingModalService = $injector.get('loadingModalService');
            rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            confirmService = $injector.get('confirmService');
            requisitionTemplateService = $injector.get('requisitionTemplateService');
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            MAX_COLUMN_DESCRIPTION_LENGTH = $injector.get('MAX_COLUMN_DESCRIPTION_LENGTH');
            // #173: product sections for template configuration
            scope = rootScope.$new();
            refreshConfirmService = $injector.get('refreshConfirmService');
            // #173: ends here
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn());

        // #173: product sections for template configuration
        originalTemplate = angular.copy(template);
        spyOn(scope, '$watch');
        spyOn(refreshConfirmService, 'register');
        spyOn(refreshConfirmService, 'deregister');
        // #173: ends here
        tags = [
            'tag-1',
            'tag-2',
            'tag-3'
        ];

        vm = $controller('RequisitionTemplateAdminController', {
            program: program,
            template: template,
            tags: tags,
            // #173: product sections for template configuration
            $scope: scope,
            originalTemplate: originalTemplate
            // #173: ends here
        });
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set template', function() {
            expect(vm.template).toEqual(template);
        });

        it('should set program', function() {
            expect(vm.program).toEqual(program);
        });

        it('should set maxColumnDescriptionLength', function() {
            expect(vm.maxColumnDescriptionLength).toEqual(MAX_COLUMN_DESCRIPTION_LENGTH);
        });

        it('should set availableTags', function() {
            expect(vm.availableTags).toEqual({});
        });

        // #173: product sections for template configuration
        it('should watch template', function() {
            expect(scope.$watch).toHaveBeenCalled();
        });

        it('should register refresh confrim', function() {
            expect(refreshConfirmService.register).toHaveBeenCalledWith(scope);
        });

        it('should deregister when $destroy event emit', function() {
            scope.$emit('$destroy');
            scope.$apply();

            expect(refreshConfirmService.deregister).toHaveBeenCalled();
        });
        // #173: ends here
    });

    describe('goToTemplateList', function() {

        it('should reload state', function() {
            spyOn(state, 'go');
            vm.goToTemplateList();

            expect(state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates',
                {}, {
                    reload: true
                });
        });
    });

    // #173: product sections for template configuration
    describe('cancel', function() {

        it('should change state', function() {
            spyOn(state, 'go');
            vm.cancel();

            expect(state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates.configure.columns',
                {
                    productSection: {
                        populateStockOnHandFromStockCards: vm.template.populateStockOnHandFromStockCards,
                        columnsMap: vm.template.columnsMap
                    }
                });
        });

        it('should change state with previous columnsMap when columnsMap changed', function() {
            spyOn(state, 'go');
            var previousTemplate = angular.copy(vm.template);
            vm.template.columnsMap.stockOnHand.displayOrder = 9999;
            vm.template.populateStockOnHandFromStockCards = true;
            vm.cancel();

            expect(state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates.configure.columns',
                {
                    productSection: {
                        populateStockOnHandFromStockCards: previousTemplate.populateStockOnHandFromStockCards,
                        columnsMap: previousTemplate.columnsMap
                    }
                });
        });
    });

    describe('preview template', function() {
        var stateGoSpy = jasmine.createSpy(),
            errorNotificationServiceSpy = jasmine.createSpy();

        beforeEach(function() {
            spyOn(notificationService, 'error').andCallFake(errorNotificationServiceSpy);

            spyOn(state, 'go').andCallFake(stateGoSpy);

            template.isValid = jasmine.createSpy().andReturn(true);
        });

        it('should display error message when template is invalid', function() {
            template.isValid.andReturn(false);

            vm.previewTemplate();

            rootScope.$apply();

            expect(stateGoSpy).not.toHaveBeenCalled();
            expect(errorNotificationServiceSpy).toHaveBeenCalledWith('adminProgramTemplate.template.invalid');
        });

        it('should change state when template is valid', function() {
            vm.previewTemplate();

            rootScope.$apply();

            expect(stateGoSpy).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates.configure.columns');
        });

    });
    // #173: ends here

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

    it('should call column drop method and display error notification when drop failed', function() {
        var notificationServiceSpy = jasmine.createSpy();

        template.moveColumn = jasmine.createSpy().andReturn(false);

        spyOn(notificationService, 'error').andCallFake(notificationServiceSpy);

        vm.dropCallback(null, 1, template.columnsMap.total);

        expect(notificationServiceSpy).toHaveBeenCalled();
    });

    it('can change source works correctly', function() {
        var beginningBalanceColumn = new TemplateColumnDataBuilder().buildBeginningBalanceColumn(),
            requestedQuantityColumn = new TemplateColumnDataBuilder().buildRequestedQuantityColumn(),
            stockOnHandColumn = new TemplateColumnDataBuilder().buildStockOnHandColumn();

        requestedQuantityColumn.columnDefinition.sources = [COLUMN_SOURCES.USER_INPUT];

        spyOn(beginningBalanceColumn, 'isStockBasedColumn').andReturn(true);
        spyOn(requestedQuantityColumn, 'isStockBasedColumn').andReturn(false);
        spyOn(stockOnHandColumn, 'isStockBasedColumn').andReturn(true);

        expect(vm.canChangeSource(beginningBalanceColumn)).toBe(true);
        expect(vm.canChangeSource(requestedQuantityColumn)).toBe(false);

        template.populateStockOnHandFromStockCards = true;

        expect(vm.canChangeSource(stockOnHandColumn)).toBe(false);
        expect(vm.canChangeSource(beginningBalanceColumn)).toBe(false);
    });

    describe('refreshAvailableTags', function() {

        beforeEach(function() {
            vm.template.columnsMap.maximumStockQuantity = new TemplateColumnDataBuilder()
                .withTag('tag-1')
                .buildMaximumStockQuantityColumn();
            vm.template.columnsMap.calculatedOrderQuantity = new TemplateColumnDataBuilder()
                .withTag('tag-2')
                .buildCalculatedOrderQuantityColumn();

            vm.refreshAvailableTags();
        });

        it('should set list of available tags to columns that supports tags', function() {
            expect(vm.availableTags.maximumStockQuantity).toEqual(['tag-3', 'tag-1']);
            expect(vm.availableTags.calculatedOrderQuantity).toEqual(['tag-3', 'tag-2']);
        });

        it('should not set list of available tags to columns that not supports tags', function() {
            expect(vm.availableTags.total).toBe(undefined);
            expect(vm.availableTags.remarks).toBe(undefined);
            expect(vm.availableTags.stockOnHand).toBe(undefined);
            expect(vm.availableTags.averageConsumption).toBe(undefined);
        });
    });
});
