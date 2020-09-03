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

describe('SiglusGoBackController', function() {

    var vm, $controller, stateTrackerService;

    beforeEach(function() {
        module('siglus-go-back');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            stateTrackerService = $injector.get('stateTrackerService');
        });

        vm = $controller('SiglusGoBackController');
        spyOn(stateTrackerService, 'goToPreviousState');
    });

    describe('backToPrevious', function() {

        it('should call the goToPreviousState method and set the default previous state', function() {
            vm.backToPrevious();

            expect(stateTrackerService.goToPreviousState).toHaveBeenCalledWith('openlmis.home');
        });
    });
});
