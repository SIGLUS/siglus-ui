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

describe('AdminTemplateConfigureSettingsController', function() {

    var vm, template, loadingModalService, $q, $state, notificationService, rootScope,
        FacilityTypeDataBuilder, $controller, confirmService, requisitionTemplateService,
        TemplateDataBuilder, districtHospital, healthCenter, districtStore, templateFacilityTypes,
        // #163: add associate program
        ProgramDataBuilder, program, programTwo;
        // #163: ends here

    beforeEach(function() {
        module('admin-template-configure-settings');

        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            notificationService = $injector.get('notificationService');
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            rootScope = $injector.get('$rootScope');
            confirmService = $injector.get('confirmService');
            requisitionTemplateService = $injector.get('requisitionTemplateService');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            // #163: add associate program
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            // #163: ends here
        });

        districtHospital = FacilityTypeDataBuilder.buildDistrictHospital();
        healthCenter = new FacilityTypeDataBuilder().build();
        districtStore = FacilityTypeDataBuilder.buildDistrictStore();

        template = new TemplateDataBuilder().withFacilityTypes([healthCenter, districtHospital])
            .build();

        templateFacilityTypes = {};
        templateFacilityTypes[template.id] = [healthCenter, districtHospital];

        // #163: add associate program
        program = new ProgramDataBuilder().withId('program-1')
            .build();
        programTwo = new ProgramDataBuilder().withId('program-2')
            .build();
        // #163: ends here
    });

    describe('$onInit', function() {

        beforeEach(function() {
            initController();
        });

        it('should set template and facility types', function() {
            expect(vm.template).toEqual(template);
        });

        it('should set template facility types', function() {
            expect(vm.template.facilityTypes).toEqual([districtHospital, healthCenter]);
        });

        // #163: add associate program
        it('should set template associate programs', function() {
            expect(vm.template.associatePrograms).toEqual([program]);
        });
        // #163: ends here

    });

    describe('save template', function() {

        var stateGoSpy = jasmine.createSpy(),
            successNotificationServiceSpy = jasmine.createSpy(),
            errorNotificationServiceSpy = jasmine.createSpy();

        beforeEach(function() {
            initController();

            spyOn(notificationService, 'success').andCallFake(successNotificationServiceSpy);
            spyOn(notificationService, 'error').andCallFake(errorNotificationServiceSpy);

            spyOn($state, 'go').andCallFake(stateGoSpy);

            spyOn(loadingModalService, 'close');
            spyOn(loadingModalService, 'open');

            spyOn(confirmService, 'confirm').andReturn($q.resolve());

            spyOn(requisitionTemplateService, 'save').andReturn($q.resolve());
        });

        it('should not save template if confirm failed', function() {
            confirmService.confirm.andReturn($q.reject());

            vm.saveTemplate();

            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminTemplateConfigureSettings.templateSettingsSave.description',
                'adminTemplateConfigureSettings.save',
                undefined, 'adminTemplateConfigureSettings.templateSettingsSave.title'
            );

            expect(stateGoSpy).not.toHaveBeenCalled();
            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(successNotificationServiceSpy).not.toHaveBeenCalled();
        });

        it('should save template and then display success notification and change state', function() {
            vm.saveTemplate();

            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminTemplateConfigureSettings.templateSettingsSave.description',
                'adminTemplateConfigureSettings.save',
                undefined, 'adminTemplateConfigureSettings.templateSettingsSave.title'
            );

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(requisitionTemplateService.save).toHaveBeenCalledWith(template);
            expect(stateGoSpy).toHaveBeenCalled();
            expect(successNotificationServiceSpy).toHaveBeenCalledWith(
                'adminTemplateConfigureSettings.templateSettingsSave.success'
            );
        });

        it('should close loading modal if template save was unsuccessful', function() {
            requisitionTemplateService.save.andReturn($q.reject());

            vm.saveTemplate();
            rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith(
                'adminTemplateConfigureSettings.templateSettingsSave.description',
                'adminTemplateConfigureSettings.save',
                undefined, 'adminTemplateConfigureSettings.templateSettingsSave.title'
            );

            expect(loadingModalService.close).toHaveBeenCalled();
            expect(requisitionTemplateService.save).toHaveBeenCalledWith(template);
            expect(errorNotificationServiceSpy).toHaveBeenCalledWith(
                'adminTemplateConfigureSettings.templateSettingsSave.failure'
            );
        });
    });

    describe('add', function() {

        beforeEach(function() {
            initController();
            vm.facilityType = districtStore;
        });

        it('should add facility type to template facility types', function() {
            vm.add();
            rootScope.$apply();

            expect(vm.template.facilityTypes).toEqual([districtHospital, districtStore, healthCenter]);
        });

        it('should remove facility type from available facility types', function() {
            vm.add();
            rootScope.$apply();

            expect(vm.facilityTypes).toEqual([]);
        });
    });

    describe('remove', function() {

        beforeEach(function() {
            initController();
            vm.facilityType = healthCenter;
        });

        it('should remove facility type from template facility types', function() {
            vm.remove(healthCenter);
            rootScope.$apply();

            expect(vm.template.facilityTypes).toEqual([districtHospital]);
        });

        it('should add facility type to available facility types', function() {
            vm.remove(districtHospital);
            rootScope.$apply();

            expect(vm.facilityTypes).toEqual([districtHospital, districtStore]);
        });
    });

    // #163: add associate program
    describe('addAssociateProgram', function() {

        beforeEach(function() {
            initController();
            vm.associateProgram = programTwo;
        });

        it('should add facility type to template facility types', function() {
            vm.addAssociateProgram();
            rootScope.$apply();

            expect(vm.template.associatePrograms).toEqual([program, programTwo]);
        });

        it('should remove facility type from available facility types', function() {
            vm.addAssociateProgram();
            rootScope.$apply();

            expect(vm.associatePrograms).toEqual([]);
        });
    });

    describe('removeAssociateProgram', function() {

        beforeEach(function() {
            initController();
        });

        it('should remove facility type from template facility types', function() {
            vm.removeAssociateProgram(program);
            rootScope.$apply();

            expect(vm.template.associatePrograms).toEqual([]);
        });

        it('should add facility type to available facility types', function() {
            vm.removeAssociateProgram(program);
            rootScope.$apply();

            expect(vm.associatePrograms).toEqual([programTwo, program]);
        });
    });
    // #163: ends here

    describe('goToTemplateList', function() {

        beforeEach(function() {
            initController();
        });

        it('should go to the template list', function() {
            spyOn($state, 'go');

            vm.goToTemplateList();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates', {}, {
                reload: true
            });
        });
    });

    function initController() {
        vm = $controller('AdminTemplateConfigureSettingsController', {
            template: template,
            availableFacilityTypes: [districtStore],
            templateFacilityTypes: templateFacilityTypes,
            // #163: add associate program
            availableAssociatePrograms: [programTwo],
            templateAssociatePrograms: [program]
            // #163: ends here
        });

        vm.$onInit();
    }

});
