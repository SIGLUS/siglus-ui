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

    angular
        .module('admin-template-configure-settings')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($stateProvider, REQUISITION_RIGHTS) {
        $stateProvider.state('openlmis.administration.requisitionTemplates.configure.settings', {
            label: 'adminTemplateConfigureSettings.title',
            url: '/settings',
            templateUrl: 'admin-template-configure-settings/admin-template-configure-settings.html',
            controller: 'AdminTemplateConfigureSettingsController',
            controllerAs: 'vm',
            accessRights: [REQUISITION_RIGHTS.REQUISITION_TEMPLATES_MANAGE],
            resolve: {
                facilityTypes: function(facilityTypeService) {
                    return facilityTypeService.query({
                        active: true
                    })
                        .then(function(response) {
                            return response.content;
                        });
                },
                templates: function(requisitionTemplateService) {
                    return requisitionTemplateService.getAll();
                },
                programTemplates: function(template, templates, templateListFactory) {
                    return templateListFactory.getProgramTemplates(templates, [template.program]);
                },
                templateFacilityTypes: function(template, facilityTypes, templateListFactory) {
                    return templateListFactory.getTemplateFacilityTypes([template], facilityTypes);
                },
                availableFacilityTypes: function(programTemplates, facilityTypes, template,
                    templateFacilityTypeFactory) {
                    return templateFacilityTypeFactory.getAvailableFacilityTypesForProgram(
                        programTemplates[template.program.id], facilityTypes
                    );
                },
                // #163: add associate program
                programs: function(programService) {
                    return programService.getVirtualPrograms();
                },
                templateAssociatePrograms: function(template, programs) {
                    return programs.filter(function(program) {
                        var associatePrograms = template.associatePrograms.filter(function(associateProgram) {
                            return program.id === associateProgram.id;
                        });
                        return associatePrograms.length > 0;
                    });
                },
                availableAssociatePrograms: function(template, programs) {
                    return programs.filter(function(program) {
                        if (program.id === template.program.id) {
                            return false;
                        }
                        var associatePrograms = template.associatePrograms.filter(function(associateProgram) {
                            return program.id === associateProgram.id;
                        });
                        return associatePrograms.length === 0;
                    });
                }
                // #163: ends here
            }
        });
    }
})();
