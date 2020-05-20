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
        .service('stockEventService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory', 'moment'];

    function service($resource, stockmanagementUrlFactory, moment) {
        var resource = $resource(stockmanagementUrlFactory('/api/siglusintegration/stockEvents'), {}, {
            save: {
                method: 'POST',
                transformRequest: formatPayload
            }
        });

        return {
            submit: submitStockEvent,
            formatPayload: formatPayload,
            formatResponse: formatResponse
        };

        function submitStockEvent(event) {
            return resource.save(event).$promise;
        }

        function formatPayload(payload) {
            payload.lineItems.forEach(function(lineItem) {
                if (!lineItem.extraData) {
                    lineItem.extraData = {};
                }
                if (!lineItem.lotId) {
                    lineItem.extraData.lotCode = lineItem.lotCode;
                    lineItem.extraData.expirationDate = moment(lineItem.expirationDate).format('YYYY-MM-DD');
                }
                lineItem.extraData.stockCardId = lineItem.stockCardId;
                lineItem.occurredDate = moment(lineItem.occurredDate).format('YYYY-MM-DD');

                delete lineItem.lotCode;
                delete lineItem.expirationDate;
                delete lineItem.stockCardId;
            });

            return angular.toJson(payload);
        }

        function formatResponse(response) {
            response.lineItems.forEach(function(lineItem) {
                if (lineItem.extraData) {
                    lineItem.lotCode = lineItem.extraData.lotCode;
                    lineItem.expirationDate = lineItem.extraData.expirationDate;
                    lineItem.stockCardId = lineItem.extraData.stockCardId;
                }
            });

            return response;
        }
    }

})();
