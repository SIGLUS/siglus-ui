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

(function() {
    'use strict';

    /**
     * @ngdoc controller
     * @name openlmis-login.controller:LoginController
     *
     * @description
     * Controller that drives the login form.
     */
    angular
        .module('openlmis-login')
        .controller('LoginController', LoginController);

    LoginController.$inject = [
        'loginService', 'modalDeferred', 'loadingModalService', '$rootScope', 'LocalDatabase',
        'siglusHomeFacilityService', 'localStorageService', 'navigationStateService', 'currentUserService'
    ];

    function LoginController(loginService, modalDeferred, loadingModalService, $rootScope, LocalDatabase,
                             siglusHomeFacilityService, localStorageService, navigationStateService,
                             currentUserService) {

        var vm = this;

        vm.doLogin = doLogin;

        vm.$onInit = function() {
            new LocalDatabase('orderables').removeAll();
            siglusHomeFacilityService.facility = null;
            currentUserService.clearAllStorage();
            navigationStateService.clearPromise();
        };

        /**
         * @ngdoc method
         * @methodOf openlmis-login.controller:LoginController
         * @name doLogin
         *
         * @description
         * Takes username and .password variables and sends them to login service.
         * On error response from the login service, loginError is set.
         * On success a 'auth.login' event is emitted.
         */
        function doLogin() {
            loadingModalService.open();
            loginService.login(vm.username, vm.password)
                .then(function() {
                    $rootScope.$emit('openlmis-auth.login');
                    modalDeferred.resolve();
                })
                .catch(function(error) {
                    var errorMessageKey = _.get(error, ['data', 'messageKey']);
                    if (errorMessageKey === 'localmachine.notActivated') {
                        vm.loginError = 'openlmisLogin.localmachineNotActivated';
                        loginService.logout();
                    } else if (errorMessageKey === 'localmachine.login.user.not.match.active.facility') {
                        vm.loginError = 'openlmisLogin.localmachineLoginUserNotMatchActiveFacility';
                        loginService.logout();
                    } else {
                        vm.loginError = error;
                    }
                    vm.password = undefined;
                })
                .finally(loadingModalService.close);
        }

    }
}());
