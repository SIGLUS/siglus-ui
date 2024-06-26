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
     * @name stock-adjustment-creation.existingOrderableGroupsFactory
     *
     * @description
     * Provides groups for existing orderables for program and facility.
     */
    angular
        .module('stock-adjustment-creation')
        .factory('existingStockOrderableGroupsFactory', factory);

    factory.$inject = ['orderableGroupService'];

    function factory(orderableGroupService) {
        return {
            getGroupsWithoutStock: getGroupsWithoutStock
        };

        /**
         * @ngdoc method
         * @methodOf stock-adjustment-creation.existingOrderableGroupsFactory
         * @name getGroupsWithNotZeroSoh
         *
         * @description
         * Returns groups for existing orderables for program and facility. Group members with
         * stock on hand equal zero are filtered out.
         *
         * @param  {Object}     stateParams object with orderableGroups
         * @param  {Object}     program the program
         * @param  {Object}     facility the facility
         * @param  {String}     rightName the right
         * @return {Promise}    the orderable groups from state params or stock card summaries.
         */
        // #225: cant view detail page when not have stock view right
        function getGroupsWithoutStock(stateParams, program, facility, rightName, draftId) {
            if (!stateParams.orderableGroups) {
                return orderableGroupService
                    .findAvailableProductsAndCreateOrderableGroups(program.id, facility.id, false,
                        rightName, draftId)
                    .then(getNotEmptyGroupsWithNotZeroSoh);
            }
            return stateParams.orderableGroups;
        }
        // #225: ends here

        function getNotEmptyGroupsWithNotZeroSoh(orderableGroups) {
            var filteredGroups = [];
            _.forEach(orderableGroups, function(orderableGroup) {
                var group = _.filter(orderableGroup, isStockOnHandNotZero);
                if (group.length !== 0) {
                    filteredGroups.push(group);
                }
            });
            return filteredGroups;
        }

        function isStockOnHandNotZero(orderableLot) {
            return orderableLot.stockOnHand !== 0;
        }
    }
})();
