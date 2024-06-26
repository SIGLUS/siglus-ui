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
     * @name stock-card.controller:StockCardController
     *
     * @description
     * Controller in charge of displaying one single stock card.
     */
    angular
        .module('siglus-soh-product-print')
        .controller('SiglusSohPrintController', controller);

    controller.$inject = [
        'stockCardLineItems',
        '$scope',
        '$window',
        'facility',
        'program'
    ];

    function controller(
        stockCardLineItems,
        $scope,
        $window,
        facility,
        program
    ) {
        var vm = this;

        vm.$onInit = onInit;

        vm.displayItems = [];
        vm.program = undefined;
        vm.facility = undefined;

        function onInit() {
            hideLayoutAndBreadcrumb();
            vm.displayItems = stockCardLineItems;
            vm.program = program;
            vm.facility = facility;
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
