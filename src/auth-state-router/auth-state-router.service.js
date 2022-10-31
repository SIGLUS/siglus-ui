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
     * @ngdoc service
     * @name auth-state-router.authStateRouter
     *
     * @description
     * Functions for initialize/reroute state.
     */
    angular
        .module('auth-state-router')
        .service('authStateRouter', router);

    router.$inject = ['$rootScope', '$state', 'authorizationService', 'alertService',
        'loadingModalService'];

    function router($rootScope, $state, authorizationService, alertService, loadingModalService) {

        this.initialize = initialize;

        /**
         * @ngdoc method
         * @methodOf auth-state-router.authStateRouter
         * @name initialize
         *
         * @description
        * Initializes the state router.
         */
        function initialize() {
            $rootScope.$on('$stateChangeStart', reroute);
        }

        function reroute(event, toState) {

            if (!authorizationService.isAuthenticated() && toState.name.indexOf('auth') !== 0) {
                event.preventDefault();
                $rootScope.$emit('openlmis-auth.logout');
                $state.go('auth.login', {
                    reload: true
                });
            } else if (authorizationService.isAuthenticated() && toState.name.indexOf('auth') === 0) {
                event.preventDefault();
                $state.go('openlmis.home', {}, {
                    reload: true
                });
            } else if (canViewState(toState)) {
                event.preventDefault();
                loadingModalService.close();
                alertService.error('openlmisAuth.authorization.error');
            }
        }

        function canViewState(toState) {
            return toState.accessRights &&
                !authorizationService.hasRights(toState.accessRights, toState.areAllRightsRequired);
        }
    }

})();
