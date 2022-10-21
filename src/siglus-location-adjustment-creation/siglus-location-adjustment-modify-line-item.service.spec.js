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

    var siglusLocationAdjustmentModifyLineItemService, $filter, dateUtils,
        ReasonDataBuilder;

    function prepareInjector() {
        inject(function($injector) {
            siglusLocationAdjustmentModifyLineItemService
            = $injector.get('siglusLocationAdjustmentModifyLineItemService');
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

            var product = {
                productCode: '29A13',
                orderableId: 'eaa33427-de8e-49ed-aa82-cd71d332b809',
                fullProductName: '96 Deep Well Plates (1x32DWP)(Covid 19); N/A; N/A - each',
                isKit: false,
                programId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                dispensable: {
                    displayUnit: 'each'
                }
            };
            var newLineItem =  siglusLocationAdjustmentModifyLineItemService.getAddProductRow(product);

            expect(newLineItem).toEqual({
                $errors: {},
                orderable: product,
                orderableId: 'eaa33427-de8e-49ed-aa82-cd71d332b809',
                productCode: '29A13',
                productName: $filter('productName')(product),
                lot: null,
                stockOnHand: 0,
                isKit: product.isKit,
                isMainGroup: true,
                location: null,
                programId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
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
            var productList = [{
                productCode: '29A13',
                orderableId: 'eaa33427-de8e-49ed-aa82-cd71d332b809',
                fullProductName: '96 Deep Well Plates (1x32DWP)(Covid 19); N/A; N/A - each',
                isKit: false,
                programId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                dispensable: {
                    displayUnit: 'each'
                }
            }];
            var locations = [];
            var areaLocationInfo = [];
            var darftInfo = {
                lineItems: [
                    {
                        productCode: '29A13',
                        orderableId: 'eaa33427-de8e-49ed-aa82-cd71d332b809',
                        fullProductName: '96 Deep Well Plates (1x32DWP)(Covid 19); N/A; N/A - each',
                        isKit: false,
                        reasonId: '0000123-123ahsdfoasdf-123123',
                        lotCode: 'LTE-OTE-202012',
                        locationCode: 'AA202',
                        programId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                        dispensable: {
                            displayUnit: 'each'
                        }
                    }
                ]
            };
            var newLineItem =  siglusLocationAdjustmentModifyLineItemService
                .prepareAddedLineItems(darftInfo, locations, productList, reasons, areaLocationInfo);

            expect(newLineItem).not.toEqual([]);
        });
    });

});
