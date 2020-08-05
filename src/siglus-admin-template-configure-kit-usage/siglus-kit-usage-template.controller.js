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
     * @name siglus-admin-template-configure-kit-usage.controller:SiglusKitUsageTemplateController
     *
     * @description
     * Controller for template view page.
     */
    angular
        .module('siglus-admin-template-configure-kit-usage')
        .controller('SiglusKitUsageTemplateController', SiglusKitUsageTemplateController);

    SiglusKitUsageTemplateController.$inject = ['COLUMN_SOURCES', 'siglusTemplateConfigureService', 'template', 'tags',
        'SIGLUS_SECTION_TYPES'];

    function SiglusKitUsageTemplateController(COLUMN_SOURCES, siglusTemplateConfigureService, template, tags,
                                              SIGLUS_SECTION_TYPES) {
        var vm = this;

        vm.$onInit = onInit;
        vm.addCollectionColumn = addCollectionColumn;
        vm.addServiceColumn = addServiceColumn;

        vm.template = undefined;

        vm.tags = undefined;

        function onInit() {
            vm.template = template;
            vm.tags = tags;
            vm.collection =
                siglusTemplateConfigureService.getSectionByName(template.kitUsage, SIGLUS_SECTION_TYPES.COLLECTION);
            vm.service =
                siglusTemplateConfigureService.getSectionByName(template.kitUsage, SIGLUS_SECTION_TYPES.SERVICE);
        }

        function addCollectionColumn() {
            vm.collection.columns.push(angular.merge({}, siglusTemplateConfigureService.getDefaultColumn(), {
                columnDefinition: {
                    sources: [COLUMN_SOURCES.STOCK_CARDS, COLUMN_SOURCES.USER_INPUT]
                }
            }));
        }

        function addServiceColumn() {
            vm.service.columns.push(angular.merge({}, siglusTemplateConfigureService.getDefaultColumn(), {
                source: COLUMN_SOURCES.USER_INPUT,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT],
                    supportsTag: false
                }
            }));
        }
    }
})();
