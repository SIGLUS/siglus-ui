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

        $stateProvider.state('openlmis.requisitions.malaria', {
            url: '/Malaria/:rnr?showBreadCrumb',
            showInNavigation: false,
            label: 'malaria.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined
            },
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportCustomizeMalariaController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-customize-malaria/siglus-analytics-report-customize-malaria.html'
                }
            },
            resolve: {
                requisition: function($stateParams, requisitionService) {
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                }
            }
        });

        $stateProvider.state('openlmis.requisitions.mmia', {
            url: '/MMIA/:rnr?showBreadCrumb&forClient',
            showInNavigation: false,
            label: 'mmia.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined,
                forClient: 'false'
            },
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportCustomizeMMIAController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-customize-mmia/siglus-analytics-report-customize-mmia.html'
                }
            },
            resolve: {
                requisition: function($stateParams, requisitionService, localStorageService) {
                    if ($stateParams.forClient === 'true') {
                        return angular.fromJson(localStorageService.get($stateParams.rnr));
                    }
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                }
            }
        });

        $stateProvider.state('openlmis.requisitions.rapid', {
            url: '/MMIT/:rnr?showBreadCrumb&forClient',
            showInNavigation: false,
            label: 'rapid.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined,
                forClient: 'false'
            },
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportCustomizeRapidController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-customize-rapid/siglus-analytics-report-customize-rapid.html'
                }
            },
            resolve: {
                requisition: function($stateParams, requisitionService, localStorageService) {
                    if ($stateParams.forClient === 'true') {
                        return angular.fromJson(localStorageService.get($stateParams.rnr));
                    }
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                }
            }
        });

        $stateProvider.state('openlmis.requisitions.tb', {
            url: '/MMTB/:rnr?showBreadCrumb&forClient',
            showInNavigation: false,
            label: 'tb.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined,
                forClient: 'false'
            },
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportCustomizeTBController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-customize-tb/siglus-analytics-report-customize-tb.html'
                }
            },
            resolve: {
                requisition: function($stateParams, requisitionService, localStorageService) {
                    if ($stateParams.forClient === 'true') {
                        return angular.fromJson(localStorageService.get($stateParams.rnr));
                    }
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                }
            }
        });

        $stateProvider.state('openlmis.requisitions.ViaClassica', {
            url: '/Balance Requisition/:rnr?showBreadCrumb&forClient',
            showInNavigation: false,
            label: 'via.title',
            priority: 9,
            params: {
                showBreadCrumb: undefined,
                forClient: 'false'
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
                localRequisition: function($stateParams, localStorageService) {
                    if ($stateParams.forClient === 'true') {
                        return angular.fromJson(localStorageService.get($stateParams.rnr));
                    }
                    return null;
                },
                requisition: function($stateParams, requisitionService, localRequisition) {
                    if ($stateParams.forClient === 'true') {
                        return requisitionService.extendLineItemsWithOrderablesAndFtaps(localRequisition);
                    }
                    return requisitionService.getWithoutStatusMessages($stateParams.rnr);
                },
                facility: function(facilityService, requisition) {
                    return facilityService.get(requisition.facility.id);
                },
                processingPeriod: function(periodService, requisition) {
                    return periodService.get(requisition.processingPeriod.id);
                },
                lineItemsList: function($filter, requisition) {
                    var filterObject = {};
                    if (!requisition.isCreateForClient || !requisition.isInitForClient) {
                        filterObject = requisition.template.hideSkippedLineItems() ?
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
                    }
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
                    return  _.sortBy(requisition.template.getColumnsByNames(columnsList), 'displayOrder');
                }
            }
        });

    }

})();
