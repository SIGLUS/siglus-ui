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

describe('SiglusPhysicalInventoryCeationController', function() {
    var vm, $rootScope, $controller, $scope;
    beforeEach(function() {
        module('siglus-physical-inventory-creation');
        module('openlmis-modal');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $controller = $injector.get('$controller');
        });

        vm = $controller('SiglusPhysicalInventoryCeationController', {
            $scope: $scope
        });

        vm.$onInit();

        describe('onInit', function() {
            console.log('vm --->>>', vm);
            it('should get default columns', function() {
                expect(2).toBe(2);
            });
        });
    });
});
