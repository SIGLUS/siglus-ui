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

describe('siglusAnalyticsReportCustomizeRapidController', function() {
    var testData = [];
    beforeEach(function() {
        var context = this;
        module('siglus-analytics-report');
        module('siglus-analytics-report-customize-rapid');
        module('requisition-view', function($provide) {
            context.RequisitionStockCountDateModalMock = jasmine.createSpy('RequisitionStockCountDateModal');

            $provide.factory('RequisitionStockCountDateModal', function() {
                return context.RequisitionStockCountDateModalMock;
            });
        });
        module('referencedata-facility-type-approved-product');
        module('referencedata-facility');
        module('referencedata-program');
        module('referencedata-period');

        var RequisitionDataBuilder, RequisitionLineItemDataBuilder, ProgramDataBuilder;
        inject(function($injector) {
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            RequisitionLineItemDataBuilder = $injector.get('RequisitionLineItemDataBuilder');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.openlmisDateFilter = $injector.get('openlmisDateFilter');
            this.siglusTemplateConfigureService = $injector.get('siglusTemplateConfigureService');
            this.$controller = $injector.get('$controller');
            this.siglusAnalyticsDateService = $injector.get('siglusAnalyticsDateService');
        });

        this.program = new ProgramDataBuilder()
            .withEnabledDatePhysicalStockCountCompleted()
            .build();
        this.facility = new this.FacilityDataBuilder().build();

        testData = [
            {
                title: 'is January',
                date: '2022-01-10',
                expect: 'January',
                id: '000001',
                pdfName: 'Requi000001_' + this.facility.name + '_Jan 10_2022_MMIT.pdf'
            },
            {
                title: 'is February',
                date: '2021-02-10',
                expect: 'February',
                id: '000002',
                pdfName: 'Requi000002_' + this.facility.name + '_Feb 10_2021_MMIT.pdf'
            },
            {
                title: 'is March',
                date: '2020-03-10',
                expect: 'March',
                id: '000003',
                pdfName: 'Requi000003_' + this.facility.name + '_Mar 10_2020_MMIT.pdf'
            },
            {
                title: 'is April',
                date: '2022-04-10',
                expect: 'April',
                id: '000004',
                pdfName: 'Requi000004_' + this.facility.name + '_Apr 10_2022_MMIT.pdf'
            },
            {
                title: 'is May',
                date: '2023-05-10',
                expect: 'May',
                id: '000005',
                pdfName: 'Requi000005_' + this.facility.name + '_May 10_2023_MMIT.pdf'
            },
            {
                title: 'is June',
                date: '2022-06-10',
                expect: 'June',
                id: '000006',
                pdfName: 'Requi000006_' + this.facility.name + '_Jun 10_2022_MMIT.pdf'
            },
            {
                title: 'is July',
                date: '2022-07-10',
                expect: 'July',
                id: '000007',
                pdfName: 'Requi000007_' + this.facility.name + '_Jul 10_022_MMIT.pdf'
            },
            {
                title: 'is August',
                date: '2024-08-10',
                expect: 'August',
                id: '000008',
                pdfName: 'Requi000008_' + this.facility.name + '_Aug 10_2024_MMIT.pdf'
            },
            {
                title: 'is September',
                date: '2022-09-10',
                expect: 'September',
                id: '000009',
                pdfName: 'Requi000009_' + this.facility.name + '_Sep 10_2022_MMIT.pdf'
            },
            {
                title: 'is October',
                date: '2029-10-10',
                expect: 'October',
                id: '000010',
                pdfName: 'Requi000010_' + this.facility.name + '_Oct 10_2029_MMIT.pdf'
            },
            {
                title: 'is November',
                date: '2022-11-10',
                expect: 'November',
                id: '000011',
                pdfName: 'Requi000011_' + this.facility.name + '_Nov 10_2022_MMIT.pdf'
            },
            {
                title: 'is December',
                date: '2022-12-10',
                expect: 'December',
                id: '000012',
                pdfName: 'Requi000012_' + this.facility.name + '_Dec 10_2022_MMIT.pdf'
            }
        ];
        this.requisition = new RequisitionDataBuilder()
            .withProgram(this.program)
            .withRequisitionLineItems([
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(this.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(this.program)
                    .buildJson()
            ])
            .build();
        // SIGLUS-REFACTOR: starts here
        this.requisition.extraData = {
            consultationNumber: undefined,
            openedKitByCHW: undefined,
            openedKitByHF: undefined,
            receivedKitByCHW: undefined,
            receivedKitByHF: undefined,
            signaure: {
                submit: 'fxffxf',
                approve: ['11'],
                authorize: '111'
            }
        };
        this.requisition.usageTemplate = {
            kitUsage: [{
                id: 'c8037468-21e5-45ee-8d64-aaf7bf90c22b',
                name: 'collection',
                label: 'KIT data collection',
                displayOrder: 0,
                columns: [{
                    id: '72f5795c-f95d-4253-b5a3-6af5cc435dd6',
                    name: 'kitReceived',
                    label: 'No. of Kit Received',
                    indicator: 'KD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of how many KIT received',
                    tag: null,
                    columnDefinition: {
                        id: '23c0ecc1-f58e-41e4-99f2-241a3f8360d6',
                        name: 'kitReceived',
                        sources: ['USER_INPUT', 'STOCK_CARDS'],
                        label: 'No. de Kits Recebidos',
                        indicator: 'KD',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: true,
                        definition: 'record the quantity of how many KIT received',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'ba673de0-a0d0-4dc4-9124-c08a5bae9910',
                    name: 'kitOpened',
                    label: 'No. of Kit Opened',
                    indicator: 'KD',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of how many KIT opened',
                    tag: null,
                    columnDefinition: {
                        id: '86ca8cea-94c2-4d50-8dc8-ec5f6ff60ec4',
                        name: 'kitOpened',
                        sources: ['USER_INPUT', 'STOCK_CARDS'],
                        label: 'Nº de Kits Abertos e Enviados',
                        indicator: 'KD',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: true,
                        definition: 'record the quantity of how many KIT opened and issued',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }, {
                id: '5d9ef497-aba1-4922-bb42-69be9e32a79f',
                name: 'service',
                label: 'Services',
                displayOrder: 1,
                columns: [{
                    id: '4235e712-6249-4d88-bbe7-90b492a5fc0d',
                    name: 'HF',
                    label: 'HF',
                    indicator: 'SV',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of KIT data in my facility',
                    tag: null,
                    columnDefinition: {
                        id: 'cbee99e4-f100-4f9e-ab4f-783d61ac80a6',
                        name: 'HF',
                        sources: [],
                        label: 'HF',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the quantity of KIT data in my facility',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: null
                }, {
                    id: '74d07250-ec18-4bbc-86f7-02968e3d83c5',
                    name: 'CHW',
                    label: 'CHW',
                    indicator: 'SV',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of KIT data in CHW',
                    tag: null,
                    columnDefinition: {
                        id: '95227492-c394-4f7e-8fa0-dd5b5cef3e8e',
                        name: 'CHW',
                        sources: ['USER_INPUT'],
                        label: 'CHW',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the quantity of KIT data in CHW',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }],
            patient: [{
                id: '3d89dd4e-a192-4173-be68-dce410190b2e',
                name: 'patientType',
                label: 'Type of Patient',
                displayOrder: 0,
                columns: [{
                    id: '6d8ccc3b-b898-461f-b135-4b62e7b23669',
                    name: 'new',
                    label: 'New',
                    indicator: 'PD',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of new patients',
                    tag: null,
                    columnDefinition: {
                        id: '07a70f2b-451c-401a-b8ca-75e56baeb91c',
                        name: 'new',
                        sources: ['USER_INPUT'],
                        label: 'Novos',
                        indicator: 'PD',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of new patients',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'dc3ef290-fde8-443f-a4ef-64700b921d27',
                    name: 'total',
                    label: 'Total',
                    indicator: 'PD',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of this group',
                    tag: null,
                    columnDefinition: {
                        id: 'f51371a4-ba6f-4119-9a0e-1a588fa5df21',
                        name: 'total',
                        sources: ['USER_INPUT', 'CALCULATED'],
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
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }],
            regimen: [{
                id: 'e6bf3fe4-3d10-4e05-a438-137267e536e2',
                name: 'regimen',
                label: 'Regimen',
                displayOrder: 0,
                columns: [{
                    id: '3ffa7435-87a5-4c9d-92ff-bca9e1661ea5',
                    name: 'code',
                    label: 'Code',
                    indicator: 'RE',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'display the code of each regimen',
                    tag: null,
                    columnDefinition: {
                        id: 'c47396fe-381a-49a2-887e-ce25c80b0875',
                        name: 'code',
                        sources: ['REFERENCE_DATA'],
                        label: 'Código',
                        indicator: 'RE',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'display the code of each regimen',
                        canChangeOrder: false,
                        columnType: 'TEXT',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'REFERENCE_DATA'
                }, {
                    id: '7c0b2869-dc25-4427-ae9d-ebc9549c90b2',
                    name: 'regiment',
                    label: 'Therapeutic regiment',
                    indicator: 'RE',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'display the name of each regimen',
                    tag: null,
                    columnDefinition: {
                        id: '55353f84-d5a1-4a60-985e-ec3c04212575',
                        name: 'regiment',
                        sources: ['REFERENCE_DATA'],
                        label: 'Regimes Terapeuticos',
                        indicator: 'RE',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'display the name of each regimen',
                        canChangeOrder: false,
                        columnType: 'TEXT',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'REFERENCE_DATA'
                }, {
                    id: '5ea8b4d6-a39c-43f4-a9cf-5d0a52923136',
                    name: 'patients',
                    label: 'Total patients',
                    indicator: 'RE',
                    displayOrder: 2,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of patients',
                    tag: null,
                    columnDefinition: {
                        id: '1a44bc23-b652-4a72-b74b-98210d44101c',
                        name: 'patients',
                        sources: ['USER_INPUT'],
                        label: 'Total Pacientes',
                        indicator: 'RE',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of patients',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '21a5304f-526d-4371-b5fa-561aef8dc91e',
                    name: 'community',
                    label: 'Community pharmacy',
                    indicator: 'RE',
                    displayOrder: 3,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of patients in community pharmacy',
                    tag: null,
                    columnDefinition: {
                        id: '04065445-3aaf-4928-b329-8454964b62f8',
                        name: 'community',
                        sources: ['USER_INPUT'],
                        label: 'Farmácia Comunitária',
                        indicator: 'RE',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of patients in community pharmacy',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 3,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }, {
                id: '26af5fe6-d93d-4618-9c7f-1b6be8c578a1',
                name: 'summary',
                label: 'Summary',
                displayOrder: 1,
                columns: [{
                    id: '88f87b13-2813-4609-90b7-993ec0583c42',
                    name: '1stLinhas',
                    label: '1st linhas',
                    indicator: 'SU',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'display on the second part of the regimen section as the first lines',
                    tag: null,
                    columnDefinition: {
                        id: '73a20c66-c0f5-45d3-8268-336198296e33',
                        name: '1stLinhas',
                        sources: ['USER_INPUT'],
                        label: '1st linhas',
                        indicator: 'SU',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'display on the second part of the regimen section as the first lines',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'f85ed1a5-3be8-4899-9ae2-89b90b326c8c',
                    name: 'total',
                    label: 'Total',
                    indicator: 'SU',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'Count the total number in the second part of the regimen section',
                    tag: null,
                    columnDefinition: {
                        id: '676665ea-ba70-4742-b4d3-c512e7a9f389',
                        name: 'total',
                        sources: ['CALCULATED', 'USER_INPUT'],
                        label: 'Total',
                        indicator: 'SU',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'Count the total number in the second part of the regimen section',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'CALCULATED'
                }],
                isDefault: true
            }],
            consultationNumber: [{
                id: '2c941dac-0f2c-4f9a-91f0-39b32f31f668',
                name: 'number',
                label: 'Consultation Number',
                displayOrder: 0,
                columns: [{
                    id: 'b8f2afee-a169-4d49-8872-ae8bd35a8757',
                    name: 'consultationNumber',
                    label: 'No.of External Consultations Performed',
                    indicator: 'CN',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the number of consultations performed in this period',
                    tag: null,
                    columnDefinition: {
                        id: '23c0edc1-9382-7161-99f2-241a3e8360c6',
                        name: 'consultationNumber',
                        sources: ['USER_INPUT'],
                        label: 'Nº de Consultas Externas Realizadas',
                        indicator: 'CN',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the number of consultations performed in this period',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '15bc3d23-f487-41c3-ab16-7233dba21c68',
                    name: 'total',
                    label: 'Total',
                    indicator: 'CN',
                    displayOrder: 1,
                    isDisplayed: false,
                    option: null,
                    definition: 'record the total number',
                    tag: null,
                    columnDefinition: {
                        id: '95327492-2874-3836-8fa0-dd2b5ced3e8c',
                        name: 'total',
                        sources: ['USER_INPUT', 'CALCULATED'],
                        label: 'Total',
                        indicator: 'CN',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: true,
                        definition: 'record the total number',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }],
            rapidTestConsumption: [{
                id: 'a7d6cb1d-a964-40e3-966a-773adf8e2962',
                name: 'outcome',
                label: 'Test Outcome',
                displayOrder: 1,
                columns: [{
                    id: '950cf884-d6fc-4028-a47d-bb84c1e13ff0',
                    name: 'consumo',
                    label: 'Consumo',
                    indicator: 'TO',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the consumo quantity for each test project',
                    tag: null,
                    columnDefinition: {
                        id: '743a0575-6d00-4ff0-89a6-1a76de1c1714',
                        name: 'consumo',
                        sources: ['USER_INPUT'],
                        label: 'Consumo',
                        indicator: 'TO',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the consumo quantity for each test project',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '8f82a4f6-b258-42f0-a4f2-f955ac8e97f9',
                    name: 'positive',
                    label: 'Positivo',
                    indicator: 'TO',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the positive test outcome quantity for each test project',
                    tag: null,
                    columnDefinition: {
                        id: 'becae41f-1436-4f67-87ac-dece0b97d417',
                        name: 'positive',
                        sources: ['USER_INPUT'],
                        label: 'Positive',
                        indicator: 'TO',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the positive test outcome quantity for each test project',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '15f09c25-1f2b-4553-953e-19ece1bcb256',
                    name: 'unjustified',
                    label: 'Injustificado',
                    indicator: 'TO',
                    displayOrder: 2,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the unjustified test outcome quantity for each test project',
                    tag: null,
                    columnDefinition: {
                        id: 'fe6e0f40-f47b-41e2-be57-8064876d75f6',
                        name: 'unjustified',
                        sources: ['USER_INPUT'],
                        label: 'Unjustified',
                        indicator: 'TO',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the unjustified test outcome quantity for each test project',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }, {
                id: '883a1ce7-3c33-423d-9998-3a2057364b05',
                name: 'service',
                label: 'Services',
                displayOrder: 2,
                columns: [{
                    id: 'fd138ff5-2cad-4af0-8448-dd1f8e4b97af',
                    name: 'HF',
                    label: 'Maternidade_SMI',
                    indicator: 'SV',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'maternity',
                    tag: null,
                    columnDefinition: {
                        id: 'c280a232-a39e-4ea9-850b-7bb9fcc2d848',
                        name: 'HF',
                        sources: ['USER_INPUT'],
                        label: 'HF',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the test outcome for my facility',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '4d1a87e6-50dc-46bf-b629-0b932e9ac57f',
                    name: 'newColumn0',
                    label: 'Enfermaria',
                    indicator: 'N',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'General Ward',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn0',
                        sources: ['USER_INPUT'],
                        label: 'Enfermaria',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'General Ward',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'ed23a217-60d8-4244-81d7-145b316edb9a',
                    name: 'newColumn3',
                    label: 'Banco de Socorro-BIS',
                    indicator: 'N',
                    displayOrder: 2,
                    isDisplayed: true,
                    option: null,
                    definition: 'Accident & Emergency',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn3',
                        sources: ['USER_INPUT'],
                        label: 'Banco de Socorro-BIS',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'Accident & Emergency',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '589d12bb-7556-4f3e-bfca-677d71a0aae2',
                    name: 'newColumn4',
                    label: 'Brigade movel',
                    indicator: 'N',
                    displayOrder: 3,
                    isDisplayed: true,
                    option: null,
                    definition: 'Mobile unit',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn4',
                        sources: ['USER_INPUT'],
                        label: 'Brigade movel',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'Mobile unit',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 3,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '81311c48-11ed-4bae-87e4-9791c626270e',
                    name: 'newColumn5',
                    label: 'Laboratorio',
                    indicator: 'N',
                    displayOrder: 4,
                    isDisplayed: true,
                    option: null,
                    definition: 'Laboratory',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn5',
                        sources: ['USER_INPUT'],
                        label: 'Laboratorio',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'Laboratory',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 4,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '3e506ab2-1ba1-4e95-8626-0ee2268eee74',
                    name: 'newColumn1',
                    label: 'UATS',
                    indicator: 'N',
                    displayOrder: 5,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the related test outcomes for UATS',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn1',
                        sources: ['USER_INPUT'],
                        label: 'UATS',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'record the related test outcomes for UATS',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 5,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'fe35c249-a045-43b8-b9e9-98333397ca29',
                    name: 'newColumn6',
                    label: 'PNCTL',
                    indicator: 'N',
                    displayOrder: 6,
                    isDisplayed: true,
                    option: null,
                    definition: 'PNCTL',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn6',
                        sources: ['USER_INPUT'],
                        label: 'PNCTL',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'PNCTL',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 6,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'd26e09bc-982e-4e83-86c7-ae22cf117371',
                    name: 'newColumn2',
                    label: 'PAV',
                    indicator: 'N',
                    displayOrder: 7,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the related test outcomes for PAV',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn2',
                        sources: ['USER_INPUT'],
                        label: 'PAV',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'record the related test outcomes for PAV',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 7,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'f89479dd-ae24-4fb4-bf95-b1ea4f5ecc4a',
                    name: 'newColumn7',
                    label: 'Estomatologia',
                    indicator: 'N',
                    displayOrder: 8,
                    isDisplayed: true,
                    option: null,
                    definition: 'Dental Ward',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn7',
                        sources: ['USER_INPUT'],
                        label: 'Estomatologia',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'Dental Ward',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 8,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'fd9d45d8-41a3-42a5-b583-5d24ef3b0633',
                    name: 'APES',
                    label: 'APEs',
                    indicator: 'SV',
                    displayOrder: 10,
                    isDisplayed: true,
                    option: null,
                    definition: 'APES',
                    tag: null,
                    columnDefinition: {
                        id: '379692a8-12f4-4c35-868a-9b6055c8fa8e',
                        name: 'APES',
                        sources: ['USER_INPUT'],
                        label: 'APES',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the related test outcomes for APES',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '3c71c60f-9a7d-41cf-84ca-06170b5e4505',
                    name: 'total',
                    label: 'Total',
                    indicator: 'SV',
                    displayOrder: 9,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of each column',
                    tag: null,
                    columnDefinition: {
                        id: '09e5d451-0ffe-43df-ae00-2f15f2a3681b',
                        name: 'total',
                        sources: ['USER_INPUT', 'CALCULATED'],
                        label: 'Total',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the total number of each column',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'CALCULATED'
                }],
                isDefault: true
            }, {
                id: '344b75e8-4360-4fcc-a78d-f7c31f577881',
                name: 'project',
                label: 'Test Project',
                displayOrder: 0,
                columns: [{
                    id: 'a118fb8d-5b8a-43bf-9f87-e8a60ff17300',
                    name: 'hivDetermine',
                    label: 'HIV Determine',
                    indicator: 'TP',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the test data for HIV Determine',
                    tag: null,
                    columnDefinition: {
                        id: '28cbdef0-318b-4b34-a4c3-9d1b5bb74d15',
                        name: 'hivDetermine',
                        sources: [],
                        label: 'HIV Determine',
                        indicator: 'TP',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the test data for HIV Determine',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: null
                }, {
                    id: '0916b587-0c76-4b54-a8a9-e5f7e5b06c61',
                    name: 'newColumn0',
                    label: 'HIV Unigoid',
                    indicator: 'N',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the test data for HIV Unigoid',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn0',
                        sources: ['USER_INPUT'],
                        label: 'HIV Unigoid',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'record the test data for HIV Unigoid',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '73ff95c6-fa58-4d7a-acb6-43da20e6d622',
                    name: 'newColumn1',
                    label: 'Sifilis',
                    indicator: 'N',
                    displayOrder: 2,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the test data for HIV Syphilis',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn1',
                        sources: ['USER_INPUT'],
                        label: 'Sifilis',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'record the test data for HIV Syphilis',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: 'da256c4f-984f-4e2b-9379-cd271ba7c8c7',
                    name: 'newColumn2',
                    label: 'Malaria',
                    indicator: 'N',
                    displayOrder: 3,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the test data for HIV Malarias',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn2',
                        sources: ['USER_INPUT'],
                        label: 'Malaria',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'record the test data for HIV Malarias',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 3,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }],
            usageInformation: [{
                id: 'bde550d3-3983-4371-b154-7bd8d4062ecd',
                name: 'information',
                label: 'Product Usage Information',
                displayOrder: 0,
                columns: [{
                    id: '95acf570-6293-4658-88d7-8e5a86707107',
                    name: 'treatmentsAttended',
                    label: 'N Treatments Attended in this Month',
                    indicator: 'PU',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the quantity of patients for each treatment by products',
                    tag: null,
                    columnDefinition: {
                        id: '23c0ecc1-9182-7161-99f2-241a3f8360d6',
                        name: 'treatmentsAttended',
                        sources: ['USER_INPUT'],
                        label: 'N Tratamentos atendidos neste mês',
                        indicator: 'PU',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the quantity of patients for each treatment by products',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '2d774425-8a48-439a-a945-368da5e03bcf',
                    name: 'existentStock',
                    label: 'Existent Stock at the End of the Period',
                    indicator: 'PU',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the SOH of the product',
                    tag: null,
                    columnDefinition: {
                        id: '86ca8cea-9281-9281-8dc8-ec5f6ff60ec4',
                        name: 'existentStock',
                        sources: ['USER_INPUT'],
                        label: 'Stock Existente no Final do Período',
                        indicator: 'PU',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the SOH of the product',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }, {
                id: 'd9684431-7457-463c-b748-f379e5ef28b8',
                name: 'service',
                label: 'Services',
                displayOrder: 1,
                columns: [{
                    id: '74cecd0e-4718-41fb-9681-c5a18ce07dac',
                    name: 'HF',
                    label: 'HF',
                    indicator: 'SV',
                    displayOrder: 0,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the product usage information for my facility',
                    tag: null,
                    columnDefinition: {
                        id: 'cbee99e4-1827-0291-ab4f-783d61ac80a6',
                        name: 'HF',
                        sources: ['USER_INPUT'],
                        label: 'HF',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: false,
                        definition: 'record the product usage information for my facility',
                        canChangeOrder: false,
                        columnType: 'NUMERIC',
                        displayOrder: 0,
                        options: []
                    },
                    source: 'USER_INPUT'
                }, {
                    id: '62c14e5d-3252-4ca5-a9fc-1a753a3d142d',
                    name: 'total',
                    label: 'Total',
                    indicator: 'SV',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'record the total number of each column',
                    tag: null,
                    columnDefinition: {
                        id: '95227492-2874-2836-8fa0-dd5b5cef3e8e',
                        name: 'total',
                        sources: ['USER_INPUT', 'CALCULATED'],
                        label: 'Total',
                        indicator: 'SV',
                        mandatory: false,
                        isDisplayRequired: true,
                        canBeChangedByUser: false,
                        supportsTag: true,
                        definition: 'record the total number of each column',
                        canChangeOrder: true,
                        columnType: 'NUMERIC',
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT'
                }],
                isDefault: true
            }]
        };
        // SIGLUS-REFACTOR: ends here
        this.vm = this.$controller('siglusAnalyticsReportCustomizeRapidController', {
            facility: this.facility,
            requisition: this.requisition,
            openlmisDateFilter: this.openlmisDateFilter,
            siglusTemplateConfigureService: this.siglusTemplateConfigureService,
            siglusAnalyticsDateService: this.siglusAnalyticsDateService
        });
        this.vm.$onInit();
    });

    describe('$onInit', function() {

        it('should expose facility', function() {
            expect(angular.toJson(this.vm.facility)).toEqual(angular.toJson(this.facility));
        });

        it('should expose requisition', function() {
            expect(angular.toJson(this.vm.requisition)).toEqual(angular.toJson(this.requisition));
        });
    });

    describe('get fully month function', function() {
        _.forEach(testData, function(item) {
            it('should expose month ' + item.title, function() {
                expect(this.vm.getMonth(item.date)).toEqual(item.expect);
            });
        });
    });

    describe('get creationDate function', function() {
        _.forEach(testData, function(item) {
            it('should expose month year ' + item.title, function() {
                expect(this.vm.getCreationDate(item.date))
                    .toEqual(item.expect.substring(0, 3) + ' ' + new Date(item.date).getFullYear());
            });
        });
    });

    describe('get getPdfName function', function() {
        _.forEach(testData, function(item) {
            it('should expose pdf name ' + item.title, function() {
                expect(this.vm.getPdfName(item.date, this.vm.facility.name, item.id))
                    .toEqual(item.pdfName);
            });
        });
    });

});
