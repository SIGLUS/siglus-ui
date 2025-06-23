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
     * @name siglus-soh-product-detail-print.controller:SiglusSohProductDetailPrintController
     *
     * @description
     * Controller in charge of printing product movement detail.
     */
    angular
        .module('siglus-soh-product-detail-print')
        .controller('SiglusSohProductDetailPrintController', controller);

    controller.$inject = [
        '$scope',
        '$window',
        '$stateParams',
        'facility',
        'stockCard',
        'program',
        'STOCKREASON'
    ];

    function controller($scope, $window, $stateParams, facility, stockCard, program, STOCKREASON) {
        var vm = this;
        vm.facility = undefined;
        vm.stockCard = undefined;
        vm.program = undefined;
        vm.isArchived = false;

        vm.$onInit = function onInit() {
            vm.stockCard = stockCard;
            vm.facility = facility;
            vm.program = program;
            vm.isArchived = $stateParams.isArchived;
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        };

        vm.getReason = function(lineItem) {
            var reason = lineItem.reason;
            if (reason === 'stockConstants.adjustment' && lineItem.reasonFreeText) {
                return _.get(STOCKREASON, reason, '') + ': ' + _.get(lineItem, 'reasonFreeText', '');
            }
            return _.get(STOCKREASON, reason, null);
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
