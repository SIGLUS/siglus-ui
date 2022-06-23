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

    angular
        .module('siglus-physical-inventory-draft-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.physicalInventory.draftList',
            {
                url: '/draftList',
                showInNavigation: false,
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-physical-inventory-draft-list/physical-inventory-draft-list.html',
                        controller: 'siglusPhysicalInventoryDraftListController',
                        controllerAs: 'vm'
                    }
                },
                accessRights: [STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT],
                resolve: {
                    facility: function(facilityFactory) {
                        return facilityFactory.getUserHomeFacility();
                    },
                    user: function(authorizationService) {
                        return authorizationService.getUser();
                    },
                    programs: function(user, stockProgramUtilService) {
                        return stockProgramUtilService.getPrograms(user.user_id,
                            STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT);
                    },
                    programName: function(programs, $stateParams) {
                        return _.find(programs, function(item) {
                            return item.id === $stateParams.programId;
                        }).name;
                    },
                    drafts: function(physicalInventoryFactory, programs, facility) {
                        if (_.isUndefined(facility)) {
                            return [];
                        }
                        var programId = _.map(programs, function(program) {
                            return program.id;
                        });

                        return physicalInventoryFactory.getDrafts(programId,
                            facility.id);
                    },
                    draftList: function(physicalInventoryDraftListService, programs,
                        facility, $stateParams) {
                        console.log('physicalInventoryDraftListService', physicalInventoryDraftListService);
                        if (_.isUndefined(facility)) {
                            return [];
                        }
                        var isDraft = true;
                        return physicalInventoryDraftListService.getDraftList(
                            facility.id,
                            isDraft,
                            $stateParams.programId
                        );
                    }
                }
            });
    }
})();
