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
        .module('requisition-convert-to-order')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS) {

        $stateProvider.state('openlmis.requisitions.convertToOrder', {
            showInNavigation: true,
            label: 'requisitionConvertToOrder.convertToOrder.label',
            url: '/convertToOrder?programId&facilityId&page&size',
            controller: 'ConvertToOrderController',
            controllerAs: 'vm',
            templateUrl: 'requisition-convert-to-order/convert-to-order.html',
            accessRights: [FULFILLMENT_RIGHTS.ORDERS_EDIT],
            params: {
                requisitionList: undefined,
                programs: undefined
            },
            resolve: {
                programs: function(programService, $stateParams) {
                    if ($stateParams.requisitionList) {
                        return $stateParams.programs;
                    }
                    return programService.getAll();
                },
                facilities: function(facilityService) {
                    return facilityService.getAllMinimal();
                },
                requisitionList: function(requisitionService, $stateParams) {
                    if ($stateParams.requisitionList) {
                        return $stateParams.requisitionList;
                    }
                    return requisitionService.forConvert({
                        page: 0,
                        size: 2147483647
                    });
                },
                requisitions: function(paginationService, requisitionList, $stateParams) {
                    return paginationService.registerUrl($stateParams, function(stateParams) {
                        var requisitionListCopy = angular.copy(requisitionList);
                        requisitionListCopy.content  = _.filter(requisitionList.content, function(item) {
                            // eslint-disable-next-line max-len
                            return  stateParams.facilityId ? _.get(item, ['requisition', 'facility', 'id']) === stateParams.facilityId : true
                            // eslint-disable-next-line max-len
                            && stateParams.programId ? _.get(item, ['requisition', 'program', 'id']) === stateParams.programId : true;
                        });
                        return requisitionListCopy;
                    });
                }
            }
        });
    }
})();
