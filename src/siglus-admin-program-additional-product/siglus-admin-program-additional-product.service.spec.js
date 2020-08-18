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

describe('siglusAdminProgramAdditionalProductService', function() {

    var siglusAdminProgramAdditionalProductService, $rootScope, $httpBackend, requisitionUrlFactory, PageDataBuilder;

    beforeEach(function() {
        module('siglus-admin-program-additional-product');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $httpBackend = $injector.get('$httpBackend');
            siglusAdminProgramAdditionalProductService = $injector.get('siglusAdminProgramAdditionalProductService');
            requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            PageDataBuilder = $injector.get('PageDataBuilder');
        });
    });

    describe('search', function() {

        var searchParams, programId, page;

        beforeEach(function() {
            programId = 'some-program-id';

            searchParams = {
                programId: programId
            };

            page = PageDataBuilder.buildWithContent([
            ]);

            $httpBackend.whenGET(requisitionUrlFactory('/api/siglusapi/programadditionalorderables?programId='
                + programId))
                .respond(200, page);
        });

        it('should call /api/siglusapi/programadditionalorderables endpoint', function() {
            $httpBackend.expectGET(requisitionUrlFactory('/api/siglusapi/programadditionalorderables?programId='
                + programId));

            siglusAdminProgramAdditionalProductService.search(searchParams);

            $httpBackend.flush();
        });

        it('should return page', function() {
            var result;
            siglusAdminProgramAdditionalProductService.search(searchParams)
                .then(function(page) {
                    result = page;
                });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(page));
        });

    });

    describe('addAdditionalProducts', function() {

        var addParams;

        beforeEach(function() {
            addParams = [{
                programId: 'some-program-id'
            }];

            $httpBackend.whenPOST(requisitionUrlFactory('/api/siglusapi/programadditionalorderables'))
                .respond(200, {});
        });

        it('should call /api/siglusapi/programadditionalorderables endpoint', function() {
            $httpBackend.expectPOST(requisitionUrlFactory('/api/siglusapi/programadditionalorderables'));

            var result;
            siglusAdminProgramAdditionalProductService.addAdditionalProducts(addParams).then(function(response) {
                result = response;
            });

            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });
    });

    describe('remove', function() {

        var someId;

        beforeEach(function() {
            someId = 'some-orderable-id';

            $httpBackend.whenDELETE(
                requisitionUrlFactory('api/siglusapi/programadditionalorderables/' + someId)
            ).respond(200, {});
        });

        it('should call api/siglusapi/programadditionalorderables/ endpoint', function() {
            $httpBackend.whenDELETE(
                requisitionUrlFactory('api/siglusapi/programadditionalorderables/' + someId)
            );

            var result;
            siglusAdminProgramAdditionalProductService.remove(someId).then(function(response) {
                result = response;
            });
            $httpBackend.flush();
            $rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
