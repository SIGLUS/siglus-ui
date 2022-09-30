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

    NavigationController.$inject = ['$scope', 'navigationStateService', 'currentUserHomeFacilityService'];

    function NavigationController($scope, navigationStateService, currentUserHomeFacilityService) {

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
        }

        function setStates() {
            if (!$scope.rootState && !$scope.states) {
                vm.states = navigationStateService.roots[''];
            } else if ($scope.rootState) {
                var states = navigationStateService.roots[$scope.rootState];
                currentUserHomeFacilityService.getHomeFacility().then(function(data) {
                    var flag = data.enableLocationManagement;
                    vm.states = _.filter(states, function(stateItem) {
                        return !_.get(stateItem, ['name']).contains(
                            flag ? 'openlmis.stockmanagement' : 'openlmis.locationManagement'
                        );
                    });
                });

            } else {
                vm.states = $scope.states;
            }
        }
    }
})();
