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

describe('openlmis.requisitions.initRnr.requisition state', function() {

    var $q, $state, $rootScope, $stateParams, requisitionInitiateFactory, PeriodDataBuilder, periods,
        periodFactory, siglusRequisitionInitiateService, authorizationService, programService;

    beforeEach(function() {
        module('referencedata-period');
        module('requisition-initiate');

        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            periodFactory = $injector.get('periodFactory');
            PeriodDataBuilder = $injector.get('PeriodDataBuilder');
            requisitionInitiateFactory = $injector.get('requisitionInitiateFactory');
            siglusRequisitionInitiateService = $injector.get('siglusRequisitionInitiateService');
            authorizationService = $injector.get('authorizationService');
            programService = $injector.get('programService');
        });

        $state.go('openlmis');
        $rootScope.$apply();

        $stateParams = {
            facility: 'facility-id',
            program: 'program-id'
        };

        periods = [
            new PeriodDataBuilder().build(),
            new PeriodDataBuilder().build()
        ];

        spyOn(requisitionInitiateFactory, 'canInitiate').andReturn($q.resolve(true));
        spyOn(periodFactory, 'get').andReturn($q.resolve(periods));
        spyOn(siglusRequisitionInitiateService, 'getPhysicalInventoryDates').andReturn($q.resolve([]));
        spyOn(authorizationService, 'getUser').andReturn($q.resolve({}));
        spyOn(programService, 'get').andReturn($q.resolve([]));
        spyOn(authorizationService, 'hasRight').andReturn($q.resolve(true));
    });

    describe('periods resolve', function() {

        it('should return undefined if program is not set', function() {
            $stateParams.program = undefined;

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('periods')).toEqual([]);
        });

        it('should return undefined if facility is not set', function() {
            $stateParams.facility = undefined;

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('periods')).toEqual([]);
        });

        it('should prevent state change if periods download fails', function() {
            periodFactory.get.andReturn($q.reject());

            goToState();

            expect($state.current.name).not.toEqual('openlmis.requisitions.initRnr.requisition');
        });

        it('should fetch periods', function() {
            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('periods')).toEqual(periods);
            expect(periodFactory.get).toHaveBeenCalledWith(
                $stateParams.program,
                $stateParams.facility,
                false
            );
        });

        it('should fetch emergency periods', function() {
            $stateParams.emergency = 'true';

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('periods')).toEqual(periods);
            expect(periodFactory.get).toHaveBeenCalledWith(
                $stateParams.program,
                $stateParams.facility,
                true
            );
        });

    });

    describe('canInitiateRnr', function() {

        it('should return false if program is not given', function() {
            $stateParams.program = undefined;

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('canInitiateRnr')).toEqual(false);
        });

        it('should return false if facility is not given', function() {
            $stateParams.facility = undefined;

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('canInitiateRnr')).toEqual(false);
        });

        it('should return true if user can initiate requisitions', function() {
            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('canInitiateRnr')).toEqual(true);
            expect(requisitionInitiateFactory.canInitiate).toHaveBeenCalledWith(
                $stateParams.program, $stateParams.facility
            );
        });

        it('should return false if user can not initiate requisitions', function() {
            requisitionInitiateFactory.canInitiate.andReturn($q.resolve(false));

            goToState();

            expect($state.current.name).toEqual('openlmis.requisitions.initRnr.requisition');
            expect(getResolvedValue('canInitiateRnr')).toEqual(false);
            expect(requisitionInitiateFactory.canInitiate).toHaveBeenCalledWith(
                $stateParams.program, $stateParams.facility
            );
        });

    });

    function goToState() {
        $state.go('openlmis.requisitions.initRnr.requisition', $stateParams);
        $rootScope.$apply();
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

});
