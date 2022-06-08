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
        $stateProvider.state('openlmis.analyticsReport.systemVersion', {
            url: '/systemVersion',
            showInNavigation: true,
            label: 'analyticsReportMetabase.systemVersion.title',
            priority: 1,
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
                        .getMetabaseUrl(SIGLUS_METABASE_DASHBOARD_NAME.SYSTEM_VERSION_REPORT);
                    return analyticsReportMetabaseResource.then(function(data) {
                        return data;
                    });
                }
            }
        });

        // $stateProvider.state('openlmis.report.stockOnHand', {
        //     url: '/metabase',
        //     showInNavigation: true,
        //     label: 'analyticsReportMetabase.stockOnHand.title',
        //     priority: 1,
        //     views: {
        //         '@openlmis': {
        //             controller: 'siglusAnalyticsReportMetabaseController',
        //             controllerAs: 'vm',
        //             templateUrl: 'siglus-analytics-report-metabase/siglus-analytics-report-metabase.html'
        //         }
        //     },
        //     resolve: {
        //         analyticsReportMetabase: function() {
        //             var param = {};
        //             // eslint-disable-next-line max-len
        //             return param;
        //         }
        //     }
        // });

        $stateProvider.state('openlmis.analyticsReport.expiringProducts', {
            url: '/expiringProducts',
            showInNavigation: true,
            label: 'analyticsReportMetabase.expiringProducts.title',
            priority: 1,
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
                    .getMetabaseUrl(SIGLUS_METABASE_DASHBOARD_NAME.EXPIRING_PRODUCTS_REPORT);
                    return analyticsReportMetabaseResource.then(function(data) {
                        return data;
                    });
                }
            }
        });
    }

})();
