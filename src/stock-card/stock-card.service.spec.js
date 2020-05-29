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

describe('stockCardService', function() {

    beforeEach(function() {
        module('stock-card');
        module('referencedata-lot');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$httpBackend = $injector.get('$httpBackend');
            this.stockCardService = $injector.get('stockCardService');
            this.stockmanagementUrlFactory = $injector.get('stockmanagementUrlFactory');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.dateUtils = $injector.get('dateUtils');
            this.StockCardDataBuilder = $injector.get('StockCardDataBuilder');
            this.LotDataBuilder = $injector.get('LotDataBuilder');
        });

        this.stockCard = new this.StockCardDataBuilder()
            .withLot(new this.LotDataBuilder().build())
            .build();
        // SIGLUS-REFACTOR: starts here
        this.orderable = {
            id: 'id'
        };
        // SIGLUS-REFACTOR: ends here
    });

    describe('getStockCard', function() {

        beforeEach(function() {
            // SIGLUS-REFACTOR: starts here
            this.$httpBackend.when('GET', this.stockmanagementUrlFactory('/api/siglusapi/stockCards/'
                // SIGLUS-REFACTOR: ends here
                + this.stockCard.id))
                .respond(200, this.stockCard);
        });

        it('should return promise', function() {
            var result = this.stockCardService.getStockCard(this.stockCard.id);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to stock card', function() {
            var result;

            this.stockCardService.getStockCard(this.stockCard.id).then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.stockCard));
            expect(result.lot.expirationDate).toEqual(this.dateUtils.toDate(this.stockCard.lot.expirationDate));
        });
    });

    // #103: archive product
    describe('getProductStockCard', function() {

        beforeEach(function() {
            this.$httpBackend.when(
                'GET', this.stockmanagementUrlFactory('/api/siglusapi/stockCards/orderable?id='
                + this.orderable.id)
            )
                .respond(200, this.stockCard);
        });

        it('should return promise', function() {
            var result = this.stockCardService.getProductStockCard(this.orderable.id);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to stock card', function() {
            var result;

            this.stockCardService.getProductStockCard(this.orderable.id).then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(this.stockCard));
            expect(result.lot.expirationDate).toEqual(this.stockCard.lot.expirationDate);
        });
    });

    describe('archiveProduct', function() {

        beforeEach(function() {
            this.$httpBackend.when('POST', this.stockmanagementUrlFactory('/api/siglusintegration/archiveProduct/'
                + this.orderable.id))
                .respond(200, null);
        });

        it('should return promise', function() {
            var result = this.stockCardService.archiveProduct(this.orderable.id);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to null', function() {
            var result;

            this.stockCardService.archiveProduct(this.orderable.id).then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });
    });
    // #103: ends here

    // #105: activate archived product
    describe('activateProduct', function() {

        beforeEach(function() {
            this.$httpBackend.when('POST', this.stockmanagementUrlFactory('/api/siglusintegration/activateProduct/'
                + this.orderable.id))
                .respond(200, null);
        });

        it('should return promise', function() {
            var result = this.stockCardService.activateProduct(this.orderable.id);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to null', function() {
            var result;

            this.stockCardService.activateProduct(this.orderable.id).then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson({}));
        });
    });
    // #105: ends here

    afterEach(function() {
        this.$httpBackend.verifyNoOutstandingRequest();
        this.$httpBackend.verifyNoOutstandingExpectation();
    });

});
