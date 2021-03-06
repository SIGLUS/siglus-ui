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
     * @name siglus-refresh-confirm.siglusRefreshConfirmService
     *
     * @description
     * Service allows to register handler on window's beforeunload event.
     */
    angular.module('siglus-refresh-confirm')
        .service('siglusRefreshConfirmService', siglusRefreshConfirmService);

    function siglusRefreshConfirmService() {

        /**
         * @ngdoc method
         * @methodOf siglus-refresh-confirm.siglusRefreshConfirmService
         * @name register
         *
         * @description
         * Register handler on window's beforeunload event.
         *
         */
        this.register = function($scope) {
            window.onbeforeunload = askConfirm;

            function askConfirm() {
                if ($scope.needToConfirm) {
                    // According to the document of https://www.chromestatus.com/feature/5349061406228480,
                    // we can't custom messages in onbeforeunload dialogs now.
                    return '';
                }
            }
        };

        /**
         * @ngdoc method
         * @methodOf siglus-refresh-confirm.siglusRefreshConfirmService
         * @name deregister
         *
         * @description
         * Deregister handler on window's beforeunload event.
         *
         */
        this.deregister = function() {
            window.onbeforeunload = null;
        };
    }
})();
