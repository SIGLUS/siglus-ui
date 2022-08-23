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

describe('openlmis-navigation run', function() {

    beforeEach(function() {
        var context = this;
        module('openlmis-navigation', function($provide) {
            context.loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', context.loginServiceSpy);

            context.navigationStateServiceSpy = jasmine.createSpyObj('navigationStateService', [
                'clearStatesAvailability'
            ]);
            $provide.value('navigationStateService', context.navigationStateServiceSpy);
        });

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.$q = $injector.get('$q');
        });

        this.postLogoutAction = this.loginServiceSpy.registerPostLogoutAction.calls[0].args[0];
    });

    describe('run block', function() {

        it('should register post logout action', function() {
            expect(this.loginServiceSpy.registerPostLogoutAction).toHaveBeenCalled();
        });

    });

    // describe('post logout action', function() {

    //     it('should clear current user cache', function() {
    //         this.navigationStateServiceSpy.clearStatesAvailability.andReturn(this.$q.resolve());

    //         var success;
    //         console.log(this.postLogoutAction());
    //         this.postLogoutAction()
    //             .then(function() {
    //                 success = true;
    //             });
    //         this.$rootScope.$apply();

    //         expect(success).toBe(true);
    //         expect(this.navigationStateServiceSpy.clearStatesAvailability).toHaveBeenCalled();
    //     });

    // });

});