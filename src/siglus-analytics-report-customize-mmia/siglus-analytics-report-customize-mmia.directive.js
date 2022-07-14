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
     * @ngdoc directive
     * @restrict A
     * @name mmia
     *
     * @description
     * Responsible for rendering the product grid cell based on the column source and requisitions type.
     * It also keeps track of the validation as well as changes made to the related cells.
     *
     * @example
     * Here we extend our product grid cell with the directive.
     * ```
     * ```
     */

    angular
        .module('siglus-analytics-report-customize-mmia')
        .directive('mmiaBarcode', mmiaBarcode);

    mmiaBarcode.$inject = [];

    function mmiaBarcode() {
        return {
            restrict: 'A',
            controller: function($scope) {
                // this.lineItem = $scope.item;
                console.log($scope);
            },
            scope: {
                requisition: '=requisition',
                columns: '=columns'
            },
            template: function($scope) {
                console.log('#### this scope', $scope);
                // scope.name =  myService.name + ' - Link';
                return '1';
            }
        };
    }

})();
