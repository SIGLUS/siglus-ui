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

describe('SiglusSohLotDetailPrintController', function() {
    var vm, $controller, $rootScope, REASON_TYPES;

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            REASON_TYPES = $injector.get('REASON_TYPES');
        });
    }

    function prepareData() {
        $rootScope.$apply();
        vm = $controller('SiglusSohLotDetailPrintController', {
            $scope: $rootScope,
            facility: {},
            stockCard: {},
            program: {},
            REASON_TYPES: REASON_TYPES
        });
    }

    beforeEach(function() {
        module('stock-reason');
        module('siglus-location-management');
        module('siglus-soh-lot-detail-print');
        prepareInjector();
        prepareData();
    });

    describe('addPrefixForAdjustmentReason method', function() {
        it('should add negative prefix when reason type is debit', function() {
            var reasonName = 'reason name';
            var negativeReason = {
                name: reasonName,
                reasonType: REASON_TYPES.DEBIT
            };

            expect(vm.addPrefixForAdjustmentReason(negativeReason).name).toEqual('[Ajustes Negativos] ' + reasonName);
        });

        it('should add positive prefix when reason type is debit', function() {
            var reasonName = 'reason name';
            var negativeReason = {
                name: reasonName,
                reasonType: REASON_TYPES.CREDIT
            };

            expect(vm.addPrefixForAdjustmentReason(negativeReason).name).toEqual('[Ajustes Positivos] ' + reasonName);
        });
    });
});
