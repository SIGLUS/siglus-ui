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
        .factory('siglusRequisitionUtils', siglusRequisitionUtils);

    siglusRequisitionUtils.$inject = ['COLUMN_SOURCES', 'siglusColumnUtils'];

    function siglusRequisitionUtils(COLUMN_SOURCES, siglusColumnUtils) {
        return {
            clearTestConsumptionError: clearTestConsumptionError,
            getRegimenLineItemsTotal: getRegimenLineItemsTotal,
            hasRegimen: hasRegimen,
            getInputColumnsMap: getInputColumnsMap
        };

        function getInputColumnsMap(columns) {
            var filterColumns = _.filter(columns, function(column) {
                return column.source === COLUMN_SOURCES.USER_INPUT && column.isDisplayed;
            }).map(function(column) {
                return angular.merge({}, column, {
                    id: null
                });
            });
            return _.indexBy(filterColumns, 'name');
        }

        function hasRegimen(requisition) {
            return requisition.template.extension.enableRegimen && !requisition.emergency
                && !!requisition.regimenLineItems.length;
        }

        function getRegimenLineItemsTotal(lineItems, column) {
            return lineItems.reduce(function(total, lineItem) {
                if (_.isNumber(lineItem.columns[column.name].value) && !siglusColumnUtils.isTotal(lineItem)) {
                    return (total || 0) + lineItem.columns[column.name].value;
                }
                return total;
            }, undefined);
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
