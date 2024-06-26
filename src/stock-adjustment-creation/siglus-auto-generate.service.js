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

    angular
        .module('stock-adjustment-creation')
        .service('siglusAutoGenerateService', service);

    service.$inject = ['dateUtils', 'moment', 'SIGLUS_LOT_CODE_DATE_FORMATE'];
    var dateLotMapping = {};

    function service(dateUtils, moment, SIGLUS_LOT_CODE_DATE_FORMATE) {
        this.autoGenerateLotCode = function(lineItem) {
            var  code;
            var date = dateUtils.toDate(lineItem.lot.expirationDate);
            if (lineItem.orderable) {
                var productCode = lineItem.orderable.productCode;
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var year = date.getFullYear();
                var lotCodeKey = 'SEM-LOTE-' + productCode.toUpperCase() + '-' + month + year;

                var previous = dateLotMapping[productCode + lineItem.lot.expirationDate];

                if (previous) {
                    return previous;
                }

                code =  lotCodeKey + moment(lineItem.lot.expirationDate).format(SIGLUS_LOT_CODE_DATE_FORMATE);

                dateLotMapping[productCode + lineItem.lot.expirationDate] = code;

                return code;
            }
            lineItem.$errors.productCodeInvalid = true;
            return '';

        };

    }
})();