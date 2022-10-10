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

describe('siglusLocationAdjustmentModifyLineItemService', function() {

    var siglusLocationAdjustmentModifyLineItemService, OrderableDataBuilder, $filter, dateUtils,
        ReasonDataBuilder;

    function prepareInjector() {
        inject(function($injector) {
            siglusLocationAdjustmentModifyLineItemService
            = $injector.get('siglusLocationAdjustmentModifyLineItemService');
            OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            $filter = $injector.get('$filter');
            dateUtils =  $injector.get('dateUtils');
            ReasonDataBuilder = $injector.get('ReasonDataBuilder');
        });
    }

    beforeEach(function() {
        module('siglus-location-adjustment-creation');
        module('requisition');
        module('referencedata-facility-type-approved-product');

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
                reason: null,
                quantity: 0
            };
            var lineItems = [
                lineItem
            ];
            siglusLocationAdjustmentModifyLineItemService.addLineItem(lineItem, lineItems);

            expect(lineItems.length).toEqual(3);
            expect(lineItems[0].isMainGroup).toEqual(true);
            expect(lineItems[1].isMainGroup).toEqual(false);
            expect(lineItems[2].lot.lotCode).toEqual('SEM-LOTE-2011-12');
        });
    });

    describe('removeLineItem method', function() {
        it('should add two rows when current lineItems length is one ', function() {
            var lineItems = [
                {
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
                    reason: null,
                    quantity: 0
                },
                {
                    $error: {},
                    orderableId: 'ashjdfasf-123123ndsd-uiwowe123',
                    productCode: '08L07Y',
                    productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp',
                    lot: {
                        lotCode: 'SEM-LOTE-2011-12'
                    },
                    isKit: false,
                    isMainGroup: false,
                    location: null,
                    stockOnHand: 0,
                    reason: null,
                    quantity: 0
                },
                {
                    $error: {},
                    orderableId: 'ashjdfasf-123123ndsd-uiwowe124',
                    productCode: '08L08Y',
                    productName: 'Rifampicina+Isoniazida; 300mg+300mg; Comp',
                    lot: {
                        lotCode: 'SEM-LOTE-2022-12'
                    },
                    isKit: false,
                    isMainGroup: false,
                    location: null,
                    stockOnHand: 0,
                    reason: null,
                    quantity: 0
                }
            ];
            siglusLocationAdjustmentModifyLineItemService.removeItem(lineItems, 2);

            expect(lineItems.length).toEqual(1);
            expect(lineItems[0].isMainGroup).toEqual(true);
        });
    });

    describe('getMainGroupRow method', function() {
        it('should add two rows when current lineItems length is one ', function() {
            var lineItem =
                {
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
                    reason: null,
                    quantity: 0
                };

            var newLineItem =  siglusLocationAdjustmentModifyLineItemService.getMainGroupRow(lineItem);

            expect(newLineItem).toEqual({
                $errors: {},
                orderableId: 'ashjdfasf-123123ndsd-uiwowe123',
                orderable: undefined,
                lot: null,
                stockOnHand: 0,
                isKit: false,
                isMainGroup: true,
                location: null,
                reason: null,
                reasonFreeText: null,
                documentationNo: null,
                quantity: null
            });
        });
    });

    describe('getAddProductRow method', function() {
        it('should add two rows when current lineItems length is one ', function() {
            var orderable =  new OrderableDataBuilder().build();

            var newLineItem =  siglusLocationAdjustmentModifyLineItemService.getAddProductRow(orderable);

            expect(newLineItem).toEqual({
                $errors: {},
                orderable: orderable,
                orderableId: orderable.id,
                productCode: orderable.productCode,
                productName: $filter('productName')(orderable),
                lot: null,
                stockOnHand: 0,
                isKit: orderable.isKit,
                isMainGroup: true,
                location: null,
                programId: _.get(orderable.programs, [0, 'programId'], ''),
                reason: null,
                reasonFreeText: null,
                documentationNo: null,
                quantity: null,
                occurredDate: dateUtils.toStringDate(new Date())
            });
        });
    });

    describe('prepareAddedLineItems method', function() {
        it('should add two rows when current lineItems length is one ', function() {
            var reasons = [new ReasonDataBuilder().build()];
            var orderableGroups = [];
            var locations = [];
            var areaLocationInfo = [];
            var darftInfo = {
                lineItems: []
            };
            var newLineItem =  siglusLocationAdjustmentModifyLineItemService
                .prepareAddedLineItems(darftInfo, locations, orderableGroups, reasons, areaLocationInfo);

            expect(newLineItem).not.toEqual([]);
        });
    });

});
