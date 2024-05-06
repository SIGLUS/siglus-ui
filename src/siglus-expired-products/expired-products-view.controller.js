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
     * @name ExpiredProductsViewController
     *
     * @description
     * Controller for expired products view.
     */
    angular
        .module('siglus-expired-products')
        .controller('ExpiredProductsViewController', controller);

    controller.$inject = ['$state', '$stateParams', '$window', 'facility', 'expiredProducts', 'displayItems',
        'siglusSignatureWithDateModalService', 'expiredProductsViewService'];

    function controller($state, $stateParams, $window, facility, expiredProducts, displayItems,
                        siglusSignatureWithDateModalService, expiredProductsViewService) {
        var vm = this;

        vm.keyword = '';
        vm.facility = undefined;
        vm.expiredProducts = [];
        vm.displayItems = [];
        vm.enableLocation = false;
        vm.$onInit = onInit;
        vm.skipAllLineItems = skipAllLineItems;
        vm.unskipAllLineItems = unskipAllLineItems;
        // vm.changeSkipStatus = changeSkipStatus;

        function onInit() {
            vm.keyword = $stateParams.keyword;
            vm.facility = facility;
            vm.expiredProducts = expiredProducts;
            vm.displayItems = displayItems;
            vm.enableLocation = angular.copy(
                facility.enableLocationManagement
            );
        }

        function reloadPage() {
            $stateParams.facility = facility;
            $stateParams.keyword = vm.keyword;
            $stateParams.pageNumber = 0;
            $state.go($state.current.name, $stateParams, {
                reload: true
            });
        }

        vm.search = function() {
            reloadPage();
        };

        vm.cancelFilter = function() {
            vm.keyword = null;
            reloadPage();
        };

        vm.print = function() {
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'stockmanagement/expiredProductsPrint';
            $window.open(PRINT_URL, '_blank');
        };

        function skipAllLineItems() {
            vm.displayItems.forEach(function(tableLineItem) {
                tableLineItem.skipped = true;
            });
        }

        function unskipAllLineItems() {
            vm.displayItems.forEach(function(tableLineItem) {
                tableLineItem.skipped = false;
            });
        }

        vm.viewDetail = function(lineItem) {
            if (vm.enableLocation) {
                $state.go('openlmis.locationManagement.stockOnHand.locationDetail', {
                    stockCardId: lineItem.stockCardId,
                    locationCode: lineItem.locationCode,
                    program: lineItem.programId,
                    facility: vm.facility.id
                });
            } else {
                $state.go('openlmis.stockmanagement.stockCardSummaries.singleCard', {
                    stockCardId: lineItem.stockCardId,
                    program: lineItem.programId,
                    facility: vm.facility.id
                });
            }
        };

        vm.generatePickPackList = function() {
            var datas = vm.displayItems.filter(function(item) {
                return !item.skipped;
            });
            expiredProductsViewService.savePickPackDatas(vm.facility, datas);
            var PRINT_URL = $window.location.href.split('!/')[0]
                + '!/'
                + 'stockmanagement/expiredProductsPickPack';
            $window.open(PRINT_URL, '_blank');
        };

        vm.confirmRemove = function() {
            siglusSignatureWithDateModalService.confirm('stockUnpackKitCreation.signature', null, null, true)
                .then(function(resolvedData) {
                    console.log(resolvedData);
                });
        };
    }
})();
