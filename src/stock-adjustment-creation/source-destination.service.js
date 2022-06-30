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
   * @name stock-adjustment-creation.sourceDestinationService
   *
   * @description
   * Responsible for fetching valid sources or destinations.
   */
    angular
        .module('stock-adjustment-creation')
        .service('sourceDestinationService', service);

    service.$inject = ['$q', '$resource', 'stockmanagementUrlFactory'];

    function service($q, $resource, stockmanagementUrlFactory) {
        this.getSourceAssignments = getSourceAssignments;
        this.getDestinationAssignments = getDestinationAssignments;

        function getSourceAssignments(programId, facilityId) {
            // SIGLUS-REFACTOR: starts here
            var resource = $resource(stockmanagementUrlFactory('/api/siglusapi/validSources'));
            // SIGLUS-REFACTOR: ends here

            return resource.query({
                programId: programId,
                facilityId: facilityId
            }).$promise;
        }

        function getDestinationAssignments() {
            // SIGLUS-REFACTOR: starts here
            // var resource = $resource(stockmanagementUrlFactory('/api/siglusapi/validDestinations'));
            // SIGLUS-REFACTOR: ends here
            return $q.resolve(null);

            // return resource.query({
            //     programId: programId,
            //     facilityId: facilityId
            // }).$promise;
        }
    }
})();
