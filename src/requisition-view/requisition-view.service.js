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
     * @name siglus-expired-products.ExpiredProductsViewService
     *
     * @description
     * Application layer service that prepares domain objects to be used on the view.
     */
    angular
        .module('requisition-view')
        .service('requisitionViewService', RequisitionViewService);

    RequisitionViewService.inject = ['$filter', '$resource', 'stockmanagementUrlFactory', 'REQUISITION_STATUS'];

    function RequisitionViewService($resource, stockmanagementUrlFactory, REQUISITION_STATUS) {
        var resource = $resource(stockmanagementUrlFactory(), {}, {
            exportExcel: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/requisitions/:id/export'),
                responseType: 'blob',
                transformResponse: transExcelformResponse
            }
        });

        this.exportExcel = exportExcel;
        this.canExportExcel = canExportExcel;

        function canExportExcel(requisitionStatus, programCode) {
            var supportStatus = [
                REQUISITION_STATUS.APPROVED,
                REQUISITION_STATUS.RELEASED,
                REQUISITION_STATUS.RELEASED_WITHOUT_ORDER
            ];
            var supportPrograms = ['T', 'TR', 'VC', 'MMC', 'TB'];
            return supportStatus.includes(requisitionStatus)
                && supportPrograms.includes(programCode);
        }

        function exportExcel(requisitionId) {
            return resource.exportExcel({
                id: requisitionId
            });
        }

        function transExcelformResponse(data, headers, status) {
            if (status === 200) {
                var objectUrl = URL.createObjectURL(data);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.setAttribute('style', 'display:none');
                a.setAttribute('href', objectUrl);
                var filename =  getFileNameFromHeader(headers);
                a.setAttribute('download', filename);
                a.click();
                URL.revokeObjectURL(objectUrl);
            }
        }

        function getFileNameFromHeader(headers) {
            var disposition = headers('Content-Disposition');
            var prefix = 'attachment;filename=';
            return disposition.slice(prefix.length);
        }
    }
})();
