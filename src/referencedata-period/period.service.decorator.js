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
     * @name referencedata-period.periodService
     *
     * @description
     * Responsible for retrieving all processing period information from the server.
     */
    angular
        .module('referencedata-period')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('periodService', decorator);
    }

    decorator.$inject = ['$delegate', '$resource', 'referencedataUrlFactory', 'dateUtils'];

    function decorator($delegate, $resource, referencedataUrlFactory, dateUtils) {

        var resource = $resource(referencedataUrlFactory('/api/processingPeriods/:id'));

        $delegate.create = create;

        return $delegate;

        /**
         * @ngdoc method
         * @name create
         * @methodOf referencedata-period.periodService
         *
         * @description
         * Creates processing periods.
         *
         * @param  {Object}  period new Period
         * @return {Promise}        created Period
         */
        function create(period) {
            period.startDate = dateUtils.toStringDate(period.startDate);
            period.endDate = dateUtils.toStringDate(period.endDate);
            period.submitStartDate = dateUtils.toStringDate(period.submitStartDate);
            period.submitEndDate = dateUtils.toStringDate(period.submitEndDate);
            return resource.save(period).$promise;
        }
    }
})();
