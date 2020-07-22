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

describe('TemplateConfigureColumnSettingController', function() {

    //tested
    var vm;

    //mocks
    var template, unsubscribe = jasmine.createSpy();

    //injects
    var $controller, state, notificationService, rootScope, configureStateRouterService,
        TemplateColumnDataBuilder, TemplateDataBuilder;

    var scope, originalTemplate, refreshConfirmService;

    beforeEach(function() {
        module('admin-template-configure-column-setting');
        module('admin-template');

        inject(function($injector) {
            state = $injector.get('$state');
            notificationService = $injector.get('notificationService');
            rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            scope = rootScope.$new();
            configureStateRouterService = $injector.get('configureStateRouterService');
            refreshConfirmService = $injector.get('refreshConfirmService');
        });

        template = new TemplateDataBuilder()
            .withColumn(new TemplateColumnDataBuilder().buildTotalColumn())
            .withColumn(new TemplateColumnDataBuilder().buildRemarksColumn())
            .withColumn(new TemplateColumnDataBuilder().buildStockOnHandColumn())
            .withColumn(new TemplateColumnDataBuilder().buildAverageConsumptionColumn())
            .build();

        originalTemplate = angular.copy(template);
        spyOn(scope, '$watch');
        spyOn(refreshConfirmService, 'register');
        spyOn(refreshConfirmService, 'deregister');
        spyOn(configureStateRouterService, 'initialize').andReturn(unsubscribe);

        vm = $controller('TemplateConfigureColumnSettingController', {
            $state: state,
            $scope: scope,
            template: template,
            originalTemplate: originalTemplate
        });
    });

    describe('onInit', function() {

        it('should set template', function() {
            vm.$onInit();

            expect(vm.template).toEqual(template);
        });

        it('should set previousTemplate', function() {
            vm.$onInit();

            expect(vm.previousTemplate).toEqual(template);
        });

        it('should call initialize', function() {
            vm.$onInit();

            expect(configureStateRouterService.initialize).toHaveBeenCalledWith(vm.template);
        });

        it('should call unsubscribe when $destroy event emit', function() {
            vm.$onInit();

            scope.$emit('$destroy');
            scope.$apply();

            expect(unsubscribe).toHaveBeenCalled();
        });

        it('should watch template', function() {
            vm.$onInit();

            expect(scope.$watch).toHaveBeenCalled();
        });

        it('should register refresh confrim', function() {
            vm.$onInit();

            expect(refreshConfirmService.register).toHaveBeenCalledWith(scope);
        });

        it('should deregister when $destroy event emit', function() {
            vm.$onInit();

            scope.$emit('$destroy');
            scope.$apply();

            expect(refreshConfirmService.deregister).toHaveBeenCalled();
        });

        it('should enable product when route to product detail page', function() {
            state.current.name = 'openlmis.administration.requisitionTemplates.configure.columnSetting.product';
            vm.$onInit();

            expect(vm.template.extension.enableProduct).toBe(true);
        });
    });

    describe('cancel', function() {
        beforeEach(function() {
            vm.$onInit();
        });

        it('should change state', function() {
            spyOn(state, 'go');
            vm.cancel();

            expect(state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates.configure.columns');
        });

        it('should change template to previous template when template changed', function() {
            spyOn(state, 'go');
            var previousTemplate = angular.copy(vm.template);
            vm.template.columnsMap.stockOnHand.displayOrder = 9999;
            vm.template.populateStockOnHandFromStockCards = true;
            vm.cancel();

            expect(vm.template).toEqual(previousTemplate);
        });
    });

    describe('preview template', function() {
        var stateGoSpy = jasmine.createSpy(),
            errorNotificationServiceSpy = jasmine.createSpy();

        beforeEach(function() {
            spyOn(notificationService, 'error').andCallFake(errorNotificationServiceSpy);

            spyOn(state, 'go').andCallFake(stateGoSpy);

            template.isValid = jasmine.createSpy().andReturn(true);
            vm.$onInit();
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
});
