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
     * @name openlmis-navigation.controller:NavigationController
     *
     * @description
     * Adds functionality that takes a state's label property and uses the messageService to translate it into string.
     */

    angular
        .module('openlmis-navigation')
        .controller('NavigationController', NavigationController);

    NavigationController.$inject = [
        '$scope', 'navigationStateService',
        // SIGLUS-REFACTOR: starts here
        'authorizationService'
        // SIGLUS-REFACTOR: ends here
    ];

    function NavigationController($scope, navigationStateService, authorizationService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.hasChildren = navigationStateService.hasChildren;
        vm.isSubmenu = navigationStateService.isSubmenu;
        vm.isOffline = navigationStateService.isOffline;

        /**
         * @ngdoc property
         * @propertyOf openlmis-navigation.controller:NavigationController
         * @name states
         * @type {Array}
         *
         * @description
         * Contains all states in application in tree structure.
         */
        vm.states = undefined;

        /**
         * @ngdoc method
         * @methodOf openlmis-navigation.controller:NavigationController
         * @name onInit
         *
         * @description
         * Initialization method for NavigationController.
         */
        function onInit() {
            setStates();
            // SIGLUS-REFACTOR: hide state and check requisition rights
            checkRequisitionRights();
            // SIGLUS-REFACTOR: ends here
        }

        function setStates() {
            if (!$scope.rootState && !$scope.states) {
                vm.states = navigationStateService.roots[''];
            } else if ($scope.rootState) {
                vm.states = navigationStateService.roots[$scope.rootState];
            } else {
                vm.states = $scope.states;
            }
        }

        // SIGLUS-REFACTOR: hide state and check requisition rights
        function checkRequisitionRights() {
            _.forEach(vm.states, function(state) {
                if (state.name === 'openlmis.requisitions' && _.isArray(state.children)) {
                    _.forEach(state.children, function(child) {
                        if (child.name === 'openlmis.requisitions.initRnr') {
                            var rights = authorizationService.getRights();
                            var canCreate = _.some(rights, function(right) {
                                return right.name === 'REQUISITION_CREATE';
                            });
                            var canAuthorize = _.some(rights, function(right) {
                                return right.name === 'REQUISITION_AUTHORIZE';
                            });

                            if (canCreate && !canAuthorize) {
                                child.label = 'requisitionInitiate.create';
                            }

                            if (!canCreate && canAuthorize) {
                                child.label = 'requisitionInitiate.authorize';
                            }
                        }
                    });
                }
            });
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
