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
     * @ngdoc object
     * @name stockmanagement.max-string-value
     *
     * @description
     * This is constant for max lot code string value.
     */
    angular.module('stockmanagement')
        .constant('SIGLUS_MAX_STRING_VALUE', 40)
        .constant('SIGLUS_LOT_CODE_DATE_FORMATE', '-DD/MM/YYYY')
        .constant('SIGLUS_LOT_CODE_REGEXP', /^.*-[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/)
        .constant('SIGLUS_LOT_CODE_REGEXP_REPLACE', /-[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/)
        .constant('SIGLUS_LOT_CODE_DATE_ISVALID', 'DD/MM/YYYY');

})();
