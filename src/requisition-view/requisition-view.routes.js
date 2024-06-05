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
            url: '^/requisition/:rnr?facility&period&program&emergency&forClient',
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
            resolve: {
                user: function(currentUserService) {
                    return currentUserService.getUserInfo();
                },
                requisition: function($stateParams, requisitionService) {
                    if ($stateParams.forClient === 'true') {
                        return requisitionService.buildDraftWithoutSaving($stateParams.facility,
                            $stateParams.period, $stateParams.program).then(function(requisition) {
                            requisition.$isEditable = true;
                            requisition.isCreateForClient = true;
                            return requisitionService.setOrderableUnitForRequisition(requisition);
                        });
                    }
                    return requisitionService.get($stateParams.rnr).then(function(requisition) {
                        return requisitionService.setOrderableUnitForRequisition(requisition);
                    });
                },
                isCreateForClient: function(requisition) {
                    var forClient = !!requisition.isCreateForClient;
                    if (forClient) {
                        requisition.requisitionLineItems.forEach(function(item) {
                            if (!item.approvedQuantity) {
                                item.approvedQuantity = item.authorizedQuantity;
                            }
                        });
                    }
                    return forClient;
                },
                program: function(programService, requisition) {
                    return programService.get(requisition.program.id);
                },
                processingPeriod: function(periodService, requisition) {
                    return periodService.get(requisition.processingPeriod.id);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                },
                approvedProducts: function(requisitionService, requisition, isCreateForClient) {
                    if (isCreateForClient) {
                        return requisitionService.getApprovedProducts(requisition.facility.id, requisition.program.id);
                    }
                    return [];
                },
                canSubmit: function(requisitionViewFactory, user, requisition, isCreateForClient) {
                    return isCreateForClient || requisitionViewFactory.canSubmit(user.id, requisition);
                },
                // SIGLUS-REFACTOR: starts here
                canSubmitAndAuthorize: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSubmitAndAuthorize(user.id, requisition);
                },
                // SIGLUS-REFACTOR: ends here
                canAuthorize: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canAuthorize(user.id, requisition);
                },
                // SIGLUS-REFACTOR: starts here
                hasAuthorizeRight: function(authorizationService, requisition) {
                    return authorizationService.hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, {
                        programId: requisition.program.id,
                        facilityId: requisition.facility.id
                    });
                },
                // SIGLUS-REFACTOR: ends here
                canApproveAndReject: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canApproveAndReject(user, requisition);
                },
                canDelete: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canDelete(user.id, requisition);
                },
                canSkip: function(requisitionViewFactory, user, requisition, program) {
                    return requisitionViewFactory.canSkip(user.id, requisition, program);
                },
                canSync: function(canSubmit, canAuthorize, canApproveAndReject, isCreateForClient) {
                    if (isCreateForClient) {
                        return false;
                    }
                    return canSubmit || canAuthorize || canApproveAndReject;
                }
            }
        });

    }

})();
