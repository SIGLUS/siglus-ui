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
        .module('requisition-initiate')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS', 'TEMPLATE_TYPE'];

    function routes($stateProvider, REQUISITION_RIGHTS) {

        $stateProvider.state('openlmis.requisitions.initRnr.requisition', {
            url: '/requisition?supervised&program&facility&emergency&report',
            controller: 'RequisitionInitiateRequisitionController',
            controllerAs: 'vm',
            templateUrl: 'requisition-initiate/requisition-initiate-requisition.html',
            accessRights: [
                REQUISITION_RIGHTS.REQUISITION_CREATE,
                REQUISITION_RIGHTS.REQUISITION_DELETE,
                REQUISITION_RIGHTS.REQUISITION_AUTHORIZE
            ],
            resolve: {
                program: function($stateParams, programService) {
                    return programService.get($stateParams.program);
                },
                periods: function(periodFactory, $stateParams, program, TEMPLATE_TYPE) {
                    if ($stateParams.program && $stateParams.facility) {
                        var isUsageReport = (program && program.templateType) === TEMPLATE_TYPE.USAGE_REPORT;
                        return periodFactory.get(
                            $stateParams.program,
                            $stateParams.facility,
                            $stateParams.emergency === 'true' && !isUsageReport
                        );
                    }
                    return [];
                },
                inventoryDates: function(periods, requisitionInitiateService, dateUtils, $stateParams) {
                    if (periods.length) {
                        var startDate = dateUtils.toStringDate(periods[0].submitStartDate);
                        var endDate = dateUtils.toStringDate(periods[0].submitEndDate);
                        return requisitionInitiateService.getPhysicalInventoryDates(
                            $stateParams.facility,
                            startDate,
                            endDate
                        );
                    }
                    return [];
                },
                canInitiateRnr: function(requisitionInitiateFactory, $stateParams) {
                    if ($stateParams.program && $stateParams.facility) {
                        return requisitionInitiateFactory.canInitiate(
                            $stateParams.program, $stateParams.facility
                        );
                    }
                    return false;
                }
            }
        });
    }

})();
