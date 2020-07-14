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
        .module('admin-template-configure-preview-section')
        .controller('siglusPatientPreviewController', controller);

    controller.$inject = ['columnUtils', 'COLUMN_SOURCES', 'messageService'];

    function controller(columnUtils) {

        var vm = this;

        vm.$onInit = onInit;
        vm.isUserInput = columnUtils.isUserInput;
        vm.isTotal = columnUtils.isTotal;
        vm.columnDisplayName = columnUtils.columnDisplayName;

        function onInit() {
            vm.sections = [{
                id: 'f5b72978-120e-4968-be5e-355fa49b3017',
                name: 'collection',
                label: 'Type of Patient',
                displayOrder: 0,
                columns: [ {
                    name: 'kitReceived',
                    label: 'New',
                    indicator: 'PD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of new patients',
                    tag: null,
                    columnDefinition: {
                        id: '23c0ecc1-f58e-41e4-99f2-241a3f8360d6',
                        name: 'kitReceived',
                        sources: [ 'USER_INPUT'],
                        label: 'New',
                        indicator: 'PD',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of new patients',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: [ ]
                    },
                    source: 'USER_INPUT',
                    id: '6e771f88-ad8a-4c23-be62-c2f2c3a92b57'
                }, {
                    name: 'total',
                    label: 'Total',
                    indicator: 'PD',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of this group',
                    tag: null,
                    columnDefinition: {
                        id: '86ca8cea-94c2-4d50-8dc8-ec5f6ff60ec4',
                        name: 'kitOpened',
                        sources: [ 'USER_INPUT', 'CALCULATED' ],
                        label: 'Total',
                        indicator: 'PD',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the total number of this group',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: [ ]
                    },
                    source: 'CALCULATED',
                    id: 'e6e5e3f1-8980-4f38-9a5a-a72f159d5b4b'
                } ]
            }, {
                id: 'f5b72978-120e-4968-be5e-355fa49b3017',
                name: 'collection',
                label: 'Type of Patient',
                displayOrder: 0,
                columns: [ {
                    name: 'kitReceived',
                    label: 'New',
                    indicator: 'PD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of new patients',
                    tag: null,
                    columnDefinition: {
                        id: '23c0ecc1-f58e-41e4-99f2-241a3f8360d6',
                        name: 'kitReceived',
                        sources: [ 'USER_INPUT'],
                        label: 'New',
                        indicator: 'PD',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of new patients',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: [ ]
                    },
                    source: 'USER_INPUT',
                    id: '6e771f88-ad8a-4c23-be62-c2f2c3a92b57'
                }, {
                    name: 'total',
                    label: 'Total',
                    indicator: 'PD',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of this group',
                    tag: null,
                    columnDefinition: {
                        id: '86ca8cea-94c2-4d50-8dc8-ec5f6ff60ec4',
                        name: 'kitOpened',
                        sources: [ 'USER_INPUT', 'CALCULATED' ],
                        label: 'Total',
                        indicator: 'PD',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the total number of this group',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: [ ]
                    },
                    source: 'CALCULATED',
                    id: 'e6e5e3f1-8980-4f38-9a5a-a72f159d5b4b'
                } ]
            }];
        }
    }

})();
