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
            url: '/Balance Requisition/:rnr?showBreadCrumb',
            showInNavigation: false,
            label: 'via.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined
            },
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
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
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
                    return $filter('orderBy')(fullSupplyLineItems, [
                        '$program.orderableCategoryDisplayOrder',
                        '$program.orderableCategoryDisplayName',
                        '$program.displayOrder',
                        'orderable.fullProductName'
                    ]);
                },
                columns: function(requisition) {
                    var columnsList = ['orderable.productCode', 'orderable.fullProductName',
                        'beginningBalance', 'totalReceivedQuantity', 'totalConsumedQuantity',
                        'theoreticalStockAtEndofPeriod', 'stockOnHand', 'difference',
                        'theoreticalQuantityToRequest', 'requestedQuantity', 'authorizedQuantity'];
                    return  _.sortBy(_.filter(requisition.template.getColumns(), function(item) {
                        return _.include(columnsList, item.name);
                    }), 'displayOrder');
                }
            }
        });
    }

})();
