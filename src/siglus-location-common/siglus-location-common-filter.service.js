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
        .module('siglus-location-common')
        .service('siglusLocationCommonFilterService', siglusLocationCommonFilterService);

    siglusLocationCommonFilterService.inject = [];

    function siglusLocationCommonFilterService() {

        this.filterList = function(keyword, addedLineItems) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = addedLineItems;
            } else {
                keyword = keyword.trim().toLowerCase();
                result = _.map(addedLineItems, function(lineItems) {
                    var isMatched = _.some(lineItems, function(item) {
                        return _.some([item.productName, item.productCode], function(value) {
                            return String(value.toLowerCase()).includes(keyword);
                        });
                    });
                    return isMatched ? lineItems : [];
                });

            }

            return _.filter(result, function(item) {
                return !_.isEmpty(item);
            });
        };

        this.filterListByLocation = function(keyword, status, addedLineItems) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = addedLineItems;
            } else {
                keyword = keyword.trim().toLowerCase();
                result = _.map(addedLineItems, function(lineItem) {
                    var isMatched = String(lineItem['locationCode'].toLowerCase()).includes(keyword);
                    return isMatched ? lineItem : [];
                });
            }

            if (true === status) {
                result = _.map(result, function(lineItem) {
                    return 'Occupied' === lineItem['locationStatus'] ? lineItem : [];
                });
            } else if (false === status) {
                result = _.map(result, function(lineItem) {
                    return 'Occupied' === lineItem['locationStatus'] ? [] : lineItem;
                });
            }

            return _.filter(result, function(item) {
                return !_.isEmpty(item);
            });
        };
    }

})();
