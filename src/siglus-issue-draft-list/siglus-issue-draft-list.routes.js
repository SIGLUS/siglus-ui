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
        .module('siglus-issue-draft-list')
        .config(routes);

    routes.$inject = ['$stateProvider', 'STOCKMANAGEMENT_RIGHTS'];

    function routes($stateProvider, STOCKMANAGEMENT_RIGHTS) {
        $stateProvider.state('openlmis.stockmanagement.issue.draft', {
            url: '/draft/:programId?initialDraftId&draftType',
            label: 'stockIssue.draftList',
            priority: 2,
            showInNavigation: false,
            views: {
                '@openlmis': {
                    controller: 'SiglusIssueDraftListController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-issue-draft-list/siglus-issue-draft-list.html'
                }
            },
            accessRights: [STOCKMANAGEMENT_RIGHTS.STOCK_ADJUST],
            params: {
                initialDraftInfo: undefined,
                facility: undefined
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programId: function($stateParams) {
                    return $stateParams.programId;
                },
                facility: function($stateParams, facilityFactory) {
                    if (_.isEmpty($stateParams.facility)) {
                        return facilityFactory.getUserHomeFacility();
                    }
                    return $stateParams.facility;
                },
                adjustmentType: function(ADJUSTMENT_TYPE, $stateParams) {
                    var adjustTypeMapper = {
                        issue: ADJUSTMENT_TYPE.ISSUE,
                        receive: ADJUSTMENT_TYPE.RECEIVE
                    };
                    return adjustTypeMapper[$stateParams.draftType];
                }
            }
        });
    }
})();

