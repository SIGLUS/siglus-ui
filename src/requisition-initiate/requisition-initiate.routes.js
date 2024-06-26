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

    angular
        .module('requisition-initiate')
        .config(routes);

    routes.$inject = ['$urlRouterProvider', '$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($urlRouterProvider, $stateProvider, REQUISITION_RIGHTS) {
        $urlRouterProvider.when('/requisitions/initiate', ['$state', '$stateParams', function($state, $stateParams) {
            $state.go('openlmis.requisitions.initRnr.requisition', $stateParams);
        }]);
        $stateProvider.state('openlmis.requisitions.initRnr', {
            // SIGLUS-REFACTOR: starts here
            url: '/initiate',
            // SIGLUS-REFACTOR: ends here
            showInNavigation: true,
            priority: 11,
            label: 'requisitionInitiate.createAuthorize',
            controller: 'RequisitionInitiateController',
            controllerAs: 'vm',
            templateUrl: 'requisition-initiate/requisition-initiate.html',
            accessRights: [
                REQUISITION_RIGHTS.REQUISITION_CREATE,
                REQUISITION_RIGHTS.REQUISITION_DELETE,
                REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
            ]
        });
    }

})();
