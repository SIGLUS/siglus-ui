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

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.requisitions.history', {
            label: 'requisitionView.viewRequisition',
            url: '/history/:rnr?page&size',
            templateUrl: 'requisition-view-tab/siglus-requisition-view-tab-history.html',
            controller: 'SiglusHistoryViewTabController',
            controllerAs: 'vm',
            isOffline: true,
            nonTrackable: true,
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
                    return requisitionService.get($stateParams.rnr, true);
                },
                canSubmit: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSubmit(user.id, requisition);
                },
                canSubmitAndAuthorize: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSubmitAndAuthorize(user.id, requisition);
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
                canSkip: function(requisitionViewFactory, user, requisition) {
                    return requisitionViewFactory.canSkip(user.id, requisition);
                },
                canSync: function(canSubmit, canAuthorize, canApproveAndReject) {
                    return canSubmit || canAuthorize || canApproveAndReject;
                },
                lineItems: function($filter, requisition) {
                    var filterObject = requisition.template.hideSkippedLineItems() ?
                        {
                            skipped: '!true',
                            $program: {
                                fullSupply: true
                            }
                        } : {
                            $program: {
                                fullSupply: true
                            }
                        };
                    var fullSupplyLineItems = $filter('filter')(requisition.requisitionLineItems, filterObject);

                    return $filter('orderBy')(fullSupplyLineItems, [
                        '$program.orderableCategoryDisplayOrder',
                        '$program.orderableCategoryDisplayName',
                        '$program.displayOrder',
                        'orderable.fullProductName'
                    ]);
                },
                items: function(paginationService, lineItems, $stateParams, requisitionValidator, paginationFactory) {
                    return paginationService.registerList(
                        requisitionValidator.isLineItemValid, $stateParams, function(params) {
                            return paginationFactory.getPage(lineItems, parseInt(params.page), parseInt(params.size));
                        }
                    );
                },
                columns: function(requisition) {
                    return requisition.template.getColumns();
                },
                fullSupply: function() {
                    return true;
                },
                processingPeriod: function(periodService, requisition) {
                    return periodService.get(requisition.processingPeriod.id);
                },
                program: function(programService, requisition) {
                    return programService.get(requisition.program.id);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                }
            }
        });
    }

})();
