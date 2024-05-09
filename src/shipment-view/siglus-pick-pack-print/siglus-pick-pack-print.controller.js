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
     * @name siglus-soh-location-detail-print.controller:SiglusSohLocationDetailPrintController
     *
     * @description
     * Controller in charge of printing location movement detail.
     */
    angular
        .module('siglus-pick-pack-print')
        .controller('SiglusPickPackPrintController', controller);

    controller.$inject = ['$scope', '$window', 'order', 'tableLineItems'];

    function controller($scope, $window, order, tableLineItems) {
        var vm = this;
        vm.$onInit = onInit;

        function getFillQuantity(tableLineItem) {
            var path = tableLineItem.isMainGroup ? ['quantityShipped'] : ['shipmentLineItem', 'quantityShipped'];
            return _.get(tableLineItem, path, 0);
        }

        function getAvailableSoh(tableLineItem) {
            var path = tableLineItem.isMainGroup ? ['stockOnHand'] : ['shipmentLineItem', 'stockOnHand'];
            return _.get(tableLineItem, path, 0);
        }

        function getRemainingSoh(tableLineItem) {
            var quantity = vm.getAvailableSoh(tableLineItem) - vm.getReservedSoh(tableLineItem);
            return quantity < 0 ? 0 : quantity;
        }

        function getReservedSoh(tableLineItem) {
            if (tableLineItem.isMainGroup) {
                var lotLineItems = tableLineItems.filter(function(lineItem) {
                    return !lineItem.isMainGroup &&
                        tableLineItem.id === _.get(lineItem, ['shipmentLineItem', 'orderable', 'id']) ;
                });
                return _.isEmpty(lotLineItems) ? 0 : _.reduce(lotLineItems, function(reservedSohSum, lineItem) {
                    return reservedSohSum + vm.getReservedSoh(lineItem);
                }, 0);
            }
            return _.get(tableLineItem, ['reservedStock'], 0) + vm.getFillQuantity(tableLineItem);
        }

        function onInit() {
            vm.order = order;
            vm.getFillQuantity = getFillQuantity;
            vm.getAvailableSoh = getAvailableSoh;
            vm.getRemainingSoh = getRemainingSoh;
            vm.getReservedSoh = getReservedSoh;
            vm.tableLineItems = tableLineItems;
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        }

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
