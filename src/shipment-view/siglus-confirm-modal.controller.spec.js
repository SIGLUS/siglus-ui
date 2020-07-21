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

describe('SiglusConfirmModalController', function() {

    beforeEach(function() {
        module('shipment-view');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.messageService = $injector.get('messageService');
        });

        this.message = '1 product is not fully fulfilled, By click “create sub-order”, this order will be fulfilled' +
            ' and ordering with filling quantity, the rest products will be move to a new sub-order.';
        this.confirmDeferred = jasmine.createSpyObj('confirmDeferred', ['resolve', 'reject']);
        this.modalDeferred = jasmine.createSpyObj('confirmDeferred', ['resolve', 'reject']);

        this.vm = this.$controller('SiglusConfirmModalController', {
            totalPartialLineItems: 1,
            confirmDeferred: this.confirmDeferred,
            modalDeferred: this.modalDeferred
        });
    });

    describe('$onInit', function() {

        it('should expose message', function() {
            spyOn(this.messageService, 'get').andReturn(this.message);
            this.vm.$onInit();

            expect(this.vm.message).toEqual(this.message);
        });
    });

    describe('confirm', function() {

        it('should resolve confirm promise', function() {
            this.vm.confirm(true);

            expect(this.confirmDeferred.resolve).toHaveBeenCalled();
        });

        it('should resolve modal promise', function() {
            this.vm.confirm(true);

            expect(this.modalDeferred.resolve).toHaveBeenCalled();
        });

    });

    describe('cancel', function() {

        it('should resolve confirm promise', function() {
            this.vm.cancel();

            expect(this.confirmDeferred.reject).toHaveBeenCalled();
        });

        it('should resolve modal promise', function() {
            this.vm.cancel();

            expect(this.modalDeferred.resolve).toHaveBeenCalled();
        });

    });

});
