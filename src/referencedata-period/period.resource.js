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
     * @name referencedata-period.ProcessingPeriodResource
     *
     * @description
     * Communicates with the /api/processingPeriods endpoint of the OpenLMIS server.
     */
    angular
        .module('referencedata-period')
        .factory('ProcessingPeriodResource', ProcessingPeriodResource);

    ProcessingPeriodResource.$inject = ['OpenlmisResource', 'classExtender'];

    function ProcessingPeriodResource(OpenlmisResource, classExtender) {

        classExtender.extend(ProcessingPeriodResource, OpenlmisResource);

        return ProcessingPeriodResource;
        // SIGLUS-REFACTOR: starts here
        function ProcessingPeriodResource() {
            this.super('/api/siglusapi/processingPeriods', {
                paginated: false
            });
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
