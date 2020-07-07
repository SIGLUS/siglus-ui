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

describe('openlmis.orders.podManage state', function() {

    var $q, $state, $rootScope, $location, $templateCache, orderRepository, paginationService, programService,
        facilityFactory, authorizationService, FULFILLMENT_RIGHTS, ProofOfDeliveryDataBuilder, ProgramDataBuilder,
        FacilityDataBuilder, pods, programs, requestingFacilities, supplyingFacilities, state;

    beforeEach(function() {
        loadModules();
        injectServices();
        prepareTestData();
        prepareSpies();
    });

    it('should be available under \'orders/manage\'', function() {
        expect($state.current.name).not.toEqual('openlmis.orders.podManages');

        goToUrl('/orders/manage');

        expect($state.current.name).toEqual('openlmis.orders.podManage');
    });

    it('should resolve programs', function() {
        goToUrl('/orders/manage?page=0&size=10');

        expect(getResolvedValue('programs')).toEqual(programs);
    });

    it('should resolve requesting facilities', function() {
        goToUrl('/orders/manage?page=0&size=10');

        expect(getResolvedValue('requestingFacilities')).toEqual(requestingFacilities);
    });

    it('should resolve supplying facilities', function() {
        goToUrl('/orders/manage?page=0&size=10');

        expect(getResolvedValue('supplyingFacilities')).toEqual(supplyingFacilities);
    });

    it('should resolve pods', function() {
        goToUrl('/orders/manage?page=0&size=10&programId=program-id&requestingFacilityId=facility-id');

        expect(getResolvedValue('pods')).toEqual({
            content: pods
        });
    });

    it('should resolve pods with default selection when lists have 1 element', function() {
        programService.getUserPrograms.andReturn($q.when([programs[0]]));
        requestingFacilities = [requestingFacilities[0]];
        supplyingFacilities = [supplyingFacilities[0]];

        goToUrl('/orders/manage?page=0&size=10');

        expect(getResolvedValue('pods')).toEqual({
            content: pods
        });

        // #370: sort the pod with status and created date
        expect(orderRepository.searchOrdersForManagePod).toHaveBeenCalledWith({
            page: '0',
            size: '10',
            programId: programs[0].id,
            requestingFacilityId: requestingFacilities[0].id,
            supplyingFacilityId: supplyingFacilities[0].id,
            sort : 'status,createdDate'
        });
        // #370: ends here
    });

    it('should use template', function() {
        spyOn($templateCache, 'get').andCallThrough();

        goToUrl('/orders/manage');

        expect($templateCache.get).toHaveBeenCalledWith('proof-of-delivery-manage/proof-of-delivery-manage.html');
    });

    it('should require requisition create and pods manage rights to enter', function() {
        expect(state.accessRights).toEqual([
            FULFILLMENT_RIGHTS.PODS_MANAGE,
            FULFILLMENT_RIGHTS.PODS_VIEW,
            FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
        ]);
    });

    function loadModules() {
        module('proof-of-delivery-manage');
    }

    function injectServices() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $templateCache = $injector.get('$templateCache');
            orderRepository = $injector.get('orderRepository');
            paginationService = $injector.get('paginationService');
            programService = $injector.get('programService');
            facilityFactory = $injector.get('facilityFactory');
            authorizationService = $injector.get('authorizationService');
            FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            ProofOfDeliveryDataBuilder = $injector.get('ProofOfDeliveryDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
        });
    }

    function prepareTestData() {
        state = $state.get('openlmis.orders.podManage');
        pods = [
            new ProofOfDeliveryDataBuilder().build(),
            new ProofOfDeliveryDataBuilder().build(),
            new ProofOfDeliveryDataBuilder().build()
        ];
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
    }

    function prepareSpies() {
        spyOn(orderRepository, 'searchOrdersForManagePod').andReturn($q.when({
            content: pods
        }));
        spyOn(programService, 'getUserPrograms').andReturn($q.when(programs));
        spyOn(facilityFactory, 'getSupervisedFacilitiesBasedOnRights').andCallFake(function(rights) {
            if (rights.indexOf(FULFILLMENT_RIGHTS.SHIPMENTS_EDIT) > -1 &&
                rights.indexOf(FULFILLMENT_RIGHTS.SHIPMENTS_VIEW) > -1) {
                return $q.resolve(supplyingFacilities);
            } else if (rights.indexOf(FULFILLMENT_RIGHTS.PODS_MANAGE) > -1 &&
                rights.indexOf(FULFILLMENT_RIGHTS.PODS_VIEW) > -1) {
                return $q.resolve(requestingFacilities);
            }
            return $q.when([]);
        });
        spyOn(authorizationService, 'getUser').andReturn($q.when({
            //eslint-disable-next-line camelcase
            user_id: 'user-id'
        }));
        spyOn(paginationService, 'registerUrl').andCallFake(function(stateParams, method) {
            return method(stateParams);
        });
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }
});