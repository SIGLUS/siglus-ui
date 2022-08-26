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

describe('openlmis.stockmanagement.stockCardSummaries.productCard', function() {
    var $state, $rootScope;

    function prepareInjector() {
        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
        });
    }

    function prepareSpies() {}

    function init() {
        $state.go('openlmis.stockmanagement.stockCardSummaries.productCard',
            {
                orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                facility: 'A0000010'
            });
        $rootScope.$apply();
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    beforeEach(function() {
        module('stockmanagement');
        module('stock-card-summary-list');
        module('siglus-stock-card-for-product');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            $state.go('openlmis.stockmanagement.stockCardSummaries.productCard',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: undefined
                });

            expect(getResolvedValue('facility')).toEqual(undefined);
        });

        it('should return facility in stateParams', function() {
            $state.go('openlmis.stockmanagement.stockCardSummaries.productCard',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: 'A000001'
                });

            expect(getResolvedValue('facility')).toEqual(undefined);
        });
    });

    describe('stockCard resolve', function() {
        it('should return stockCard', function() {
            $state.go('openlmis.stockmanagement.stockCardSummaries.productCard',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCard: undefined
                });

            expect(getResolvedValue('facility')).toEqual(undefined);
        });

        it('should return stockCard in stateParams', function() {
            $state.go('openlmis.stockmanagement.stockCardSummaries.productCard',
                {
                    orderable: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    stockCard: {}
                });

            expect(getResolvedValue('facility')).toEqual(undefined);
        });
    });
});
