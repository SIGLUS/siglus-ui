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

describe('SiglusHistoryViewTabController', function() {

    beforeEach(function() {
        module('requisition-view');

        var RequisitionLineItemDataBuilder, RequisitionDataBuilder;
        inject(function($injector) {
            RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');

            this.$window = $injector.get('$window');
            this.$rootScope = $injector.get('$rootScope');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            this.$controller = $injector.get('$controller');
        });

        var requisitionDataBuilder = new RequisitionDataBuilder();
        this.requisition = requisitionDataBuilder
            .withRequisitionLineItems([
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(requisitionDataBuilder.program)
                    .buildJson()
            ])
            .build();

        this.initController = initController;
    });

    describe('$onInit', function() {

        it('should bind requisition property to vm', function() {
            this.initController();

            expect(this.vm.requisition).toBe(this.requisition);
        });

        it('should bind program property to vm', function() {
            this.initController();

            expect(this.vm.program).toEqual({});
        });

        it('should bind facility property to vm', function() {
            this.initController();

            expect(this.vm.facility).toEqual({});
        });

        it('should bind processingPeriod property to vm', function() {
            this.initController();

            expect(this.vm.processingPeriod).toEqual({});
        });

        it('should bind lineItems property to vm', function() {
            this.initController();

            expect(this.vm.lineItems).toEqual([]);
        });

        it('should bind columns property to vm', function() {
            this.initController();

            expect(this.vm.columns).toEqual([]);
        });

        it('should bind backToPrevious property to vm', function() {
            this.initController();

            expect(this.vm.backToPrevious).not.toBeUndefined();
        });

        it('should set requisitionTypeClass to regular', function() {
            this.initController();

            expect(this.vm.requisitionTypeClass).toBe('regular');
        });

        it('should set requisitionTypeClass to emergency when is emergency requisition', function() {
            this.requisition.emergency = true;
            this.initController();

            expect(this.vm.requisitionTypeClass).toBe('emergency');
        });

        it('should set requisitionTypeClass to emergency when is reportOnly requisition', function() {
            this.requisition.reportOnly = true;
            this.initController();

            expect(this.vm.requisitionTypeClass).toBe('report-only');
        });
    });

    describe('print', function() {
        it('should open window with report when sync succeeded', function() {
            spyOn(this.$window, 'open');
            spyOn(this.accessTokenFactory, 'addAccessToken').andReturn('token');
            this.initController();
            this.vm.print();
            this.$rootScope.$apply();

            expect(this.$window.open).toHaveBeenCalledWith('token', '_blank');
            expect(this.accessTokenFactory.addAccessToken)
                .toHaveBeenCalledWith(this.requisitionUrlFactory('/api/siglusapi/requisitions/requisition-id-1/print'));
        });
    });

    function initController() {
        this.vm = this.$controller('SiglusHistoryViewTabController', {
            lineItems: [],
            columns: [],
            requisition: this.requisition,
            facility: {},
            program: {},
            processingPeriod: {}
        });
        this.vm.$onInit();
    }

});
