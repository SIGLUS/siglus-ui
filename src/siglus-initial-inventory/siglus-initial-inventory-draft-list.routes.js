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
        $stateProvider.state('openlmis.stockmanagement.initialInventory',
            {
                url: '/initialInventory?programId',
                label: 'stockInitialInventory.initialInventory',
                showInNavigation: true,
                views: {
                    '@openlmis': {
                        templateUrl: 'siglus-physical-inventory-draft-list/siglus-physical-inventory-draft-list.html',
                        controller: 'siglusPhysicalInventoryDraftListController',
                        controllerAs: 'vm'
                    }
                },
                canAccess: function(currentUserService) {
                    return currentUserService.getUserInfo().then(function(user) {
                        return user.canInitialInventory;
                    });
                },
                params: {
                    canInitialInventory: true
                },

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
                        var result = 'Todos os produtos';
                        var program = _.find(programs, function(item) {
                            return item.id === $stateParams.programId;
                        });
                        if (program) {
                            result = program.name;
                        }
                        return result;
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
                    draftList: function($stateParams, siglusPhysicalInventoryDraftListService, programs,
                        facility) {

                        if (_.isUndefined(facility)) {
                            return [];
                        }
                        var isDraft = true;
                        return siglusPhysicalInventoryDraftListService.getDraftList(
                            facility.id,
                            isDraft,
                            $stateParams.programId
                        );
                    }
                }
            });
    }
})();
