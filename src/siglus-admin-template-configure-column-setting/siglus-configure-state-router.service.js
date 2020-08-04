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
     * @name siglus-admin-template-configure-column-setting.siglusConfigureStateRouterService
     *
     * @description
     * Check if state being transitioned is valid.
     */
    angular.module('siglus-admin-template-configure-column-setting')
        .service('siglusConfigureStateRouterService', service);

    service.$inject = [
        '$rootScope', 'loadingModalService', 'notificationService'
    ];

    function service($rootScope, loadingModalService, notificationService) {
        this.initialize = initialize;
        function initialize(template) {
            return $rootScope.$on('$stateChangeStart', function(event, toState) {
                if (toConfigureRelatedPage(toState) && !template.isValid()) {
                    event.preventDefault();
                    loadingModalService.close();
                    notificationService.error('adminProgramTemplate.template.invalid');
                }
            });

            function toConfigureRelatedPage(toState) {
                return toState.name.indexOf('openlmis.administration.requisitionTemplates.configure') > -1;
            }
        }
    }

})();
