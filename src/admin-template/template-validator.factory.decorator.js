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
     * @name admin-template.templateValidator
     *
     * @description
     * Decorates templateValidator with additional method.
     */
    angular.module('admin-template')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('templateValidator', decorator);
    }

    decorator.$inject = ['$delegate', 'notificationService'];

    function decorator($delegate, notificationService) {
        $delegate.isTemplateValid = isTemplateValid;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf admin-template.templateValidator
         * @name isTemplateValid
         *
         * @description
         * Checks if the given template is valid.
         *
         * @param   {Object}    template    the template to be checked
         * @return  {Boolean}               true if the template is valid, false otherwise
         */
        function isTemplateValid(template) {
            var isValid = true,
                validator = this;

            var isOptionsValid = template.enableConsultationNumber || template.enableKitUsage
                || template.enableProductModule;

            angular.forEach(template.columnsMap, function(column) {
                isValid = isValid && !validator.getColumnError(column, template);
            });

            isValid = isValid && isOptionsValid;
            if (!isOptionsValid) {
                notificationService.error('adminProgramTemplate.template.invalidOptions');
            }

            return isValid;
        }
    }
})();
