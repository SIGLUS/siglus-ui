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
     * @ngdoc service
     * @name siglus-analytics-report-metabase.analyticsReportMetabaseService
     *
     * @description
     * Responsible for fetching metabase iframeUrl from server.
     */
    angular
        .module('siglus-analytics-report-metabase')
        .service('analyticsReportMetabaseService', service);

    service.$inject = ['$resource', 'analyticsReportUrlFactory', 'moment', '$http'];

    function service($resource, analyticsReportUrlFactory, moment, $http) {
        var resource = $resource(
            analyticsReportUrlFactory('/api/siglusapi/dashboard'), {}, {
                get: {
                    method: 'GET',
                    transformResponse: transformResponse
                },
                getTracerDrugFilterInfo: {
                    method: 'GET',
                    url: analyticsReportUrlFactory('/api/siglusapi/report/tracerDrug/exportFilter'),
                    transformResponse: transformResponse
                },
                exportTracerDrugReport: {
                    method: 'POST',
                    url: analyticsReportUrlFactory('/api/siglusapi/report/tracerDrug/excel'),
                    responseType: 'blob',
                    transformResponse: transExcelformResponse
                }
            }
        );

        this.getMetabaseUrl = getMetabaseUrl;
        this.getTracerDrugFilterInfo = getTracerDrugFilterInfo;
        this.exportTracerDrugReport = exportTracerDrugReport;
        this.recordUserAccess = recordUserAccess;

        /**
         * @ngdoc method
         * @methodOf siglus-analytics-report-metabase.analyticsReportMetabaseService
         * @name getMetabaseUrl
         *
         * @description
         * get metabase iframeUrl by report name
         *
         * @param {String} reportName metabase report name.
         * @return {Promise} siglus-analytics-report-metabase promise.
         */
        function getMetabaseUrl(reportName) {
            return resource.get({
                dashboardName: reportName
            }).$promise;
        }

        function getTracerDrugFilterInfo() {
            return resource.getTracerDrugFilterInfo({}).$promise;
        }

        function exportTracerDrugReport(
            productCode, districtList, startDate, endDate
        ) {
            return resource.exportTracerDrugReport({
                productCode: productCode,
                districtList: districtList,
                startDate: startDate,
                endDate: endDate
            });
        }

        function transformResponse(data, headers, status) {
            if (status === 200) {
                return angular.fromJson(data);
            }
            return data;
        }

        function transExcelformResponse(data) {
            var objectUrl = URL.createObjectURL(data);
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display:none');
            a.setAttribute('href', objectUrl);
            var filename =  'Informações_sobre_medicamento_rastreadores_'
            + moment().format('YYYY-MM-DDTHH_mm_ss.SSSSSS') + 'Z.xlsx';
            a.setAttribute('download', filename);
            a.click();
            URL.revokeObjectURL(objectUrl);
        }

        function recordUserAccess(reportName) {
            return $http({
                method: 'POST',
                url: analyticsReportUrlFactory('/api/siglusapi/reports/records'),
                params: {
                    reportName: reportName
                },
                ignoreAlert: true
            });
        }
    }
})();
