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
     * @name openlmis-date.dateUtils
     *
     * @description
     * Responsible for retrieving dates.
     */
    angular
        .module('requisition')
        .factory('requisitionUtils', requisitionUtils);

    function requisitionUtils() {
        return {
            isEmpty: isEmpty,
            calculateTotal: calculateTotal,
            clearTestConsumptionError: clearTestConsumptionError,
            getBasicLineItemsTotal: getBasicLineItemsTotal
        };

        function getBasicLineItemsTotal(lineItems, column) {
            return _.reduce(lineItems, function(total, lineItem) {
                return total + (lineItem.columns[column.name].value || 0);
            }, 0);
        }

        function isEmpty(value) {
            return value === '' || _.isUndefined(value) || _.isNull(value);
        }

        function calculateTotal(lineItems, field) {
            var allEmpty = _.every(lineItems, function(item) {
                return isEmpty(item[field]);
            });
            if (allEmpty) {
                return undefined;
            }
            return _.chain(lineItems).map(function(item) {
                return item[field];
            })
                .compact()
                .reduce(function(memo, num) {
                    return parseInt(num) + memo;
                }, 0)
                .value();
        }

        function clearTestConsumptionError(lineItems) {
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.projects), function(project) {
                    angular.forEach(Object.keys(lineItem.projects[project].outcomes), function(outcome) {
                        lineItem.projects[project].outcomes[outcome].$error = undefined;
                    });
                });
            });
        }
    }

})();
