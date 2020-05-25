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

describe('requisitionTemplateService', function() {

    var rootScope, httpBackend, requisitionTemplateService, requisitionUrlFactory, template1, template2,
        TemplateDataBuilder, ProgramDataBuilder, program1, program2;

    beforeEach(function() {
        module('admin-template-configure-columns');
        module('referencedata-program');

        inject(function($injector) {
            httpBackend = $injector.get('$httpBackend');
            rootScope = $injector.get('$rootScope');
            requisitionTemplateService = $injector.get('requisitionTemplateService');
            requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        program1 = new ProgramDataBuilder().build();
        program2 = new ProgramDataBuilder().build();
        template1 = new TemplateDataBuilder().withProgram(program1)
            .build();
        template2 = new TemplateDataBuilder().withProgram(program2)
            .build();
    });

    it('should get requisition template by id', function() {
        var data;

        // SIGLUS-REFACTOR: starts here
        httpBackend.when('GET', requisitionUrlFactory('/api/siglusapi/requisitionTemplates/' + template1.id))
            .respond(200, template1);
        // SIGLUS-REFACTOR: ends here

        requisitionTemplateService.get(template1.id).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        rootScope.$apply();

        expect(data.id).toEqual(template1.id);
        expect(data.programId).toEqual(template1.programId);
    });

    it('should get all requisition templates', function() {
        var data;

        httpBackend.when('GET', requisitionUrlFactory('/api/requisitionTemplates'))
            .respond(200, [template1, template2]);

        requisitionTemplateService.getAll().then(function(response) {
            data = response;
        });

        httpBackend.flush();
        rootScope.$apply();

        expect(data[0].id).toEqual(template1.id);
        expect(data[0].program.id).toEqual(template1.program.id);
        expect(data[1].id).toEqual(template2.id);
        expect(data[1].program.id).toEqual(template2.program.id);
    });

    it('should search requisition template by program id', function() {
        var data;

        httpBackend.when(
            'GET', requisitionUrlFactory('/api/requisitionTemplates/search?program=' + template2.program.id)
        ).respond(200, template2);

        requisitionTemplateService.search(template2.program.id).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        rootScope.$apply();

        expect(data.id).toEqual(template2.id);
        expect(data.programId).toEqual(template2.programId);
    });

    it('should saves requisition template', function() {
        var data;

        // SIGLUS-REFACTOR: starts here
        httpBackend.when('PUT', requisitionUrlFactory('/api/siglusapi/requisitionTemplates/' + template1.id))
            .respond(200, template1);
        // SIGLUS-REFACTOR: ends here

        requisitionTemplateService.save(template1).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        rootScope.$apply();

        expect(data.id).toEqual(template1.id);
        expect(data.programId).toEqual(template1.programId);
    });

    it('should create requisition template', function() {
        var data,
            template2 = new TemplateDataBuilder().withProgram(program2)
                .withoutId()
                .build();

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitionTemplates'))
            .respond(201, template2);

        requisitionTemplateService.create(template2).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        rootScope.$apply();

        expect(data.programId).toEqual(template2.programId);
    });

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
});
