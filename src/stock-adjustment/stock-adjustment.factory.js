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
     * @ngdoc factory
     * @name stock-adjustment.stockAdjustmentService
     *
     * @description
     * Allows the user to retrieve adjustment/issue/receive enhanced information.
     */
    angular
        .module('stock-adjustment')
        .factory('stockAdjustmentFactory', factory);

    factory.$inject = [
        '$q', 'stockAdjustmentService'
    ];

    function factory($q, stockAdjustmentService) {

        return {
            getDrafts: getDrafts,
            getDraft: getDraft
        };

        function getDrafts(user, programIds, facility, adjustmentType) {
            var promises = [];
            angular.forEach(programIds, function(programId) {
                promises.push(getDraft(user.user_id, programId, facility.id, adjustmentType.state));
            });
            return $q.all(promises);
        }

        function getDraft(userId, programId, facilityId, adjustmentTypeState) {
            return stockAdjustmentService.getDrafts(userId, programId, facilityId, adjustmentTypeState)
                .then(function(drafts) {
                    return drafts[0];
                });
        }
    }
})();
