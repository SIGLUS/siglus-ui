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

describe('SiglusKitUsageController', function() {

    var vm, sections, kitUsageLineItems, $controller;

    beforeEach(function() {
        module('requisition-view-section');

        inject(function($injector) {
            $controller = $injector.get('$controller');
        });
        sections = [ {
            id: '7467b211-b38b-4122-a91e-4bc2476b7eb5',
            name: 'collection',
            label: 'KIT data collection',
            displayOrder: 0,
            columns: [ {
                name: 'kitReceived',
                label: 'No. of Kit Received',
                indicator: 'KD',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the quantity of how many KIT received',
                tag: 'received',
                source: 'STOCK_CARDS',
                id: 'e90aa569-aed2-457d-b085-58d142c99f45'
            }]
        }, {
            id: 'ff882d28-e7a5-4283-9016-7e592b1c89c5',
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
                definition: 'record the quantity of KIT data in my facility',
                tag: null,
                source: '',
                id: '3ba0c302-5694-4664-bb8e-573fae366a30'
            }]
        } ];
        kitUsageLineItems = [ {
            collection: 'kitReceived',
            services: {
                HF: {
                    id: '000f8d2f-1149-46a8-9fbc-8c7a7669ee1e',
                    value: 0
                }
            }
        } ];

        vm = $controller('SiglusKitUsageController');
        vm.sections = sections;
        vm.lineItems = kitUsageLineItems;
        vm.$onInit();
    });

    describe('onInit', function() {

        it('should enhance lineItems with collection data and services data', function() {
            vm.lineItems = kitUsageLineItems;
            vm.$onInit();

            expect(vm.lineItems).toEqual([ {
                collection: 'kitReceived',
                name: 'kitReceived',
                label: 'No. of Kit Received',
                indicator: 'KD',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the quantity of how many KIT received',
                tag: 'received',
                source: 'STOCK_CARDS',
                id: 'e90aa569-aed2-457d-b085-58d142c99f45',
                services: {
                    HF: {
                        id: '000f8d2f-1149-46a8-9fbc-8c7a7669ee1e',
                        value: 0,
                        name: 'HF',
                        label: 'HF',
                        indicator: 'SV',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the quantity of KIT data in my facility',
                        tag: null,
                        source: ''
                    }
                }
            } ]);
        });
    });

    describe('isUserInput', function() {

        it('should return false if canEdit is false', function() {
            vm.canEdit = false;

            expect(vm.isUserInput({}, {})).toBe(false);
        });

        it('should return false if service is HF and source is stock card', function() {
            vm.canEdit = true;

            expect(vm.isUserInput(vm.lineItems[0].services.HF, vm.lineItems[0])).toBe(false);
        });

        it('should return true if service is CHW and source user input', function() {
            vm.canEdit = true;

            vm.lineItems[0].services.CWH = {
                id: '000f8d2f-1149-46a8-9fbc-8c7a7669ee1e',
                value: 0,
                name: 'CWH',
                label: 'CWH',
                indicator: 'SV',
                displayOrder: 0,
                isDisplayed: true,
                option: null,
                definition: 'record the quantity of KIT data in my facility',
                tag: null,
                source: 'USER_INPUT'
            };

            expect(vm.isUserInput(vm.lineItems[0].services.CWH, vm.lineItems[0].kitReceived)).toBe(true);
        });
    });
});
