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
        .module('requisition-report-table')
        .controller('RapidTestProductController', controller);

    controller.$inject = ['requisitionUtils'];

    function controller(requisitionUtils) {

        var vm = this;

        vm.$onInit = onInit;
        vm.calculateTotal = requisitionUtils.calculateTotal;

        vm.validateStockOnHand = function(lineItem) {
            // try $errors instead of error here!
            // not working for openlmis-invalid with dynamic validation needs blur twice to show error
            // use ng-required instead
            lineItem.isRequiredSOH = true;
        };

        vm.validateBeginningBalance = function(lineItem) {
            lineItem.isRequiredBeginningBalance = true;
        };

        // function validateBB(lineItem) {
        //     var errors = {};
        //     if (lineItem.$errors) {
        //         errors.stockOnHand = lineItem.$errors.stockOnHand;
        //     }
        //
        //     if (!_.isNumber(lineItem.beginningBalance)) {
        //         errors.beginningBalance = 'requisitionValidation.required';
        //     }
        //
        //     lineItem.$errors = errors;
        // }

        function onInit() {
            vm.isFirstReport = vm.requisition.extraData.isFirstReport;
            vm.lineItems = vm.requisition.requisitionLineItems;
        }
    }

})();