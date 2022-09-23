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
        .service('siglusStockDispatchService', service);

    service.$inject = ['siglusStockIssueLocationService', 'siglusStockIssueService'];

    function service(siglusStockIssueLocationService, siglusStockIssueService) {
        this.queryInitialDraftInfo = function(programId, draftType, moduleType, facilityId) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.queryInitialDraftInfo(programId, draftType);
            }
            return siglusStockIssueService.queryInitialDraftInfo(programId, facilityId, draftType);
        };

        this.initDraft = function(formData, moduleType) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.initDraft(formData);
            }
            return siglusStockIssueService.initDraft(formData);
        };

        this.createDraft = function(data, moduleType) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.createDraft(data);
            }
            return siglusStockIssueService.createDraft(data);
        };

        this.getDrafts = function(data, moduleType) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.getDrafts(data);
            }
            return siglusStockIssueService.getDrafts(data);
        };

        this.removeIssueDraft = function(id, initialDraftId, moduleType) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.removeIssueDraft(id, initialDraftId);
            }
            return siglusStockIssueService.removeIssueDraft(id);
        };

        this.deleteAllDraft = function(id, moduleType) {
            if (moduleType === 'locationManagement') {
                return siglusStockIssueLocationService.deleteAllDraft(id);
            }
            return siglusStockIssueService.deleteAllDraft(id);
        };
    }
})();
