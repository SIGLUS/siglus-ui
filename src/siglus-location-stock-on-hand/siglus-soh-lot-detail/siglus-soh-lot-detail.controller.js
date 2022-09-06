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
        .module('siglus-soh-lot-detail')
        .controller('siglusSohLotDetailController', siglusSohLotDetailController);

    siglusSohLotDetailController.$inject = [
        'stockCard', '$state', 'stockCardService', 'REASON_TYPES', 'messageService',
        'alertService', '$scope', 'confirmService', 'notificationService', 'loadingModalService',
        'paginationService', '$stateParams', 'REASON_CATEGORIES', 'Reason'
    ];

    function siglusSohLotDetailController(stockCard, $state, stockCardService, REASON_TYPES, messageService,
                                          alertService, $scope, confirmService, notificationService,
                                          loadingModalService, paginationService,
                                          $stateParams, REASON_CATEGORIES, Reason) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getReason = getReason;
        vm.stockCard = [];
        vm.displayedLineItems = [];
        vm.binCardName = '';

        vm.print = function() {
            stockCardService.print(vm.stockCard.id);
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
            vm.binCardName = stockCard.orderable.fullProductName;
            $stateParams.stockCard = stockCard;
            paginationService.registerList(null, $stateParams, function() {
                return vm.stockCard.lineItems;
            });
        }

        function getSignedQuantity(adjustment) {
            if (adjustment.reason.reasonType === REASON_TYPES.DEBIT) {
                return -adjustment.quantity;
            }
            return adjustment.quantity;
        }

        function addPrefixForAdjustmentReason(reason) {
            var negativePrefix = '[Ajustes Negativos] ';
            var positivePrefix = '[Ajustes Positivos] ';
            if (reason.reasonType === REASON_TYPES.DEBIT && !reason.name.contains(negativePrefix)) {
                reason.name = negativePrefix + reason.name;
            } else if (reason.reasonType === REASON_TYPES.CREDIT && !reason.name.contains(positivePrefix)) {
                reason.name = positivePrefix + reason.name;
            }
            return reason;
        }

        function isPhysicalReason(reasonCategory) {
            return reasonCategory === REASON_CATEGORIES.PHYSICAL_INVENTORY;
        }

        function getReason(lineItem) {
            lineItem.reason = new Reason(lineItem.reason);
            if (lineItem.reasonFreeText) {
                return messageService.get('stockCard.reasonAndFreeText', {
                    name: addPrefixForAdjustmentReason(lineItem.reason).name,
                    freeText: lineItem.reasonFreeText
                });
            }
            return isPhysicalReason(_.get(lineItem.reason, 'reasonCategory'))
                ? messageService.get('stockCard.physicalInventory')
                : addPrefixForAdjustmentReason(lineItem.reason).name;
        }
    }
})();