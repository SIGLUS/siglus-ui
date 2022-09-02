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

        it('should prepareAddedLineItemsForVirtual group by orderable then sort by lot ', function() {
            var lineItem1 = {
                destArea: null,
                destLocationCode: null,
                expirationDate: '2023-04-21',
                isKit: null,
                lotCode: 'SEM-LOTE-08K04-042023-2-21/04/2023',
                lotId: '47d1bc2f-777f-4e37-a47e-bf3e2d6ec247',
                orderableId: '99b7f370-affc-4851-b40c-5f005683a491',
                productCode: '08K04',
                productName: 'Metronidazol; 250mg; Comp',
                quantity: 100,
                srcArea: 'virtual location',
                srcLocationCode: '00000',
                stockOnHand: 100
            };
            var lineItem2 = angular.copy(lineItem1);
            lineItem2.quantity = 20;
            var lineItems = [
                lineItem1,
                lineItem2
            ];
            var draftInfo = {
                facilityId: 'b889bb10-cfb4-11e9-9398-0242ac130008',
                id: '67d435b8-9136-416c-a4e9-af9a2d45aa67',
                programId: '00000000-0000-0000-0000-000000000000',
                userId: '5af58c84-eeba-4b33-bdb5-62343fd06606',
                lineItems: lineItems
            };

            var result = addAndRemoveLineItemService.prepareAddedLineItemsForVirtual(draftInfo, [], []);

            expect(result.length).toEqual(1);
            expect(result[0][0].isMainGroup).toEqual(true);
            expect(result[0][1].isFirst).toEqual(true);
            expect(result[0][2].isFirst).toBeUndefined();

        });

    });

});
