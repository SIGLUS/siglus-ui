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

describe('addAndRemoveLineItemService', function() {

    var addAndRemoveLineItemService;

    function prepareInjector() {
        inject(function($injector) {
            addAndRemoveLineItemService = $injector.get('addAndRemoveLineItemService');
        });
    }

    beforeEach(function() {
        module('siglus-location-movement');

        prepareInjector();
    });

    describe('addLineItem method', function() {

        it('should add two rows when current lineItems length is one ', function() {
            var lineItem = {
                $error: {},
                orderableId: 'ashjdfasf-123123ndsd-uiwowe123',
                productCode: '08L07Y',
                productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp',
                lot: {
                    lotCode: 'SEM-LOTE-2011-12'
                },
                isKit: false,
                isMainGroup: true,
                location: null,
                stockOnHand: 0,
                moveTo: null,
                quantity: 0
            };
            var lineItems = [
                lineItem
            ];
            addAndRemoveLineItemService.addLineItem(lineItem, lineItems);

            expect(lineItems.length).toEqual(3);
            expect(lineItems[0].isMainGroup).toEqual(true);
            expect(lineItems[1].isMainGroup).toEqual(false);
            expect(lineItems[2].lot.lotCode).toEqual('SEM-LOTE-2011-12');
        });
    });

});
