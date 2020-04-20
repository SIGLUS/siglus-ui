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
     * @name admin-template-add.TemplateAddService
     *
     * @description
     * Decorates TemplateAddService with additional attribute.
     */

    angular.module('admin-template-add')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('TemplateAddService', decorator);
    }

    decorator.$inject = [
        '$delegate', 'notificationService', 'loadingModalService', 'Template', '$state', '$q'
    ];

    function decorator($delegate, notificationService, loadingModalService, Template, $state, $q) {
        $delegate.prototype.initiateTemplate = initiateTemplate;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf admin-template-add.TemplateAddService
         * @name initiateTemplate
         *
         * @description
         * Creates a new Template and decorates it's save method with notification, alert and loading modal.
         */
        function initiateTemplate() {
            var template = new Template({
                populateStockOnHandFromStockCards: false,
                // SIGLUS-REFACTOR: starts here
                enableConsultationNumber: false,
                enableKitUsage: false,
                enableProductModule: false,
                // SIGLUS-REFACTOR: ends here
                columnsMap: {},
                facilityTypes: []
            }, this.repository);

            decorateCreate(template);

            return template;
        }

        function decorateCreate(template) {
            var originalCreate = template.create;

            template.create = function() {
                loadingModalService.open();
                return originalCreate.apply(this, arguments)
                    .then(function(response) {
                        notificationService.success('adminTemplateAdd.createTemplate.success');
                        $state.go('openlmis.administration.requisitionTemplates.configure.columns', {
                            id: response.id
                        }, {
                            reload: true
                        });
                        return response;
                    })
                    .catch(function(error) {
                        loadingModalService.close();
                        notificationService.error('adminTemplateAdd.createTemplate.failure');
                        return $q.reject(error);
                    });
            };
        }
    }
})();