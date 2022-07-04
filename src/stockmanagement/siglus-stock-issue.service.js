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
        .module('stockmanagement')
        .service('siglusStockIssueService', service);

    service.$inject = ['$resource', 'stockmanagementUrlFactory'];

    function service($resource, stockmanagementUrlFactory) {

        var urlBasePath = '/api/siglusapi/drafts/initial';
        var resource = $resource(stockmanagementUrlFactory(urlBasePath), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory(urlBasePath)
            },
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory(urlBasePath + '/:id')
            },
            delete: {
                method: 'DELETE',
                url: stockmanagementUrlFactory(urlBasePath + '/:id')
            }
        });

        this.createIssueDraft = createIssueDraft;
        this.getIssueDrafts = getIssueDrafts;
        this.removeIssueDraft = removeIssueDraft;
        this.initIssueDraft = initIssueDraft;
        this.queryIssueToInfo = queryIssueToInfo;

        function createIssueDraft(userId, programId, facilityId, adjustmentTypeState) {
            return resource.save({
                programId: programId,
                facilityId: facilityId,
                userId: userId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function getIssueDrafts(userId, programId, facilityId, adjustmentTypeState) {
            return resource.get({
                program: programId,
                facility: facilityId,
                isDraft: true,
                userId: userId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function queryIssueToInfo(programId, facilityId, adjustmentTypeState) {
            return resource.query({
                programId: programId,
                facility: facilityId,
                draftType: adjustmentTypeState
            }).$promise;
        }

        function initIssueDraft(formData) {
            return resource.save(formData).$promise;
        }

        function removeIssueDraft(draftId) {
            return resource.delete({
                id: draftId
            }).$promise;
        }
    }
})();
