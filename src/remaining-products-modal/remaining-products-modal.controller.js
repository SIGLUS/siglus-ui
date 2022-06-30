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
        .module('remaining-products-modal')
        .controller('remainingProductsModalController', controller);

    controller.$inject = [
        '$state', 'remainingProductsModalService', 'modalDeferred', 'items'
    ];

    function controller($state, remainingProductsModalService, modalDeferred, items) {
        var vm = this;
        vm.conflictItems = items;
        vm.$onInit = onInit;
        /**
         * @ngdoc method
         * @methodOf select-products-modal.controller:SelectProductsModalController
         * @name $onInit
         *
         * @description
         * Initialization method of the SelectProductsModalController.
         */
        function onInit() {
            // #105: activate archived product
            // vm.orderables = orderables.sort(function(a, b) {
            //     return a.archived - b.archived;
            // });
            // // #105: ends here
            // vm.selections = remainingProductsModalService.getSelections();
            // vm.external = external;
            // vm.code = $stateParams.productCode;
            // vm.name = $stateParams.productName;
            // vm.searchText = $stateParams.search;
            // vm.filteredOrderables = filterOrderables(orderables, $stateParams.search);
            // vm.isUnpackKitState = isUnpackKitState;
            // // SIGLUS-REFACTOR: starts here
            // vm.limit = remainingProductsModalService.getLimit();
            // vm.overLimit = false;
            // validateSelection();
            // SIGLUS-REFACTOR: ends here
        }

        vm.confirm = function() {
            //some items may not have been validated yet, so validate all here.
            // _.forEach(vm.addedItems, function(item) {
            //     vm.validate(item);
            // });

            // $scope.$broadcast('openlmis-form-submit');

            // var noErrors = _.all(vm.addedItems, function(item) {
            //     return !item.quantityInvalid;
            // });
            // if (noErrors) {
            //     modalDeferred.resolve();
            // }
            modalDeferred.resolve();
        };

        // function filterOrderables(orderables, searchText) {
        //     if (searchText) {
        //         return orderables.filter(searchByCodeAndName);
        //     }
        //     return orderables;
        // }

        // function searchByCodeAndName(orderable) {
        //     var searchText = vm.searchText.toLowerCase();
        //     var foundInFullProductName;
        //     var foundInProductCode;

        //     if (orderable.productCode !== undefined) {
        //         foundInProductCode = orderable.productCode.toLowerCase().startsWith(searchText);
        //     }

        //     if (orderable.fullProductName !== undefined) {
        //         foundInFullProductName = orderable.fullProductName.toLowerCase().contains(searchText);
        //     }
        //     return foundInFullProductName || foundInProductCode;
        // }
    }

})();
