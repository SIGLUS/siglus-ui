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
   * @ngdoc service
   * @name stockmanagement.siglusStockIssueService
   *
   * @description
   * provide issue draft save delete create get request
   */
    angular
        .module('siglus-location-stock-on-hand')
        .service('prepareStockOnHandRowService', prepareStockOnHandRowService);

    prepareStockOnHandRowService.$inject = [];

    function prepareStockOnHandRowService() {

        function prepareRowData(data) {
            var rowData = {
                orderableId: '',
                productName: '',
                productCode: '',
                lotCode: '',
                stockCardId: '',
                expirationDate: '',
                locationCode: '',
                lastUpdate: '',
                stockOnHand: '',
                isKit: false,
                type: ''
            };
            return _.extend(rowData, data);
        }

        function addGroupRow(stockCardSummary) {
            var data = {
                orderableId: stockCardSummary.orderable.id,
                productName: stockCardSummary.orderable.fullProductName,
                productCode: stockCardSummary.orderable.productCode,
                stockOnHand: stockCardSummary.stockOnHand,
                type: 'PRODUCT'
            };
            return prepareRowData(data);
        }

        function addLotRow(stockCardDetail) {
            var data = {
                orderableId: stockCardDetail.orderable.id,
                lotCode: _.get(stockCardDetail, ['lot', 'lotCode']),
                expirationDate: _.get(stockCardDetail, ['lot', 'expirationDate']),
                stockOnHand: stockCardDetail.stockOnHand,
                stockCardId: stockCardDetail.stockCard.id,
                lastUpdate: stockCardDetail.occurredDate,
                type: 'LOT'
            };
            return prepareRowData(data);
        }

        function addLocationRow(location, stockCardDetail) {
            var data = {
                orderableId: stockCardDetail.orderable.id,
                locationCode: location.locationCode,
                stockOnHand: location.stockOnHand,
                lastUpdate: location.lastUpdate,
                stockCardId: stockCardDetail.stockCard.id,
                type: 'LOCATION'
            };
            return prepareRowData(data);
        }

        this.prepareLines = function(stockCardSummaries) {
            var lines = [];
            _.forEach(stockCardSummaries, function(stockCardSummary) {
                lines.push(addGroupRow(stockCardSummary));
                _.forEach(stockCardSummary.stockCardDetails, function(stockCard) {
                    if (!stockCard.orderable.isKit) {
                        lines.push(addLotRow(stockCard));
                    }
                    _.forEach(stockCard.lotLocationSohDtoList, function(location) {
                        lines.push(addLocationRow(location, stockCard));
                    });
                });
            });
            var result =  _.values(_.groupBy(lines, 'orderableId'));
            return result;
        };
    }
})();
