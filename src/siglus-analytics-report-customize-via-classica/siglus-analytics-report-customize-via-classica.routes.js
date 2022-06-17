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
        .module('siglus-analytics-report-customize-via-classica')
        .config(routes);

    routes.$inject = ['$stateProvider'];

    function routes($stateProvider) {

        $stateProvider.state('openlmis.analyticsReport.requisitionAndMonthly.ViaClassica', {
            url: '/Balance Requisition/:rnr',
            showInNavigation: false,
            label: 'via.title',
            priority: 9,
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportCustomizeViaClassicaController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-customize-via-classica/siglus-analytics-report-customize-via-classica.html'
                }
            },
            resolve: {
                requisition: function($stateParams, requisitionService) {
                    return requisitionService.get($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                },
                processingPeriod: function(periodService, requisition) {
                    return periodService.get(requisition.processingPeriod.id);
                },
                lineItemsList: function($filter, requisition) {
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

                    // console.log($filter('orderBy')(fullSupplyLineItems, [
                    //     '$program.orderableCategoryDisplayOrder',
                    //     '$program.orderableCategoryDisplayName',
                    //     '$program.displayOrder',
                    //     'orderable.fullProductName'
                    // ]));
                    var lineItemsOrigin = $filter('orderBy')(fullSupplyLineItems, [
                        '$program.orderableCategoryDisplayOrder',
                        '$program.orderableCategoryDisplayName',
                        '$program.displayOrder',
                        'orderable.fullProductName'
                    ]);

                    var lineItemsRefactor = [];
                    var lineItemsSubList = [];

                    angular.forEach(lineItemsOrigin, function(item, index) {
                        if (index % 15 !== 14 && index !== lineItemsOrigin.length - 1) {
                            lineItemsSubList.push(item);
                        } else if (index === lineItemsOrigin.length - 1) {
                            lineItemsRefactor.push(lineItemsSubList);
                            lineItemsSubList = [];
                        } else {
                            lineItemsSubList.push(item);
                            lineItemsRefactor.push(lineItemsSubList);
                            lineItemsSubList = [];
                        }
                    });
                    return lineItemsRefactor;

                },
                columns: function(requisition) {
                    // SIGLUS-REFACTOR: starts here
                    return requisition.template.getColumns().sort(function(a, b) {
                        return a.displayOrder - b.displayOrder;
                    });
                    // SIGLUS-REFACTOR: ends here
                }
            }
        });
    }

})();
