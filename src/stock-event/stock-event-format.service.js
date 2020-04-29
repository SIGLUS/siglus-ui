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
        .module('stock-event')
        .service('stockEventFormatService', service);

    service.$inject = [];

    function service() {
        <!-- SIGLUS-REFACTOR: starts here -->
        this.formatPayload = function(payload) {
            payload.lineItems.forEach(function(lineItem) {
                if (lineItem.extraData) {
                    lineItem.extraData.lotCode = lineItem.lotCode;
                    lineItem.extraData.expirationDate = lineItem.expirationDate;
                    lineItem.extraData.stockCardId = lineItem.stockCardId;
                    lineItem.extraData.reasonFreeText = lineItem.reasonFreeText;

                    delete lineItem.lotCode;
                    delete lineItem.expirationDate;
                    delete lineItem.stockCardId;
                    delete lineItem.reasonFreeText;
                }
            });

            return payload;
        };
        <!-- SIGLUS-REFACTOR: ends here -->
    }

})();
