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

describe('openlmis.orders.fulfillment state', function() {

    var $q, $state, state, $rootScope, requestingFacilityFactory, minimalFacilities,
        FULFILLMENT_RIGHTS, $stateParams, facilityFactory, facilities, orderRepository,
        ORDER_STATUS, programs, programService, MinimalFacilityDataBuilder, FacilityDataBuilder,
        ProgramDataBuilder, paginationService;

    beforeEach(function() {
        module('order');
        module('referencedata-facilities-permissions');
        module('referencedata-program');
        module('order-fulfillment');

        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            facilityFactory = $injector.get('facilityFactory');
            requestingFacilityFactory = $injector.get('requestingFacilityFactory');
            programService = $injector.get('programService');
            paginationService = $injector.get('paginationService');
            orderRepository = $injector.get('orderRepository');
            ORDER_STATUS = $injector.get('ORDER_STATUS');
            FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            MinimalFacilityDataBuilder = $injector.get('MinimalFacilityDataBuilder');
            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        $state.go('openlmis');
        $rootScope.$apply();

        $stateParams = {
            status: undefined,
            page: 0,
            size: 10
        };

        facilities = [
            new FacilityDataBuilder().withId('facility-1')
                .build(),
            new FacilityDataBuilder().withId('facility-2')
                .build()
        ];
        minimalFacilities = [
            new MinimalFacilityDataBuilder().withId('facility-1')
                .build(),
            new MinimalFacilityDataBuilder().withId('facility-2')
                .build(),
            new MinimalFacilityDataBuilder().withId('facility-3')
                .build()
        ];
        programs = [
            new ProgramDataBuilder().build(),
            new ProgramDataBuilder().build()
        ];

        spyOn(paginationService, 'registerUrl').andCallFake(function(stateParams, method) {
            return method(stateParams);
        });

        spyOn(facilityFactory, 'getSupervisedFacilitiesBasedOnRights').andReturn($q.when(facilities));
        spyOn(requestingFacilityFactory, 'loadRequestingFacilities').andReturn($q.when(minimalFacilities));
        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
        spyOn(orderRepository, 'searchFulfill').andReturn($q.when([]));
        // #447: ends here
        // #295: get virtual program
        spyOn(programService, 'getVirtualPrograms').andReturn($q.when(programs));
        // #295: ends here
    });

    it('should fetch a list of ordering facilities', function() {
        goToState();

        expect(getResolvedValue('orderingFacilities')).toEqual(minimalFacilities);
    });

    it('should fetch a list of supervised facilities', function() {
        goToState();

        expect(getResolvedValue('supervisedFacilities')).toEqual(facilities);
    });

    it('should fetch a list of programs', function() {
        goToState();

        expect(getResolvedValue('programs')).toEqual(programs);
    });

    it('should set FULFILLING and ORDERED statuses as default', function() {
        goToState();

        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
        expect(orderRepository.searchFulfill).toHaveBeenCalledWith({
            // #447: ends here
            requestingFacilityId: undefined,
            programId: undefined,
            // #400: Facility user partially fulfill an order and create sub-order for an requisition
            status: [ORDER_STATUS.FULFILLING, ORDER_STATUS.ORDERED, ORDER_STATUS.PARTIALLY_FULFILLED],
            // #400: ends here
            page: '0',
            size: '10',
            sort: ['createdDate,desc']
        });
    });

    it('should remove not available statuses from the url', function() {
        $stateParams.status = [ORDER_STATUS.IN_ROUTE, ORDER_STATUS.ORDERED];

        goToState();

        // #447: DDM facility can see the fulfilment which is supervised by DPM facility
        expect(orderRepository.searchFulfill).toHaveBeenCalledWith({
            // #447: ends here
            requestingFacilityId: undefined,
            programId: undefined,
            status: [ORDER_STATUS.ORDERED],
            page: '0',
            size: '10',
            sort: ['createdDate,desc']
        });
    });

    it('should require FULFILLMENT_RIGHTS right to enter', function() {
        state = $state.get('openlmis.orders.fulfillment');

        expect(state.accessRights).toEqual(
            [FULFILLMENT_RIGHTS.SHIPMENTS_VIEW, FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]
        );
    });

    function goToState() {
        $state.go('openlmis.orders.fulfillment', $stateParams);
        $rootScope.$apply();
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }
});
