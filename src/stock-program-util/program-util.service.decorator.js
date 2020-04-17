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
     * @name stock-program-util.stockProgramUtilService
     *
     * @description
     * Decorator stockProgramUtilService .
     */
    angular.module('stock-program-util')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('stockProgramUtilService', decorator);
    }

    decorator.$inject = ['$delegate', 'permissionService', 'programService', 'currentUserHomeFacilityService', '$q',
        '$http', 'openlmisUrlFactory'];
    function decorator($delegate, permissionService, programService, currentUserHomeFacilityService, $q,
                       $http, openlmisUrlFactory) {
        var stockProgramUtilService = $delegate;

        stockProgramUtilService.getAllProductsProgram = getAllProductsProgram;

        return stockProgramUtilService;

        function getAllProductsProgram() {
            var url = openlmisUrlFactory('/api/siglus/programs?code=ALL');
            var deferred = $q.defer();
            $http.get(url).then(function(response) {
                deferred.resolve(response.data);
            }, function(response) {
                deferred.reject(response);
            });

            return deferred.promise;

        }
    }
})();
