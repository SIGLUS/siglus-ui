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
        .module('admin-template-configure')
        .config(routes);

    routes.$inject = ['$stateProvider', 'REQUISITION_RIGHTS'];

    function routes($stateProvider, REQUISITION_RIGHTS) {

        $stateProvider.state('openlmis.administration.requisitionTemplates.configure', {
            abstract: 'true',
            label: 'adminTemplateConfigure.label',
            url: '/:id',
            accessRights: [REQUISITION_RIGHTS.REQUISITION_TEMPLATES_MANAGE],
            views: {
                '@openlmis': {
                    controller: 'AdminTemplateConfigureController',
                    templateUrl: 'admin-template-configure/admin-template-configure.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                template: function(requisitionTemplateService, $stateParams) {
                    return requisitionTemplateService.get($stateParams.id).then(function(response) {
                        response.kitUsage = [{
                            id: '**',
                            displayorder: 0,
                            name: 'collection',
                            label: 'KIT data collection',
                            columns: [{
                                name: 'kitReceived',
                                label: 'No. of Kit Received',
                                indicator: 'KD',
                                displayOrder: 0,
                                isDisplayed: true,
                                source: 'STOCK_CARDS',
                                option: null,
                                definition: 'record the quantity of how many KIT received',
                                tag: null,
                                columnDefinition: {
                                    canChangeOrder: false,
                                    columnType: 'NUMERIC',
                                    id: 'bde01507-3837-47b7-ae08-cec92c0c3cd2',
                                    name: 'kitReceived',
                                    sources: ['STOCK_CARDS', 'USER_INPUT'],
                                    options: [],
                                    label: 'No. of Kit Received',
                                    indicator: 'KD',
                                    mandatory: false,
                                    isDisplayRequired: true,
                                    canBeChangedByUser: false,
                                    supportsTag: true,
                                    definition: 'Unique identifier for each commodity/product.'
                                }
                            }, {
                                name: 'kitOpened',
                                label: 'No. of Kit open',
                                indicator: 'KD',
                                displayOrder: 1,
                                isDisplayed: true,
                                source: 'STOCK_CARDS',
                                option: null,
                                definition: 'record the quantity of how many KIT received',
                                tag: null,
                                columnDefinition: {
                                    canChangeOrder: true,
                                    columnType: 'NUMERIC',
                                    id: 'bde01507-3837-47b7-ae08-cec92c0c3cd2',
                                    name: 'kitOpened',
                                    sources: ['STOCK_CARDS', 'USER_INPUT'],
                                    options: [],
                                    label: 'No. of Kit Received',
                                    indicator: 'KD',
                                    mandatory: false,
                                    isDisplayRequired: true,
                                    canBeChangedByUser: false,
                                    supportsTag: true,
                                    definition: 'Unique identifier for each commodity/product.'
                                }
                            }]
                        }, {
                            id: '**',
                            displayorder: 1,
                            name: 'service',
                            label: 'Services',
                            columns: [{
                                name: 'HF',
                                label: 'HF',
                                indicator: 'SV',
                                displayOrder: 0,
                                isDisplayed: true,
                                source: null,
                                option: null,
                                definition: 'depend on frontend',
                                tag: null,
                                columnDefinition: {
                                    canChangeOrder: false,
                                    columnType: 'NUMERIC',
                                    id: 'bde01507-3837-47b7-ae08-cec92c0c3cd3',
                                    name: 'HF',
                                    sources: [],
                                    options: [],
                                    label: 'HF',
                                    indicator: 'SV',
                                    mandatory: false,
                                    isDisplayRequired: true,
                                    canBeChangedByUser: false,
                                    supportsTag: false,
                                    definition: null
                                }
                            }, {
                                name: '',
                                label: 'service',
                                indicator: 'N',
                                displayOrder: 1,
                                isDisplayed: true,
                                source: 'USER_INPUT',
                                option: null,
                                definition: 'depend on frontend',
                                tag: null,
                                columnDefinition: {
                                    canChangeOrder: true,
                                    columnType: 'TEXT',
                                    id: null,
                                    name: 'HF',
                                    sources: ['USER_INPUT'],
                                    options: [],
                                    label: 'service',
                                    indicator: 'N',
                                    mandatory: false,
                                    isDisplayRequired: false,
                                    canBeChangedByUser: false,
                                    supportsTag: false,
                                    definition: null
                                }
                            }]
                        }];
                        return response;
                    });
                },
                program: function(programService, template) {
                    return programService.get(template.program.id);
                },
                // #173: product sections for template configuration
                originalTemplate: function(template) {
                    return angular.copy(template);
                }
                // #173: ends here
            }
        });
    }
})();
