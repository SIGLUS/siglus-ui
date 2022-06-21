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

describe('PhysicalInventoryCreationController', function() {

    var vm, $q, $controller, authorizationService, UserDataBuilder, user,
        modalDeferred;

    beforeEach(function() {
        module('siglus-physical-inventory-creation');
        module('referencedata-user');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            authorizationService = $injector.get('authorizationService');
            UserDataBuilder = $injector.get('UserDataBuilder');
        });

        user = new UserDataBuilder().build();
        modalDeferred = $q.defer();

        spyOn(authorizationService, 'getUser').andReturn(user);

        vm = $controller('PhysicalInventoryCreationController', {
            modalDeferred: modalDeferred
        });
    });

    describe('Validate Input function', function() {

        it('should get input number when input value is given', function() {
            expect(vm.input).toEqual(vm.input);
        });
    });

    describe('Validate ModalDeferred function', function() {

        beforeEach(function() {
            spyOn(modalDeferred, 'resolve');
        });

        it('should resolve modal if input number is correct', function() {
            vm.inputValue();

            expect(modalDeferred.resolve).toHaveBeenCalledWith({
                input: vm.input
            });
        });
    });

});
