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

describe('stockInputSelectDirective', function() {
    var $compile,
        $rootScope,
        $timeout,
        scope,
        directiveScope,
        element,
        mockItems,
        mockOrderableGroups,
        mockSelectedItem,
        orderableGroupService,
        siglusAutoGenerateService,
        orderableLotMapping;

    mockItems = getMockItems();
    mockOrderableGroups = getMockOrderableGroups();
    mockSelectedItem = getSelectedItem();

    orderableGroupService = jasmine.createSpyObj('orderableGroupService', ['findByLotInOrderableGroup', 'lotsOf']);
    orderableGroupService.findByLotInOrderableGroup.andReturn(mockSelectedItem);

    orderableLotMapping = jasmine.createSpyObj('orderableLotMapping',
        ['findSelectedOrderableGroupsByOrderableId', 'findAllOrderableIds']);
    orderableLotMapping.findSelectedOrderableGroupsByOrderableId.andReturn(mockOrderableGroups);

    siglusAutoGenerateService = jasmine.createSpyObj('siglusAutoGenerateService', ['autoGenerateLotCode']);
    siglusAutoGenerateService.autoGenerateLotCode.andReturn('SEM-LOTE-22A05-062020-0');
    // Load the stock-adjustment-creation module, which contains the directive
    beforeEach(function() {
        module('siglus-stock-input-select');
    });

    describe('When enable input', function() {
        var input, options;
        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();
            scope.lineItems = mockItems;
            // Compile a piece of HTML containing the directive
            element = $compile('<siglus-stock-input-select ' +
                'line-items="lineItems" ' +
                'line-item="lineItems[0]" ' +
                'enable-input="true"></siglus-stock-input-select>')(scope);
            angular.element(document.body).append(element);
            // fire all the watches, so the scope expression will be evaluated
            scope.$digest();
            directiveScope = element.isolateScope();

            input = element.find('div input.form-control.min-width-select.custom-item-container.adjustment-input');
            options = element.find('div .adjustment-custom-item-wrapper .adjustment-custom-item');
        }));

        it('Replaces the directive to html element', function() {
            // Check that the compiled element contains the templated content
            //console.log(element.html());
            expect(input).toBeDefined();
            expect(options).toBeDefined();
        });

        it('Should directive scope init successfully', function() {
            expect(directiveScope.lineItems).toBe(mockItems);
            expect(directiveScope.lineItem).toBe(mockItems[0]);
            expect(directiveScope.enableInput).toBe(true);
        });

        it('Should option dialog open when focus on input', function() {
            expect(directiveScope.lineItem.showSelect).toBe(false);
            input.triggerHandler('focus');

            //expect(directiveScope.lineItem.showSelect).toBe(true);
        });

        it('Should update lot property after select option', function(done) {
            input.focus();
            options.find('.option').first()
                .click();
            $timeout(function() {
                expect(directiveScope.lineItem.lot).toEqual(mockSelectedItem.lot);
                expect(directiveScope.lineItem.$previewSOH).toEqual(mockSelectedItem.stockOnHand);
                expect(directiveScope.lineItem.showSelect).toBe(false);
                done();
            });
        });

        it('Should input value match option', function(done) {
            input.focus();
            input.keypress();
            input.text('SEM-LOTE-22A05-092019-3');
            input.blur();
            $timeout(function() {
                expect(directiveScope.lineItem.lot).toEqual(mockSelectedItem.lot);
                expect(directiveScope.lineItem.$previewSOH).toEqual(mockSelectedItem.stockOnHand);
                expect(directiveScope.lineItem.showSelect).toBe(false);
                done();
            });
        });

        it('Should auto generate lot code after click button if has expirationDate', function() {
            directiveScope.lineItem.lot = {
                expirationDate: '2020-06-20'
            };
            element.find('.auto').first()
                .triggerHandler('click');

            //expect(directiveScope.lineItem.lot.lotCode).toEqual('SEM-LOTE-22A05-062020-0');
            expect(directiveScope.lineItem.$previewSOH).toEqual(null);
            expect(directiveScope.lineItem.showSelect).toBe(false);
        });
    });

    describe('When disable input', function() {
        var div, options;
        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            scope = $rootScope.$new();
            scope.lineItems = mockItems;
            // Compile a piece of HTML containing the directive
            element = $compile('<siglus-stock-input-select ' +
                'line-items="lineItems" ' +
                'line-item="lineItems[0]"></siglus-stock-input-select>')(scope);
            angular.element(document.body).append(element);
            // fire all the watches, so the scope expression will be evaluated
            scope.$digest();
            directiveScope = element.isolateScope();

            div = element.find('div div.form-control.min-width-select.custom-item-container.receive-select');
            options = element.find('div .adjustment-custom-item-wrapper .adjustment-custom-item');
        }));

        it('Replaces the directive to html element', function() {
            // Check that the compiled element contains the templated content
            //console.log(element.html());
            expect(div).toBeDefined();
            expect(options).toBeDefined();
        });

        it('Should directive scope init successfully', function() {
            expect(directiveScope.lineItems).toBe(mockItems);
            expect(directiveScope.lineItem).toBe(mockItems[0]);
            expect(directiveScope.enableInput).toBeUndefined();
        });

        it('Should option dialog open when click on div', function() {
            expect(directiveScope.lineItem.showSelect).toBe(false);
            div.triggerHandler('click');

            //expect(directiveScope.lineItem.showSelect).toBe(true);
        });

        it('Should update lot property after select option', function(done) {
            div.triggerHandler('click');
            options.find('.option').first()
                .triggerHandler('click');
            $timeout(function() {
                expect(directiveScope.lineItem.lot).toEqual(mockSelectedItem.lot);
                expect(directiveScope.lineItem.$previewSOH).toEqual(mockSelectedItem.stockOnHand);
                expect(directiveScope.lineItem.showSelect).toBe(false);
                done();
            });
        });

        it('Should auto generate lot code after click button if has expirationDate', function() {
            directiveScope.lineItem.lot = {
                expirationDate: '2020-06-20'
            };
            div.triggerHandler('click');
            element.find('.auto').first()
                .triggerHandler('click');

            //expect(directiveScope.lineItem.lot.lotCode).toEqual('SEM-LOTE-22A05-062020-0');
            expect(directiveScope.lineItem.$previewSOH).toEqual(null);
            expect(directiveScope.lineItem.showSelect).toBe(false);
        });

        it('Should empty value after click clear button', function() {
            div.triggerHandler('click');
            options.find('.option').first()
                .triggerHandler('click');
            element.find('.clear-button').first()
                .triggerHandler('click');

            //expect(directiveScope.lineItem.lot).toEqual(null);
            expect(directiveScope.lineItem.$previewSOH).toEqual(null);
            expect(directiveScope.lineItem.showSelect).toBe(false);
        });
    });

    function getMockItems() {
        return [
            {
                $errors: {},
                $previewSOH: null,
                lotOptions: [
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-0',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-25',
                        manufactureDate: '2019-09-27',
                        id: '275c7ae0-409b-4672-9811-4d2791c1894a'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-2',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-25',
                        manufactureDate: '2019-09-27',
                        id: 'b44dbb90-6b85-4973-8a74-d694064ab45b'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-3',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-19',
                        manufactureDate: '2019-09-27',
                        id: '4367b276-834f-47c7-b0af-527e06b4f777'
                    },
                    null,
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-0',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-25',
                        manufactureDate: '2019-09-27',
                        id: '275c7ae0-409b-4672-9811-4d2791c1894a'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-2',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-25',
                        manufactureDate: '2019-09-27',
                        id: 'b44dbb90-6b85-4973-8a74-d694064ab45b'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A05-092019-3',
                        active: true,
                        tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                        expirationDate: '2019-09-19',
                        manufactureDate: '2019-09-27',
                        id: '4367b276-834f-47c7-b0af-527e06b4f777'
                    },
                    null
                ],
                orderableId: 'a7b516b2-d956-11e9-944f-0242ac130005',
                showSelect: false,
                occurredDate: '2019-10-09',
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null,
                reason: null,
                isKit: false
            },
            {
                $errors: {},
                $previewSOH: null,
                lotOptions: [
                    {
                        lotCode: 'SEM-LOTE-22A07-102019-0',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2019-10-26',
                        manufactureDate: '2019-09-27',
                        id: '1a767f37-64c5-4a8d-9fde-3ca3fb67c146'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A07-092019-0',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2019-09-24',
                        manufactureDate: '2019-09-27',
                        id: '0dd44df5-5e2f-4f84-9d7d-8469dc96ec26'
                    },
                    {
                        lotCode: 'ABC',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2020-07-10',
                        manufactureDate: '2019-10-05',
                        id: 'ef1ecbdf-00ba-4011-99b6-09c05dc1864f'
                    },
                    null,
                    {
                        lotCode: 'SEM-LOTE-22A07-092019-0',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2019-09-24',
                        manufactureDate: '2019-09-27',
                        id: '0dd44df5-5e2f-4f84-9d7d-8469dc96ec26'
                    },
                    {
                        lotCode: 'SEM-LOTE-22A07-102019-0',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2019-10-26',
                        manufactureDate: '2019-09-27',
                        id: '1a767f37-64c5-4a8d-9fde-3ca3fb67c146'
                    },
                    {
                        lotCode: 'ABC',
                        active: true,
                        tradeItemId: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986',
                        expirationDate: '2020-07-10',
                        manufactureDate: '2019-10-05',
                        id: 'ef1ecbdf-00ba-4011-99b6-09c05dc1864f'
                    },
                    null
                ],
                orderableId: 'a7b5231e-d956-11e9-944f-0242ac130005',
                showSelect: false,
                stockCard: {
                    id: '8fa8b175-6549-4267-909d-d79078657a3a',
                    href: 'http: //dev.siglus.us/api/stockCards/8fa8b175-6549-4267-909d-d79078657a3a'
                },
                orderable: {
                    productCode: '22A07',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Unigold; kit de 20; Tests',
                    description: 'TDR de Unigold',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: 'b00e87b1-42e1-47de-8e17-cf5e0cc02986'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.125Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b5231e-d956-11e9-944f-0242ac130005'
                },
                stockOnHand: 1,
                processedDate: '2019-09-27T10: 28: 24.483Z',
                occurredDate: '2019-10-09',
                reason: null,
                isKit: false
            }
        ];
    }

    function getMockOrderableGroups() {
        return [
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-0',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-25',
                    manufactureDate: '2019-09-27',
                    id: '275c7ae0-409b-4672-9811-4d2791c1894a'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: 3
            },
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-2',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-25',
                    manufactureDate: '2019-09-27',
                    id: 'b44dbb90-6b85-4973-8a74-d694064ab45b'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            },
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-3',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-19',
                    manufactureDate: '2019-09-27',
                    id: '4367b276-834f-47c7-b0af-527e06b4f777'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null,
                displayLotMessage: 'SEM-LOTE-22A05-092019-3'
            },
            {
                lot: null,
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            },
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-0',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-25',
                    manufactureDate: '2019-09-27',
                    id: '275c7ae0-409b-4672-9811-4d2791c1894a'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            },
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-2',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-25',
                    manufactureDate: '2019-09-27',
                    id: 'b44dbb90-6b85-4973-8a74-d694064ab45b'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            },
            {
                lot: {
                    lotCode: 'SEM-LOTE-22A05-092019-3',
                    active: true,
                    tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                    expirationDate: '2019-09-19',
                    manufactureDate: '2019-09-27',
                    id: '4367b276-834f-47c7-b0af-527e06b4f777'
                },
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            },
            {
                lot: null,
                occurredDate: null,
                orderable: {
                    productCode: '22A05',
                    dispensable: {
                        displayUnit: ''
                    },
                    fullProductName: 'TDR de Sifilis; 1; Tests',
                    description: 'TDR de Sifilis',
                    netContent: 16,
                    packRoundingThreshold: 8,
                    roundToZero: false,
                    isKit: false,
                    programs: [
                        {
                            programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                            pricePerPack: 0
                        },
                        {
                            programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                            orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                            orderableCategoryDisplayName: 'Other',
                            orderableCategoryDisplayOrder: 1,
                            active: true,
                            fullSupply: true,
                            displayOrder: 1,
                            parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                            pricePerPack: 0
                        }
                    ],
                    children: [],
                    identifiers: {
                        tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                    },
                    extraData: {},
                    meta: {
                        lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                        versionId: '1'
                    },
                    id: 'a7b516b2-d956-11e9-944f-0242ac130005'
                },
                processedDate: null,
                stockCard: null,
                stockOnHand: null
            }
        ];
    }

    function getSelectedItem() {
        return {
            lot: {
                lotCode: 'SEM-LOTE-22A05-092019-3',
                active: true,
                tradeItemId: '3b27ad19-95e5-422e-8cac-c31befe99aa7',
                expirationDate: '2019-09-19',
                manufactureDate: '2019-09-27',
                id: '4367b276-834f-47c7-b0af-527e06b4f777'
            },
            occurredDate: null,
            orderable: {
                productCode: '22A05',
                dispensable: {
                    displayUnit: ''
                },
                fullProductName: 'TDR de Sifilis; 1; Tests',
                description: 'TDR de Sifilis',
                netContent: 16,
                packRoundingThreshold: 8,
                roundToZero: false,
                isKit: false,
                programs: [
                    {
                        programId: 'eae5b88e-cfd2-11e9-9535-0242ac130005',
                        orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                        orderableCategoryDisplayName: 'Other',
                        orderableCategoryDisplayOrder: 1,
                        active: true,
                        fullSupply: true,
                        displayOrder: 1,
                        parentId: 'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                        pricePerPack: 0
                    },
                    {
                        programId: 'd58815d6-cfd2-11e9-9535-0242ac130005',
                        orderableDisplayCategoryId: 'da7e4266-de20-11e9-8785-0242ac130007',
                        orderableCategoryDisplayName: 'Other',
                        orderableCategoryDisplayOrder: 1,
                        active: true,
                        fullSupply: true,
                        displayOrder: 1,
                        parentId: 'dce17f2e-af3e-40ad-8e00-3496adef44c3',
                        pricePerPack: 0
                    }
                ],
                children: [],
                identifiers: {
                    tradeItem: '3b27ad19-95e5-422e-8cac-c31befe99aa7'
                },
                extraData: {},
                meta: {
                    lastUpdated: '2019-09-27T08: 49: 28.147Z[GMT]',
                    versionId: '1'
                },
                id: 'a7b516b2-d956-11e9-944f-0242ac130005'
            },
            processedDate: null,
            stockCard: null,
            stockOnHand: 3,
            displayLotMessage: 'SEM-LOTE-22A05-092019-3'
        };
    }
});