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
     * @name openlmis-server-error-handler.serverErrorHandler
     *
     * @description Displays alert modal when server response status has 4xx(excluding 401) or 5xx
     * code.
     */
    angular
        .module('openlmis-server-error-handler')
        .factory('serverErrorHandler', handler);

    handler.$inject = ['$q', '$injector', '$timeout'];

    function handler($q, $injector, $timeout) {

        var provider = {
            responseError: responseError
        };
        return provider;

        /**
         * @ngdoc method
         * @methodOf openlmis-server-error-handler.serverErrorHandler
         * @name  responseError
         *
         * @description
         * Takes a failed response with 4xx(excluding 401) or 5xx code displays alert modal and
         * reject response.
         *
         * @param  {Object}  response HTTP Response
         * @return {Promise}          Rejected promise
         */
        function responseError(response) {
            if (response.status >= 400 && response.status < 600 && response.status !== 401) {
                if (response.isBusinessError) {
                    return;
                }
                $timeout(function() {
                    $injector.get('alertService').error(getTitle(response.statusText),
                        getMessage(response.data));
                }, 200);
            }

            return $q.reject(response);
        }

        function getTitle(statusText) {
            return statusText ? statusText : 'openlmisServerErrorHandler.serverResponse.error';
        }

        function getMessage(data) {
            var dataObject = data;

            if (isJSON(data)) {
                dataObject = angular.fromJson(data);
            }

            if (dataObject) {
                return dataObject.error_description || dataObject.message;
            }
        }

        function isJSON(data) {
            try {
                angular.fromJson(data);
            } catch (e) {
                return false;
            }
            return true;
        }
    }
})();
