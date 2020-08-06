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

describe('siglusAddRegimensModalStateProvider', function() {

    beforeEach(function() {
        var context = this;
        module('openlmis-modal-state', function(modalStateProvider) {
            context.modalStateProvider = modalStateProvider;
        });

        module('siglus-add-regimen-model', function(siglusAddRegimensModalStateProvider) {
            context.siglusAddRegimensModalStateProvider = siglusAddRegimensModalStateProvider;
        });

        module('openlmis-pagination');

        inject(function($injector) {
            this.selectProductsModalService = $injector.get('selectProductsModalService');
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.$state = $injector.get('$state');
            this.paginationService = $injector.get('paginationService');
        });

        this.orderables = [
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        spyOn(this.selectProductsModalService, 'getOrderables').andReturn();

        spyOn(this.modalStateProvider, 'state').andCallFake(function(stateName, config) {
            context.config = config;
            context.stateName = stateName;
            return context;
        });
    });

    describe('stateWithAddRegimensChildState', function() {

        beforeEach(function() {
            this.siglusAddRegimensModalStateProvider.stateWithAddRegimensChildState('main', {
                url: '/main'
            });

        });

        it('should set controller', function() {
            expect(this.config.controller).toBe('SelectProductsModalController');
        });

        it('should set controllerAs', function() {
            expect(this.config.controllerAs).toBe('vm');
        });

        it('should set templateUrl', function() {
            expect(this.config.templateUrl).toBe('siglus-add-regimen-model/siglus-add-regimen-model.html');
        });

        it('should set nonTrackable', function() {
            expect(this.config.nonTrackable).toBeTruthy();
        });

        it('should set params', function() {
            expect(this.config.params.addRegimensPage).toBeUndefined();
            expect(this.config.params.addRegimensSize).toBeUndefined();
            expect(this.config.params.productCode).toBeUndefined();
        });

        it('should resolve external as false', function() {
            var result = this.config.resolve.external();

            expect(result).toBeFalsy();
        });

        it('should resolve isUnpackKitState as false', function() {
            var result = this.config.resolve.isUnpackKitState();

            expect(result).toBeFalsy();
        });

        it('should resolve matching orderables', function() {
            this.search = 'search text';
            this.$state.params = {
                page: 0,
                size: 10,
                search: this.search
            };

            this.selectProductsModalService.getOrderables.andReturn();

            this.config.resolve.orderables(this.paginationService,
                this.$state.params, this.selectProductsModalService);

            expect(this.selectProductsModalService.getOrderables).toHaveBeenCalled();
        });

    });

});
