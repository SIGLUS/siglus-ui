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
                requisition: function($stateParams, requisitionService) {
                    return requisitionService.get($stateParams.rnr).then(function(requisition) {
                        var copyRequisition = angular.copy(requisition);
                        copyRequisition.$isEditable = false;
                        return copyRequisition;
                    });
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
                lineItems: function($filter, requisition, paginationService, paginationFactory, $stateParams) {
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

                    var lineItems = $filter('orderBy')(fullSupplyLineItems, [
                        '$program.orderableCategoryDisplayOrder',
                        '$program.orderableCategoryDisplayName',
                        '$program.displayOrder',
                        'orderable.fullProductName'
                    ]);

                    return paginationService.registerList(null, $stateParams, function() {
                        return lineItems;
                    });
                },
                columns: function(requisition) {
                    var columns = [],
                        columnsMap = requisition.template.columnsMap;
                    for (var columnName in columnsMap) {
                        if (columnsMap.hasOwnProperty(columnName) &&
                            columnsMap[columnName].isDisplayed) {
                            columns.push(columnsMap[columnName]);
                        }
                    }
                    return columns;
                }
            }
        });
    }

})();
