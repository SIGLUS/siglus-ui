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
        .module('siglus-location-movement-creation')
        .service('siglusMovementFilterService', siglusMovementFilterService);

    // #287: add alertService
    siglusMovementFilterService.inject = [];
    // #287: ends here

    function siglusMovementFilterService() {

        this.filterMovementList = function(keyword, addedLineItems) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = addedLineItems;
            } else {
                keyword = keyword.trim();
                result = _.map(addedLineItems, function(lineItems) {
                    return _.filter(lineItems, function(item) {
                        var data = {
                            productCode: item.productCode || '',
                            productName: item.productName || '',
                            lotCode: _.get(item.lot, 'lotCode', ''),
                            expirationDate: _.get(item.lot, 'expirationDate', ''),
                            location: _.get(item.location, 'locationCode', ''),
                            stockOnHand: _.get(item.lot, 'stockOnHand', ''),
                            moveToArea: _.get(item.moveTo, 'area', ''),
                            moveToLocation: _.get(item.moveTo, 'location', ''),
                            quantity: _.get(item, 'quantity', '')
                        };
                        return _.some(_.values(data), function(value) {
                            return String(value || '').includes(keyword);
                        });
                    });
                });

            }

            return _.filter(result, function(item) {
                return !_.isEmpty(item);
            });
        };
    }

})();
