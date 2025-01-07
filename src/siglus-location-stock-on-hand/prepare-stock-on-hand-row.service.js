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

    prepareStockOnHandRowService.$inject = ['moment'];

    function prepareStockOnHandRowService(moment) {

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
            var lastUpdate = undefined;
            if (stockCardDetail.lotLocationSohDtoList && stockCardDetail.lotLocationSohDtoList.length > 0) {
                // ascending
                var sorted = _.sortBy(stockCardDetail.lotLocationSohDtoList, function(lotLocation) {
                    return _.get(lotLocation, 'lastUpdate', '');
                });
                lastUpdate = _.get(sorted, [sorted.length - 1, 'lastUpdate']);
            }
            var data = {
                orderableId: stockCardDetail.orderable.id,
                lotCode: _.get(stockCardDetail, ['lot', 'lotCode']),
                expirationDate: _.get(stockCardDetail, ['lot', 'expirationDate']),
                stockOnHand: stockCardDetail.stockOnHand,
                stockCardId: stockCardDetail.stockCard.id,
                lastUpdate: lastUpdate ? lastUpdate : stockCardDetail.occurredDate,
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
            // 1-level sort by product code
            var sortedSummariesByProductCode = _.sortBy(stockCardSummaries, function(summary) {
                return _.get(summary, ['orderable', 'productCode'], '');
            });

            var lines = [];
            _.forEach(sortedSummariesByProductCode, function(stockCardSummary) {
                lines.push(addGroupRow(stockCardSummary));
                // 2-level sort by expiration date
                var sortedDetailsByExpirationDate = _.sortBy(stockCardSummary.stockCardDetails, function(stockCard) {
                    var expirationDate = _.get(stockCard, ['lot', 'expirationDate'], '');
                    return moment(expirationDate, 'YYYY-MM-DD');
                });

                _.forEach(sortedDetailsByExpirationDate, function(stockCard) {
                    if (!stockCard.orderable.isKit) {
                        lines.push(addLotRow(stockCard));
                    }
                    // 3-level sort by location code
                    var sortedItemsByLocationCode = _.sortBy(stockCard.lotLocationSohDtoList, function(location) {
                        return _.get(location, ['locationCode'], '');
                    });
                    _.forEach(sortedItemsByLocationCode, function(location) {
                        lines.push(addLocationRow(location, stockCard));
                    });
                });
            });
            return _.values(_.groupBy(lines, 'orderableId'));
        };
    }
})();
