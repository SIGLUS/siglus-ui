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
        .module('requisition-approval')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {

        $stateProvider.state('openlmis.requisitions.approvalList', {
            showInNavigation: true,
            isOffline: true,
            label: 'requisitionApproval.approve',
            // #368: The approver can filter the requisitions by facility
            url: '/approvalList?page&size&program&facility&offline&sort',
            // #368: ends here
            params: {
                sort: ['emergency,desc', 'authorizedDate,desc']
            },
            controller: 'RequisitionApprovalListController',
            controllerAs: 'vm',
            templateUrl: 'requisition-approval/requisition-approval-list.html',
            canAccess: function(permissionService, REQUISITION_RIGHTS) {
                return permissionService.hasRoleWithRightAndFacility(REQUISITION_RIGHTS.REQUISITION_APPROVE);
            },
            resolve: {
                requisitions: function(paginationService, requisitionService, $stateParams, REQUISITION_STATUS) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        // #368: The approver can filter the requisitions by facility
                        if (stateParams.program || stateParams.facility) {
                            // #368: ends here
                            if (stateParams.offline === 'true') {
                                stateParams.requisitionStatus = [
                                    REQUISITION_STATUS.AUTHORIZED,
                                    REQUISITION_STATUS.IN_APPROVAL
                                ];
                                stateParams.showBatchRequisitions = true;
                                return requisitionService.search(stateParams.offline === 'true', stateParams);
                            }
                            return requisitionService.forApproval(stateParams);

                        }
                        return requisitionService.forApproval(stateParams);
                    });
                },
                programs: function(requisitionApprovalService) {
                    return requisitionApprovalService.getPrograms();
                },
                selectedProgram: function($stateParams, $filter, programs) {
                    if ($stateParams.program) {
                        return $filter('filter')(programs, {
                            id: $stateParams.program
                        })[0];
                    }
                },
                isBatchApproveScreenActive: function(BATCH_APPROVE_SCREEN_FEATURE_FLAG, featureFlagService) {
                    return featureFlagService.get(BATCH_APPROVE_SCREEN_FEATURE_FLAG);
                },
                // #368: The approver can filter the requisitions by facility
                facilities: function(requisitionApprovalService) {
                    return requisitionApprovalService.getFacilities();
                },
                selectedFacility: function($stateParams, $filter, facilities) {
                    if ($stateParams.facility) {
                        return $filter('filter')(facilities, {
                            id: $stateParams.facility
                        })[0];
                    }
                }
                // #368: ends here
            }
        });
    }

})();
