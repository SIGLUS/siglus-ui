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
   * @name stock-physical-inventory-draft-list.physicalInventoryDraftListService
   *
   * @description
   * Responsible for retrieving physical inventory draft list information from server.
   */
    angular
        .module('siglus-physical-inventory-creation')
        .service('physicalInventoryDraftListService', service);

    service.$inject = [
        '$resource',
        'stockmanagementUrlFactory',
        '$filter', 'messageService',
        'openlmisDateFilter',
        'productNameFilter',
        'stockEventFactory',
        // SIGLUS-REFACTOR: starts here
        'siglusStockEventService'
        // SIGLUS-REFACTOR: ends here
    ];

    function service(
        $resource,
        stockmanagementUrlFactory,
        $filter,
        messageService,
        openlmisDateFilter,
        productNameFilter,
        stockEventFactory,
        siglusStockEventService
    ) {
    // SIGLUS-REFACTOR: starts here
        var resource = $resource(
            stockmanagementUrlFactory('/api/siglusapi/physicalInventories/draftList'), {},
            {
                get: {
                    method: 'GET',
                    url: stockmanagementUrlFactory(
                        '/api/siglusapi/physicalInventories/draftList/:id'
                    )
                },
                update: {
                    method: 'PUT',
                    url: stockmanagementUrlFactory(
                        '/api/siglusapi/physicalInventories/raftList/:id'
                    )
                },
                delete: {
                    method: 'DELETE',
                    url: stockmanagementUrlFactory(
                        '/api/siglusapi/physicalInventories/draftList/:id'
                    )
                },
                submit: {
                    method: 'POST',
                    url: stockmanagementUrlFactory(
                        '/api/siglusapi/physicalInventories/draftList/:id'
                    )
                },
                query: {
                    method: 'GET',
                    url: stockmanagementUrlFactory(
                        '/api/siglusapi/physicalInventories/draftList'
                    )
                }
            }
        );

        this.getDraft = getDraft;
        this.getDraftList = getDraftList;
        this.createDraftList = createDraftList;

        // eslint-disable-next-line no-unused-vars
        function getDraftList(facility, isDraft, program, groupNum) {
            return resource.query({
                facility: facility,
                isDraft: isDraft,
                program: program,
                groupNum: groupNum
            }).$promise.then(function(response) {
                siglusStockEventService.formatResponse(response);
                return response;
            });
        }

        function createDraftList(splitNum, facilityId, programId) {
            return resource.submit({
                id: splitNum,
                facilityId: facilityId,
                programId: programId
            }).$promise.then(function(response) {
                siglusStockEventService.formatResponse(response[0]);
                return response;
            });
        }

        // SIGLUS-REFACTOR: ends here

        function getDraft(program, facility) {
            return resource.query({
                program: program,
                facility: facility,
                isDraft: true
            })
                .$promise
                .then(function(response) {
                    siglusStockEventService.formatResponse(response[0]);
                    return response;
                });
        }
    }
})();
