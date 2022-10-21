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
        .module('siglus-soh-location-detail')
        .controller('siglusSohLocationDetailController', controller);

    controller.$inject = ['stockCard', 'REASON_TYPES', '$state', '$window', 'stockCardService', 'confirmService',
        'loadingModalService', 'messageService', 'notificationService', '$stateParams',
        'paginationService', 'localStorageService'];

    function controller(stockCard, REASON_TYPES, $state, $window, stockCardService, confirmService,
                        loadingModalService, messageService, notificationService, $stateParams,
                        paginationService, localStorageService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.stockCard = [];
        vm.displayedLineItems = [];

        vm.print = function() {
            localStorageService.add('stockCardInfoForPrint', angular.toJson(stockCard));
            var PRINT_URL = $window.location.href.split('!/')[0] + '!/locationManagement/locationDetailPrint';
            $window.open(PRINT_URL, '_blank');
        };

        vm.getProductName = function() {
            var unit = vm.stockCard.displayUnit;
            return _.isEmpty(unit) ? vm.stockCard.productName : vm.stockCard.productName + ' - ' + unit;
        };

        function onInit() {
            $state.current.label = stockCard.productName;
            vm.stockCard = stockCard;
            paginationService.registerList(null, $stateParams, function() {
                return vm.stockCard.lineItems;
            });
        }
    }
})();
