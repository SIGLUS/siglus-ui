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

    routes.$inject = ['$stateProvider', 'SIGLUS_METABASE_DASHBOARD_NAME'];

    function routes($stateProvider, SIGLUS_METABASE_DASHBOARD_NAME) {

        var reportLists = [
            {
                name: 'openlmis.analyticsReport.sohReportByProduct',
                label: 'analyticsReportMetabase.sohReportByProduct.title',
                url: '/sohReportByProduct',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_REPORT_BY_PRODUCT,
                priority: 99
            },
            {
                name: 'openlmis.analyticsReport.sohByLot',
                label: 'analyticsReportMetabase.sohByLot.title',
                url: '/sohByLot',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_BY_LOT_REPORT,
                priority: 96
            },
            {
                name: 'openlmis.analyticsReport.stockStatus',
                label: 'analyticsReportMetabase.stockStatus.title',
                url: '/stockStatus',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.STOCK_STATUS_REPORT,
                priority: 93
            },
            {
                name: 'openlmis.analyticsReport.expiringProducts',
                label: 'analyticsReportMetabase.expiringProducts.title',
                url: '/expiringProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRING_PRODUCTS_REPORT,
                priority: 90
            },
            {
                name: 'openlmis.analyticsReport.expiredProducts',
                label: 'analyticsReportMetabase.expiredProducts.title',
                url: '/expiredProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRED_PRODUCTS_REPORT,
                priority: 87
            },
            {
                name: 'openlmis.analyticsReport.historicalData',
                label: 'analyticsReportMetabase.historicalData.title',
                url: '/historicalData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.HISTORICAL_DATA_REPORT,
                priority: 81
            },
            {
                name: 'openlmis.analyticsReport.requisitionAndMonthly',
                label: 'analyticsReportMetabase.requisitionAndMonthly.title',
                url: '/requisitionAndMonthly',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.REQUISITION_MONTHLY_REPORT,
                priority: 78
            },
            {
                name: 'openlmis.analyticsReport.requisitionData',
                label: 'analyticsReportMetabase.requisitionData.title',
                url: '/requisitionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.REQUISITION_DATA_REPORT,
                priority: 75
            },
            {
                name: 'openlmis.analyticsReport.mmiaRegimens',
                label: 'analyticsReportMetabase.mmiaRegimens.title',
                url: '/mmiaRegimens',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MMIA_REGIMENS_REPORT,
                priority: 72
            },
            {
                name: 'openlmis.analyticsReport.mmtbRegimens',
                label: 'analyticsReportMetabase.mmtbRegimens.title',
                url: '/mmtbRegimens',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MMTB_REGIMENS_REPORT,
                priority: 71
            },
            {
                name: 'openlmis.analyticsReport.malariaConsumptionData',
                label: 'analyticsReportMetabase.malariaConsumptionData.title',
                url: '/malariaConsumptionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MALARIA_CONSUMPTION_DATA_REPORT,
                priority: 69
            },
            {
                name: 'openlmis.analyticsReport.rapidTestConsumptionData',
                label: 'analyticsReportMetabase.rapidTestConsumptionData.title',
                url: '/rapidTestConsumptionData',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.RAPID_TEST_CONSUMPTION_DATA_REPORT,
                priority: 66
            },
            {
                name: 'openlmis.analyticsReport.fulfillment',
                label: 'analyticsReportMetabase.fulfillment.title',
                url: '/fulfillment',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.FULFILLMENT_REPORT,
                priority: 63
            },
            {
                name: 'openlmis.analyticsReport.systemVersion',
                label: 'analyticsReportMetabase.systemVersion.title',
                url: '/systemVersion',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_VERSION_REPORT,
                priority: 60
            },
            {
                name: 'openlmis.analyticsReport.systemUpdate',
                label: 'analyticsReportMetabase.systemUpdate.title',
                url: '/systemUpdate',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_UPDATE_REPORT,
                priority: 57
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
                        var analyticsReportMetabaseResource;
                        analyticsReportMetabaseResource = analyticsReportMetabaseService
                            .getMetabaseUrl(item.dashboardName);
                        return analyticsReportMetabaseResource.then(function(data) {
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
                    var analyticsReportMetabaseResource;
                    analyticsReportMetabaseResource = analyticsReportMetabaseService
                        .getMetabaseUrl(SIGLUS_METABASE_DASHBOARD_NAME.TRACER_DRUG_REPORT);
                    return analyticsReportMetabaseResource.then(function(data) {
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
    }
})();
