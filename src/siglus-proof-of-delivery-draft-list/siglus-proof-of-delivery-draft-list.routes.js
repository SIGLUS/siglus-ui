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
        .module('siglus-proof-of-delivery-draft-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.orders.podManage.draftList', {
            url: '/draft?orderId&podId&orderCode',
            label: 'stockIssue.draftList',
            priority: 2,
            showInNavigation: false,
            views: {
                '@openlmis': {
                    controller: 'SiglusPODDraftListController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-proof-of-delivery-draft-list/siglus-proof-of-delivery-draft-list.html'
                }
            },
            accessRights: [
                FULFILLMENT_RIGHTS.PODS_MANAGE,
                FULFILLMENT_RIGHTS.PODS_VIEW,
                FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
            ],
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
                }
            }
        });
    }
})();

