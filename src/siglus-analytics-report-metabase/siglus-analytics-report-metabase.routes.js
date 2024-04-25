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
        .module('siglus-analytics-report-metabase')
        .config(routes);

    routes.$inject = ['$stateProvider', 'SIGLUS_METABASE_DASHBOARD_NAME', 'ADMINISTRATION_RIGHTS'];

    function routes($stateProvider, SIGLUS_METABASE_DASHBOARD_NAME, ADMINISTRATION_RIGHTS) {

        var reportLists = [
            {
                name: 'openlmis.analyticsReport.stockStatus',
                label: 'analyticsReportMetabase.stockStatus.title',
                url: '/sohReportByProduct',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_REPORT_BY_PRODUCT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.STOCK_STATUS,
                priority: 99
            },
            {
                name: 'openlmis.analyticsReport.sohByLot',
                label: 'analyticsReportMetabase.sohByLot.title',
                url: '/sohByLot',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_BY_LOT_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.SOH_BY_LOT,
                priority: 96
            },
            // {
            //     name: 'openlmis.analyticsReport.stockStatus',
            //     label: 'analyticsReportMetabase.stockStatus.title',
            //     url: '/stockStatus',
            //     dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.STOCK_STATUS_REPORT,
            //     priority: 93
            // },
            {
                name: 'openlmis.analyticsReport.expiringProducts',
                label: 'analyticsReportMetabase.expiringProducts.title',
                url: '/expiringProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRING_PRODUCTS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.EXPIRING_PRODUCTS,
                priority: 90
            },
            {
                name: 'openlmis.analyticsReport.expiredProducts',
                label: 'analyticsReportMetabase.expiredProducts.title',
                url: '/expiredProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRED_PRODUCTS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.EXPIRED_PRODUCTS,
                priority: 87
            },
            {
                name: 'openlmis.analyticsReport.historicalData',
                label: 'analyticsReportMetabase.historicalData.title',
                url: '/historicalData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.HISTORICAL_DATA_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.HISTORICAL_DATA,
                priority: 81
            },
            {
                name: 'openlmis.analyticsReport.requisitionAndMonthly',
                label: 'analyticsReportMetabase.requisitionAndMonthly.title',
                url: '/requisitionAndMonthly',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.REQUISITION_MONTHLY_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.REQUISITIONS_MONTHLY,
                priority: 78
            },
            {
                name: 'openlmis.analyticsReport.requisitionData',
                label: 'analyticsReportMetabase.requisitionData.title',
                url: '/requisitionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.REQUISITION_DATA_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.REQUISITION_DATA,
                priority: 75
            },
            {
                name: 'openlmis.analyticsReport.mmiaRegimens',
                label: 'analyticsReportMetabase.mmiaRegimens.title',
                url: '/mmiaRegimens',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MMIA_REGIMENS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.MMIA_REGIMENS,
                priority: 72
            },
            {
                name: 'openlmis.analyticsReport.mmtbRegimens',
                label: 'analyticsReportMetabase.mmtbRegimens.title',
                url: '/mmtbRegimens',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MMTB_REGIMENS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.MMTB_REGIMENS,
                priority: 71
            },
            {
                name: 'openlmis.analyticsReport.malariaConsumptionData',
                label: 'analyticsReportMetabase.malariaConsumptionData.title',
                url: '/malariaConsumptionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MALARIA_CONSUMPTION_DATA_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.MALARIA_CONSUMPTION_DATA,
                priority: 69
            },
            {
                name: 'openlmis.analyticsReport.rapidTestConsumptionData',
                label: 'analyticsReportMetabase.rapidTestConsumptionData.title',
                url: '/rapidTestConsumptionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.RAPID_TEST_CONSUMPTION_DATA_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.RAPID_TEST_CONSUMPTION_DATA,
                priority: 66
            },
            {
                name: 'openlmis.analyticsReport.fulfillment',
                label: 'analyticsReportMetabase.fulfillment.title',
                url: '/fulfillment',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.FULFILLMENT_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.FULFILLMENT,
                priority: 63
            },
            {
                name: 'openlmis.analyticsReport.systemVersion',
                label: 'analyticsReportMetabase.systemVersion.title',
                url: '/systemVersion',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_VERSION_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.SYSTEM_VERSION,
                priority: 60
            },
            {
                name: 'openlmis.analyticsReport.systemUpdate',
                label: 'analyticsReportMetabase.systemUpdate.title',
                url: '/systemUpdate',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_UPDATE_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.SYSTEM_UPDATE,
                priority: 57
            },
            {
                name: 'openlmis.analyticsReport.userAccess',
                label: 'analyticsReportMetabase.userAccess.title',
                url: '/userAccess',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.USER_ACCESS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.USER_ACCESS,
                priority: 51
            },
            {
                name: 'openlmis.analyticsReport.expiredRemovedProducts',
                label: 'analyticsReportMetabase.expiredRemovedProducts.title',
                url: '/expiredRemovedProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRED_REMOVED_PRODUCTS_REPORT,
                recordName: SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.EXPIRED_REMOVED_PRODUCTS,
                priority: 48
            }
        ];

        angular.forEach(reportLists, function(item) {
            $stateProvider.state(item.name, {
                url: item.url,
                showInNavigation: true,
                label: item.label,
                priority: item.priority,
                views: {
                    '@openlmis': {
                        controller: 'siglusAnalyticsReportMetabaseController',
                        controllerAs: 'vm',
                        templateUrl: 'siglus-analytics-report-metabase/siglus-analytics-report-metabase.html'
                    }
                },
                resolve: {
                    analyticsReportMetabase: function($stateParams, analyticsReportMetabaseService) {
                        return analyticsReportMetabaseService.getMetabaseUrl(item.dashboardName).then(function(data) {
                            analyticsReportMetabaseService.recordUserAccess(item.recordName);
                            return data;
                        });
                    }
                }
            });
        });

        $stateProvider.state('openlmis.analyticsReport.tracerDrug', {
            url: '/tracerDrug',
            showInNavigation: true,
            label: 'analyticsReportMetabase.tracerDrug.title',
            priority: 84,
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportTracerDrugController',
                    controllerAs: 'vm',
                    // eslint-disable-next-line max-len
                    templateUrl: 'siglus-analytics-report-tracer-drug/siglus-analytics-report-tracer-drug.html'
                }
            },
            resolve: {
                analyticsReportMetabase: function($stateParams, analyticsReportMetabaseService) {
                    return analyticsReportMetabaseService
                        .getMetabaseUrl(SIGLUS_METABASE_DASHBOARD_NAME.TRACER_DRUG_REPORT).then(function(data) {
                            analyticsReportMetabaseService.recordUserAccess(
                                SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.TRACER_DRUG
                            );
                            return data;
                        });
                },
                filterInfo: function(analyticsReportMetabaseService) {
                    return analyticsReportMetabaseService
                        .getTracerDrugFilterInfo().then(function(data) {
                            return data;
                        });
                }
            }
        });

        $stateProvider.state('openlmis.analyticsReport.user', {
            url: '/user',
            showInNavigation: true,
            priority: 54,
            accessRights: [
                ADMINISTRATION_RIGHTS.USERS_MANAGE
            ],
            label: 'analyticsReportMetabase.user.title',
            views: {
                '@openlmis': {
                    controller: 'siglusAnalyticsReportMetabaseController',
                    controllerAs: 'vm',
                    templateUrl: 'siglus-analytics-report-metabase/siglus-analytics-report-metabase.html'
                }
            },
            resolve: {
                analyticsReportMetabase: function($stateParams, analyticsReportMetabaseService) {
                    return analyticsReportMetabaseService.getMetabaseUrl(SIGLUS_METABASE_DASHBOARD_NAME.USER_REPORT)
                        .then(function(data) {
                            analyticsReportMetabaseService.recordUserAccess(
                                SIGLUS_METABASE_DASHBOARD_NAME.RECORD_REPORT_NAME.USER
                            );
                            return data;
                        });
                }
            }
        });
    }
})();
