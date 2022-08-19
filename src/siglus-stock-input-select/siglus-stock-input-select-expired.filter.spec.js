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

describe('expired lot filter', function() {

    beforeEach(function() {
        module('siglus-stock-input-select');

        inject(function($injector) {
            this.$filter = $injector.get('$filter');
        });

        this.siglusExpiredLotCodeFilter = this.$filter('siglusExpiredLotCode');
        this.expiredLot = {
            lotCode: 'testLostCode1',
            expirationDate: '2018-08-18'
        };
        this.unExpiredLot = {
            lotCode: 'testLostCode2',
            expirationDate: '2028-08-18'
        };
    });

    it('should return undefined for undefined', function() {
        expect(this.siglusExpiredLotCodeFilter()).toBeUndefined();
    });

    it('should return a lotcode with  [expired] tag  when expirationDate is before the moment', function() {
        var filteredLot = this.siglusExpiredLotCodeFilter(this.expiredLot);

        expect(filteredLot).toEqual('[expired]testLostCode1');
        expect(filteredLot).not.toEqual('testLostCode1');
    });

    it('should not return a lotcode with  [expired] tag  when expirationDate is after the moment', function() {
        var filteredLot = this.siglusExpiredLotCodeFilter(this.unExpiredLot);

        expect(filteredLot).not.toEqual('[expired]testLostCode2');
        expect(filteredLot).toEqual('testLostCode2');
    });

});