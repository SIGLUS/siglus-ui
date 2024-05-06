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
     * @name SiglusExpiredProductsPickPackController
     *
     */
    angular
        .module('expired-products-pick-pack')
        .controller('SiglusExpiredProductsPickPackController', controller);

    controller.$inject = [
        '$scope',
        '$window',
        'facility',
        'displayItems'
    ];

    function controller(
        $scope,
        $window,
        facility,
        displayItems
    ) {
        var vm = this;

        vm.$onInit = onInit;

        vm.displayItems = [];
        vm.facility = undefined;
        vm.enableLocation = false;
        vm.now = new Date();

        function onInit() {
            hideLayoutAndBreadcrumb();
            vm.facility = facility;
            vm.displayItems = displayItems;
            vm.enableLocation = angular.copy(
                facility.enableLocationManagement
            );
        }

        var hideLayoutAndBreadcrumb = function() {
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        };

        $scope.$on('$destroy', function() {
            $window.onunload = null;
        });

        $scope.$on('$stateChangeStart', function(event, toState) {
            if (toState) {
                document.getElementsByClassName('header')[0].style.display = 'block';
                document.getElementsByClassName('page')[0].childNodes[1].style.display = 'block';
            }
        });
    }
})();
