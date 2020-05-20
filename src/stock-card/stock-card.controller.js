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
        .module('stock-card')
        .controller('StockCardController', controller);

    controller.$inject = [
        'stockCard', '$state', 'stockCardService', 'REASON_TYPES', 'messageService',
        // SIGLUS-REFACTOR: starts here
        'Reason', 'alertService', '$scope', 'confirmService', 'notificationService'
        // SIGLUS-REFACTOR: ends here
    ];

    function controller(stockCard, $state, stockCardService, REASON_TYPES, messageService,
                        Reason, alertService, $scope, confirmService, notificationService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getReason = getReason;
        vm.stockCard = [];
        vm.displayedLineItems = [];
        // SIGLUS-REFACTOR: starts here
        vm.binCardName = '';
        vm.isLoadSOHCorrectly = false;
        vm.canArchive = false;
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

        vm.archive = function() {
            confirmService.confirmDestroy('stockCard.archiveProduct', 'stockCard.archive', 'stockCard.cancel')
                .then(function() {
                    stockCardService.archiveProduct(stockCard.orderable.id).then(function() {
                        notificationService.success('stockCard.archiveProduct.success');
                        $state.go('openlmis.stockmanagement.archivedProductSummaries');
                    }, function() {
                        notificationService.error('stockCard.archiveProduct.failure');
                    });
                });
        };

        function onInit() {
            $state.current.label = stockCard.orderable.fullProductName;

            var items = [];
            var previousSoh;
            angular.forEach(stockCard.lineItems, function(lineItem) {
                if (lineItem.stockAdjustments.length > 0) {
                    angular.forEach(lineItem.stockAdjustments.slice().reverse(), function(adjustment, i) {
                        var lineValue = angular.copy(lineItem);
                        if (i !== 0) {
                            lineValue.stockOnHand = previousSoh;
                        }
                        lineValue.reason = adjustment.reason;
                        lineValue.quantity = adjustment.quantity;
                        lineValue.stockAdjustments = [];
                        items.push(lineValue);
                        previousSoh = lineValue.stockOnHand - getSignedQuantity(adjustment);
                    });
                } else {
                    items.push(lineItem);
                }
            });

            vm.stockCard = stockCard;
            vm.stockCard.lineItems = items;
            // SIGLUS-REFACTOR: starts here
            vm.binCardName = stockCard.isViewProductCard
                ? stockCard.orderable.fullProductName
                : stockCard.program.name;
            vm.isLoadSOHCorrectly = stockCard.lineItems[0].stockOnHand === stockCard.stockOnHand;
            vm.canArchive = stockCard.isViewProductCard && stockCard.stockOnHand === 0 && vm.isLoadSOHCorrectly;
            // SIGLUS-REFACTOR: ends here
        }

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
            if (lineItem.reasonFreeText) {
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
        $scope.$on('$viewContentLoaded', function() {
            if (stockCard.isViewProductCard && !vm.isLoadSOHCorrectly) {
                alertService.error('stockCard.viewProductStockCard.failure');
            }
        });
        // SIGLUS-REFACTOR: ends here

    }
})();
