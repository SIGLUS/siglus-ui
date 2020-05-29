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
     * @ngdoc controller
     * @name admin-template-configure.controller:AdminTemplateConfigureController
     *
     * @description
     * Controller for managing template configuration screen.
     */
    angular
        .module('admin-template-configure')
        .controller('AdminTemplateConfigureController', AdminTemplateConfigureController);

    AdminTemplateConfigureController.$inject = [
        'template', 'program',
        // #173: product sections for template configuration
        'configureStateRouterService', '$scope'
        // #173: ends here
    ];

    function AdminTemplateConfigureController(template, program, configureStateRouterService, $scope) {

        var vm = this;

        vm.$onInit = onInit;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure.controller:AdminTemplateConfigureController
         * @name template
         * @type {Object}
         *
         * @description
         * Holds template.
         */
        vm.template = template;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure.controller:AdminTemplateConfigureController
         * @name program
         * @type {Object}
         *
         * @description
         * Holds program.
         */
        vm.program = program;

        /**
         * @ngdoc property
         * @propertyOf admin-template-configure.controller:AdminTemplateConfigureController
         * @type {string}
         * @name originalTemplateName
         *
         * @description
         * The original name of the template.
         */
        vm.originalTemplateName = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-template-configure.controller:AdminTemplateConfigureController
         * @name onInit
         *
         * @description
         * Initialization method of the AdminTemplateConfigureController.
         */
        function onInit() {
            vm.template = template;
            vm.program = program;
            vm.originalTemplateName = template.name;
            // #173: product sections for template configuration
            var unsubscribe = configureStateRouterService.initialize(template);
            $scope.$on('$destroy', function() {
                unsubscribe();
            });
            // #173: ends here
        }
    }
})();
