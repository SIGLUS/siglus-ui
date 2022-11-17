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
     * @name siglus-soh-product-detail-print.controller:SiglusSohLotDetailPrintController
     *
     * @description
     * Controller in charge of printing lot movement detail.
     */
    angular
        .module('siglus-soh-lot-detail-print')
        .controller('SiglusSohLotDetailPrintController', controller);

    controller.$inject = ['$scope', '$window', 'facility', 'stockCard', 'REASON_TYPES',
        'messageService', 'REASON_CATEGORIES', 'Reason'];

    function controller($scope, $window, facility, stockCard, REASON_TYPES,
                        messageService, REASON_CATEGORIES, Reason) {
        var vm = this;
        vm.facility = undefined;
        vm.stockCard = undefined;
        vm.program = undefined;

        vm.getReason = getReason;
        vm.$onInit = onInit;
        vm.addPrefixForAdjustmentReason = addPrefixForAdjustmentReason;

        $scope.$on('$destroy', function() {
            $window.onunload = null;
        });

        $scope.$on('$stateChangeStart', function(event, toState) {
            if (toState) {
                document.getElementsByClassName('header')[0].style.display = 'block';
                document.getElementsByClassName('page')[0].childNodes[1].style.display = 'block';
            }
        });

        function onInit() {
            vm.stockCard = stockCard;
            vm.facility = facility;
            vm.program = stockCard.program;
            document.getElementsByClassName('header')[0].style.display = 'none';
            document.getElementsByClassName('page')[0].childNodes[1].style.display = 'none';
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
                ? 'Inventário físico'
                : addPrefixForAdjustmentReason(lineItem.reason).name;
        }
    }
})();
