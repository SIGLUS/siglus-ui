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
        .service('siglusLocationDisplayItemFilterService', siglusLocationDisplayItemFilterService);

    siglusLocationDisplayItemFilterService.inject = [];

    function siglusLocationDisplayItemFilterService() {

        this.filterList = function(keyword, addedLineItems) {
            var result = [];

            if (_.isEmpty(keyword)) {
                result = addedLineItems;
            } else {
                keyword = keyword.trim();
                result = _.map(addedLineItems, function(lineItems) {
                    var isMatched = _.some(lineItems, function(item) {
                        return _.some([item.productName, item.productCode], function(value) {
                            return String(value).includes(keyword);
                        });
                    });
                    return isMatched ? lineItems : [];
                });

            }

            return _.filter(result, function(item) {
                return !_.isEmpty(item);
            });
        };
    }

})();
