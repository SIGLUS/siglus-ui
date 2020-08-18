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

describe('SiglusAdminProgramAdditionalProductController', function() {

    var $q, $state, $controller, $rootScope, confirmService, loadingModalService, notificationService,
        ProgramDataBuilder, vm, programs, stateParams, additionalProducts, siglusAdminProgramAdditionalProductService,
        selectProductsModalService;

    beforeEach(function() {
        module('siglus-admin-program-additional-product');
        module('referencedata-program');

        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            confirmService = $injector.get('confirmService');
            loadingModalService = $injector.get('loadingModalService');
            siglusAdminProgramAdditionalProductService = $injector.get('siglusAdminProgramAdditionalProductService');
            notificationService = $injector.get('notificationService');
            selectProductsModalService = $injector.get('selectProductsModalService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        programs = [
            new ProgramDataBuilder().withId('program-1')
                .build(),
            new ProgramDataBuilder().withId('program-2')
                .build()
        ];

        stateParams = {
            code: undefined,
            name: undefined,
            orderableOriginProgramId: 'program-1'
        };

        additionalProducts = [
            {
                id: 'product-1',
                orderableOriginProgramId: 'program-1'
            },
            {
                id: 'product-2',
                orderableOriginProgramId: 'program-2'
            }
        ];

        vm = $controller('SiglusAdminProgramAdditionalProductController', {
            $stateParams: stateParams,
            allPrograms: programs,
            additionalProducts: additionalProducts
        });
        vm.$onInit();

        spyOn($state, 'go').andReturn();
    });

    describe('onInit', function() {

        it('should set allPrograms', function() {
            expect(vm.allPrograms).toEqual(programs);
        });

        it('should set additionalProducts', function() {
            expect(vm.additionalProducts).toEqual([
                {
                    id: 'product-1',
                    orderableOriginProgramId: 'program-1',
                    program: programs[0]
                },
                {
                    id: 'product-2',
                    orderableOriginProgramId: 'program-2',
                    program: programs[1]
                }
            ]);
        });

        it('should set productCode', function() {
            expect(vm.productCode).toBeUndefined();
        });

        it('should set productName', function() {
            expect(vm.productName).toBeUndefined();
        });

        it('should set additionalProductsProgram', function() {
            expect(vm.additionalProductsProgram).toEqual(programs[0]);
        });

    });

    describe('search', function() {

        it('should set code', function() {
            vm.productCode = 'product-one';

            vm.search();

            expect($state.go)
                .toHaveBeenCalledWith('openlmis.administration.programs.settings.additionalProducts', {
                    code: 'product-one',
                    name: null,
                    orderableOriginProgramId: 'program-1'
                }, {
                    reload: true
                });
        });

        it('should set name', function() {
            vm.productName = 'product-name';

            vm.search();

            expect($state.go)
                .toHaveBeenCalledWith('openlmis.administration.programs.settings.additionalProducts', {
                    code: null,
                    name: 'product-name',
                    orderableOriginProgramId: 'program-1'
                }, {
                    reload: true
                });
        });

        it('should set orderableOriginProgramId', function() {
            vm.additionalProductsProgram = {
                id: 'program-1'
            };

            vm.search();

            expect($state.go)
                .toHaveBeenCalledWith('openlmis.administration.programs.settings.additionalProducts', {
                    code: null,
                    name: null,
                    orderableOriginProgramId: 'program-1'
                }, {
                    reload: true
                });
        });

    });

    describe('addAdditionalProducts', function() {

        beforeEach(function() {
            spyOn(selectProductsModalService, 'show').andReturn($q.resolve());
        });

        it('should call selectProductsModalService show', function() {

            vm.addAdditionalProducts();
            $rootScope.$apply();

            expect(selectProductsModalService.show).toHaveBeenCalled();
        });

    });

    describe('remove', function() {

        beforeEach(function() {
            spyOn(confirmService, 'confirm').andReturn($q.resolve());
            spyOn(loadingModalService, 'open').andReturn($q.resolve());
            spyOn(loadingModalService, 'close').andReturn($q.resolve());
            spyOn(notificationService, 'success').andReturn($q.resolve());
            spyOn(notificationService, 'error').andReturn($q.resolve());
        });

        it('should call notificationService success', function() {
            spyOn(siglusAdminProgramAdditionalProductService, 'remove').andReturn($q.resolve());
            var additionalProduct = {
                id: 'product-1'
            };

            vm.remove(additionalProduct);
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalled();
            expect(siglusAdminProgramAdditionalProductService.remove).toHaveBeenCalledWith('product-1');
            expect(loadingModalService.open).toHaveBeenCalled();
            expect(notificationService.success)
                .toHaveBeenCalledWith('adminProgramAdditionalProducts.productHasBeenRemoved');
        });

        it('should call notificationService error', function() {
            spyOn(siglusAdminProgramAdditionalProductService, 'remove').andReturn($q.reject());
            var additionalProduct = {
                id: 'product-1'
            };

            vm.remove(additionalProduct);
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalled();
            expect(siglusAdminProgramAdditionalProductService.remove).toHaveBeenCalledWith('product-1');
            expect(loadingModalService.open).toHaveBeenCalled();
            expect(loadingModalService.close).toHaveBeenCalled();
            expect(notificationService.error)
                .toHaveBeenCalledWith('adminProgramAdditionalProducts.failedToRemoveProduct');
        });

    });

});
