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

describe('siglusAddAdditionalProductModalStateProvider', function() {

    beforeEach(function() {
        var context = this;
        module('openlmis-modal-state', function(modalStateProvider, $stateProvider) {
            context.modalStateProvider = modalStateProvider;
            context.$stateProvider = $stateProvider;
        });

        module('siglus-add-additional-product-modal', function(siglusAddAdditionalProductModalStateProvider) {
            context.siglusAddAdditionalProductModalStateProvider = siglusAddAdditionalProductModalStateProvider;
        });
        module('select-products-modal');
        module('openlmis-pagination');

        inject(function($injector) {
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.SiglusAdditionalOrderableResource = $injector.get('SiglusAdditionalOrderableResource');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.$state = $injector.get('$state');
            this.$q = $injector.get('$q');
            this.paginationService = $injector.get('paginationService');
            this.programService = $injector.get('programService');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        this.orderables = [
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        this.orderablesPage = new this.PageDataBuilder()
            .withContent(this.orderables)
            .build();

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        spyOn(this.paginationService, 'registerUrl').andCallFake(function(stateParams, method) {
            return method(stateParams);
        });
        spyOn(this.SiglusAdditionalOrderableResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.orderablesPage));
        spyOn(this.modalStateProvider, 'state').andCallFake(function(stateName, config) {
            context.config = config;
            context.stateName = stateName;
            return context;
        });
    });

    describe('stateWithAddAdditionalProductChildState', function() {

        beforeEach(function() {
            this.siglusAddAdditionalProductModalStateProvider.stateWithAddAdditionalProductChildState('main', {
                url: '/main'
            });

        });

        it('should set controller', function() {
            expect(this.config.controller).toBe('SiglusAddAdditionalProductModalController');
        });

        it('should set controllerAs', function() {
            expect(this.config.controllerAs).toBe('vm');
        });

        it('should set templateUrl', function() {
            expect(this.config.templateUrl)
                .toBe('siglus-add-additional-product-modal/siglus-add-additional-product-modal.html');
        });

        it('should set nonTrackable', function() {
            expect(this.config.nonTrackable).toBeTruthy();
        });

        it('should set params', function() {
            expect(this.config.params.addAdditionalProductPage).toBeUndefined();
            expect(this.config.params.addAdditionalProductSize).toBeUndefined();
            expect(this.config.params.productName).toBeUndefined();
            expect(this.config.params.productCode).toBeUndefined();
        });

        it('should resolve matching orderables', function() {
            this.$state.params = {
                page: 0,
                size: 10
            };

            this.config.resolve.orderables(this.paginationService,
                this.$state.params, this.SiglusAdditionalOrderableResource, this.programs);

            expect(this.SiglusAdditionalOrderableResource.prototype.query).toHaveBeenCalled();
        });

    });

});
