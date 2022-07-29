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

describe('siglusPhysicalInventoryCeationController', function() {
    var vm, $rootScope, $controller, $scope, $q, modalDeferred;
    beforeEach(function() {
        module('siglus-physical-inventory-creation');
        module('openlmis-modal');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            modalDeferred = $q.defer();

            vm = $controller('SiglusPhysicalInventoryCreationController', {
                $scope: $scope,
                modalDeferred: modalDeferred,
                programId: ''
            });
        });
    });

    describe('isValid funcition', function() {
        it('should correspond this rules', function() {
            var userInputSplitNum = 5;

            expect(vm.isValid(userInputSplitNum)).toEqual(true);
        });

        it('should incompatible this rules', function() {
            var userInputSplitNum = 15;

            expect(vm.isValid(userInputSplitNum)).toEqual(false);
        });
    });

    describe('changeShowError funcition', function() {
        it('should correspond this rules', function() {
            vm.changeShowError();

            expect(vm.showError).toEqual(false);
        });
    });
});
