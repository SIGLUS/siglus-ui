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

describe('siglusSohLotDetailController', function() {
    var vm, facility, $controller, $state,
        $scope, $rootScope, messageService,
        stockCardService;

    // SIGLUS-REFACTOR: ends here

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            stockCardService = $injector.get('stockCardService');
            messageService = $injector.get('messageService');
        });
    }

    function prepareSpies() {
        spyOn(stockCardService, 'printByProduct').andReturn();
        spyOn(messageService, 'get').andReturn();
        spyOn($state, 'go').andReturn();
    }

    function prepareData() {
        vm = $controller('siglusSohLotDetailController', {
            facility: facility,
            stockCardSummaries: [],
            displayItems: [],
            user: {},
            programs: [],
            stockCard: {
                orderable: {
                    fullProductName: 'Amikacina sulfato; 250mg/2mL-ampola'
                }
            },
            $scope: $scope,
            stockCardLineItems: []
        });
        vm.$onInit();
    }

    beforeEach(function() {
        module('stock-card');
        module('siglus-location-common');
        module('siglus-location-stock-on-hand');
        module('siglus-soh-lot-detail');
        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('getReason method', function() {
        it('should call with own name when free text is exist', function() {
            var lineItem = {
                reason: {
                    name: 'inventário',
                    reasonCategory: 'ADJUSTMENT',
                    reasonType: 'BALANCE_ADJUSTMENT'
                },
                reasonFreeText: 'reason is not null'
            };

            vm.getReason(lineItem);

            expect(messageService.get).toHaveBeenCalledWith('stockCard.reasonAndFreeText', {
                name: 'inventário',
                freeText: 'reason is not null'
            });
        });

        it('should call with negative name when free text is exist', function() {
            var lineItem = {
                reason: {
                    name: 'Negativos error message',
                    reasonCategory: 'ADJUSTMENT',
                    reasonType: 'DEBIT'
                },
                reasonFreeText: 'reason is not null'
            };

            vm.getReason(lineItem);

            expect(messageService.get).toHaveBeenCalledWith('stockCard.reasonAndFreeText', {
                name: '[Ajustes Negativos] Negativos error message',
                freeText: 'reason is not null'
            });
        });

        it('should call with positive name when free text is exist', function() {
            var lineItem = {
                reason: {
                    name: 'Ajustes Positivos error message',
                    reasonCategory: 'ADJUSTMENT',
                    reasonType: 'CREDIT'
                },
                reasonFreeText: 'reason is not null'
            };

            vm.getReason(lineItem);

            expect(messageService.get).toHaveBeenCalledWith('stockCard.reasonAndFreeText', {
                name: '[Ajustes Positivos] Ajustes Positivos error message',
                freeText: 'reason is not null'
            });
        });

        it('should return stockCard.physicalInventory when category is PHYSICAL_INVENTORY', function() {
            var lineItem = {
                reason: {
                    name: 'physical inventory',
                    reasonCategory: 'PHYSICAL_INVENTORY'
                }
            };

            vm.getReason(lineItem);

            expect(messageService.get).toHaveBeenCalledWith('stockCard.physicalInventory');
        });

        it('should return [Ajustes Positivos] Ajustes Positivos error message when category is not PHYSICAL_INVENTORY',
            function() {
                var lineItem = {
                    reason: {
                        name: 'Ajustes Positivos error message',
                        reasonCategory: 'ADJUSTMENT',
                        reasonType: 'CREDIT'
                    }
                };

                expect(vm.getReason(lineItem)).toEqual('[Ajustes Positivos] Ajustes Positivos error message');
            });
    });

});
