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
     * @name siglus-stock-archived-product.filter:siglusArchivedProductName
     *
     * @description
     * Add archived tag for archived product name.
     *
     * @param   {Object} orderableGroup
     * @return  {String}
     */
    angular
        .module('siglus-stock-archived-product')
        .filter('siglusArchivedProductName', archivedProductNameFilter);
    archivedProductNameFilter.$inject = ['messageService'];
    function archivedProductNameFilter(messageService) {
        return function(orderable) {
            if (!orderable) {
                return undefined;
            }

            if (orderable.archived) {
                return '[' + messageService.get('product.archived') + '] ' + orderable.fullProductName;
            }
            return orderable.fullProductName;
        };
    }

})();
