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
        .module('shipment-view-report')
        .controller('ShipmentViewReport', controller);

    controller.$inject = [
        '$scope',
        '$window',
        'displayTableLineItems',
        '$stateParams',
        'QUANTITY_UNIT',
        'SiglusLocationCommonUtilsService',
        'locations',
        'pickPackInfo'
    ];

    function controller(
        $scope,
        $window,
        displayTableLineItems,
        $stateParams,
        QUANTITY_UNIT,
        SiglusLocationCommonUtilsService,
        locations,
        pickPackInfo
    ) {
        var vm = this;
        vm.$onInit = onInit;

        function onInit() {
            hideLayoutAndBreadcrumb();
            vm.quantityUnit = undefined;
            vm.displayTableLineItems = JSON.parse(displayTableLineItems);
            vm.pickPackInfo = pickPackInfo;
        }

        var hideLayoutAndBreadcrumb = function() {
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
        };

        vm.showInDoses = function showInDoses() {
            return vm.quantityUnit === QUANTITY_UNIT.DOSES;
        };

        vm.getFillQuantity = function(lineItems, index) {
            if (index === 0) {
                return _.reduce(lineItems, function(fillQuantity, item) {
                    return fillQuantity + _.get(item, 'quantityShipped', 0);
                }, 0);
            }
            return _.get(lineItems[index], 'quantityShipped', 0);

        };

        function recalculateQuantity(quantity, lineItem) {
            if (vm.showInDoses()) {
                var netContent =  _.get(lineItem, 'netContent', 1);
                return quantity * netContent;
            }
            return quantity;
        }

        function getSohByOrderableLocation(lineItem) {
            var orderableLocationLotsMap =
                SiglusLocationCommonUtilsService.getOrderableLocationLotsMap(locations);
            var lot = _.chain(orderableLocationLotsMap[lineItem.orderableId])
                .get(_.get(lineItem.location, 'locationCode'))
                .find(function(item) {
                    return lineItem.isKit ? _.isEmpty(item.lotCode)
                        : item.lotCode === _.get(lineItem.lot, 'lotCode');
                })
                .value();
            return _.get(lot, 'stockOnHand', 0);
        }

        function getSohByOrderableAndLocation(lineItem) {
            return recalculateQuantity(getSohByOrderableLocation(lineItem));
        }

        vm.getAvailableSoh = function(lineItems, index) {
            if (index === 0) {
                return _.reduce(lineItems, function(availableSoh, lineItem) {
                    return availableSoh + getSohByOrderableAndLocation(lineItem);

                }, 0);
            }
            return getSohByOrderableAndLocation(lineItems[index]);

        };

        vm.getRemainingSoh = function(lineItems, index) {
            var quantity = vm.getAvailableSoh(lineItems, index) - vm.getFillQuantity(lineItems, index);
            return quantity < 0 ? 0 : quantity;
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
