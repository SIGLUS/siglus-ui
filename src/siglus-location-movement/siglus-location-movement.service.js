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
        .module('siglus-location-movement')
        .service('siglusLocationMovementService', service);

    service.$inject = ['$resource'];

    function service($resource) {

        var resource = $resource('', {}, {
            getMovementDrafts: {
                method: 'GET',
                url: '/api/siglusapi/movementDrafts',
                isArray: true
            },
            getMovementDraftById: {
                method: 'GET',
                url: '/api/siglusapi/movementDrafts/:id',
                isArray: false
            }
        });

        this.getMovementDrafts = getMovementDrafts;
        this.getMovementDraftById = getMovementDraftById;

        function getMovementDrafts(programId) {
            return resource.getMovementDrafts({
                programId: programId
            }).$promise;
        }

        function getMovementDraftById(draftId) {
            return resource.getMovementDraftById({
                id: draftId
            }).$promise;
        }

    }
})();
