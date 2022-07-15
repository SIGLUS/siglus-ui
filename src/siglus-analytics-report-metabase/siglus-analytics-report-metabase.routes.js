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
                name: 'openlmis.analyticsReport.systemVersion',
                label: 'analyticsReportMetabase.systemVersion.title',
                url: '/systemVersion',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_VERSION_REPORT
            },
            {
                name: 'openlmis.analyticsReport.expiringProducts',
                label: 'analyticsReportMetabase.expiringProducts.title',
                url: '/expiringProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRING_PRODUCTS_REPORT
            },
            {
                name: 'openlmis.analyticsReport.systemUpdate',
                label: 'analyticsReportMetabase.systemUpdate.title',
                url: '/systemUpdate',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_UPDATE_REPORT
            },
            {
                name: 'openlmis.analyticsReport.expiredProducts',
                label: 'analyticsReportMetabase.expiredProducts.title',
                url: '/expiredProducts',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.EXPIRED_PRODUCTS_REPORT
            },
            {
                name: 'openlmis.analyticsReport.requisitionAndMonthly',
                label: 'analyticsReportMetabase.requisitionAndMonthly.title',
                url: '/requisitionAndMonthly',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.REQUISITION_MONTHLY_REPORT
            },
            {
                name: 'openlmis.analyticsReport.sohReportByProduct',
                label: 'analyticsReportMetabase.sohReportByProduct.title',
                url: '/sohReportByProduct',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_REPORT_BY_PRODUCT
            },
            {
                name: 'openlmis.analyticsReport.sohByLot',
                label: 'analyticsReportMetabase.sohByLot.title',
                url: '/sohByLot',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.SOH_BY_LOT_REPORT
            },
            {
                name: 'openlmis.analyticsReport.stockStatus',
                label: 'analyticsReportMetabase.stockStatus.title',
                url: '/stockStatus',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.STOCK_STATUS_REPORT
            },
            {
                name: 'openlmis.analyticsReport.mmiaRegimens',
                label: 'analyticsReportMetabase.mmiaRegimens.title',
                url: '/mmiaRegimens',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.MMIA_REGIMENS_REPORT
            },
            {
                name: 'openlmis.analyticsReport.fulfillment',
                label: 'analyticsReportMetabase.fulfillment.title',
                url: '/fulfillment',
                dashboardName: SIGLUS_METABASE_DASHBOARD_NAME.FULFILLMENT_REPORT
            }
        ];

        angular.forEach(reportLists, function(item, index) {
            $stateProvider.state(item.name, {
                url: item.url,
                showInNavigation: true,
                label: item.label,
                priority: parseInt(100 - index),
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
    }

})();
