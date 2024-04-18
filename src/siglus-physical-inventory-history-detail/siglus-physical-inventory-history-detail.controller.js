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
        .module('siglus-physical-inventory-history-detail')
        .controller('PhysicalInventoryHistoryDetailController', controller);

    controller.$inject = [
        '$state', 'facility', 'program', '$window'
    ];

    function controller($state, facility, program, $window) {
        var vm = this;
        vm.facility = facility;
        vm.program = program;
        vm.print = print;

        vm.detail = {
            items: [
                {
                    productCode: '001',
                    productName: '1',
                    lotCode: '2022xxx',
                    expiryDate: '2024xxx',
                    stockOnHand: '100',
                    currentStock: '200',
                    reasons: 'reasons'
                }, {
                    productCode: '001',
                    productName: '1',
                    lotCode: '2022xxx',
                    expiryDate: '2024xxx',
                    stockOnHand: '100',
                    currentStock: '200',
                    reasons: 'reasons'
                }
            ]
        };

        function print() {
            $window.open('#!/stockmanagement/history/print', '_blank');
        }
    }
})();
