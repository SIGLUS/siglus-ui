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

    // SIGLUS-REFACTOR: starts here
    routes.$inject = ['$urlRouterProvider', '$stateProvider', 'INITRNR_LABEL', 'REQUISITION_RIGHTS'];

    function routes($urlRouterProvider, $stateProvider, INITRNR_LABEL, REQUISITION_RIGHTS) {
        [INITRNR_LABEL.CREATE_AUTHORIZE, INITRNR_LABEL.CREATE, INITRNR_LABEL.AUTHORIZE].forEach(function(right) {
            redirectToRequisitionTab(right);
            addStateForRight(right);
        });

        function redirectToRequisitionTab(right) {
            $urlRouterProvider.when('/requisitions/' + right,
                ['$state', '$stateParams', function($state, $stateParams) {
                    $state.go('openlmis.requisitions.' + right + '.initRnr', $stateParams);
                }]);
        }
        function addStateForRight(right) {
            var stateParams = {
                url: '/' + right,
                showInNavigation: true,
                priority: 11,
                label: 'requisitionInitiate.createAuthorize',
                controller: 'RequisitionInitiateController',
                controllerAs: 'vm',
                templateUrl: 'requisition-initiate/requisition-initiate.html',
                accessRights: [
                    REQUISITION_RIGHTS.REQUISITION_CREATE,
                    REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
                ],
                areAllRightsRequired: true
            };
            if (right === INITRNR_LABEL.CREATE) {
                stateParams.label = 'requisitionInitiate.create';
                stateParams.accessRights = [
                    REQUISITION_RIGHTS.REQUISITION_CREATE
                ];
                stateParams.canAccess = function(permissionService, REQUISITION_RIGHTS) {
                    return haveNoPermission(permissionService, REQUISITION_RIGHTS.REQUISITION_AUTHORIZE);
                };
            }
            if (right === INITRNR_LABEL.AUTHORIZE) {
                stateParams.label = 'requisitionInitiate.authorize';
                stateParams.accessRights = [
                    REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
                ];
                stateParams.canAccess = function(permissionService, REQUISITION_RIGHTS) {
                    return haveNoPermission(permissionService, REQUISITION_RIGHTS.REQUISITION_CREATE);
                };
            }
            $stateProvider.state('openlmis.requisitions.' + right, stateParams);
        }
        function haveNoPermission(permissionService, right) {
            return permissionService
                .hasPermissionWithAnyProgramAndAnyFacility(right)
                .then(function() {
                    return false;
                })
                .catch(function() {
                    return true;
                });
        }
    }
// SIGLUS-REFACTOR: starts here
})();
