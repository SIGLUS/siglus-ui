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

describe('SiglusUsageInformationController', function() {

    var vm, sections, usageInformationLineItems, $controller, availableProducts;

    beforeEach(function() {
        module('siglus-requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
        });
        sections = [ {
            id: '12131415',
            name: 'information',
            label: 'Product Usage Information',
            displayOrder: 0,
            columns: [ {
                name: 'treatmentsAttended',
                label: 'N Treatments Attended in this Month',
                indicator: 'PU',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the quantity of patients for each treatment by products',
                tag: null,
                source: 'USER_INPUT',
                id: '123456'
            }]
        }, {
            id: '135792',
            name: 'service',
            label: 'Services',
            displayOrder: 1,
            columns: [ {
                name: 'HF',
                label: 'HF',
                indicator: 'SV',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the product usage information for my facility',
                tag: null,
                source: 'USER_INPUT',
                id: '1234567890'
            }]
        } ];
        usageInformationLineItems = [{
            service: 'HF',
            informations: {
                treatmentsAttended: {
                    orderables: {
                        '98-76-54-321': {
                            usageInformationLineItemId: '98-76-54-321',
                            value: 2
                        }
                    }
                }
            }
        }];

        availableProducts = [{
            id: '98-76-54-321',
            fullProductName: 'Product for Test'
        }];

        vm = $controller('SiglusUsageInformationController');
        vm.sections = sections;
        vm.lineItems = usageInformationLineItems;
        vm.availableProducts = availableProducts;
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should init values', function() {

            expect(vm.lineItems).toEqual([ {
                service: 'HF',
                name: 'HF',
                label: 'HF',
                indicator: 'SV',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the product usage information for my facility',
                tag: null,
                source: 'USER_INPUT',
                id: '1234567890',
                informations: {
                    treatmentsAttended: {
                        name: 'treatmentsAttended',
                        label: 'N Treatments Attended in this Month',
                        indicator: 'PU',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the quantity of patients for each treatment by products',
                        tag: null,
                        source: 'USER_INPUT',
                        id: '123456',
                        orderables: {
                            '98-76-54-321': {
                                id: '98-76-54-321',
                                fullProductName: 'Product for Test',
                                usageInformationLineItemId: '98-76-54-321',
                                value: 2,
                                $error: undefined
                            }
                        }
                    }
                }
            } ]);

            expect(vm.firstService).toEqual(vm.lineItems[0]);
            expect(vm.monthOrYearColspan).toEqual(2);
            expect(vm.informationColspan).toEqual(1);
        });
    });

    describe('getTotal', function() {

        it('should return total when informationName and orderableId', function() {
            var informationName = 'treatmentsAttended';
            var orderableId = '98-76-54-321';
            vm.lineItems.push({
                service: 'total',
                name: 'total',
                informations: {
                    treatmentsAttended: {
                        orderables: {
                            '98-76-54-321': {
                                usageInformationLineItemId: '98-76-54-321',
                                value: 0
                            }
                        }
                    }
                }
            });

            expect(vm.getTotal(informationName, orderableId)).toBe(2);
        });
    });
});
