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
     * @ngdoc filter
     * @name stock-physical-inventory-draft.filter:siglusGroupByAllProductProgramProductCategory
     *
     * @description
     * Groups nested array of physical inventory line item by 'orderableCategoryDisplayName'
     *
     * @param   {Array}  List of objects to be grouped
     * @return  {Object} Grouped products - category name as key and array of products as value
     */
    angular
        .module('stock-physical-inventory-draft')
        .filter('siglusGroupByAllProductProgramProductCategory', filter);

    function filter() {
        return function(items) {
            return _.groupBy(items, function(item) {
                return _.findWhere(item[0].orderable.programs).orderableCategoryDisplayName;
            });
        };
    }

})();