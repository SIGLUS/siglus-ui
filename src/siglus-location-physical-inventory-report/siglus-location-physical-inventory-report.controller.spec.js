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

describe('SiglusLocationPhysicalInventoryReport', function() {
    var vm, lineItemsGroup, $controller, $rootScope, program, facility, $window;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $rootScope = $injector.get('$rootScope');
            $window = $injector.get('$window');
        });
    }

    function prepareData() {
        lineItemsGroup = [
            [
                {
                    area: null,
                    id: '110',
                    locationCode: null,
                    lot: {
                        lotCode: 'TEST-110',
                        active: true,
                        tradeItemId: '111'
                    },
                    lotOptions: [],
                    orderable: {
                        productCode: '08D01',
                        fullProductName: 'testName'
                    },
                    programId: '00000000-0000-0000-0000-000000000000',
                    quantity: null,
                    reasonFreeText: null,
                    stockAdjustments: [],
                    stockCardId: 'stock-test-110',
                    stockOnHand: 123
                },
                {
                    area: null,
                    id: '110',
                    locationCode: null,
                    lot: {
                        lotCode: 'TEST-110',
                        active: true,
                        tradeItemId: '111'
                    },
                    lotOptions: [],
                    orderable: {
                        productCode: '08D01',
                        fullProductName: 'testName'
                    },
                    programId: '00000000-0000-0000-0000-000000000000',
                    quantity: null,
                    reasonFreeText: null,
                    stockAdjustments: [],
                    stockCardId: 'stock-test-110',
                    stockOnHand: 123
                }
            ],
            [
                {
                    area: null,
                    id: '110',
                    locationCode: null,
                    lot: {
                        lotCode: 'TEST-110',
                        active: true,
                        tradeItemId: '111'
                    },
                    lotOptions: [],
                    orderable: {
                        productCode: '08D01',
                        fullProductName: 'testName'
                    },
                    programId: '00000000-0000-0000-0000-000000000000',
                    quantity: null,
                    reasonFreeText: null,
                    stockAdjustments: [],
                    stockCardId: 'stock-test-110',
                    stockOnHand: 123
                }
            ]
        ];
        program = {
            code: 'ALL',
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Todos os produtos'
        };
        facility = {
            id: '10134',
            name: 'National Warehouse',
            supportedPrograms: program
        };

        vm = $controller('SiglusLocationPhysicalInventoryReport', {
            $scope: $rootScope,
            $window: $window,
            lineItemsGroup: lineItemsGroup,
            facility: facility,
            program: program,
            isMerged: false
        });

        // vm.$onInit();
    }

    function prepareSpies() {
        // this.deferred = $q.defer();
        // spyOn($state, 'go');
        // spyOn(SiglusPhysicalInventoryCreationService, 'show').andReturn(deferred.promise);
        // spyOn(physicalInventoryService, 'validateConflictProgram').andReturn(deferred.promise);
        // spyOn(alertService, 'error');
    }

    beforeEach(function() {
        module('siglus-location-physical-inventory-report');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('getTbDataSource', function() {

        it('should return flatten array which lot is empty', function() {
            var result = [
                {
                    productCode: '08D01',
                    product: 'testName'
                },
                {
                    productCode: '',
                    product: ''
                },
                {
                    productCode: '',
                    product: ''
                },
                {
                    productCode: '08D01',
                    product: 'testName'
                }
            ];

            vm.$onInit();

            expect(vm.notMergedLineItems).toEqual(result);
        });

    });
});
