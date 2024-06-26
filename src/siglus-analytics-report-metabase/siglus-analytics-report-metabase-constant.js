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

    /**
     * @ngdoc object
     * @name siglus-report-metabase-report dashboardname constant
     *
     * @description
     * This is constant for metabase report dashboard name.
     */
    angular.module('siglus-analytics-report-metabase')
        .constant('SIGLUS_METABASE_DASHBOARD_NAME', dashboardname());

    function dashboardname() {
        return {
            SYSTEM_VERSION_REPORT: 'system_version_report',
            EXPIRING_PRODUCTS_REPORT: 'expiring_products_report',
            SYSTEM_UPDATE_REPORT: 'system_update_report',
            EXPIRED_PRODUCTS_REPORT: 'expired_products_report',
            REQUISITION_MONTHLY_REPORT: 'requisition_monthly_report',
            SOH_REPORT_BY_PRODUCT: 'soh_report_by_product',
            SOH_BY_LOT_REPORT: 'soh_by_lot_report',
            STOCK_STATUS_REPORT: 'stock_status_report',
            MMIA_REGIMENS_REPORT: 'mmia_regimens_report',
            MMTB_REGIMENS_REPORT: 'mmtb_regimens_report',
            FULFILLMENT_REPORT: 'fulfillment_report',
            HISTORICAL_DATA_REPORT: 'historical_data_report',
            MALARIA_CONSUMPTION_DATA_REPORT: 'malaria_consumption_data_report',
            REQUISITION_DATA_REPORT: 'requisition_data_report',
            RAPID_TEST_CONSUMPTION_DATA_REPORT: 'rapid_test_consumption_data_report',
            TRACER_DRUG_REPORT: 'tracer_drug_report',
            USER_REPORT: 'user_report',
            USER_ACCESS_REPORT: 'user_access_report',
            EXPIRED_REMOVED_PRODUCTS_REPORT: 'expired_removed_products_report',
            FEFO_REPORT: 'fefo_report',
            RECORD_REPORT_NAME: recordReportName()
        };
    }

    function recordReportName() {
        return {
            STOCK_STATUS: 'STOCK_STATUS',
            SOH_BY_LOT: 'SOH_BY_LOT',
            EXPIRING_PRODUCTS: 'EXPIRING_PRODUCTS',
            EXPIRED_PRODUCTS: 'EXPIRED_PRODUCTS',
            TRACER_DRUG: 'TRACER_DRUG',
            HISTORICAL_DATA: 'HISTORICAL_DATA',
            REQUISITIONS_MONTHLY: 'REQUISITIONS_MONTHLY',
            REQUISITION_DATA: 'REQUISITION_DATA',
            MMIA_REGIMENS: 'MMIA_REGIMENS',
            MMTB_REGIMENS: 'MMTB_REGIMENS',
            MALARIA_CONSUMPTION_DATA: 'MALARIA_CONSUMPTION_DATA',
            RAPID_TEST_CONSUMPTION_DATA: 'RAPID_TEST_CONSUMPTION_DATA',
            FULFILLMENT: 'FULFILLMENT',
            SYSTEM_VERSION: 'SYSTEM_VERSION',
            SYSTEM_UPDATE: 'SYSTEM_UPDATE',
            USER: 'USER',
            USER_ACCESS: 'USER_ACCESS',
            EXPIRED_REMOVED_PRODUCTS: 'EXPIRED_REMOVED_PRODUCTS',
            FEFO: 'FEFO'
        };
    }

})();
