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
        .module('requisition-view')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider, REQUISITION_RIGHTS, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.requisitions.requisition', {
            label: 'requisitionView.viewRequisition',
            url: '^/requisition/:rnr',
            controller: 'RequisitionViewController',
            controllerAs: 'vm',
            templateUrl: 'requisition-view/requisition-view.html',
            isOffline: true,
            accessRights: [
                REQUISITION_RIGHTS.REQUISITION_CREATE,
                REQUISITION_RIGHTS.REQUISITION_DELETE,
                REQUISITION_RIGHTS.REQUISITION_AUTHORIZE,
                REQUISITION_RIGHTS.REQUISITION_APPROVE,
                FULFILLMENT_RIGHTS.ORDERS_EDIT
            ],
            params: {
                requisition: undefined,
                // SIGLUS-REFACTOR: starts here
                stopSetDefaultValue: false
                // SIGLUS-REFACTOR: ends here
            },
            resolve: {
                user: function(currentUserService) {
                    return currentUserService.getUserInfo();
                },
                requisition: function($stateParams, requisitionService) {
                    if ($stateParams.requisition) {
                        var rnr = angular.copy($stateParams.requisition);
                        $stateParams.requisition = undefined;
                        return rnr;
                    }
                    return requisitionService.get($stateParams.rnr);
                },
                canSubmit: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSubmit(user.id, requisition);
                },
                canAuthorize: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canAuthorize(user.id, requisition);
                },
                canApproveAndReject: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canApproveAndReject(user, requisition);
                },
                canDelete: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canDelete(user.id, requisition);
                },
                canSync: function(canSubmit, canAuthorize, canApproveAndReject) {
                    return canSubmit || canAuthorize || canApproveAndReject;
                },
                // SIGLUS-REFACTOR: starts here
                program: function(programService, requisition) {
                    return programService.get(requisition.program.id);
                },
                processingPeriod: function(periodService, requisition) {
                    return periodService.get(requisition.processingPeriod.id);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                },
                canSubmitAndAuthorize: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSubmitAndAuthorize(user.id, requisition);
                },
                hasAuthorizeRight: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.hasAuthorizeRight(user.id, requisition);
                },
                canSkip: function(requisitionViewFactory, user, requisition, program) {
                    return requisitionViewFactory.canSkip(user.id, requisition, program);
                }
                // SIGLUS-REFACTOR: ends here
            }
        });

    }

})();
