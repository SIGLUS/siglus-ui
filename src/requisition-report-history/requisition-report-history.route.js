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
        .module('requisition-report-history')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($stateProvider) {
        $stateProvider.state('openlmis.requisitions.reportHistory', {
            label: 'requisitionViewReport.viewReport',
            url: '^/usageReport/history/:rnr',
            controller: 'RequisitionReportHistoryController',
            controllerAs: 'vm',
            templateUrl: 'requisition-report-history/requisition-report-history.html',
            canAccess: function(permissionService, REQUISITION_RIGHTS) {
                return permissionService.hasRoleWithRight(REQUISITION_RIGHTS.REQUISITION_VIEW);
            },
            resolve: {
                requisition: function($stateParams, requisitionService) {
                    if ($stateParams.requisition) {
                        var rnr = angular.copy($stateParams.requisition);
                        $stateParams.requisition = undefined;
                        return rnr;
                    }
                    return requisitionService.get($stateParams.rnr);
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
