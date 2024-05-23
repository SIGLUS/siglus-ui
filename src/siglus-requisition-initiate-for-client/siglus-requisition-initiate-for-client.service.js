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
     * @name SiglusRequisitionInitiateForClientService
     *
     */
    angular
        .module('siglus-requisition-initiate-for-client')
        .service('SiglusRequisitionInitiateForClientService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory', 'periodFactory'];

    function service($resource, stockmanagementUrlFactory, periodFactory) {
        var resource = $resource(stockmanagementUrlFactory(), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/facility/:id/clients'),
                isArray: true
            },
            buildDraft: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/requisitions/draft')
            }
        });

        this.getPeriods = getPeriods;
        this.getClients = getClients;
        this.getRequisitionDraft = getRequisitionDraft;

        function getPeriods(facilityId, programId, emergency) {
            return periodFactory.get(programId, facilityId, emergency);
        }

        function getClients(facilityId, programId) {
            return resource.get({
                id: facilityId,
                programId: programId
            });
        }

        function getRequisitionDraft(facilityId, periodId, programId) {
            return resource.buildDraft({
                facility: facilityId,
                period: periodId,
                program: programId
            });
        }
    }
})();
