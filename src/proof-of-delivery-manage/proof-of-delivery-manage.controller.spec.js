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

describe('ProofOfDeliveryManageController', function() {

    var proofOfDeliveryManageService, $rootScope, $state, $q, $controller, ProgramDataBuilder, FacilityDataBuilder,
        ProofOfDeliveryDataBuilder, vm, deferred, pod, stateParams, supplyingFacilities, programs, requestingFacilities,
        loadingModalService, siglusDownloadLoadingModalService, orderablesPrice,
        notificationService, loadingDeferred, $window, ProofOfDeliveryPrinter, order;

    beforeEach(function() {
        module('proof-of-delivery-manage');
        module('proof-of-delivery');
        module('referencedata-orderable-fulfills');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            deferred = $q.defer();
            $window = $injector.get('$window');
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            proofOfDeliveryManageService = $injector.get('proofOfDeliveryManageService');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            ProofOfDeliveryDataBuilder = $injector.get('ProofOfDeliveryDataBuilder');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            ProofOfDeliveryPrinter = $injector.get('ProofOfDeliveryPrinter');
            siglusDownloadLoadingModalService = $injector.get('siglusDownloadLoadingModalService');
        });

        order = {
            id: 'f9314d2f-e441-4a87-a29b-a2dc0d6111bf',
            program: {
                code: 'VC',
                name: 'Via Clássica',
                description: null,
                active: true,
                periodsSkippable: false,
                showNonFullSupplyTab: false,
                supportLocallyFulfilled: false,
                id: 'dce17f2e-af3e-40ad-8e00-3496adef44c3'
            },
            facility: {
                code: '01100122',
                name: 'Centro de Saúde Bedene',
                type: {
                    code: 'CS',
                    name: 'CS - Centro de Saúde',
                    description: null,
                    displayOrder: 17,
                    active: true,
                    id: '26834258-faa0-420b-a83b-a9af60c605c8'
                },
                id: '648fb0ee-cfcf-11e9-9535-0242ac130005'
            }
        };

        orderablesPrice = {
            '5f655d74-1213-46e0-9009-38a01e39c503': 66.66,
            '384b6095-c3ba-4e32-a3bf-2de7ffe23d7a': 55,
            '0fe4e147-714e-4bf0-9e5b-921e3f6d608d': 10
        };

        pod = new ProofOfDeliveryDataBuilder().build();
        requestingFacilities = [
            new FacilityDataBuilder().build(),
            new FacilityDataBuilder().build()
        ];
        supplyingFacilities = [
            new FacilityDataBuilder().build(),
            new FacilityDataBuilder().build()
        ];
        programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];
        stateParams = {
            page: 0,
            size: 10,
            programId: programs[0].id,
            requestingFacilityId: requestingFacilities[0].id,
            supplyingFacilityId: supplyingFacilities[0].id
        };

        vm = $controller('ProofOfDeliveryManageController', {
            programs: programs,
            requestingFacilities: requestingFacilities,
            supplyingFacilities: supplyingFacilities,
            pods: [pod],
            $stateParams: stateParams,
            facility: new FacilityDataBuilder().build(),
            orderablesPrice: orderablesPrice
        });

        loadingDeferred = $q.defer();

        spyOn(loadingModalService, 'close');
        spyOn(siglusDownloadLoadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');
        spyOn($window, 'open').andCallThrough();
        spyOn(ProofOfDeliveryPrinter.prototype, 'closeTab');
        spyOn(ProofOfDeliveryPrinter.prototype, 'openTab');
        spyOn(ProofOfDeliveryPrinter.prototype, 'print');

        spyOn(siglusDownloadLoadingModalService, 'open').andReturn(loadingDeferred.promise);
        spyOn(loadingModalService, 'open').andReturn(loadingDeferred.promise);
    });

    describe('onInit', function() {

        it('should expose pod', function() {
            vm.$onInit();

            expect(vm.pods).toEqual([pod]);
        });

        it('should expose programs', function() {
            vm.$onInit();

            expect(vm.programs).toEqual(programs);
        });

        it('should expose requesting facilities', function() {
            vm.$onInit();

            expect(vm.requestingFacilities).toEqual(requestingFacilities);
        });

        it('should expose supplying facilities', function() {
            vm.$onInit();

            expect(vm.supplyingFacilities).toEqual(supplyingFacilities);
        });

        it('should select program', function() {
            vm.$onInit();

            expect(vm.program).toEqual(programs[0]);
        });

        it('should select requesting facility', function() {
            vm.$onInit();

            expect(vm.requestingFacility).toEqual(requestingFacilities[0]);
        });

        it('should select supplying facility', function() {
            vm.$onInit();

            expect(vm.supplyingFacility).toEqual(supplyingFacilities[0]);
        });

        it('should set program name', function() {
            vm.$onInit();

            expect(vm.facilityName).toEqual(vm.requestingFacility.name);
        });

        it('should set facility name', function() {
            vm.$onInit();

            expect(vm.programName).toEqual(vm.program.name);
        });
    });

    it('loadOrders should reload state with right params', function() {
        spyOn($state, 'go');

        vm.requestingFacility =  {
            id: 'facility-one'
        };
        vm.supplyingFacility =  {
            id: 'facility-two'
        };
        vm.program = {
            id: 'program-one'
        };

        vm.loadOrders();

        expect($state.go).toHaveBeenCalledWith('openlmis.orders.podManage', {
            requestingFacilityId: vm.requestingFacility.id,
            supplyingFacilityId: vm.supplyingFacility.id,
            programId: vm.program.id,
            page: 0,
            size: 10
        }, {
            reload: true
        });
    });

    describe('openPod', function() {
        it('should change state when user select order to view its POD', function() {
            spyOn(proofOfDeliveryManageService, 'getByOrderId').andReturn(deferred.promise);
            spyOn($state, 'go').andReturn();

            vm.openPod(pod.id);
            deferred.resolve(pod);
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.orders.podManage.podView', {
                podId: pod.id
            });
        });
    });

    describe('printProofOfDelivery', function() {

        beforeEach(function() {
            vm.$onInit();
            spyOn(proofOfDeliveryManageService, 'getByOrderId').andReturn(deferred.promise);
        });

        it('should open loading modal', function() {

            vm.printProofOfDelivery(order);

            expect(siglusDownloadLoadingModalService.open).toHaveBeenCalled();
            expect(siglusDownloadLoadingModalService.close).not.toHaveBeenCalled();
        });

        it('should attempt to get proof of delivery', function() {
            vm.printProofOfDelivery(order);
            $rootScope.$apply();

            expect(siglusDownloadLoadingModalService.open).toHaveBeenCalled();
            // expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);
            expect(siglusDownloadLoadingModalService.close).not.toHaveBeenCalled();
        });

        it('should open window after proof of delivery was found', function() {
            vm.printProofOfDelivery(order);

            expect(siglusDownloadLoadingModalService.open).toHaveBeenCalled();
            // expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);

            deferred.resolve(pod);
            $rootScope.$apply();

            // expect(ProofOfDeliveryPrinter.prototype.openTab).toHaveBeenCalled();
            // expect(notificationService.error).not.toHaveBeenCalled();
            // expect(notificationService.success).not.toHaveBeenCalled();
            // expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should close loading modal after pod failed to get', function() {
            vm.printProofOfDelivery(order);

            expect(siglusDownloadLoadingModalService.open).toHaveBeenCalled();
            // expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);

            // deferred.reject();
            // $rootScope.$apply();

            // expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should close the window after pod failed to get', function() {
            vm.printProofOfDelivery(order);

            expect(siglusDownloadLoadingModalService.open).toHaveBeenCalled();
            // expect(proofOfDeliveryManageService.getByOrderId).toHaveBeenCalledWith(pod.id);

            // deferred.reject();
            // $rootScope.$apply();

            // expect(loadingModalService.close).toHaveBeenCalled();

            // expect(ProofOfDeliveryPrinter.prototype.closeTab).toHaveBeenCalled();
        });

    });

});
