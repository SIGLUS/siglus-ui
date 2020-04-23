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
/* eslint-disable */

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
        .module('stock-card')
        .controller('StockCardController', controller);

    // SIGLUS-REFACTOR: starts here
    controller.$inject = ['stockCard', '$state', 'stockCardService', 'REASON_TYPES', 'messageService', 'Reason', 'alertService', '$scope'];
    // SIGLUS-REFACTOR: ends here

    function controller(stockCard, $state, stockCardService, REASON_TYPES, messageService, Reason, alertService, $scope) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getReason = getReason;
        vm.stockCard = [];
        vm.displayedLineItems = [];
        // SIGLUS-REFACTOR: starts here
        vm.binCardName = '';
        vm.paginationId = 'stock-management-stock-card';
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name print
         *
         * @description
         * Print specific stock card.
         *
         */
        vm.print = function() {
            stockCardService.print(vm.stockCard.id);
        };

        function onInit() {
            $state.current.label = stockCard.orderable.fullProductName;

            var items = [];
            var previousSoh;
            // SIGLUS-REFACTOR: starts here
            var hasAddFirstInventory = false;
            var firstInventoryItem = {
                occurredDate: stockCard.createDate,
                stockOnHand: 0,
                reason: new Reason({
                    name: 'Inventory'
                })
            };
            var isViewProductCard = stockCard.isViewProductCard;
            angular.forEach(stockCard.lineItems, function(lineItem) {
                if (!isViewProductCard && !hasAddFirstInventory && stockCard.createDate > lineItem.occurredDate) {
                    items.push(firstInventoryItem);
                    hasAddFirstInventory = true;
                }
                // if (lineItem.stockAdjustments.length > 0) {
                //     angular.forEach(lineItem.stockAdjustments.slice().reverse(), function(adjustment, i) {
                //         var lineValue = angular.copy(lineItem);
                //         if (i !== 0) {
                //             lineValue.stockOnHand = previousSoh;
                //         }
                //         // lineValue.reason = adjustment.reason;
                //         lineValue.quantity = adjustment.quantity;
                //         lineValue.stockAdjustments = [];
                //         items.push(lineValue);
                //         previousSoh = lineValue.stockOnHand - getSignedQuantity(adjustment);
                //     });
                // } else {
                //     items.push(lineItem);
                // }
                items.push(lineItem);
            });
            if (!isViewProductCard && !hasAddFirstInventory) {
                items.push(firstInventoryItem);
            }

            vm.stockCard = stockCard;
            vm.stockCard.lineItems = items;
            vm.binCardName = isViewProductCard
                ? stockCard.orderable.fullProductName
                : stockCard.program.name;
        }
        // SIGLUS-REFACTOR: ends here

        function getSignedQuantity(adjustment) {
            if (adjustment.reason.reasonType === REASON_TYPES.DEBIT) {
                return -adjustment.quantity;
            }
            return adjustment.quantity;

        }

        /**
         * @ngdoc method
         * @methodOf stock-card.controller:StockCardController
         * @name getReason
         *
         * @description
         * Get Reason column value.
         *
         * @param {object} lineItem to get reason from
         * @return {object} message for reason
         */
        function getReason(lineItem) {
            // SIGLUS-REFACTOR: starts here
            if (lineItem.reasonFreeText && lineItem.reason.isFreeTextAllowed) {
                // SIGLUS-REFACTOR: ends here
                return messageService.get('stockCard.reasonAndFreeText', {
                    name: lineItem.reason.name,
                    freeText: lineItem.reasonFreeText
                });
            }
            return lineItem.reason.isPhysicalReason()
                ? messageService.get('stockCard.physicalInventory')
                : lineItem.reason.name;
        }

        // SIGLUS-REFACTOR: starts here
        $scope.$on('$viewContentLoaded', function () {
            var lastItemStockOnHand = vm.stockCard.lineItems[0].stockOnHand;

            if (stockCard.isViewProductCard && lastItemStockOnHand !== stockCard.stockOnHand) {
                alertService.error('stockCard.viewProductStockCard.failure');
            }
        });
        // SIGLUS-REFACTOR: ends here

    }
})();
