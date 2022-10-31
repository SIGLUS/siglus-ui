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

describe('siglusAnalyticsReportCustomizeTBController', function() {
    beforeEach(function() {
        var context = this;
        module('siglus-analytics-report-customize-tb');
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

        inject(function($injector) {
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.openlmisDateFilter = $injector.get('openlmisDateFilter');
            this.siglusTemplateConfigureService = $injector.get('siglusTemplateConfigureService');
            this.siglusDownloadLoadingModalService = $injector.get('siglusDownloadLoadingModalService');
            this.$controller = $injector.get('$controller');
        });

        this.facility = new this.FacilityDataBuilder().build();
        // for constroller's functions
        this.requisition = {
            id: '665778fb-b690-44e1-a219-27c7efcca2b0',
            createdDate: '2022-07-29T07:37:47.937Z',
            modifiedDate: '2022-07-31T05:16:05.579Z',
            draftStatusMessage: '',
            status: 'RELEASED',
            emergency: false,
            reportOnly: false,
            supplyingFacility: '060a6888-cfbc-11e9-9398-0242ac130008',
            supervisoryNode: '6dab2830-f831-11ea-a7fc-0242ac1a0007',
            template: {
                id: '5d4d9924-c0a1-4c5e-90df-3ed2bbec5921',
                createdDate: '2021-07-07T05:45:01.15Z',
                numberOfPeriodsToAverage: 3,
                populateStockOnHandFromStockCards: true,
                name: 'HF TARV Template',
                columnsMap: {
                    numberOfNewPatientsAdded: {
                        name: 'numberOfNewPatientsAdded',
                        label: 'Number of new patients added',
                        indicator: 'F',
                        displayOrder: 23,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: {
                            id: '4957ebb4-297c-459e-a291-812e72286eff',
                            optionName: 'dispensingUnitsForNewPatients',
                            optionLabel: 'requisitionConstants.dispensingUnitsForNewPatients'
                        },
                        definition: 'New patients data.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    adjustedConsumption: {
                        name: 'adjustedConsumption',
                        label: 'Adjusted consumption',
                        indicator: 'N',
                        displayOrder: 25,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: '1',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['totalConsumedQuantity', 'additionalQuantityRequired', 'totalStockoutDays'],
                        $canChangeOrder: true
                    },
                    theoreticalQuantityToRequest: {
                        name: 'theoreticalQuantityToRequest',
                        label: 'Theoretical Quantity to Request',
                        indicator: 'TQ',
                        displayOrder: 13,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Theoretical Quantity to Request=2 * issues - inventory',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['totalConsumedQuantity', 'stockOnHand'],
                        $canChangeOrder: true
                    },
                    totalLossesAndAdjustments: {
                        name: 'totalLossesAndAdjustments',
                        label: 'Perdas e ajustes',
                        indicator: 'D',
                        displayOrder: 8,
                        isDisplayed: true,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'All kind of losses/adjustments made at the facility.',
                        tag: 'adjustment',
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    totalStockoutDays: {
                        name: 'totalStockoutDays',
                        label: 'Total stockout days',
                        indicator: 'X',
                        displayOrder: 11,
                        isDisplayed: false,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'Total number of days facility was out of stock.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    packsToShip: {
                        name: 'packsToShip',
                        label: 'Packs to ship',
                        indicator: 'V',
                        displayOrder: 21,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: {
                            id: 'dcf41f06-3000-4af6-acf5-5de4fffc966f',
                            optionName: 'showPackToShipInAllPages',
                            optionLabel: 'requisitionConstants.showPackToShipInAllPages'
                        },
                        definition: 'Total packs to be shipped based on pack size and applying rounding rules.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: false,
                        $dependencies: ['requestedQuantity', 'approvedQuantity', 'calculatedOrderQuantity'],
                        $canChangeOrder: true
                    },
                    skipped: {
                        name: 'skipped',
                        label: 'Ignorar',
                        indicator: 'S',
                        displayOrder: 0,
                        isDisplayed: true,
                        source: 'USER_INPUT',
                        option: {
                            id: '17d6e860-a746-4500-a0fa-afc84d799dca',
                            optionName: 'disableSkippedLineItems',
                            optionLabel: 'requisitionConstants.disableSkippedLineItems'
                        },
                        definition: '',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: false,
                            columnType: 'BOOLEAN'
                        },
                        $type: 'BOOLEAN',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: false
                    },
                    'orderable.productCode': {
                        name: 'orderable.productCode',
                        label: 'FNM',
                        indicator: 'O',
                        displayOrder: 1,
                        isDisplayed: true,
                        source: 'REFERENCE_DATA',
                        option: null,
                        definition: 'Unique identifier for each commodity/product.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: false,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: false,
                        $canChangeOrder: false
                    },
                    idealStockAmount: {
                        name: 'idealStockAmount',
                        label: 'Ideal Stock Amount',
                        indicator: 'G',
                        displayOrder: 29,
                        isDisplayed: false,
                        source: 'REFERENCE_DATA',
                        option: null,
                        definition: '2',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    total: {
                        name: 'total',
                        label: 'Total',
                        indicator: 'Y',
                        displayOrder: 20,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Total of beginning balance and quantity received.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['beginningBalance', 'totalReceivedQuantity'],
                        $canChangeOrder: true
                    },
                    totalConsumedQuantity: {
                        name: 'totalConsumedQuantity',
                        label: 'Saida',
                        indicator: 'C',
                        displayOrder: 6,
                        isDisplayed: true,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: '3',
                        tag: 'consumed',
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: [
                            'beginningBalance',
                            'totalReceivedQuantity',
                            'stockOnHand',
                            'totalLossesAndAdjustments'
                        ],
                        $canChangeOrder: true
                    },
                    stockOnHand: {
                        name: 'stockOnHand',
                        label: 'Inventário',
                        indicator: 'E',
                        displayOrder: 9,
                        isDisplayed: true,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'Current physical count of stock on hand. This is quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: [
                            'beginningBalance',
                            'totalReceivedQuantity',
                            'totalConsumedQuantity',
                            'totalLossesAndAdjustments'
                        ],
                        $canChangeOrder: true
                    },
                    theoreticalStockAtEndofPeriod: {
                        name: 'theoreticalStockAtEndofPeriod',
                        label: 'Stock Teórico no Final do Periodo',
                        indicator: 'TS',
                        displayOrder: 7,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: '3',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['beginningBalance', 'totalReceivedQuantity', 'totalConsumedQuantity'],
                        $canChangeOrder: true
                    },
                    requestedQuantity: {
                        name: 'requestedQuantity',
                        label: 'Requested quantity',
                        indicator: 'J',
                        displayOrder: 14,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: null,
                        definition: '3',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: true,
                        $fullSupplyOnly: false,
                        $canChangeOrder: true
                    },
                    suggestedQuantity: {
                        name: 'suggestedQuantity',
                        label: 'Suggested Quantity',
                        indicator: 'SQ',
                        displayOrder: 16,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: {
                            id: '822fc359-6d78-4ba0-99fd-d7c776041c5e',
                            optionName: 'cmm',
                            optionLabel: 'requisitionConstants.cmm'
                        },
                        definition: 'Suggested quantity calculated for the requisition of DPM.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    expirationDate: {
                        name: 'expirationDate',
                        label: 'Validade',
                        indicator: 'EX',
                        displayOrder: 27,
                        isDisplayed: true,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'The expiry date of the lot code which will be expired first since today.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    beginningBalance: {
                        name: 'beginningBalance',
                        label: 'Stock Inicial',
                        indicator: 'A',
                        displayOrder: 4,
                        isDisplayed: true,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'Based on the Stock On Hand from the' +
                        'previous period. This is quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    'orderable.dispensable.displayUnit': {
                        name: 'orderable.dispensable.displayUnit',
                        label: 'Unidade',
                        indicator: 'U',
                        displayOrder: 3,
                        isDisplayed: true,
                        source: 'REFERENCE_DATA',
                        option: null,
                        definition: 'Dispensing unit for this product.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: false,
                        $canChangeOrder: true
                    },
                    approvedQuantity: {
                        name: 'approvedQuantity',
                        label: 'Quantidade Aprovada',
                        indicator: 'K',
                        displayOrder: 17,
                        isDisplayed: true,
                        source: 'USER_INPUT',
                        option: null,
                        definition: 'Final approved quantity. This is quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: true,
                        $fullSupplyOnly: false,
                        $canChangeOrder: true
                    },
                    totalReceivedQuantity: {
                        name: 'totalReceivedQuantity',
                        label: 'Entradas',
                        indicator: 'B',
                        displayOrder: 5,
                        isDisplayed: true,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'Total quantity received in the reporting'
                        + 'period. This is quantified in dispensing units.',
                        tag: 'received',
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    'orderable.fullProductName': {
                        name: 'orderable.fullProductName',
                        label: 'MEDICAMENTO',
                        indicator: 'R',
                        displayOrder: 2,
                        isDisplayed: true,
                        source: 'REFERENCE_DATA',
                        option: null,
                        definition: 'Primary name of the product.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: false,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: true,
                        $required: false,
                        $fullSupplyOnly: false,
                        $canChangeOrder: false
                    },
                    pricePerPack: {
                        name: 'pricePerPack',
                        label: 'Price per pack',
                        indicator: 'T',
                        displayOrder: 22,
                        isDisplayed: false,
                        source: 'REFERENCE_DATA',
                        option: null,
                        definition: 'Price per pack. Will be blank if price is not defined.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'CURRENCY'
                        },
                        $type: 'CURRENCY',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    calculatedOrderQuantityIsa: {
                        name: 'calculatedOrderQuantityIsa',
                        label: 'Calc Order Qty ISA',
                        indicator: 'S',
                        displayOrder: 30,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Calculated Order Quantity ISA is based on an ISA'
                        + 'configured by commodity type, and several trade items may fill for one commodity type.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    requestedQuantityExplanation: {
                        name: 'requestedQuantityExplanation',
                        label: 'Requested quantity explanation',
                        indicator: 'W',
                        displayOrder: 18,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: null,
                        definition: 'Explanation of request for a quantity other than calculated order quantity.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: false,
                        $dependencies: ['requestedQuantity'],
                        $canChangeOrder: true
                    },
                    difference: {
                        name: 'difference',
                        label: 'Diferença',
                        indicator: 'DI',
                        displayOrder: 10,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Difference=Inventory -(Stock at Beginning of Period + Sum of Entries - Issues).',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: [
                            'beginningBalance',
                            'totalReceivedQuantity',
                            'totalConsumedQuantity',
                            'stockOnHand'
                        ],
                        $canChangeOrder: true
                    },
                    averageConsumption: {
                        name: 'averageConsumption',
                        label: 'Average consumption',
                        indicator: 'P',
                        displayOrder: 12,
                        isDisplayed: false,
                        source: 'STOCK_CARDS',
                        option: null,
                        definition: 'Average consumption over a specified number '
                        + 'of periods/months. Quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['totalConsumedQuantity', 'totalStockoutDays'],
                        $canChangeOrder: true
                    },
                    calculatedOrderQuantity: {
                        name: 'calculatedOrderQuantity',
                        label: 'Quantidade do pedido',
                        indicator: 'I',
                        displayOrder: 28,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Actual quantity needed after deducting stock in hand.'
                        + 'This is quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['maximumStockQuantity', 'stockOnHand'],
                        $canChangeOrder: true
                    },
                    totalCost: {
                        name: 'totalCost',
                        label: 'Total cost',
                        indicator: 'Q',
                        displayOrder: 24,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: null,
                        definition: 'Total cost of the product based on quantity requested.'
                        + 'Will be blank if price is not defined.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'CURRENCY'
                        },
                        $type: 'CURRENCY',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['packsToShip', 'pricePerPack'],
                        $canChangeOrder: true
                    },
                    remarks: {
                        name: 'remarks',
                        label: 'Remarks',
                        indicator: 'L',
                        displayOrder: 19,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: null,
                        definition: 'Any additional remarks.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'TEXT'
                        },
                        $type: 'TEXT',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: false,
                        $canChangeOrder: true
                    },
                    maximumStockQuantity: {
                        name: 'maximumStockQuantity',
                        label: 'Maximum stock quantity',
                        indicator: 'H',
                        displayOrder: 26,
                        isDisplayed: false,
                        source: 'CALCULATED',
                        option: {
                            id: 'ff2b350c-37f2-4801-b21e-27ca12c12b3c',
                            optionName: 'default',
                            optionLabel: 'requisitionConstants.default'
                        },
                        definition: 'Maximum stock calculated based on consumption and '
                        + 'max stock amounts. Quantified in dispensing units.',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: false,
                        $fullSupplyOnly: true,
                        $dependencies: ['averageConsumption'],
                        $canChangeOrder: true
                    },
                    authorizedQuantity: {
                        name: 'authorizedQuantity',
                        label: 'Quantity Authorized',
                        indicator: 'QA',
                        displayOrder: 15,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: null,
                        definition: 'Final authorized quantity. This is quantified in dispensing units',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: true,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    },
                    additionalQuantityRequired: {
                        name: 'additionalQuantityRequired',
                        label: 'Additional quantity required',
                        indicator: 'Z',
                        displayOrder: 31,
                        isDisplayed: false,
                        source: 'USER_INPUT',
                        option: null,
                        definition: 'Additional quantity required for new patients',
                        tag: null,
                        columnDefinition: {
                            canChangeOrder: true,
                            columnType: 'NUMERIC'
                        },
                        $type: 'NUMERIC',
                        $display: false,
                        $required: true,
                        $fullSupplyOnly: true,
                        $canChangeOrder: true
                    }
                },
                extension: {
                    id: '42f659bb-131f-445b-ac2c-e91baadad3ec',
                    requisitionTemplateId: '5d4d9924-c0a1-4c5e-90df-3ed2bbec5921',
                    enableConsultationNumber: false,
                    enableKitUsage: false,
                    enableProduct: true,
                    enableRegimen: true,
                    enableRapidTestConsumption: false,
                    enableUsageInformation: false,
                    enableQuicklyFill: true,
                    enableAgeGroup: false,
                    enablePatient: true
                },
                emergency: false
            },
            statusChanges: {
                RELEASED: {
                    authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                    changeDate: '2022-08-01T05:16:06.593Z'
                },
                IN_APPROVAL: {
                    authorId: '3074fd01-2d12-4eb2-b9e0-73962338d7ab',
                    changeDate: '2022-07-30T08:17:11.199Z'
                },
                SUBMITTED: {
                    authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                    changeDate: '2022-07-30T07:40:01.365Z'
                },
                INITIATED: {
                    authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                    changeDate: '2022-07-30T07:37:47.937Z'
                },
                APPROVED: {
                    authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                    changeDate: '2022-07-30T08:21:18.656Z'
                },
                AUTHORIZED: {
                    authorId: 'de8007a2-3524-49bb-83bd-54d89c44dd20',
                    changeDate: '2022-07-30T08:15:24.572Z'
                }
            },
            statusHistory: [{
                status: 'SUBMITTED',
                statusMessageDto: {
                    id: '96b2cbc4-5f68-41d5-849f-7a7f74bf8d87',
                    requisitionId: '665778fb-b690-44e1-a219-27c7efcca2b0',
                    statusChangeId: '1d38f104-a9a3-4865-84a5-87d17737a193',
                    authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                    authorFirstName: 'cs',
                    authorLastName: 'mocumbi',
                    status: 'SUBMITTED',
                    body: 'yyds',
                    createdDate: '2022-07-30T07:40:01.365Z'
                },
                authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                createdDate: '2022-07-30T07:40:01.365Z'
            }, {
                status: 'IN_APPROVAL',
                statusMessageDto: null,
                authorId: '3074fd01-2d12-4eb2-b9e0-73962338d7ab',
                createdDate: '2022-07-30T08:17:11.199Z'
            }, {
                status: 'AUTHORIZED',
                statusMessageDto: null,
                authorId: 'de8007a2-3524-49bb-83bd-54d89c44dd20',
                createdDate: '2022-07-30T08:15:24.572Z'
            }, {
                status: 'INITIATED',
                statusMessageDto: null,
                authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                createdDate: '2022-07-30T07:37:47.937Z'
            }, {
                status: 'APPROVED',
                statusMessageDto: null,
                authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                createdDate: '2022-07-30T08:21:18.656Z'
            }, {
                status: 'RELEASED',
                statusMessageDto: null,
                authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                createdDate: '2022-08-01T05:16:06.593Z'
            }],
            stockAdjustmentReasons: [{
                id: '448153bc-df64-11e9-9e7e-4c32759554d9',
                name: 'Issue',
                reasonType: 'DEBIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: 'f8bb41e2-ab43-4781-ae7a-7bf3b5116b82',
                name: 'Stock Inicial Insuficiente',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: 'e3fc3cf3-da18-44b0-a220-77c985202e06',
                name: 'Transfer In',
                reasonType: 'CREDIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: 'b5c27da7-bdda-4790-925a-9484c5dfb594',
                name: 'Consumido',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '84eb13c3-3e54-4687-8a5f-a9f20dcd0dac',
                name: 'Stock Inicial Excessivo',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '448152fe-df64-11e9-9e7e-4c32759554d9',
                name: 'Devolução para o DDM',
                description: 'Return to DDM ',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44815222-df64-11e9-9e7e-4c32759554d9',
                name: 'Saída para quarentena, no caso de problemas relativos a qualidade',
                description: 'Product defective, moved to quarantine',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '4481515a-df64-11e9-9e7e-4c32759554d9',
                name: 'Devolução de expirados quarentena (ou depósito fornecedor)',
                description: 'Drugs in quarantine have expired, returned to Supplier',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44815088-df64-11e9-9e7e-4c32759554d9',
                name: 'Danificado no depósito',
                description: 'Damaged in the warehouse',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814fde-df64-11e9-9e7e-4c32759554d9',
                name: 'test1',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814f2a-df64-11e9-9e7e-4c32759554d9',
                name: 'Empréstimos (para todos níveis) que dão saída do depósito',
                description: 'Loans made from a health facility deposit',
                reasonType: 'DEBIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814e30-df64-11e9-9e7e-4c32759554d9',
                name: 'Retorno da quarentena, no caso de se confirmar a qualidade do produto',
                description: 'Returns from Quarantine, in the case of quarantined product being fit for use',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814cc8-df64-11e9-9e7e-4c32759554d9',
                name: 'Doações ao Depósito',
                description: 'Donations to Deposit',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814bc4-df64-11e9-9e7e-4c32759554d9',
                name: 'Receive',
                reasonType: 'CREDIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: '44814a0c-df64-11e9-9e7e-4c32759554d9',
                name: 'Devolução de expirados (US e Depósitos Beneficiários)',
                description: 'Returns of expired drugs (HF and dependent wards)',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '448148b8-df64-11e9-9e7e-4c32759554d9',
                name: 'Devolução dos clientes (US e Depósitos Beneficiários)',
                description: 'Returns from Customers(HF and dependent wards)',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '448147f0-df64-11e9-9e7e-4c32759554d9',
                name: 'Correcção de inventário, no caso do ' +
                'stock em excesso (stock é superior ao existente na ficha de stock)',
                description: 'Inventory correction in case of under ' +
                'stock on Stock card (Stock on hand is more than stock in stock card)',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '44814746-df64-11e9-9e7e-4c32759554d9',
                name: 'Empréstimos (de todos os níveis) que dão entrada no depósito',
                description: 'Loans received at the health facility deposit',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: '313f2f5f-0c22-4626-8c49-3554ef763de3',
                name: 'Recebido',
                reasonType: 'CREDIT',
                reasonCategory: 'ADJUSTMENT',
                isFreeTextAllowed: true,
                hidden: false
            }, {
                id: 'a389abfc-3084-11ec-bea8-acde48001122',
                name: 'Danificado/quebrado/derramado',
                description: 'Damaged/broken/spilled',
                reasonType: 'DEBIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: 'a389af30-3084-11ec-bea8-acde48001122',
                name: 'Recebido a menos',
                description: 'Received less quantities than expected',
                reasonType: 'DEBIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: 'a389b034-3084-11ec-bea8-acde48001122',
                name: 'Fora do prazo de validade',
                description: 'Expired products',
                reasonType: 'DEBIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }, {
                id: 'a389b08e-3084-11ec-bea8-acde48001122',
                name: 'Impróprio para o consumo',
                description: 'Inappropriate for consumption',
                reasonType: 'DEBIT',
                reasonCategory: 'TRANSFER',
                isFreeTextAllowed: false,
                hidden: false
            }],
            extraData: {
                signaure: {
                    submit: 'yyds',
                    approve: ['yyds', 'yyds'],
                    authorize: 'yyds'
                },
                actualEndDate: '2022-06-20',
                actualStartDate: '2022-05-21',
                isSaved: false
            },
            facility: {
                id: 'b82b088e-cfcf-11e9-9535-0242ac130005',
                href: 'http://qa.siglus.us.internal/api/facilities/b82b088e-cfcf-11e9-9535-0242ac130005'
            },
            program: {
                id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                href: 'http://qa.siglus.us.internal/api/programs/10845cb9-d365-4aaa-badd-b4fa39c6a26a'
            },
            processingPeriod: {
                id: 'bc7390c1-6a7c-4fe5-aac6-d5fcb391bc30',
                name: 'Junho 2022',
                startDate: '2022-05-21',
                endDate: '2022-06-20',
                processingSchedule: {
                    id: '727bef28-de1c-11e9-8785-0242ac130007',
                    code: 'M1',
                    description: 'Monthly',
                    modifiedDate: null,
                    name: 'Monthly'
                },
                description: '21Mai - 20Jun',
                durationInMonths: 1,
                extraData: {},
                submitStartDate: '2022-06-18',
                submitEndDate: '2022-06-25',
                currentPeriodRegularRequisitionAuthorized: false
            },
            requisitionLineItems: [{
                id: 'd109dffd-b8c4-4add-a549-668a1dec6ffa',
                beginningBalance: 240,
                totalReceivedQuantity: 22,
                totalLossesAndAdjustments: 0,
                stockOnHand: 210,
                totalConsumedQuantity: 30,
                approvedQuantity: 35,
                packsToShip: 35,
                totalCost: 0,
                skipped: '',
                adjustedConsumption: 30,
                previousAdjustedConsumptions: [],
                averageConsumption: 30,
                expirationDate: '13/05/2024',
                stockAdjustments: [],
                orderable: {
                    productCode: '08S31',
                    dispensable: {
                        dispensingUnit: 'each',
                        displayUnit: 'each',
                        '.displayUnit': ''
                    },
                    fullProductName: 'Tenofovir/Emtricitabina; 300mg+200mg 30 Comp; Comp',
                    description: 'Tenof+Emtricitabina;Emb(300mg+200mg 30 Comp)',
                    netContent: 1,
                    packRoundingThreshold: 1,
                    roundToZero: false,
                    programs: [{
                        programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                        orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                        orderableCategoryDisplayName: 'Default',
                        orderableCategoryDisplayOrder: 0,
                        active: true,
                        fullSupply: true,
                        displayOrder: 0
                    }],
                    children: [],
                    identifiers: {
                        tradeItem: '4787a3f5-8eeb-4869-bc45-8950af84ec00'
                    },
                    extraData: {
                        isTracer: false
                    },
                    meta: {
                        versionNumber: 2,
                        lastUpdated: '2022-07-04T06:45:12.825Z'
                    },
                    id: '2698abe3-f795-40f9-8a92-7338f1b1782d',
                    lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                    latest: false,
                    _id: '2698abe3-f795-40f9-8a92-7338f1b1782d/2',
                    _rev: '2-a0893cda53a446d6b1577b665ae96992',
                    '.productCode': '',
                    '.fullProductName': ''
                },
                approvedProduct: {
                    orderable: {
                        productCode: '08S31',
                        dispensable: {
                            dispensingUnit: 'each',
                            displayUnit: 'each'
                        },
                        fullProductName: 'Tenofovir/Emtricitabina; 300mg+200mg 30 Comp; Comp',
                        description: 'Tenof+Emtricitabina;Emb(300mg+200mg 30 Comp)',
                        netContent: 1,
                        packRoundingThreshold: 1,
                        roundToZero: false,
                        programs: [{
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                            orderableCategoryDisplayName: 'Default',
                            orderableCategoryDisplayOrder: 0,
                            active: true,
                            fullSupply: true,
                            displayOrder: 0
                        }],
                        children: [],
                        identifiers: {
                            tradeItem: '4787a3f5-8eeb-4869-bc45-8950af84ec00'
                        },
                        extraData: {
                            isTracer: false
                        },
                        meta: {
                            versionNumber: 2,
                            lastUpdated: '2022-07-04T06:45:12.825Z'
                        },
                        id: '2698abe3-f795-40f9-8a92-7338f1b1782d'
                    },
                    program: {
                        code: 'T',
                        name: 'TARV',
                        active: true,
                        periodsSkippable: false,
                        skipAuthorization: false,
                        showNonFullSupplyTab: false,
                        enableDatePhysicalStockCountCompleted: false,
                        id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a'
                    },
                    facilityType: {
                        code: 'CS',
                        name: 'CS - Centro de Saúde',
                        displayOrder: 17,
                        active: true,
                        id: '26834258-faa0-420b-a83b-a9af60c605c8'
                    },
                    maxPeriodsOfStock: 3,
                    active: true,
                    meta: {
                        versionNumber: 1,
                        lastUpdated: '2020-11-25T09:27:00.36Z'
                    },
                    id: '7fd83b6f-df9d-42cf-8034-7cd34aada28d',
                    lastModified: null,
                    latest: true,
                    _id: '7fd83b6f-df9d-42cf-8034-7cd34aada28d/1',
                    _rev: '1-07ce13c134194026a156dfae54583c2c'
                },
                $errors: {},
                $program: {
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }
            }, {
                id: 'c02cd7a1-0624-4d07-90e5-501b1555402a',
                beginningBalance: 210,
                totalReceivedQuantity: 20,
                totalLossesAndAdjustments: 0,
                stockOnHand: 160,
                totalConsumedQuantity: 50,
                approvedQuantity: 50,
                packsToShip: 50,
                totalCost: 0,
                skipped: '',
                adjustedConsumption: 50,
                previousAdjustedConsumptions: [],
                averageConsumption: 50,
                expirationDate: '13/05/2024',
                stockAdjustments: [],
                orderable: {
                    productCode: '08S30ZY',
                    dispensable: {
                        dispensingUnit: 'each',
                        displayUnit: 'each',
                        '.displayUnit': ''
                    },
                    fullProductName: 'Dolutegravir; 50 mg 30 comp; Comp',
                    description: '',
                    netContent: 1,
                    packRoundingThreshold: 1,
                    roundToZero: false,
                    programs: [{
                        programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                        orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                        orderableCategoryDisplayName: 'Default',
                        orderableCategoryDisplayOrder: 0,
                        active: true,
                        fullSupply: true,
                        displayOrder: 0
                    }],
                    children: [],
                    identifiers: {
                        tradeItem: '4447e6cd-a36f-47d5-909e-4f04469663d2'
                    },
                    extraData: {
                        isTracer: false
                    },
                    meta: {
                        versionNumber: 2,
                        lastUpdated: '2022-07-04T06:43:39.511Z'
                    },
                    id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                    lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                    latest: true,
                    _id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215/2',
                    _rev: '1-d079f6f90a644e0082796e30eb677535',
                    '.productCode': '',
                    '.fullProductName': ''
                },
                approvedProduct: {
                    orderable: {
                        productCode: '08S30ZY',
                        dispensable: {
                            dispensingUnit: 'each',
                            displayUnit: 'each'
                        },
                        fullProductName: 'Dolutegravir; 50 mg 30 comp; Comp',
                        description: '',
                        netContent: 1,
                        packRoundingThreshold: 1,
                        roundToZero: false,
                        programs: [{
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                            orderableCategoryDisplayName: 'Default',
                            orderableCategoryDisplayOrder: 0,
                            active: true,
                            fullSupply: true,
                            displayOrder: 0
                        }],
                        children: [],
                        identifiers: {
                            tradeItem: '4447e6cd-a36f-47d5-909e-4f04469663d2'
                        },
                        extraData: {
                            isTracer: false
                        },
                        meta: {
                            versionNumber: 2,
                            lastUpdated: '2022-07-04T06:43:39.511Z'
                        },
                        id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215'
                    },
                    program: {
                        code: 'T',
                        name: 'TARV',
                        active: true,
                        periodsSkippable: false,
                        skipAuthorization: false,
                        showNonFullSupplyTab: false,
                        enableDatePhysicalStockCountCompleted: false,
                        id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a'
                    },
                    facilityType: {
                        code: 'CS',
                        name: 'CS - Centro de Saúde',
                        displayOrder: 17,
                        active: true,
                        id: '26834258-faa0-420b-a83b-a9af60c605c8'
                    },
                    maxPeriodsOfStock: 3,
                    active: true,
                    meta: {
                        versionNumber: 1,
                        lastUpdated: '2020-11-25T09:21:10.24Z'
                    },
                    id: '28f0f607-dedd-449b-ae3b-c6f30410fa11',
                    lastModified: null,
                    latest: true,
                    _id: '28f0f607-dedd-449b-ae3b-c6f30410fa11/1',
                    _rev: '1-a2a034f48851404cb4991e761174d396'
                },
                $errors: {},
                $program: {
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }
            }],
            availableProducts: [{
                id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                href: 'http://qa.siglus.us.internal/api/orderables/9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                versionNumber: 2
            }, {
                id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                href: 'http://qa.siglus.us.internal/api/orderables/6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                versionNumber: 2
            }, {
                id: '70110486-794d-4a45-b58d-efe60bafe101',
                href: 'http://qa.siglus.us.internal/api/orderables/70110486-794d-4a45-b58d-efe60bafe101',
                versionNumber: 2
            }, {
                id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                href: 'http://qa.siglus.us.internal/api/orderables/8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                versionNumber: 2
            }, {
                id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                href: 'http://qa.siglus.us.internal/api/orderables/e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                versionNumber: 4
            }, {
                id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                href: 'http://qa.siglus.us.internal/api/orderables/6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                versionNumber: 2
            }, {
                id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                href: 'http://qa.siglus.us.internal/api/orderables/d7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                versionNumber: 2
            }, {
                id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033',
                href: 'http://qa.siglus.us.internal/api/orderables/c0da3070-1140-4c0f-a34f-42f6d0da4033',
                versionNumber: 2
            }, {
                id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                href: 'http://qa.siglus.us.internal/api/orderables/0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                versionNumber: 2
            }, {
                id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                href: 'http://qa.siglus.us.internal/api/orderables/6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                versionNumber: 2
            }, {
                id: '630066dd-68bc-46ab-82b9-66ea01d3cb66',
                href: 'http://qa.siglus.us.internal/api/orderables/630066dd-68bc-46ab-82b9-66ea01d3cb66',
                versionNumber: 2
            }, {
                id: '1940111b-d224-44ac-9010-2004b39d9a39',
                href: 'http://qa.siglus.us.internal/api/orderables/1940111b-d224-44ac-9010-2004b39d9a39',
                versionNumber: 2
            }, {
                id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                href: 'http://qa.siglus.us.internal/api/orderables/8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                versionNumber: 2
            }, {
                id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                href: 'http://qa.siglus.us.internal/api/orderables/9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                versionNumber: 2
            }, {
                id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1',
                href: 'http://qa.siglus.us.internal/api/orderables/c880689e-bd21-4c78-a0a9-5aa6137378c1',
                versionNumber: 2
            }, {
                id: 'cf6da234-677b-4797-a60f-ba55e5154f66',
                href: 'http://qa.siglus.us.internal/api/orderables/cf6da234-677b-4797-a60f-ba55e5154f66',
                versionNumber: 2
            }, {
                id: '23d4fb12-1300-41ff-963e-562ee13903eb',
                href: 'http://qa.siglus.us.internal/api/orderables/23d4fb12-1300-41ff-963e-562ee13903eb',
                versionNumber: 2
            }, {
                id: 'c59ae025-2c3b-492e-86d2-513be8be76f3',
                href: 'http://qa.siglus.us.internal/api/orderables/c59ae025-2c3b-492e-86d2-513be8be76f3',
                versionNumber: 2
            }, {
                id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                href: 'http://qa.siglus.us.internal/api/orderables/ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                versionNumber: 2
            }, {
                id: '198ade2c-353d-41d5-9462-bddc6636fef1',
                href: 'http://qa.siglus.us.internal/api/orderables/198ade2c-353d-41d5-9462-bddc6636fef1',
                versionNumber: 2
            }, {
                id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c',
                href: 'http://qa.siglus.us.internal/api/orderables/b956ced2-6b28-4ae3-9667-96e57a18d70c',
                versionNumber: 1
            }, {
                id: 'f3d39029-5c4f-4608-908d-0cea937d4045',
                href: 'http://qa.siglus.us.internal/api/orderables/f3d39029-5c4f-4608-908d-0cea937d4045',
                versionNumber: 5
            }, {
                id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003',
                href: 'http://qa.siglus.us.internal/api/orderables/f8bdb62d-916a-425c-a0fa-6671fbed0003',
                versionNumber: 2
            }, {
                id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                href: 'http://qa.siglus.us.internal/api/orderables/45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                versionNumber: 1
            }, {
                id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                href: 'http://qa.siglus.us.internal/api/orderables/bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                versionNumber: 2
            }, {
                id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                href: 'http://qa.siglus.us.internal/api/orderables/4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                versionNumber: 2
            }, {
                id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                href: 'http://qa.siglus.us.internal/api/orderables/7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                versionNumber: 1
            }, {
                id: 'f5160677-3212-4aa4-89bc-19bb507e9f84',
                href: 'http://qa.siglus.us.internal/api/orderables/f5160677-3212-4aa4-89bc-19bb507e9f84',
                versionNumber: 3
            }, {
                id: '53b4248b-879c-4012-8a0d-1609a65a2a31',
                href: 'http://qa.siglus.us.internal/api/orderables/53b4248b-879c-4012-8a0d-1609a65a2a31',
                versionNumber: 2
            }, {
                id: '81239d4b-179a-4b32-bf31-b773b9393165',
                href: 'http://qa.siglus.us.internal/api/orderables/81239d4b-179a-4b32-bf31-b773b9393165',
                versionNumber: 2
            }, {
                id: '95c7909c-404e-4808-aad7-1494ce55eea1',
                href: 'http://qa.siglus.us.internal/api/orderables/95c7909c-404e-4808-aad7-1494ce55eea1',
                versionNumber: 2
            }, {
                id: 'dfe3d7ba-a675-4c79-8699-fba147184421',
                href: 'http://qa.siglus.us.internal/api/orderables/dfe3d7ba-a675-4c79-8699-fba147184421',
                versionNumber: 2
            }, {
                id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                href: 'http://qa.siglus.us.internal/api/orderables/d5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                versionNumber: 2
            }, {
                id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                href: 'http://qa.siglus.us.internal/api/orderables/61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                versionNumber: 2
            }, {
                id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                href: 'http://qa.siglus.us.internal/api/orderables/7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                versionNumber: 2
            }, {
                id: '80d915bf-fb55-4632-81ae-3c3e636a50dc',
                href: 'http://qa.siglus.us.internal/api/orderables/80d915bf-fb55-4632-81ae-3c3e636a50dc',
                versionNumber: 2
            }, {
                id: 'a399f564-fbc9-47af-a3fb-ea4387072847',
                href: 'http://qa.siglus.us.internal/api/orderables/a399f564-fbc9-47af-a3fb-ea4387072847',
                versionNumber: 2
            }, {
                id: '2698abe3-f795-40f9-8a92-7338f1b1782d',
                href: 'http://qa.siglus.us.internal/api/orderables/2698abe3-f795-40f9-8a92-7338f1b1782d',
                versionNumber: 2
            }, {
                id: '32d78103-14f0-4f7c-b396-8ef93ca033c5',
                href: 'http://qa.siglus.us.internal/api/orderables/32d78103-14f0-4f7c-b396-8ef93ca033c5',
                versionNumber: 2
            }, {
                id: '60b12949-749c-4ed5-b7de-ea18f57be754',
                href: 'http://qa.siglus.us.internal/api/orderables/60b12949-749c-4ed5-b7de-ea18f57be754',
                versionNumber: 2
            }, {
                id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                href: 'http://qa.siglus.us.internal/api/orderables/5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                versionNumber: 2
            }, {
                id: '403e3f47-d1b5-482a-864c-05d8a6086970',
                href: 'http://qa.siglus.us.internal/api/orderables/403e3f47-d1b5-482a-864c-05d8a6086970',
                versionNumber: 2
            }, {
                id: '4b81061e-508e-4e40-87f7-24c86fd1a713',
                href: 'http://qa.siglus.us.internal/api/orderables/4b81061e-508e-4e40-87f7-24c86fd1a713',
                versionNumber: 2
            }, {
                id: '5c28f59c-e27b-4e79-a017-298b02ec27a3',
                href: 'http://qa.siglus.us.internal/api/orderables/5c28f59c-e27b-4e79-a017-298b02ec27a3',
                versionNumber: 2
            }, {
                id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                href: 'http://qa.siglus.us.internal/api/orderables/bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                versionNumber: 2
            }, {
                id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                href: 'http://qa.siglus.us.internal/api/orderables/dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                versionNumber: 2
            }, {
                id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4',
                href: 'http://qa.siglus.us.internal/api/orderables/b37951fa-8f51-447a-96d5-43a6dce56bf4',
                versionNumber: 2
            }, {
                id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                href: 'http://qa.siglus.us.internal/api/orderables/6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                versionNumber: 2
            }, {
                id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                href: 'http://qa.siglus.us.internal/api/orderables/ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                versionNumber: 2
            }, {
                id: '7119f253-4f95-4fb2-9186-f0a426434cda',
                href: 'http://qa.siglus.us.internal/api/orderables/7119f253-4f95-4fb2-9186-f0a426434cda',
                versionNumber: 2
            }, {
                id: '4702bf14-6f91-454d-8539-03e2e2afd0ea',
                href: 'http://qa.siglus.us.internal/api/orderables/4702bf14-6f91-454d-8539-03e2e2afd0ea',
                versionNumber: 2
            }, {
                id: '75fccffe-5575-4074-9ac7-af29f452cec2',
                href: 'http://qa.siglus.us.internal/api/orderables/75fccffe-5575-4074-9ac7-af29f452cec2',
                versionNumber: 2
            }, {
                id: '95c00deb-9454-4bb1-a347-dad18c576a82',
                href: 'http://qa.siglus.us.internal/api/orderables/95c00deb-9454-4bb1-a347-dad18c576a82',
                versionNumber: 2
            }, {
                id: '03746692-24a0-4944-9a79-a3d144fbe262',
                href: 'http://qa.siglus.us.internal/api/orderables/03746692-24a0-4944-9a79-a3d144fbe262',
                versionNumber: 2
            }, {
                id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                href: 'http://qa.siglus.us.internal/api/orderables/08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                versionNumber: 2
            }],
            isFinalApproval: false,
            isApprovedByInternal: false,
            kitUsageLineItems: [],
            usageInformationLineItems: [],
            testConsumptionLineItems: [],
            patientLineItems: [{
                name: 'newSection0',
                columns: {
                    new: {
                        id: '9ae221c7-aa66-4394-8449-d8b1ed18417c',
                        value: 0
                    },
                    newColumn2: {
                        id: '1d3195fa-0920-4d6c-85dd-9090cc0bb3d0',
                        value: 2
                    },
                    newColumn0: {
                        id: '5a298f58-e17e-42b5-8a55-459593779a48',
                        value: 2
                    },
                    newColumn1: {
                        id: 'c256c3b2-cc21-451c-928d-2fd9a902bcf8',
                        value: 4
                    }
                },
                column: {
                    id: '8e6c8636-c7c7-4023-a36f-b62482e4aa0f',
                    name: 'newSection0',
                    label: 'Faixa Etária dos Pacientes TARV',
                    displayOrder: 1,
                    columns: [{
                        id: '2a1574c0-7a8a-4996-90b4-94ffcc20a6db',
                        name: 'new',
                        label: 'Adultos',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Age range for patients in ARV treatment',
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
                        id: 'ea51f61e-282c-459d-8984-c3c7a049a663',
                        name: 'newColumn0',
                        label: 'Pediátricos 0 aos 4 anos',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 0 to 4 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 0 aos 4 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 0 to 4 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'eb82abd4-69cf-4d7b-8173-cd39391a9075',
                        name: 'newColumn1',
                        label: 'Pediátricos 5 aos 9 anos',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 5 to 9 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 5 aos 9 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 5 to 9 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'b925556f-403d-43eb-a5fd-256b841357b1',
                        name: 'newColumn2',
                        label: 'Pediátricos 10 aos 14 anos',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 10 to 14 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 10 aos 14 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 10 to 14 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection1',
                columns: {
                    new: {
                        id: 'c014db95-5357-425a-ba2f-12528eb9bf64',
                        value: 10
                    },
                    newColumn1: {
                        id: 'e3ba7043-b221-4b09-ad3c-f6d9c252825f',
                        value: 2
                    }
                },
                column: {
                    id: 'fafc926a-6283-469e-9c16-dac65e1e97a2',
                    name: 'newSection1',
                    label: 'Profilaxia',
                    displayOrder: 2,
                    columns: [{
                        id: '7a28622b-fed2-41bd-a760-bcb5d2766ce1',
                        name: 'new',
                        label: 'PPE',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'PPE',
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
                        id: '6c14d830-bd19-4daa-a946-44e4da3449a7',
                        name: 'newColumn1',
                        label: 'Criança Exposta',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Exposed Child',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Criança Exposta',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Exposed Child',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection2',
                columns: {
                    newColumn4: {
                        id: '1279ce7c-91e7-4539-ac3c-c942ef76ef7a',
                        value: 21
                    },
                    new: {
                        id: 'c551090d-8a8b-4f33-922e-9b9910fcaf63',
                        value: 5
                    },
                    newColumn2: {
                        id: '07303418-ac19-4eda-b450-4092da18ac53',
                        value: 9
                    },
                    total: {
                        id: '08966331-b426-4c8b-a0d8-0c2bb4ddd78d',
                        value: 39
                    },
                    newColumn3: {
                        id: '56b0ae55-baef-40b6-b977-491b0ea31546',
                        value: 0
                    },
                    newColumn0: {
                        id: '68ab256d-5a47-4bf0-9926-d326d96ed79e',
                        value: 2
                    },
                    newColumn1: {
                        id: '0e1d8624-acf6-406a-9265-33f25d77d2d9',
                        value: 2
                    }
                },
                column: {
                    id: 'b7ad5b4b-88e7-46e4-a586-32c60d95b92f',
                    name: 'newSection2',
                    label: 'Tipo de Dispensa - Dispensa para 6 Mensal (DS)',
                    displayOrder: 4,
                    columns: [{
                        id: 'b2bc0e56-de53-4e14-b87f-258fc3cf33dc',
                        name: 'new',
                        label: '5 meses atrás',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: '5 months ago',
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
                        id: 'de8ef9de-41a7-45a2-8dd6-8862fa0e4559',
                        name: 'newColumn0',
                        label: '4 meses atrás',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: '4 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: '4 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '4 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '534ce710-dad3-41f3-a6ce-6ed899d15fbe',
                        name: 'newColumn1',
                        label: '3 meses atrás',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: '3 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: '3 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '3 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '4c88d45f-e664-419d-82d9-a76b8f2646f2',
                        name: 'newColumn2',
                        label: '2 meses atrás',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: '2 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: '2 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '2 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'dc40bd4b-2e3f-4930-8a3f-53462bb84442',
                        name: 'newColumn3',
                        label: 'Mês Anterior',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Last month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn3',
                            sources: ['USER_INPUT'],
                            label: 'Mês Anterior',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Last month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'e6b1075b-3ad6-4d3a-ab0b-7cdb92a565d3',
                        name: 'newColumn4',
                        label: 'Levantaram no mês',
                        indicator: 'N',
                        displayOrder: 5,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn4',
                            sources: ['USER_INPUT'],
                            label: 'Levantaram no mês',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 5,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'b17d4182-aaf2-49ce-8797-ede98633b26c',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 6,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection3',
                columns: {
                    new: {
                        id: 'dfd0cd97-f33c-4126-bff0-527f99c7c30d',
                        value: 2
                    },
                    total: {
                        id: '396353f5-726f-4c4e-878b-ad99960e2f7f',
                        value: 8
                    },
                    newColumn0: {
                        id: '5cd18bfe-3277-4651-a2ef-c76c75ac241d',
                        value: 4
                    },
                    newColumn1: {
                        id: '1419e7e8-1b68-4f26-84ea-530bd2e5f78a',
                        value: 2
                    }
                },
                column: {
                    id: 'a6799705-99a5-465a-95b9-2a938be0d0b3',
                    name: 'newSection3',
                    label: 'Tipo de Dispensa - Dispensa para 3 Mensal (DT)',
                    displayOrder: 5,
                    columns: [{
                        id: 'e64abeb2-7473-42b5-aca7-9ac711644369',
                        name: 'new',
                        label: '2 meses atrás',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: '2 months ago',
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
                        id: '45a022dd-5322-43ec-8cb2-ff43bdab19ab',
                        name: 'newColumn0',
                        label: 'Mês Anterior',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Last month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Mês Anterior',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Last month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '5419e234-9b8f-4c2e-9199-3ddb2a8c2815',
                        name: 'newColumn1',
                        label: 'Levantaram no mês',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Levantaram no mês',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '11812c5d-8026-4fe2-b4b3-c1ae3e476380',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection4',
                columns: {
                    new: {
                        id: 'fdd80e87-654a-46f8-b31a-e5b9e51bc610',
                        value: 2
                    },
                    total: {
                        id: '8b525271-d263-46da-9117-0ab83c2c22e6',
                        value: 2
                    }
                },
                column: {
                    id: '5c714814-021d-4aa9-b4da-7b4e4f5680f6',
                    name: 'newSection4',
                    label: 'Tipo de Dispensa - Dispensa Mensal (DM)',
                    displayOrder: 6,
                    columns: [{
                        id: '320df9b5-2828-4c5a-91e1-cbc57156d929',
                        name: 'new',
                        label: 'Levantaram no mês',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
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
                        id: 'e43a5e4b-c4fd-4536-b749-c636de0b61ad',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection5',
                columns: {
                    new: {
                        id: '930d91f8-3903-4487-8f98-694a55a94d66',
                        value: 4
                    },
                    total: {
                        id: 'b194a030-f1ff-4dc4-bf61-9911323525a7',
                        value: 11
                    },
                    newColumn0: {
                        id: 'bc59e598-b360-4d9d-b29d-59343ceb07d5',
                        value: 2
                    },
                    newColumn1: {
                        id: 'd9af2fa6-ef93-4bc6-b804-cee0ead4a656',
                        value: 5
                    }
                },
                column: {
                    id: '3432aa12-d011-448a-bd89-7255bf6b1a87',
                    name: 'newSection5',
                    label: 'Tipo de Dispensa - Mês Corrente',
                    displayOrder: 7,
                    columns: [{
                        id: 'a496bac7-28f6-4fd4-947f-2b8abf7aa972',
                        name: 'new',
                        label: 'Mês Corrente-DS',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DS',
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
                        id: '8107462c-fa1d-47d4-800d-0c93272ac1bb',
                        name: 'newColumn0',
                        label: 'Mês Corrente-DT',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DT',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Mês Corrente-DT',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month-DT',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '98b066b3-9952-44cd-8bdb-6ee93b52929a',
                        name: 'newColumn1',
                        label: 'Mês Corrente-DM',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DM',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Mês Corrente-DM',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month-DM',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '2ddcc161-82cc-4a00-a32d-4f6b11153d0d',
                        name: 'total',
                        label: 'Total',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection6',
                columns: {
                    new: {
                        id: '05127e6d-069f-4589-b78b-a6678d2bc2d6',
                        value: 2
                    },
                    total: {
                        id: 'a2399c08-8967-41c6-bc6b-4aa7d32a4ad9',
                        value: 9
                    },
                    newColumn0: {
                        id: '195a396d-e997-42db-b233-e8b44cecb1c8',
                        value: 4
                    },
                    newColumn1: {
                        id: '5d0ac908-3fd7-439e-b987-d8300c6966ab',
                        value: 3
                    }
                },
                column: {
                    id: '61204681-71ea-48bb-8c32-ceb91787f8bc',
                    name: 'newSection6',
                    label: 'Tipo de Dispensa - Total de pacientes com tratamento',
                    displayOrder: 8,
                    columns: [{
                        id: 'ac33c901-104c-4e97-b9af-1d82e6d1558b',
                        name: 'new',
                        label: 'Total de pacientes com tratamento-DS',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment-DS',
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
                        id: '2a7fcc6a-2b69-44a2-a4de-a82c13dbe5ab',
                        name: 'newColumn0',
                        label: 'Total de pacientes com tratamento-DM',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment-DM',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Total de pacientes com tratamento-DM',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Total patients with treatment-DM',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '8a503c16-aa92-48a2-960a-396f69c16190',
                        name: 'newColumn1',
                        label: 'Total de pacientes com tratamento-DT',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total de pacientes com tratamento-DT',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Total de pacientes com tratamento-DT',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Total de pacientes com tratamento-DT',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '7e3fa423-ac99-4476-ac2f-e493a00239bc',
                        name: 'total',
                        label: 'Total',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }
            }, {
                name: 'newSection7',
                columns: {
                    new: {
                        id: '0f95dae4-d1e5-4142-b52a-d0cfce06ef14',
                        value: 3
                    }
                },
                column: {
                    id: 'f783361b-2c14-4b1b-8510-896073d175d2',
                    name: 'newSection7',
                    label: 'Tipo de Dispensa - Ajuste',
                    displayOrder: 9,
                    columns: [{
                        id: '6b65e385-6239-42af-99a1-2f652f54d1ea',
                        name: 'new',
                        label: 'Ajuste',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Ajustment',
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
                    }],
                    isDefault: false
                }
            }, {
                name: 'patientType',
                columns: {
                    new: {
                        id: 'deb47f40-4435-4598-8bb5-07f2ca8a23b8',
                        value: 1
                    },
                    newColumn2: {
                        id: '1cfd8b71-0d69-405c-b94f-a315e13f5994',
                        value: 4
                    },
                    newColumn3: {
                        id: 'a271569f-1162-4c9e-8453-e25ffc57845e',
                        value: 3
                    },
                    newColumn0: {
                        id: 'd8f15812-1e01-4336-b90a-48c6ac653756',
                        value: 2
                    },
                    newColumn1: {
                        id: '39d5f633-9a71-4277-90d0-7c6e9bbddcd5',
                        value: 0
                    }
                },
                column: {
                    id: 'fdd119eb-de41-45c5-a290-1dea04fb5bef',
                    name: 'patientType',
                    label: 'Tipo de doentes em TARV',
                    displayOrder: 0,
                    columns: [{
                        id: '26c56b06-af89-4ff6-8a69-ed6a34b7516a',
                        name: 'new',
                        label: 'Novos',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'New',
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
                        id: '59eba1cd-04d7-44a2-98df-604d00efe120',
                        name: 'newColumn0',
                        label: 'Manutenção',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Maintenance',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Manutenção',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Maintenance',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '7152ed19-dce0-431a-8875-c5b89585c285',
                        name: 'newColumn1',
                        label: 'Trânsito',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Transit',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Trânsito',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Transit',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'd530c97d-cfb2-47f6-92b5-c03a69968195',
                        name: 'newColumn2',
                        label: 'Transferências',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Transfers',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: 'Transferências',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Transfers',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '0fbed6c5-9759-4b0e-bd78-d70029c9b4ee',
                        name: 'newColumn3',
                        label: 'Alteração',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Alteration',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn3',
                            sources: ['USER_INPUT'],
                            label: 'Alteração',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Alteration',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: true
                }
            }, {
                name: 'newSection8',
                columns: {
                    new: {
                        id: '12a709ae-ca26-40d8-9aba-665902f37d0a',
                        value: 4
                    },
                    newColumn0: {
                        id: '78a882b1-4395-43aa-8fb2-a5bc7ba56197',
                        value: 2
                    }
                },
                column: {
                    id: '8e11bcb6-071a-11ed-a27f-acde48001122',
                    name: 'newSection8',
                    label: 'Total global',
                    displayOrder: 3,
                    columns: [{
                        id: '8e11bfcc-071a-11ed-a27f-acde48001122',
                        name: 'new',
                        label: 'Total de pacientes em TARV na US',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the number of total de pacientes em TARV na US',
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
                        id: '8e11c076-071a-11ed-a27f-acde48001122',
                        name: 'newColumn0',
                        label: 'Total de Meses de Terapêutica',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the number of total de Meses de Terapêutica',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Total de Meses de Terapêutica',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'record the number of total de Meses de Terapêutica',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }
            }],
            consultationNumberLineItems: [],
            regimenLineItems: [{
                regimen: {
                    id: 'd59f88d2-fbcf-4040-bcb2-6ea8c0590123',
                    code: '2alt3',
                    fullProductName: 'AZT+3TC+ATV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 69,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '8dd5324c-c737-41d3-a409-399f4c86c472',
                        value: 0
                    },
                    community: {
                        id: '41ba6055-d083-4f23-9a27-9088065de21f',
                        value: 0
                    }
                }
            }, {
                regimen: {
                    id: 'e1aa5e49-b25b-4e2d-9328-0a88d99e998e',
                    code: 'A2Fped Cpts',
                    fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 100/25)',
                    active: true,
                    isCustom: false,
                    displayOrder: 89,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'c0b90f70-96ce-4033-b8af-20071c64694b',
                        value: 12
                    },
                    community: {
                        id: '4d93f55b-6497-411f-90d7-25e948d2f5f2',
                        value: 10
                    }
                }
            }, {
                regimen: {
                    id: '28f52213-325f-4d30-b040-de9ef63519a7',
                    code: 'ABCPedXarope',
                    fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 80/20)',
                    active: true,
                    isCustom: false,
                    displayOrder: 100,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'fa1355ec-67e8-4f49-bb16-da43ba72eced',
                        value: 0
                    },
                    community: {
                        id: 'd49610c2-4387-48d8-9922-e1c8161b66ef',
                        value: 21
                    }
                }
            }, {
                regimen: {
                    id: 'e1169d62-f0ca-4948-8a80-8b0ea4680597',
                    code: '2alt1',
                    fullProductName: 'TDF+3TC+ATV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 72,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '58f005f0-ba19-45c8-91dc-596b4df54a0a',
                        value: 3
                    },
                    community: {
                        id: '89689a8c-79d0-44b3-88f5-5437ce246f53',
                        value: 2
                    }
                }
            }, {
                regimen: {
                    id: '05c6962f-b06f-4b78-a501-2e931a2fb38b',
                    code: '1alt1',
                    fullProductName: 'ABC+3TC+DTG',
                    active: true,
                    isCustom: false,
                    displayOrder: 66,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '2a9e78e6-a063-4259-9a4b-f63aa5381a4a',
                        value: 4
                    },
                    community: {
                        id: '67c16734-46ed-44f6-8dfa-1cea2d8e3d45',
                        value: 3
                    }
                }
            }, {
                regimen: {
                    id: '8e2d520b-3ea7-4b97-aa23-2a2976597c6c',
                    code: 'A2Fped Xarope',
                    fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 80/20)',
                    active: true,
                    isCustom: false,
                    displayOrder: 101,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'be186a30-2fa0-4bf0-9f3a-3c30ba919412',
                        value: 0
                    },
                    community: {
                        id: 'f4f16efe-23ff-41b8-b0df-4ddc18915829',
                        value: 4
                    }
                }
            }, {
                regimen: {
                    id: 'd35c5d0f-f63a-4a8b-ae71-c357c71b86f4',
                    code: '2alt2',
                    fullProductName: 'ABC+3TC+ATV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 65,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '76b33c17-86d8-4962-a579-b10bf77c812f',
                        value: 0
                    },
                    community: {
                        id: '74bbb306-1e29-49d4-bf2e-be23231b3812',
                        value: 12
                    }
                }
            }, {
                regimen: {
                    id: '4134c58a-a394-491d-9b70-953e3e89a17c',
                    code: 'ABC12',
                    fullProductName: 'ABC+3TC+LPV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 50,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '5abe7e42-3b5f-4a86-bca3-495ad71dc23f',
                        value: 12
                    },
                    community: {
                        id: '57012793-74c7-4a09-b753-1ca570e72d37',
                        value: 10
                    }
                }
            }, {
                regimen: {
                    id: '9c694968-9bbd-4ecf-949d-8cbefafd601c',
                    code: 'X6APed',
                    fullProductName: 'ABC+3TC+DTG (2DFCped+DTG50)',
                    active: true,
                    isCustom: false,
                    displayOrder: 84,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '727944f5-a1b1-4f8e-9e1d-f06171ad2d37',
                        value: 22
                    },
                    community: {
                        id: 'b51ef887-9fc7-48ee-bf0b-886780f00de0',
                        value: 45
                    }
                }
            }, {
                regimen: {
                    id: '56e512d7-e190-4781-940e-0215b22768ac',
                    code: 'ABCPedCpts',
                    fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 100/25)',
                    active: true,
                    isCustom: false,
                    displayOrder: 86,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '62eced98-bc3a-45ce-b2f2-2724a17236fc',
                        value: 12
                    },
                    community: {
                        id: 'e39e5451-fa62-4093-b4b3-035b61c72f2b',
                        value: 14
                    }
                }
            }, {
                regimen: {
                    id: 'c11d30e8-209a-48d1-956d-fe3837e086bf',
                    code: '1aLTLD',
                    fullProductName: 'TDF+3TC+DTG',
                    active: true,
                    isCustom: false,
                    displayOrder: 73,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '2a871d81-f4e3-4b3b-b933-5d75d0640fef',
                        value: 2
                    },
                    community: {
                        id: '7d1f47dc-c7e4-49a1-a61b-82d937da8928',
                        value: 3
                    }
                }
            }, {
                regimen: {
                    id: 'cf09202f-3f44-438b-b79a-f541ba04ff4f',
                    code: 'ABCPedGranulos',
                    fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 40/10)',
                    active: true,
                    isCustom: false,
                    displayOrder: 87,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'df8fc5bc-6eb0-427b-8f6d-0f2b556be9f9',
                        value: 5
                    },
                    community: {
                        id: 'a5041110-2cb4-4aed-9145-f4d6ab786ed5',
                        value: 9
                    }
                }
            }, {
                regimen: {
                    id: 'e07904c0-4ad6-415c-bd8d-8252f2f9b5ac',
                    code: '1alt2',
                    fullProductName: 'AZT+3TC+DTG',
                    active: true,
                    isCustom: false,
                    displayOrder: 70,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: '056ee834-f40c-427b-abb0-bd75464c2e9a',
                        value: 12
                    },
                    community: {
                        id: '3a7c94b9-348a-4380-85bc-6e2f3fb21850',
                        value: 14
                    }
                }
            }, {
                regimen: {
                    id: '2a32712d-837c-4e49-be01-363bfc7dedb4',
                    code: 'C7A',
                    fullProductName: 'TDF+3TC+LPV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 12,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'fdd8c8ce-f670-4295-b26b-526d8461dc7a',
                        value: 1
                    },
                    community: {
                        id: '753aade8-6681-4a4a-b3bc-c3a44031569a',
                        value: 0
                    }
                }
            }, {
                regimen: {
                    id: '9c90fc20-be66-4f23-a06a-865a59919668',
                    code: 'A2Fped Granulos',
                    fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 40/10)',
                    active: true,
                    isCustom: false,
                    displayOrder: 90,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c254a-e53b-11eb-8494-acde48001122',
                        code: 'PAEDIATRICS',
                        name: 'Paediatrics',
                        displayOrder: 2
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'd9cc50c5-0e51-4281-9edf-b2478f7a9aac',
                        value: 3
                    },
                    community: {
                        id: '135fd64a-5cb0-4e96-8d51-9d4b7d277b6c',
                        value: 0
                    }
                }
            }, {
                regimen: {
                    id: 'd8b4aa79-2d8c-4a92-a0a7-de7932fb5f8a',
                    code: 'A4A',
                    fullProductName: 'TDF+3TC+EFV',
                    active: true,
                    isCustom: false,
                    displayOrder: 5,
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                    regimenCategory: {
                        id: '873c2202-e53b-11eb-8494-acde48001122',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 1
                    }
                },
                name: null,
                columns: {
                    patients: {
                        id: 'f8971d89-3b4a-4b32-a295-cb33d01ac9b4',
                        value: 0
                    },
                    community: {
                        id: '0f77f17c-c1b9-431d-b223-74247e13c7d4',
                        value: 0
                    }
                }
            }, {
                regimen: null,
                name: 'total',
                columns: {
                    patients: {
                        id: '4b26e6d2-79f2-44f2-a7bd-52a2cb103780',
                        value: 88
                    },
                    community: {
                        id: '1a0851a5-b176-4303-80f3-23db3d16cfb1',
                        value: 147
                    }
                }
            }],
            regimenSummaryLineItems: [{
                name: 'total',
                columns: {
                    patients: {
                        id: 'baabcaac-1acc-431a-9c42-aef55bdfcb80',
                        value: 44
                    },
                    community: {
                        id: '62b0f8d8-10ea-4ae0-90c4-7f0d019b535a',
                        value: 46
                    }
                },
                column: {
                    id: '23afa289-ce84-4659-afc3-ddb5274f5e15',
                    name: 'total',
                    label: 'Total',
                    indicator: 'SU',
                    displayOrder: 3,
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
                    source: 'CALCULATED',
                    columns: []
                }
            }, {
                name: 'newColumn0',
                columns: {
                    patients: {
                        id: '54de4665-0390-4f3a-8f52-2103872b735c',
                        value: 14
                    },
                    community: {
                        id: 'f8f29f5e-6446-4a47-84bf-4b78ef61e144',
                        value: 15
                    }
                },
                column: {
                    id: '44189ce2-dfb3-4d77-95c4-fec1dbfd7d12',
                    name: 'newColumn0',
                    label: '2ª Linha',
                    indicator: 'N',
                    displayOrder: 1,
                    isDisplayed: true,
                    option: null,
                    definition: 'display on the second part of the regimen section as the second line',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn0',
                        sources: ['USER_INPUT'],
                        label: '2ª Linha',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'display on the second part of the regimen section as the second line',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 1,
                        options: []
                    },
                    source: 'USER_INPUT',
                    columns: []
                }
            }, {
                name: '1stLinhas',
                columns: {
                    patients: {
                        id: '4f8d41ee-f17d-4a5b-9b6e-9f0faef75fe9',
                        value: 20
                    },
                    community: {
                        id: '8a60a199-24a5-49da-8990-279049fec0e2',
                        value: 10
                    }
                },
                column: {
                    id: '3ba6801b-9bb9-4aaf-a9dd-b109e623d361',
                    name: '1stLinhas',
                    label: '1ª Linha',
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
                    source: 'USER_INPUT',
                    columns: []
                }
            }, {
                name: 'newColumn1',
                columns: {
                    patients: {
                        id: '2bf990e5-8576-4b83-a3e9-d6b779905ada',
                        value: 10
                    },
                    community: {
                        id: '6219011e-9c8a-42b7-8735-7aa2bb03164a',
                        value: 21
                    }
                },
                column: {
                    id: 'c076a36d-5f72-4fa7-b8a3-6f3f2d63fa6c',
                    name: 'newColumn1',
                    label: '3ª Linha',
                    indicator: 'N',
                    displayOrder: 2,
                    isDisplayed: true,
                    option: null,
                    definition: 'display on the second part of the regimen section as the 3rd line',
                    tag: null,
                    columnDefinition: {
                        id: null,
                        name: 'newColumn1',
                        sources: ['USER_INPUT'],
                        label: '3ª Linha',
                        indicator: 'N',
                        mandatory: false,
                        isDisplayRequired: false,
                        canBeChangedByUser: true,
                        supportsTag: true,
                        definition: 'display on the second part of the regimen section as the 3rd line',
                        canChangeOrder: true,
                        columnType: null,
                        displayOrder: 2,
                        options: []
                    },
                    source: 'USER_INPUT',
                    columns: []
                }
            }],
            customRegimens: [{
                id: '043723a3-7a04-4086-9ca9-87c560336fcf',
                code: '3La',
                fullProductName: 'TDF+3TC+RAL+DRV+RTV',
                active: true,
                isCustom: true,
                displayOrder: 76,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '0c62fad1-61ab-42d5-bd29-2097e53002cb',
                code: '2Op1',
                fullProductName: '2as Optimizadas ATV/r',
                active: true,
                isCustom: true,
                displayOrder: 60,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '1a714554-e939-405b-b53c-444375cfc7c7',
                code: '3Lb',
                fullProductName: 'AZT+3TC+RAL+DRV+RTV',
                active: true,
                isCustom: true,
                displayOrder: 14,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '1d2eac88-b55c-4f35-b8ee-4d6680ee138d',
                code: '2Op3',
                fullProductName: '2as Optimizadas DRV+RTV',
                active: true,
                isCustom: true,
                displayOrder: 62,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '54d71cfb-cc01-4a7e-a7df-35983c22ce38',
                code: '3Lbb',
                fullProductName: 'ABC+3TC+RAL+DRV+RTV',
                active: true,
                isCustom: true,
                displayOrder: 68,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '5f0fa21c-f36e-4ddf-81e7-5834037d509d',
                code: 'A2C',
                fullProductName: 'AZT+3TC+ABC',
                active: true,
                isCustom: true,
                displayOrder: 48,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'a413ad75-90d7-41be-8f85-e6425c25001f',
                code: 'X5C',
                fullProductName: 'ABC+3TC+NVP',
                active: true,
                isCustom: true,
                displayOrder: 45,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'b86f55fb-e8dc-4abb-bff9-3a0864533680',
                code: '2Op2',
                fullProductName: '2as Optimizadas ATV/r+RAL',
                active: true,
                isCustom: true,
                displayOrder: 61,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'b8c46e14-735b-4d0f-ab1f-00f16f033473',
                code: 'PreEP',
                fullProductName: 'TDF+FTC PreEP',
                active: true,
                isCustom: true,
                displayOrder: 75,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'd2725429-5240-4c78-85f0-bad30b1cc2b9',
                code: '1TB2',
                fullProductName: 'ABC+3TC+RAL',
                active: true,
                isCustom: true,
                displayOrder: 67,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'e95fc701-34d5-4775-9f3b-c2c664feae41',
                code: '3op1',
                fullProductName: '3a Linha adaptada DRV+RAL+RTV',
                active: true,
                isCustom: true,
                displayOrder: 63,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'ec6c7950-c62b-4177-b143-3e7ac0ae98d7',
                code: '3L_3TC',
                fullProductName: '3TC+RAL+DRV+RTV',
                active: true,
                isCustom: true,
                displayOrder: 64,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'fccacdb0-b116-4978-b75e-422f9984222b',
                code: 'X5A',
                fullProductName: 'ABC+3TC+EFV',
                active: true,
                isCustom: true,
                displayOrder: 6,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: 'a71d67b4-95ad-4b16-9486-919ae48b15a4',
                code: 'A2Cped',
                fullProductName: 'AZT+3TC+ABC (2FDC+ABC Baby)',
                active: true,
                isCustom: true,
                displayOrder: 49,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c254a-e53b-11eb-8494-acde48001122',
                    code: 'PAEDIATRICS',
                    name: 'Paediatrics',
                    displayOrder: 2
                }
            }, {
                id: '60fe5559-2bec-4b45-9a4b-404b2c7ba7ce',
                code: 'A2F',
                fullProductName: 'AZT+3TC+LPV/r',
                active: true,
                isCustom: true,
                displayOrder: 1,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c2202-e53b-11eb-8494-acde48001122',
                    code: 'ADULTS',
                    name: 'Adults',
                    displayOrder: 1
                }
            }, {
                id: '4e2626f2-efa3-418c-99fe-b3dd4b60e72f',
                code: 'X5APed',
                fullProductName: 'ABC+3TC+EFV Ped (2DFC+EFV 200)',
                active: true,
                isCustom: true,
                displayOrder: 85,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c254a-e53b-11eb-8494-acde48001122',
                    code: 'PAEDIATRICS',
                    name: 'Paediatrics',
                    displayOrder: 2
                }
            }, {
                id: 'c832c07b-93be-4d4b-a519-61eb3bfde716',
                code: 'A2Aped',
                fullProductName: 'AZT+3TC+NVP (3FDC Baby)',
                active: true,
                isCustom: true,
                displayOrder: 4,
                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                regimenCategory: {
                    id: '873c254a-e53b-11eb-8494-acde48001122',
                    code: 'PAEDIATRICS',
                    name: 'Paediatrics',
                    displayOrder: 2
                }
            }],
            ageGroupLineItems: [],
            usageTemplate: {
                kitUsage: [{
                    id: '7f9c15ee-a408-4f3f-be99-7c7b94f9ec4a',
                    name: 'collection',
                    label: 'KIT data collection',
                    displayOrder: 0,
                    columns: [{
                        id: '87cd6f22-5997-4f4d-b759-f1427819205e',
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
                    }, {
                        id: 'e369fcb1-4f81-4bfe-9710-1656c884f0a1',
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
                    }],
                    isDefault: true
                }, {
                    id: '4b4d57de-6f98-45a5-9e33-7a514895fe9e',
                    name: 'service',
                    label: 'Services',
                    displayOrder: 1,
                    columns: [{
                        id: '668a3a0c-a852-423c-b33d-348bd24c4af3',
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
                    }, {
                        id: '6dd852e3-1f84-4ec9-b7d5-1a9591bfbd9a',
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
                    }],
                    isDefault: true
                }],
                patient: [{
                    id: 'fdd119eb-de41-45c5-a290-1dea04fb5bef',
                    name: 'patientType',
                    label: 'Tipo de doentes em TARV',
                    displayOrder: 0,
                    columns: [{
                        id: '26c56b06-af89-4ff6-8a69-ed6a34b7516a',
                        name: 'new',
                        label: 'Novos',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'New',
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
                        id: '59eba1cd-04d7-44a2-98df-604d00efe120',
                        name: 'newColumn0',
                        label: 'Manutenção',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Maintenance',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Manutenção',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Maintenance',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '7152ed19-dce0-431a-8875-c5b89585c285',
                        name: 'newColumn1',
                        label: 'Trânsito',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Transit',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Trânsito',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Transit',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'd530c97d-cfb2-47f6-92b5-c03a69968195',
                        name: 'newColumn2',
                        label: 'Transferências',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Transfers',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: 'Transferências',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Transfers',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '0fbed6c5-9759-4b0e-bd78-d70029c9b4ee',
                        name: 'newColumn3',
                        label: 'Alteração',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Alteration',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn3',
                            sources: ['USER_INPUT'],
                            label: 'Alteração',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Alteration',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: true
                }, {
                    id: '8e6c8636-c7c7-4023-a36f-b62482e4aa0f',
                    name: 'newSection0',
                    label: 'Faixa Etária dos Pacientes TARV',
                    displayOrder: 1,
                    columns: [{
                        id: '2a1574c0-7a8a-4996-90b4-94ffcc20a6db',
                        name: 'new',
                        label: 'Adultos',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Age range for patients in ARV treatment',
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
                        id: 'ea51f61e-282c-459d-8984-c3c7a049a663',
                        name: 'newColumn0',
                        label: 'Pediátricos 0 aos 4 anos',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 0 to 4 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 0 aos 4 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 0 to 4 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'eb82abd4-69cf-4d7b-8173-cd39391a9075',
                        name: 'newColumn1',
                        label: 'Pediátricos 5 aos 9 anos',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 5 to 9 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 5 aos 9 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 5 to 9 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'b925556f-403d-43eb-a5fd-256b841357b1',
                        name: 'newColumn2',
                        label: 'Pediátricos 10 aos 14 anos',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Pediatric from 10 to 14 years old',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: 'Pediátricos 10 aos 14 anos',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Pediatric from 10 to 14 years old',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }, {
                    id: 'fafc926a-6283-469e-9c16-dac65e1e97a2',
                    name: 'newSection1',
                    label: 'Profilaxia',
                    displayOrder: 2,
                    columns: [{
                        id: '7a28622b-fed2-41bd-a760-bcb5d2766ce1',
                        name: 'new',
                        label: 'PPE',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'PPE',
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
                        id: '6c14d830-bd19-4daa-a946-44e4da3449a7',
                        name: 'newColumn1',
                        label: 'Criança Exposta',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Exposed Child',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Criança Exposta',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Exposed Child',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }, {
                    id: '8e11bcb6-071a-11ed-a27f-acde48001122',
                    name: 'newSection8',
                    label: 'Total global',
                    displayOrder: 3,
                    columns: [{
                        id: '8e11bfcc-071a-11ed-a27f-acde48001122',
                        name: 'new',
                        label: 'Total de pacientes em TARV na US',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the number of total de pacientes em TARV na US',
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
                        id: '8e11c076-071a-11ed-a27f-acde48001122',
                        name: 'newColumn0',
                        label: 'Total de Meses de Terapêutica',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the number of total de Meses de Terapêutica',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Total de Meses de Terapêutica',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'record the number of total de Meses de Terapêutica',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }],
                    isDefault: false
                }, {
                    id: 'b7ad5b4b-88e7-46e4-a586-32c60d95b92f',
                    name: 'newSection2',
                    label: 'Tipo de Dispensa - Dispensa para 6 Mensal (DS)',
                    displayOrder: 4,
                    columns: [{
                        id: 'b2bc0e56-de53-4e14-b87f-258fc3cf33dc',
                        name: 'new',
                        label: '5 meses atrás',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: '5 months ago',
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
                        id: 'de8ef9de-41a7-45a2-8dd6-8862fa0e4559',
                        name: 'newColumn0',
                        label: '4 meses atrás',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: '4 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: '4 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '4 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '534ce710-dad3-41f3-a6ce-6ed899d15fbe',
                        name: 'newColumn1',
                        label: '3 meses atrás',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: '3 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: '3 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '3 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '4c88d45f-e664-419d-82d9-a76b8f2646f2',
                        name: 'newColumn2',
                        label: '2 meses atrás',
                        indicator: 'N',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: '2 months ago',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn2',
                            sources: ['USER_INPUT'],
                            label: '2 meses atrás',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: '2 months ago',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 3,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'dc40bd4b-2e3f-4930-8a3f-53462bb84442',
                        name: 'newColumn3',
                        label: 'Mês Anterior',
                        indicator: 'N',
                        displayOrder: 4,
                        isDisplayed: true,
                        option: null,
                        definition: 'Last month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn3',
                            sources: ['USER_INPUT'],
                            label: 'Mês Anterior',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Last month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 4,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'e6b1075b-3ad6-4d3a-ab0b-7cdb92a565d3',
                        name: 'newColumn4',
                        label: 'Levantaram no mês',
                        indicator: 'N',
                        displayOrder: 5,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn4',
                            sources: ['USER_INPUT'],
                            label: 'Levantaram no mês',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 5,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: 'b17d4182-aaf2-49ce-8797-ede98633b26c',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 6,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }, {
                    id: 'a6799705-99a5-465a-95b9-2a938be0d0b3',
                    name: 'newSection3',
                    label: 'Tipo de Dispensa - Dispensa para 3 Mensal (DT)',
                    displayOrder: 5,
                    columns: [{
                        id: 'e64abeb2-7473-42b5-aca7-9ac711644369',
                        name: 'new',
                        label: '2 meses atrás',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: '2 months ago',
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
                        id: '45a022dd-5322-43ec-8cb2-ff43bdab19ab',
                        name: 'newColumn0',
                        label: 'Mês Anterior',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Last month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Mês Anterior',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Last month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '5419e234-9b8f-4c2e-9199-3ddb2a8c2815',
                        name: 'newColumn1',
                        label: 'Levantaram no mês',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Levantaram no mês',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '11812c5d-8026-4fe2-b4b3-c1ae3e476380',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }, {
                    id: '5c714814-021d-4aa9-b4da-7b4e4f5680f6',
                    name: 'newSection4',
                    label: 'Tipo de Dispensa - Dispensa Mensal (DM)',
                    displayOrder: 6,
                    columns: [{
                        id: '320df9b5-2828-4c5a-91e1-cbc57156d929',
                        name: 'new',
                        label: 'Levantaram no mês',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month',
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
                        id: 'e43a5e4b-c4fd-4536-b749-c636de0b61ad',
                        name: 'total',
                        label: 'Total de pacientes com tratamento',
                        indicator: 'PD',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }, {
                    id: '3432aa12-d011-448a-bd89-7255bf6b1a87',
                    name: 'newSection5',
                    label: 'Tipo de Dispensa - Mês Corrente',
                    displayOrder: 7,
                    columns: [{
                        id: 'a496bac7-28f6-4fd4-947f-2b8abf7aa972',
                        name: 'new',
                        label: 'Mês Corrente-DS',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DS',
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
                        id: '8107462c-fa1d-47d4-800d-0c93272ac1bb',
                        name: 'newColumn0',
                        label: 'Mês Corrente-DT',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DT',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Mês Corrente-DT',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month-DT',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '98b066b3-9952-44cd-8bdb-6ee93b52929a',
                        name: 'newColumn1',
                        label: 'Mês Corrente-DM',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Within this month-DM',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Mês Corrente-DM',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Within this month-DM',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '2ddcc161-82cc-4a00-a32d-4f6b11153d0d',
                        name: 'total',
                        label: 'Total',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }, {
                    id: '61204681-71ea-48bb-8c32-ceb91787f8bc',
                    name: 'newSection6',
                    label: 'Tipo de Dispensa - Total de pacientes com tratamento',
                    displayOrder: 8,
                    columns: [{
                        id: 'ac33c901-104c-4e97-b9af-1d82e6d1558b',
                        name: 'new',
                        label: 'Total de pacientes com tratamento-DS',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment-DS',
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
                        id: '2a7fcc6a-2b69-44a2-a4de-a82c13dbe5ab',
                        name: 'newColumn0',
                        label: 'Total de pacientes com tratamento-DM',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total patients with treatment-DM',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: 'Total de pacientes com tratamento-DM',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Total patients with treatment-DM',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '8a503c16-aa92-48a2-960a-396f69c16190',
                        name: 'newColumn1',
                        label: 'Total de pacientes com tratamento-DT',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total de pacientes com tratamento-DT',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: 'Total de pacientes com tratamento-DT',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'Total de pacientes com tratamento-DT',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT'
                    }, {
                        id: '7e3fa423-ac99-4476-ac2f-e493a00239bc',
                        name: 'total',
                        label: 'Total',
                        indicator: 'PD',
                        displayOrder: 3,
                        isDisplayed: true,
                        option: null,
                        definition: 'Total',
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
                        source: 'CALCULATED'
                    }],
                    isDefault: false
                }, {
                    id: 'f783361b-2c14-4b1b-8510-896073d175d2',
                    name: 'newSection7',
                    label: 'Tipo de Dispensa - Ajuste',
                    displayOrder: 9,
                    columns: [{
                        id: '6b65e385-6239-42af-99a1-2f652f54d1ea',
                        name: 'new',
                        label: 'Ajuste',
                        indicator: 'PD',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'Ajustment',
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
                    }],
                    isDefault: false
                }],
                regimen: [{
                    id: 'd129537c-8c90-4d46-a696-428b7c6c6638',
                    name: 'regimen',
                    label: 'Regimen',
                    displayOrder: 0,
                    columns: [{
                        id: '3e0b6ba5-f0ea-40f0-93a5-a93e503b52f0',
                        name: 'code',
                        label: 'FNM',
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
                        id: 'bb1d41be-4153-4e5c-9644-e7a93f3c2419',
                        name: 'community',
                        label: 'Farmácia Comunitária',
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
                    }, {
                        id: '6391b7c1-63a7-4da7-9195-b11ec801e29e',
                        name: 'patients',
                        label: 'Total doentes',
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
                            label: 'Total doentes',
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
                        id: 'd68d1767-eeec-484f-97cf-44e37915b407',
                        name: 'regiment',
                        label: 'REGIME TERAPÊUTICO',
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
                    }],
                    isDefault: true
                }, {
                    id: '1dd521fd-aa52-4505-9237-1b5ab89934f8',
                    name: 'summary',
                    label: 'Linhas terapêuticas',
                    displayOrder: 1,
                    columns: [{
                        id: '3ba6801b-9bb9-4aaf-a9dd-b109e623d361',
                        name: '1stLinhas',
                        label: '1ª Linha',
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
                        source: 'USER_INPUT',
                        columns: []
                    }, {
                        id: '44189ce2-dfb3-4d77-95c4-fec1dbfd7d12',
                        name: 'newColumn0',
                        label: '2ª Linha',
                        indicator: 'N',
                        displayOrder: 1,
                        isDisplayed: true,
                        option: null,
                        definition: 'display on the second part of the regimen section as the second line',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn0',
                            sources: ['USER_INPUT'],
                            label: '2ª Linha',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'display on the second part of the regimen section as the second line',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 1,
                            options: []
                        },
                        source: 'USER_INPUT',
                        columns: []
                    }, {
                        id: 'c076a36d-5f72-4fa7-b8a3-6f3f2d63fa6c',
                        name: 'newColumn1',
                        label: '3ª Linha',
                        indicator: 'N',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'display on the second part of the regimen section as the 3rd line',
                        tag: null,
                        columnDefinition: {
                            id: null,
                            name: 'newColumn1',
                            sources: ['USER_INPUT'],
                            label: '3ª Linha',
                            indicator: 'N',
                            mandatory: false,
                            isDisplayRequired: false,
                            canBeChangedByUser: true,
                            supportsTag: true,
                            definition: 'display on the second part of the regimen section as the 3rd line',
                            canChangeOrder: true,
                            columnType: null,
                            displayOrder: 2,
                            options: []
                        },
                        source: 'USER_INPUT',
                        columns: []
                    }, {
                        id: '23afa289-ce84-4659-afc3-ddb5274f5e15',
                        name: 'total',
                        label: 'Total',
                        indicator: 'SU',
                        displayOrder: 3,
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
                        source: 'CALCULATED',
                        columns: []
                    }],
                    isDefault: true
                }],
                consultationNumber: [{
                    id: '0b53120e-5cb8-4dea-9072-01361f2801e3',
                    name: 'number',
                    label: 'Consultation Number',
                    displayOrder: 0,
                    columns: [{
                        id: '31f8148e-bcc8-4f1a-8ef5-235529fda9b2',
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
                        id: '64f82b3b-6fe6-47af-b829-e893c357c820',
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
                    id: '47ff6a3d-5159-4b4c-bfa4-5c5980ad8c3d',
                    name: 'project',
                    label: 'Test Project',
                    displayOrder: 0,
                    columns: [{
                        id: '699712b8-6e02-48c8-9e17-19589f4c254f',
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
                    }],
                    isDefault: true
                }, {
                    id: '71a0a5fd-64a2-4d7b-a552-8a4c29974da4',
                    name: 'outcome',
                    label: 'Test Outcome',
                    displayOrder: 1,
                    columns: [{
                        id: '80a13208-e800-4ee2-9f3e-9104677538fe',
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
                        id: '1caebf30-8193-48b3-a10b-7f041c9a6599',
                        name: 'positive',
                        label: 'Positive',
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
                        id: '374c4e10-b358-4a77-8f7f-928570266ba2',
                        name: 'unjustified',
                        label: 'Unjustified',
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
                    id: '0442304c-fbdd-4d03-a176-bc5a6fed623f',
                    name: 'service',
                    label: 'Services',
                    displayOrder: 2,
                    columns: [{
                        id: 'ecc07964-0ac7-4467-9e04-cdd1228b777a',
                        name: 'APES',
                        label: 'APES',
                        indicator: 'SV',
                        displayOrder: 2,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the related test outcomes for APES',
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
                        id: 'd7698fa8-491a-4b0d-bb0f-b2dc1deae6c7',
                        name: 'HF',
                        label: 'HF',
                        indicator: 'SV',
                        displayOrder: 0,
                        isDisplayed: true,
                        option: null,
                        definition: 'record the test outcome for my facility',
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
                        id: 'a2fa8726-89b0-4fbb-88a1-94fbb7aa79e3',
                        name: 'total',
                        label: 'Total',
                        indicator: 'SV',
                        displayOrder: 1,
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
                        source: 'USER_INPUT'
                    }],
                    isDefault: true
                }],
                usageInformation: [{
                    id: 'f9a7f670-b6fd-48d7-b0ec-7330293acfe6',
                    name: 'information',
                    label: 'Product Usage Information',
                    displayOrder: 0,
                    columns: [{
                        id: '40790eb7-ce2b-493c-9162-4cd23f1b5bb9',
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
                    }, {
                        id: '2b2001a1-0f8c-43f5-aefe-4525d67cdf8c',
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
                    }],
                    isDefault: true
                }, {
                    id: '3d5a5331-40cb-45b0-a2ed-05b962cfbfa5',
                    name: 'service',
                    label: 'Services',
                    displayOrder: 1,
                    columns: [{
                        id: '3fc2b2f1-e81a-452f-916d-b5bd34e0cf83',
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
                        id: '18f1e8c8-924a-4f42-8cae-9a2f5b603ad6',
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
                }],
                ageGroup: []
            },
            requisitionNumber: 'RNR-NO010805110000002',
            eTag: null,
            $promise: {
                $$state: {
                    status: 1,
                    value: {
                        id: '665778fb-b690-44e1-a219-27c7efcca2b0',
                        createdDate: '2022-07-29T07:37:47.937Z',
                        modifiedDate: '2022-07-31T05:16:05.579Z',
                        draftStatusMessage: '',
                        status: 'RELEASED',
                        emergency: false,
                        reportOnly: false,
                        supplyingFacility: '060a6888-cfbc-11e9-9398-0242ac130008',
                        supervisoryNode: '6dab2830-f831-11ea-a7fc-0242ac1a0007',
                        template: {
                            id: '5d4d9924-c0a1-4c5e-90df-3ed2bbec5921',
                            createdDate: '2021-07-07T05:45:01.15Z',
                            numberOfPeriodsToAverage: 3,
                            populateStockOnHandFromStockCards: true,
                            name: 'HF TARV Template',
                            columnsMap: {
                                numberOfNewPatientsAdded: {
                                    name: 'numberOfNewPatientsAdded',
                                    label: 'Number of new patients added',
                                    indicator: 'F',
                                    displayOrder: 23,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: {
                                        id: '4957ebb4-297c-459e-a291-812e72286eff',
                                        optionName: 'dispensingUnitsForNewPatients',
                                        optionLabel: 'requisitionConstants.dispensingUnitsForNewPatients'
                                    },
                                    definition: 'New patients data.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                adjustedConsumption: {
                                    name: 'adjustedConsumption',
                                    label: 'Adjusted consumption',
                                    indicator: 'N',
                                    displayOrder: 25,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: '1',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                theoreticalQuantityToRequest: {
                                    name: 'theoreticalQuantityToRequest',
                                    label: 'Theoretical Quantity to Request',
                                    indicator: 'TQ',
                                    displayOrder: 13,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Theoretical Quantity to Request=2 * issues - inventory',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                totalLossesAndAdjustments: {
                                    name: 'totalLossesAndAdjustments',
                                    label: 'Perdas e ajustes',
                                    indicator: 'D',
                                    displayOrder: 8,
                                    isDisplayed: true,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'All kind of losses/adjustments made at the facility.',
                                    tag: 'adjustment',
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                totalStockoutDays: {
                                    name: 'totalStockoutDays',
                                    label: 'Total stockout days',
                                    indicator: 'X',
                                    displayOrder: 11,
                                    isDisplayed: false,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Total number of days facility was out of stock.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                packsToShip: {
                                    name: 'packsToShip',
                                    label: 'Packs to ship',
                                    indicator: 'V',
                                    displayOrder: 21,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: {
                                        id: 'dcf41f06-3000-4af6-acf5-5de4fffc966f',
                                        optionName: 'showPackToShipInAllPages',
                                        optionLabel: 'requisitionConstants.showPackToShipInAllPages'
                                    },
                                    definition: 'de',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                skipped: {
                                    name: 'skipped',
                                    label: 'Ignorar',
                                    indicator: 'S',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    source: 'USER_INPUT',
                                    option: {
                                        id: '17d6e860-a746-4500-a0fa-afc84d799dca',
                                        optionName: 'disableSkippedLineItems',
                                        optionLabel: 'requisitionConstants.disableSkippedLineItems'
                                    },
                                    definition: 'Select the check box below to skip a '
                                    + 'single product. Remove all data from the row prior to selection.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: false,
                                        columnType: 'BOOLEAN'
                                    }
                                },
                                'orderable.productCode': {
                                    name: 'orderable.productCode',
                                    label: 'FNM',
                                    indicator: 'O',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    source: 'REFERENCE_DATA',
                                    option: null,
                                    definition: 'Unique identifier for each commodity/product.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: false,
                                        columnType: 'TEXT'
                                    }
                                },
                                idealStockAmount: {
                                    name: 'idealStockAmount',
                                    label: 'Ideal Stock Amount',
                                    indicator: 'G',
                                    displayOrder: 29,
                                    isDisplayed: false,
                                    source: 'REFERENCE_DATA',
                                    option: null,
                                    definition: 'The Ideal Stock Amount is the target quantity '
                                    + 'for a specific commodity type, facility, and period.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                total: {
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'Y',
                                    displayOrder: 20,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Total of beginning balance and quantity received.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                totalConsumedQuantity: {
                                    name: 'totalConsumedQuantity',
                                    label: 'Saida',
                                    indicator: 'C',
                                    displayOrder: 6,
                                    isDisplayed: true,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Quantity dispensed/consumed in the reporting' +
                                    ' period. This is quantified in dispensing units.',
                                    tag: 'consumed',
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                stockOnHand: {
                                    name: 'stockOnHand',
                                    label: 'Inventário',
                                    indicator: 'E',
                                    displayOrder: 9,
                                    isDisplayed: true,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Current physical count of stock on hand. '
                                    + 'This is quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                theoreticalStockAtEndofPeriod: {
                                    name: 'theoreticalStockAtEndofPeriod',
                                    label: 'Stock Teórico no Final do Periodo',
                                    indicator: 'TS',
                                    displayOrder: 7,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Theoretical Stock at End of Period=stock ' +
                                    'at beginning of period + sum of entries -issues',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                requestedQuantity: {
                                    name: 'requestedQuantity',
                                    label: 'Requested quantity',
                                    indicator: 'J',
                                    displayOrder: 14,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Requested override of calculated quantity.' +
                                    'This is quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                suggestedQuantity: {
                                    name: 'suggestedQuantity',
                                    label: 'Suggested Quantity',
                                    indicator: 'SQ',
                                    displayOrder: 16,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: {
                                        id: '822fc359-6d78-4ba0-99fd-d7c776041c5e',
                                        optionName: 'cmm',
                                        optionLabel: 'requisitionConstants.cmm'
                                    },
                                    definition: 'Suggested quantity calculated for the requisition of DPM.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                expirationDate: {
                                    name: 'expirationDate',
                                    label: 'Validade',
                                    indicator: 'EX',
                                    displayOrder: 27,
                                    isDisplayed: true,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'The expiry date of the lot code ' +
                                    'which will be expired first since today.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'TEXT'
                                    }
                                },
                                beginningBalance: {
                                    name: 'beginningBalance',
                                    label: 'Stock Inicial',
                                    indicator: 'A',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Based on the Stock On Hand from the previous ' +
                                    'period. This is quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                'orderable.dispensable.displayUnit': {
                                    name: 'orderable.dispensable.displayUnit',
                                    label: 'Unidade',
                                    indicator: 'U',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    source: 'REFERENCE_DATA',
                                    option: null,
                                    definition: 'Dispensing unit for this product.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'TEXT'
                                    }
                                },
                                approvedQuantity: {
                                    name: 'approvedQuantity',
                                    label: 'Quantidade Aprovada',
                                    indicator: 'K',
                                    displayOrder: 17,
                                    isDisplayed: true,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Final approved quantity. This is quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                totalReceivedQuantity: {
                                    name: 'totalReceivedQuantity',
                                    label: 'Entradas',
                                    indicator: 'B',
                                    displayOrder: 5,
                                    isDisplayed: true,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Total quantity received in the reporting period.'
                                    + 'This is quantified in dispensing units.',
                                    tag: 'received',
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                'orderable.fullProductName': {
                                    name: 'orderable.fullProductName',
                                    label: 'MEDICAMENTO',
                                    indicator: 'R',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    source: 'REFERENCE_DATA',
                                    option: null,
                                    definition: 'Primary name of the product.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: false,
                                        columnType: 'TEXT'
                                    }
                                },
                                pricePerPack: {
                                    name: 'pricePerPack',
                                    label: 'Price per pack',
                                    indicator: 'T',
                                    displayOrder: 22,
                                    isDisplayed: false,
                                    source: 'REFERENCE_DATA',
                                    option: null,
                                    definition: 'Price per pack. Will be blank if price is not defined.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'CURRENCY'
                                    }
                                },
                                calculatedOrderQuantityIsa: {
                                    name: 'calculatedOrderQuantityIsa',
                                    label: 'Calc Order Qty ISA',
                                    indicator: 'S',
                                    displayOrder: 30,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Calculated Order Quantity ISA is based on an ISA' +
                                    'configured by commodity type, and several ' +
                                    'trade items may fill for one commodity type.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                requestedQuantityExplanation: {
                                    name: 'requestedQuantityExplanation',
                                    label: 'Requested quantity explanation',
                                    indicator: 'W',
                                    displayOrder: 18,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Explanation of request for a quantity ' +
                                    'other than calculated order quantity.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'TEXT'
                                    }
                                },
                                difference: {
                                    name: 'difference',
                                    label: 'Diferença',
                                    indicator: 'DI',
                                    displayOrder: 10,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Difference=Inventory -(Stock at Beginning of '
                                    + 'Period + Sum of Entries - Issues).',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                averageConsumption: {
                                    name: 'averageConsumption',
                                    label: 'Average consumption',
                                    indicator: 'P',
                                    displayOrder: 12,
                                    isDisplayed: false,
                                    source: 'STOCK_CARDS',
                                    option: null,
                                    definition: 'Average consumption over a specified '
                                    + 'number of periods/months. Quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                calculatedOrderQuantity: {
                                    name: 'calculatedOrderQuantity',
                                    label: 'Quantidade do pedido',
                                    indicator: 'I',
                                    displayOrder: 28,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Actual quantity needed after deducting stock ' +
                                    'in hand. This is quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                totalCost: {
                                    name: 'totalCost',
                                    label: 'Total cost',
                                    indicator: 'Q',
                                    displayOrder: 24,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: null,
                                    definition: 'Total cost of the product based on quantity '
                                    + 'requested. Will be blank if price is not defined.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'CURRENCY'
                                    }
                                },
                                remarks: {
                                    name: 'remarks',
                                    label: 'Remarks',
                                    indicator: 'L',
                                    displayOrder: 19,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Any additional remarks.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'TEXT'
                                    }
                                },
                                maximumStockQuantity: {
                                    name: 'maximumStockQuantity',
                                    label: 'Maximum stock quantity',
                                    indicator: 'H',
                                    displayOrder: 26,
                                    isDisplayed: false,
                                    source: 'CALCULATED',
                                    option: {
                                        id: 'ff2b350c-37f2-4801-b21e-27ca12c12b3c',
                                        optionName: 'default',
                                        optionLabel: 'requisitionConstants.default'
                                    },
                                    definition: 'Maximum stock calculated based on ' +
                                    'consumption and max stock amounts. Quantified in dispensing units.',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                authorizedQuantity: {
                                    name: 'authorizedQuantity',
                                    label: 'Quantity Authorized',
                                    indicator: 'QA',
                                    displayOrder: 15,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Final authorized quantity. This is quantified in dispensing units',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                },
                                additionalQuantityRequired: {
                                    name: 'additionalQuantityRequired',
                                    label: 'Additional quantity required',
                                    indicator: 'Z',
                                    displayOrder: 31,
                                    isDisplayed: false,
                                    source: 'USER_INPUT',
                                    option: null,
                                    definition: 'Additional quantity required for new patients',
                                    tag: null,
                                    columnDefinition: {
                                        canChangeOrder: true,
                                        columnType: 'NUMERIC'
                                    }
                                }
                            },
                            extension: {
                                id: '42f659bb-131f-445b-ac2c-e91baadad3ec',
                                requisitionTemplateId: '5d4d9924-c0a1-4c5e-90df-3ed2bbec5921',
                                enableConsultationNumber: false,
                                enableKitUsage: false,
                                enableProduct: true,
                                enableRegimen: true,
                                enableRapidTestConsumption: false,
                                enableUsageInformation: false,
                                enableQuicklyFill: true,
                                enableAgeGroup: false,
                                enablePatient: true
                            }
                        },
                        statusChanges: {
                            RELEASED: {
                                authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                                changeDate: '2022-08-01T05:16:06.593Z'
                            },
                            IN_APPROVAL: {
                                authorId: '3074fd01-2d12-4eb2-b9e0-73962338d7ab',
                                changeDate: '2022-07-30T08:17:11.199Z'
                            },
                            SUBMITTED: {
                                authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                                changeDate: '2022-07-30T07:40:01.365Z'
                            },
                            INITIATED: {
                                authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                                changeDate: '2022-07-30T07:37:47.937Z'
                            },
                            APPROVED: {
                                authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                                changeDate: '2022-07-30T08:21:18.656Z'
                            },
                            AUTHORIZED: {
                                authorId: 'de8007a2-3524-49bb-83bd-54d89c44dd20',
                                changeDate: '2022-07-30T08:15:24.572Z'
                            }
                        },
                        statusHistory: [{
                            status: 'SUBMITTED',
                            statusMessageDto: {
                                id: '96b2cbc4-5f68-41d5-849f-7a7f74bf8d87',
                                requisitionId: '665778fb-b690-44e1-a219-27c7efcca2b0',
                                statusChangeId: '1d38f104-a9a3-4865-84a5-87d17737a193',
                                authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                                authorFirstName: 'cs',
                                authorLastName: 'mocumbi',
                                status: 'SUBMITTED',
                                body: 'yyds',
                                createdDate: '2022-07-30T07:40:01.365Z'
                            },
                            authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                            createdDate: '2022-07-30T07:40:01.365Z'
                        }, {
                            status: 'IN_APPROVAL',
                            statusMessageDto: null,
                            authorId: '3074fd01-2d12-4eb2-b9e0-73962338d7ab',
                            createdDate: '2022-07-30T08:17:11.199Z'
                        }, {
                            status: 'AUTHORIZED',
                            statusMessageDto: null,
                            authorId: 'de8007a2-3524-49bb-83bd-54d89c44dd20',
                            createdDate: '2022-07-30T08:15:24.572Z'
                        }, {
                            status: 'INITIATED',
                            statusMessageDto: null,
                            authorId: 'decbace7-182e-4b48-8dca-5be09b0a73f3',
                            createdDate: '2022-07-30T07:37:47.937Z'
                        }, {
                            status: 'APPROVED',
                            statusMessageDto: null,
                            authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                            createdDate: '2022-07-30T08:21:18.656Z'
                        }, {
                            status: 'RELEASED',
                            statusMessageDto: null,
                            authorId: '00ae0076-67ec-40c9-ab04-82f6c9ba6ad9',
                            createdDate: '2022-08-01T05:16:06.593Z'
                        }],
                        stockAdjustmentReasons: [{
                            id: '448153bc-df64-11e9-9e7e-4c32759554d9',
                            name: 'Issue',
                            reasonType: 'DEBIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: 'f8bb41e2-ab43-4781-ae7a-7bf3b5116b82',
                            name: 'Stock Inicial Insuficiente',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: 'e3fc3cf3-da18-44b0-a220-77c985202e06',
                            name: 'Transfer In',
                            reasonType: 'CREDIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: 'b5c27da7-bdda-4790-925a-9484c5dfb594',
                            name: 'Consumido',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '84eb13c3-3e54-4687-8a5f-a9f20dcd0dac',
                            name: 'Stock Inicial Excessivo',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '448152fe-df64-11e9-9e7e-4c32759554d9',
                            name: 'Devolução para o DDM',
                            description: 'Return to DDM ',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44815222-df64-11e9-9e7e-4c32759554d9',
                            name: 'Saída para quarentena, no caso de problemas relativos a qualidade',
                            description: 'Product defective, moved to quarantine',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '4481515a-df64-11e9-9e7e-4c32759554d9',
                            name: 'Devolução de expirados quarentena (ou depósito fornecedor)',
                            description: 'Drugs in quarantine have expired, returned to Supplier',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44815088-df64-11e9-9e7e-4c32759554d9',
                            name: 'Danificado no depósito',
                            description: 'Damaged in the warehouse',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814fde-df64-11e9-9e7e-4c32759554d9',
                            name: 'Correcção de inventário, ' +
                            'no caso do stock em falta (stock é inferior ao existente na ficha de stock)',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814f2a-df64-11e9-9e7e-4c32759554d9',
                            name: 'Empréstimos (para todos níveis) que dão saída do depósito',
                            description: 'Loans made from a health facility deposit',
                            reasonType: 'DEBIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814e30-df64-11e9-9e7e-4c32759554d9',
                            name: 'Retorno da quarentena, ' +
                            'no caso de se confirmar a qualidade do produto',
                            description: 'Returns from Quarantine, in the case of quarantined product being' +
                            'fit for use',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814cc8-df64-11e9-9e7e-4c32759554d9',
                            name: 'Doações ao Depósito',
                            description: 'Donations to Deposit',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814bc4-df64-11e9-9e7e-4c32759554d9',
                            name: 'Receive',
                            reasonType: 'CREDIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: '44814a0c-df64-11e9-9e7e-4c32759554d9',
                            name: 'Devolução de expirados (US e Depósitos Beneficiários)',
                            description: 'Returns of expired drugs (HF and dependent wards)',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '448148b8-df64-11e9-9e7e-4c32759554d9',
                            name: 'Devolução dos clientes (US e Depósitos Beneficiários)',
                            description: 'Returns from Customers(HF and dependent wards)',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '448147f0-df64-11e9-9e7e-4c32759554d9',
                            name: 'Correcção de inventário, no caso do' +
                            'stock em excesso (stock é superior ao existente na ficha de stock)',
                            description: 'Inventory correction in case of under stock on Stock'
                            + 'card (Stock on hand is more than stock in stock card)',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '44814746-df64-11e9-9e7e-4c32759554d9',
                            name: 'Empréstimos (de todos os níveis) que dão entrada no depósito',
                            description: 'Loans received at the health facility deposit',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: '313f2f5f-0c22-4626-8c49-3554ef763de3',
                            name: 'Recebido',
                            reasonType: 'CREDIT',
                            reasonCategory: 'ADJUSTMENT',
                            isFreeTextAllowed: true,
                            hidden: false
                        }, {
                            id: 'a389abfc-3084-11ec-bea8-acde48001122',
                            name: 'Danificado/quebrado/derramado',
                            description: 'Damaged/broken/spilled',
                            reasonType: 'DEBIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: 'a389af30-3084-11ec-bea8-acde48001122',
                            name: 'Recebido a menos',
                            description: 'Received less quantities than expected',
                            reasonType: 'DEBIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: 'a389b034-3084-11ec-bea8-acde48001122',
                            name: 'Fora do prazo de validade',
                            description: 'Expired products',
                            reasonType: 'DEBIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }, {
                            id: 'a389b08e-3084-11ec-bea8-acde48001122',
                            name: 'Impróprio para o consumo',
                            description: 'Inappropriate for consumption',
                            reasonType: 'DEBIT',
                            reasonCategory: 'TRANSFER',
                            isFreeTextAllowed: false,
                            hidden: false
                        }],
                        extraData: {
                            signaure: {
                                submit: 'yyds',
                                approve: ['yyds', 'yyds'],
                                authorize: 'yyds'
                            },
                            actualEndDate: '2022-06-20',
                            actualStartDate: '2022-05-21',
                            isSaved: false
                        },
                        facility: {
                            id: 'b82b088e-cfcf-11e9-9535-0242ac130005',
                            href: 'http://qa.siglus.us.internal/api/facilities/b82b088e-cfcf-11e9-9535-0242ac130005'
                        },
                        program: {
                            id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            href: 'http://qa.siglus.us.internal/api/programs/10845cb9-d365-4aaa-badd-b4fa39c6a26a'
                        },
                        processingPeriod: {
                            id: 'bc7390c1-6a7c-4fe5-aac6-d5fcb391bc30',
                            name: 'Junho 2022',
                            startDate: '2022-05-21',
                            endDate: '2022-06-20',
                            processingSchedule: {
                                id: '727bef28-de1c-11e9-8785-0242ac130007',
                                code: 'M1',
                                description: 'Monthly',
                                modifiedDate: null,
                                name: 'Monthly'
                            },
                            description: '21Mai - 20Jun',
                            durationInMonths: 1,
                            extraData: {},
                            submitStartDate: '2022-06-18',
                            submitEndDate: '2022-06-25',
                            currentPeriodRegularRequisitionAuthorized: false
                        },
                        requisitionLineItems: [{
                            id: 'd109dffd-b8c4-4add-a549-668a1dec6ffa',
                            beginningBalance: 240,
                            totalReceivedQuantity: 22,
                            totalLossesAndAdjustments: 0,
                            stockOnHand: 210,
                            totalConsumedQuantity: 30,
                            approvedQuantity: 35,
                            packsToShip: 35,
                            totalCost: 0,
                            skipped: false,
                            adjustedConsumption: 30,
                            previousAdjustedConsumptions: [],
                            averageConsumption: 30,
                            expirationDate: '2024-05-13',
                            stockAdjustments: [],
                            orderable: {
                                productCode: '08S31',
                                dispensable: {
                                    dispensingUnit: 'each',
                                    displayUnit: 'each',
                                    '.displayUnit': ''
                                },
                                fullProductName: 'Tenofovir/Emtricitabina; 300mg+200mg 30 Comp; Comp',
                                description: 'Tenof+Emtricitabina;Emb(300mg+200mg 30 Comp)',
                                netContent: 1,
                                packRoundingThreshold: 1,
                                roundToZero: false,
                                programs: [{
                                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                    orderableCategoryDisplayName: 'Default',
                                    orderableCategoryDisplayOrder: 0,
                                    active: true,
                                    fullSupply: true,
                                    displayOrder: 0
                                }],
                                children: [],
                                identifiers: {
                                    tradeItem: '4787a3f5-8eeb-4869-bc45-8950af84ec00'
                                },
                                extraData: {
                                    isTracer: false
                                },
                                meta: {
                                    versionNumber: 2,
                                    lastUpdated: '2022-07-04T06:45:12.825Z'
                                },
                                id: '2698abe3-f795-40f9-8a92-7338f1b1782d',
                                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                                latest: false,
                                _id: '2698abe3-f795-40f9-8a92-7338f1b1782d/2',
                                _rev: '2-a0893cda53a446d6b1577b665ae96992',
                                '.productCode': '',
                                '.fullProductName': ''
                            },
                            approvedProduct: {
                                orderable: {
                                    productCode: '08S31',
                                    dispensable: {
                                        dispensingUnit: 'each',
                                        displayUnit: 'each'
                                    },
                                    fullProductName: 'Tenofovir/Emtricitabina; 300mg+200mg 30 Comp; Comp',
                                    description: 'Tenof+Emtricitabina;Emb(300mg+200mg 30 Comp)',
                                    netContent: 1,
                                    packRoundingThreshold: 1,
                                    roundToZero: false,
                                    programs: [{
                                        programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                        orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                        orderableCategoryDisplayName: 'Default',
                                        orderableCategoryDisplayOrder: 0,
                                        active: true,
                                        fullSupply: true,
                                        displayOrder: 0
                                    }],
                                    children: [],
                                    identifiers: {
                                        tradeItem: '4787a3f5-8eeb-4869-bc45-8950af84ec00'
                                    },
                                    extraData: {
                                        isTracer: false
                                    },
                                    meta: {
                                        versionNumber: 2,
                                        lastUpdated: '2022-07-04T06:45:12.825Z'
                                    },
                                    id: '2698abe3-f795-40f9-8a92-7338f1b1782d'
                                },
                                program: {
                                    code: 'T',
                                    name: 'TARV',
                                    active: true,
                                    periodsSkippable: false,
                                    skipAuthorization: false,
                                    showNonFullSupplyTab: false,
                                    enableDatePhysicalStockCountCompleted: false,
                                    id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a'
                                },
                                facilityType: {
                                    code: 'CS',
                                    name: 'CS - Centro de Saúde',
                                    displayOrder: 17,
                                    active: true,
                                    id: '26834258-faa0-420b-a83b-a9af60c605c8'
                                },
                                maxPeriodsOfStock: 3,
                                active: true,
                                meta: {
                                    versionNumber: 1,
                                    lastUpdated: '2020-11-25T09:27:00.36Z'
                                },
                                id: '7fd83b6f-df9d-42cf-8034-7cd34aada28d',
                                lastModified: null,
                                latest: true,
                                _id: '7fd83b6f-df9d-42cf-8034-7cd34aada28d/1',
                                _rev: '1-07ce13c134194026a156dfae54583c2c'
                            }
                        }, {
                            id: 'c02cd7a1-0624-4d07-90e5-501b1555402a',
                            beginningBalance: 210,
                            totalReceivedQuantity: 20,
                            totalLossesAndAdjustments: 0,
                            stockOnHand: 160,
                            totalConsumedQuantity: 50,
                            approvedQuantity: 50,
                            packsToShip: 50,
                            totalCost: 0,
                            skipped: false,
                            adjustedConsumption: 50,
                            previousAdjustedConsumptions: [],
                            averageConsumption: 50,
                            expirationDate: '2024-05-13',
                            stockAdjustments: [],
                            orderable: {
                                productCode: '08S30ZY',
                                dispensable: {
                                    dispensingUnit: 'each',
                                    displayUnit: 'each',
                                    '.displayUnit': ''
                                },
                                fullProductName: 'Dolutegravir; 50 mg 30 comp; Comp',
                                description: '',
                                netContent: 1,
                                packRoundingThreshold: 1,
                                roundToZero: false,
                                programs: [{
                                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                    orderableCategoryDisplayName: 'Default',
                                    orderableCategoryDisplayOrder: 0,
                                    active: true,
                                    fullSupply: true,
                                    displayOrder: 0
                                }],
                                children: [],
                                identifiers: {
                                    tradeItem: '4447e6cd-a36f-47d5-909e-4f04469663d2'
                                },
                                extraData: {
                                    isTracer: false
                                },
                                meta: {
                                    versionNumber: 2,
                                    lastUpdated: '2022-07-04T06:43:39.511Z'
                                },
                                id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                                latest: true,
                                _id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215/2',
                                _rev: '1-d079f6f90a644e0082796e30eb677535',
                                '.productCode': '',
                                '.fullProductName': ''
                            },
                            approvedProduct: {
                                orderable: {
                                    productCode: '08S30ZY',
                                    dispensable: {
                                        dispensingUnit: 'each',
                                        displayUnit: 'each'
                                    },
                                    fullProductName: 'Dolutegravir; 50 mg 30 comp; Comp',
                                    description: '',
                                    netContent: 1,
                                    packRoundingThreshold: 1,
                                    roundToZero: false,
                                    programs: [{
                                        programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                        orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                        orderableCategoryDisplayName: 'Default',
                                        orderableCategoryDisplayOrder: 0,
                                        active: true,
                                        fullSupply: true,
                                        displayOrder: 0
                                    }],
                                    children: [],
                                    identifiers: {
                                        tradeItem: '4447e6cd-a36f-47d5-909e-4f04469663d2'
                                    },
                                    extraData: {
                                        isTracer: false
                                    },
                                    meta: {
                                        versionNumber: 2,
                                        lastUpdated: '2022-07-04T06:43:39.511Z'
                                    },
                                    id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215'
                                },
                                program: {
                                    code: 'T',
                                    name: 'TARV',
                                    active: true,
                                    periodsSkippable: false,
                                    skipAuthorization: false,
                                    showNonFullSupplyTab: false,
                                    enableDatePhysicalStockCountCompleted: false,
                                    id: '10845cb9-d365-4aaa-badd-b4fa39c6a26a'
                                },
                                facilityType: {
                                    code: 'CS',
                                    name: 'CS - Centro de Saúde',
                                    displayOrder: 17,
                                    active: true,
                                    id: '26834258-faa0-420b-a83b-a9af60c605c8'
                                },
                                maxPeriodsOfStock: 3,
                                active: true,
                                meta: {
                                    versionNumber: 1,
                                    lastUpdated: '2020-11-25T09:21:10.24Z'
                                },
                                id: '28f0f607-dedd-449b-ae3b-c6f30410fa11',
                                lastModified: null,
                                latest: true,
                                _id: '28f0f607-dedd-449b-ae3b-c6f30410fa11/1',
                                _rev: '1-a2a034f48851404cb4991e761174d396'
                            }
                        }],
                        availableProducts: [{
                            id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                            href: 'http://qa.siglus.us.internal/api/orderables/9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                            versionNumber: 2
                        }, {
                            id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                            href: 'http://qa.siglus.us.internal/api/orderables/6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                            versionNumber: 2
                        }, {
                            id: '70110486-794d-4a45-b58d-efe60bafe101',
                            href: 'http://qa.siglus.us.internal/api/orderables/70110486-794d-4a45-b58d-efe60bafe101',
                            versionNumber: 2
                        }, {
                            id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                            href: 'http://qa.siglus.us.internal/api/orderables/8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                            versionNumber: 2
                        }, {
                            id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                            href: 'http://qa.siglus.us.internal/api/orderables/e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                            versionNumber: 4
                        }, {
                            id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                            href: 'http://qa.siglus.us.internal/api/orderables/6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                            versionNumber: 2
                        }, {
                            id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                            href: 'http://qa.siglus.us.internal/api/orderables/d7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                            versionNumber: 2
                        }, {
                            id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033',
                            href: 'http://qa.siglus.us.internal/api/orderables/c0da3070-1140-4c0f-a34f-42f6d0da4033',
                            versionNumber: 2
                        }, {
                            id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                            href: 'http://qa.siglus.us.internal/api/orderables/0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                            versionNumber: 2
                        }, {
                            id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                            href: 'http://qa.siglus.us.internal/api/orderables/6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                            versionNumber: 2
                        }, {
                            id: '630066dd-68bc-46ab-82b9-66ea01d3cb66',
                            href: 'http://qa.siglus.us.internal/api/orderables/630066dd-68bc-46ab-82b9-66ea01d3cb66',
                            versionNumber: 2
                        }, {
                            id: '1940111b-d224-44ac-9010-2004b39d9a39',
                            href: 'http://qa.siglus.us.internal/api/orderables/1940111b-d224-44ac-9010-2004b39d9a39',
                            versionNumber: 2
                        }, {
                            id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                            href: 'http://qa.siglus.us.internal/api/orderables/8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                            versionNumber: 2
                        }, {
                            id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                            href: 'http://qa.siglus.us.internal/api/orderables/9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                            versionNumber: 2
                        }, {
                            id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1',
                            href: 'http://qa.siglus.us.internal/api/orderables/c880689e-bd21-4c78-a0a9-5aa6137378c1',
                            versionNumber: 2
                        }, {
                            id: 'cf6da234-677b-4797-a60f-ba55e5154f66',
                            href: 'http://qa.siglus.us.internal/api/orderables/cf6da234-677b-4797-a60f-ba55e5154f66',
                            versionNumber: 2
                        }, {
                            id: '23d4fb12-1300-41ff-963e-562ee13903eb',
                            href: 'http://qa.siglus.us.internal/api/orderables/23d4fb12-1300-41ff-963e-562ee13903eb',
                            versionNumber: 2
                        }, {
                            id: 'c59ae025-2c3b-492e-86d2-513be8be76f3',
                            href: 'http://qa.siglus.us.internal/api/orderables/c59ae025-2c3b-492e-86d2-513be8be76f3',
                            versionNumber: 2
                        }, {
                            id: 'ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                            href: 'http://qa.siglus.us.internal/api/orderables/ee5ebde3-ae37-4f3d-b8fc-f571d34fc215',
                            versionNumber: 2
                        }, {
                            id: '198ade2c-353d-41d5-9462-bddc6636fef1',
                            href: 'http://qa.siglus.us.internal/api/orderables/198ade2c-353d-41d5-9462-bddc6636fef1',
                            versionNumber: 2
                        }, {
                            id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c',
                            href: 'http://qa.siglus.us.internal/api/orderables/b956ced2-6b28-4ae3-9667-96e57a18d70c',
                            versionNumber: 1
                        }, {
                            id: 'f3d39029-5c4f-4608-908d-0cea937d4045',
                            href: 'http://qa.siglus.us.internal/api/orderables/f3d39029-5c4f-4608-908d-0cea937d4045',
                            versionNumber: 5
                        }, {
                            id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003',
                            href: 'http://qa.siglus.us.internal/api/orderables/f8bdb62d-916a-425c-a0fa-6671fbed0003',
                            versionNumber: 2
                        }, {
                            id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                            href: 'http://qa.siglus.us.internal/api/orderables/45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                            versionNumber: 1
                        }, {
                            id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                            href: 'http://qa.siglus.us.internal/api/orderables/bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                            versionNumber: 2
                        }, {
                            id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                            href: 'http://qa.siglus.us.internal/api/orderables/4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                            versionNumber: 2
                        }, {
                            id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                            href: 'http://qa.siglus.us.internal/api/orderables/7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                            versionNumber: 1
                        }, {
                            id: 'f5160677-3212-4aa4-89bc-19bb507e9f84',
                            href: 'http://qa.siglus.us.internal/api/orderables/f5160677-3212-4aa4-89bc-19bb507e9f84',
                            versionNumber: 3
                        }, {
                            id: '53b4248b-879c-4012-8a0d-1609a65a2a31',
                            href: 'http://qa.siglus.us.internal/api/orderables/53b4248b-879c-4012-8a0d-1609a65a2a31',
                            versionNumber: 2
                        }, {
                            id: '81239d4b-179a-4b32-bf31-b773b9393165',
                            href: 'http://qa.siglus.us.internal/api/orderables/81239d4b-179a-4b32-bf31-b773b9393165',
                            versionNumber: 2
                        }, {
                            id: '95c7909c-404e-4808-aad7-1494ce55eea1',
                            href: 'http://qa.siglus.us.internal/api/orderables/95c7909c-404e-4808-aad7-1494ce55eea1',
                            versionNumber: 2
                        }, {
                            id: 'dfe3d7ba-a675-4c79-8699-fba147184421',
                            href: 'http://qa.siglus.us.internal/api/orderables/dfe3d7ba-a675-4c79-8699-fba147184421',
                            versionNumber: 2
                        }, {
                            id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                            href: 'http://qa.siglus.us.internal/api/orderables/d5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                            versionNumber: 2
                        }, {
                            id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                            href: 'http://qa.siglus.us.internal/api/orderables/61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                            versionNumber: 2
                        }, {
                            id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                            href: 'http://qa.siglus.us.internal/api/orderables/7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                            versionNumber: 2
                        }, {
                            id: '80d915bf-fb55-4632-81ae-3c3e636a50dc',
                            href: 'http://qa.siglus.us.internal/api/orderables/80d915bf-fb55-4632-81ae-3c3e636a50dc',
                            versionNumber: 2
                        }, {
                            id: 'a399f564-fbc9-47af-a3fb-ea4387072847',
                            href: 'http://qa.siglus.us.internal/api/orderables/a399f564-fbc9-47af-a3fb-ea4387072847',
                            versionNumber: 2
                        }, {
                            id: '2698abe3-f795-40f9-8a92-7338f1b1782d',
                            href: 'http://qa.siglus.us.internal/api/orderables/2698abe3-f795-40f9-8a92-7338f1b1782d',
                            versionNumber: 2
                        }, {
                            id: '32d78103-14f0-4f7c-b396-8ef93ca033c5',
                            href: 'http://qa.siglus.us.internal/api/orderables/32d78103-14f0-4f7c-b396-8ef93ca033c5',
                            versionNumber: 2
                        }, {
                            id: '60b12949-749c-4ed5-b7de-ea18f57be754',
                            href: 'http://qa.siglus.us.internal/api/orderables/60b12949-749c-4ed5-b7de-ea18f57be754',
                            versionNumber: 2
                        }, {
                            id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                            href: 'http://qa.siglus.us.internal/api/orderables/5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                            versionNumber: 2
                        }, {
                            id: '403e3f47-d1b5-482a-864c-05d8a6086970',
                            href: 'http://qa.siglus.us.internal/api/orderables/403e3f47-d1b5-482a-864c-05d8a6086970',
                            versionNumber: 2
                        }, {
                            id: '4b81061e-508e-4e40-87f7-24c86fd1a713',
                            href: 'http://qa.siglus.us.internal/api/orderables/4b81061e-508e-4e40-87f7-24c86fd1a713',
                            versionNumber: 2
                        }, {
                            id: '5c28f59c-e27b-4e79-a017-298b02ec27a3',
                            href: 'http://qa.siglus.us.internal/api/orderables/5c28f59c-e27b-4e79-a017-298b02ec27a3',
                            versionNumber: 2
                        }, {
                            id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                            href: 'http://qa.siglus.us.internal/api/orderables/bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                            versionNumber: 2
                        }, {
                            id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                            href: 'http://qa.siglus.us.internal/api/orderables/dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                            versionNumber: 2
                        }, {
                            id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4',
                            href: 'http://qa.siglus.us.internal/api/orderables/b37951fa-8f51-447a-96d5-43a6dce56bf4',
                            versionNumber: 2
                        }, {
                            id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                            href: 'http://qa.siglus.us.internal/api/orderables/6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                            versionNumber: 2
                        }, {
                            id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                            href: 'http://qa.siglus.us.internal/api/orderables/ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                            versionNumber: 2
                        }, {
                            id: '7119f253-4f95-4fb2-9186-f0a426434cda',
                            href: 'http://qa.siglus.us.internal/api/orderables/7119f253-4f95-4fb2-9186-f0a426434cda',
                            versionNumber: 2
                        }, {
                            id: '4702bf14-6f91-454d-8539-03e2e2afd0ea',
                            href: 'http://qa.siglus.us.internal/api/orderables/4702bf14-6f91-454d-8539-03e2e2afd0ea',
                            versionNumber: 2
                        }, {
                            id: '75fccffe-5575-4074-9ac7-af29f452cec2',
                            href: 'http://qa.siglus.us.internal/api/orderables/75fccffe-5575-4074-9ac7-af29f452cec2',
                            versionNumber: 2
                        }, {
                            id: '95c00deb-9454-4bb1-a347-dad18c576a82',
                            href: 'http://qa.siglus.us.internal/api/orderables/95c00deb-9454-4bb1-a347-dad18c576a82',
                            versionNumber: 2
                        }, {
                            id: '03746692-24a0-4944-9a79-a3d144fbe262',
                            href: 'http://qa.siglus.us.internal/api/orderables/03746692-24a0-4944-9a79-a3d144fbe262',
                            versionNumber: 2
                        }, {
                            id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                            href: 'http://qa.siglus.us.internal/api/orderables/08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                            versionNumber: 2
                        }],
                        isFinalApproval: false,
                        isApprovedByInternal: false,
                        kitUsageLineItems: [],
                        usageInformationLineItems: [],
                        testConsumptionLineItems: [],
                        patientLineItems: [{
                            name: 'newSection0',
                            columns: {
                                new: {
                                    id: '9ae221c7-aa66-4394-8449-d8b1ed18417c',
                                    value: 0
                                },
                                newColumn2: {
                                    id: '1d3195fa-0920-4d6c-85dd-9090cc0bb3d0',
                                    value: 2
                                },
                                newColumn0: {
                                    id: '5a298f58-e17e-42b5-8a55-459593779a48',
                                    value: 2
                                },
                                newColumn1: {
                                    id: 'c256c3b2-cc21-451c-928d-2fd9a902bcf8',
                                    value: 4
                                }
                            },
                            column: {
                                id: '8e6c8636-c7c7-4023-a36f-b62482e4aa0f',
                                name: 'newSection0',
                                label: 'Faixa Etária dos Pacientes TARV',
                                displayOrder: 1,
                                columns: [{
                                    id: '2a1574c0-7a8a-4996-90b4-94ffcc20a6db',
                                    name: 'new',
                                    label: 'Adultos',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Age range for patients in ARV treatment',
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
                                    id: 'ea51f61e-282c-459d-8984-c3c7a049a663',
                                    name: 'newColumn0',
                                    label: 'Pediátricos 0 aos 4 anos',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 0 to 4 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 0 aos 4 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 0 to 4 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'eb82abd4-69cf-4d7b-8173-cd39391a9075',
                                    name: 'newColumn1',
                                    label: 'Pediátricos 5 aos 9 anos',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 5 to 9 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 5 aos 9 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 5 to 9 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'b925556f-403d-43eb-a5fd-256b841357b1',
                                    name: 'newColumn2',
                                    label: 'Pediátricos 10 aos 14 anos',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 10 to 14 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 10 aos 14 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 10 to 14 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection1',
                            columns: {
                                new: {
                                    id: 'c014db95-5357-425a-ba2f-12528eb9bf64',
                                    value: 10
                                },
                                newColumn1: {
                                    id: 'e3ba7043-b221-4b09-ad3c-f6d9c252825f',
                                    value: 2
                                }
                            },
                            column: {
                                id: 'fafc926a-6283-469e-9c16-dac65e1e97a2',
                                name: 'newSection1',
                                label: 'Profilaxia',
                                displayOrder: 2,
                                columns: [{
                                    id: '7a28622b-fed2-41bd-a760-bcb5d2766ce1',
                                    name: 'new',
                                    label: 'PPE',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'PPE',
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
                                    id: '6c14d830-bd19-4daa-a946-44e4da3449a7',
                                    name: 'newColumn1',
                                    label: 'Criança Exposta',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Exposed Child',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Criança Exposta',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Exposed Child',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection2',
                            columns: {
                                newColumn4: {
                                    id: '1279ce7c-91e7-4539-ac3c-c942ef76ef7a',
                                    value: 21
                                },
                                new: {
                                    id: 'c551090d-8a8b-4f33-922e-9b9910fcaf63',
                                    value: 5
                                },
                                newColumn2: {
                                    id: '07303418-ac19-4eda-b450-4092da18ac53',
                                    value: 9
                                },
                                total: {
                                    id: '08966331-b426-4c8b-a0d8-0c2bb4ddd78d',
                                    value: 39
                                },
                                newColumn3: {
                                    id: '56b0ae55-baef-40b6-b977-491b0ea31546',
                                    value: 0
                                },
                                newColumn0: {
                                    id: '68ab256d-5a47-4bf0-9926-d326d96ed79e',
                                    value: 2
                                },
                                newColumn1: {
                                    id: '0e1d8624-acf6-406a-9265-33f25d77d2d9',
                                    value: 2
                                }
                            },
                            column: {
                                id: 'b7ad5b4b-88e7-46e4-a586-32c60d95b92f',
                                name: 'newSection2',
                                label: 'Tipo de Dispensa - Dispensa para 6 Mensal (DS)',
                                displayOrder: 4,
                                columns: [{
                                    id: 'b2bc0e56-de53-4e14-b87f-258fc3cf33dc',
                                    name: 'new',
                                    label: '5 meses atrás',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '5 months ago',
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
                                    id: 'de8ef9de-41a7-45a2-8dd6-8862fa0e4559',
                                    name: 'newColumn0',
                                    label: '4 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '4 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: '4 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '4 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '534ce710-dad3-41f3-a6ce-6ed899d15fbe',
                                    name: 'newColumn1',
                                    label: '3 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '3 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: '3 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '3 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '4c88d45f-e664-419d-82d9-a76b8f2646f2',
                                    name: 'newColumn2',
                                    label: '2 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '2 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: '2 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '2 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'dc40bd4b-2e3f-4930-8a3f-53462bb84442',
                                    name: 'newColumn3',
                                    label: 'Mês Anterior',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Last month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn3',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Anterior',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Last month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'e6b1075b-3ad6-4d3a-ab0b-7cdb92a565d3',
                                    name: 'newColumn4',
                                    label: 'Levantaram no mês',
                                    indicator: 'N',
                                    displayOrder: 5,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn4',
                                        sources: ['USER_INPUT'],
                                        label: 'Levantaram no mês',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 5,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'b17d4182-aaf2-49ce-8797-ede98633b26c',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 6,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection3',
                            columns: {
                                new: {
                                    id: 'dfd0cd97-f33c-4126-bff0-527f99c7c30d',
                                    value: 2
                                },
                                total: {
                                    id: '396353f5-726f-4c4e-878b-ad99960e2f7f',
                                    value: 8
                                },
                                newColumn0: {
                                    id: '5cd18bfe-3277-4651-a2ef-c76c75ac241d',
                                    value: 4
                                },
                                newColumn1: {
                                    id: '1419e7e8-1b68-4f26-84ea-530bd2e5f78a',
                                    value: 2
                                }
                            },
                            column: {
                                id: 'a6799705-99a5-465a-95b9-2a938be0d0b3',
                                name: 'newSection3',
                                label: 'Tipo de Dispensa - Dispensa para 3 Mensal (DT)',
                                displayOrder: 5,
                                columns: [{
                                    id: 'e64abeb2-7473-42b5-aca7-9ac711644369',
                                    name: 'new',
                                    label: '2 meses atrás',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '2 months ago',
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
                                    id: '45a022dd-5322-43ec-8cb2-ff43bdab19ab',
                                    name: 'newColumn0',
                                    label: 'Mês Anterior',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Last month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Anterior',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Last month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '5419e234-9b8f-4c2e-9199-3ddb2a8c2815',
                                    name: 'newColumn1',
                                    label: 'Levantaram no mês',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Levantaram no mês',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '11812c5d-8026-4fe2-b4b3-c1ae3e476380',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection4',
                            columns: {
                                new: {
                                    id: 'fdd80e87-654a-46f8-b31a-e5b9e51bc610',
                                    value: 2
                                },
                                total: {
                                    id: '8b525271-d263-46da-9117-0ab83c2c22e6',
                                    value: 2
                                }
                            },
                            column: {
                                id: '5c714814-021d-4aa9-b4da-7b4e4f5680f6',
                                name: 'newSection4',
                                label: 'Tipo de Dispensa - Dispensa Mensal (DM)',
                                displayOrder: 6,
                                columns: [{
                                    id: '320df9b5-2828-4c5a-91e1-cbc57156d929',
                                    name: 'new',
                                    label: 'Levantaram no mês',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
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
                                    id: 'e43a5e4b-c4fd-4536-b749-c636de0b61ad',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection5',
                            columns: {
                                new: {
                                    id: '930d91f8-3903-4487-8f98-694a55a94d66',
                                    value: 4
                                },
                                total: {
                                    id: 'b194a030-f1ff-4dc4-bf61-9911323525a7',
                                    value: 11
                                },
                                newColumn0: {
                                    id: 'bc59e598-b360-4d9d-b29d-59343ceb07d5',
                                    value: 2
                                },
                                newColumn1: {
                                    id: 'd9af2fa6-ef93-4bc6-b804-cee0ead4a656',
                                    value: 5
                                }
                            },
                            column: {
                                id: '3432aa12-d011-448a-bd89-7255bf6b1a87',
                                name: 'newSection5',
                                label: 'Tipo de Dispensa - Mês Corrente',
                                displayOrder: 7,
                                columns: [{
                                    id: 'a496bac7-28f6-4fd4-947f-2b8abf7aa972',
                                    name: 'new',
                                    label: 'Mês Corrente-DS',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DS',
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
                                    id: '8107462c-fa1d-47d4-800d-0c93272ac1bb',
                                    name: 'newColumn0',
                                    label: 'Mês Corrente-DT',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DT',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Corrente-DT',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month-DT',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '98b066b3-9952-44cd-8bdb-6ee93b52929a',
                                    name: 'newColumn1',
                                    label: 'Mês Corrente-DM',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DM',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Corrente-DM',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month-DM',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '2ddcc161-82cc-4a00-a32d-4f6b11153d0d',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection6',
                            columns: {
                                new: {
                                    id: '05127e6d-069f-4589-b78b-a6678d2bc2d6',
                                    value: 2
                                },
                                total: {
                                    id: 'a2399c08-8967-41c6-bc6b-4aa7d32a4ad9',
                                    value: 9
                                },
                                newColumn0: {
                                    id: '195a396d-e997-42db-b233-e8b44cecb1c8',
                                    value: 4
                                },
                                newColumn1: {
                                    id: '5d0ac908-3fd7-439e-b987-d8300c6966ab',
                                    value: 3
                                }
                            },
                            column: {
                                id: '61204681-71ea-48bb-8c32-ceb91787f8bc',
                                name: 'newSection6',
                                label: 'Tipo de Dispensa - Total de pacientes com tratamento',
                                displayOrder: 8,
                                columns: [{
                                    id: 'ac33c901-104c-4e97-b9af-1d82e6d1558b',
                                    name: 'new',
                                    label: 'Total de pacientes com tratamento-DS',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment-DS',
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
                                    id: '2a7fcc6a-2b69-44a2-a4de-a82c13dbe5ab',
                                    name: 'newColumn0',
                                    label: 'Total de pacientes com tratamento-DM',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment-DM',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de pacientes com tratamento-DM',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Total patients with treatment-DM',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '8a503c16-aa92-48a2-960a-396f69c16190',
                                    name: 'newColumn1',
                                    label: 'Total de pacientes com tratamento-DT',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total de pacientes com tratamento-DT',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de pacientes com tratamento-DT',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Total de pacientes com tratamento-DT',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '7e3fa423-ac99-4476-ac2f-e493a00239bc',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'newSection7',
                            columns: {
                                new: {
                                    id: '0f95dae4-d1e5-4142-b52a-d0cfce06ef14',
                                    value: 3
                                }
                            },
                            column: {
                                id: 'f783361b-2c14-4b1b-8510-896073d175d2',
                                name: 'newSection7',
                                label: 'Tipo de Dispensa - Ajuste',
                                displayOrder: 9,
                                columns: [{
                                    id: '6b65e385-6239-42af-99a1-2f652f54d1ea',
                                    name: 'new',
                                    label: 'Ajuste',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Ajustment',
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
                                }],
                                isDefault: false
                            }
                        }, {
                            name: 'patientType',
                            columns: {
                                new: {
                                    id: 'deb47f40-4435-4598-8bb5-07f2ca8a23b8',
                                    value: 1
                                },
                                newColumn2: {
                                    id: '1cfd8b71-0d69-405c-b94f-a315e13f5994',
                                    value: 4
                                },
                                newColumn3: {
                                    id: 'a271569f-1162-4c9e-8453-e25ffc57845e',
                                    value: 3
                                },
                                newColumn0: {
                                    id: 'd8f15812-1e01-4336-b90a-48c6ac653756',
                                    value: 2
                                },
                                newColumn1: {
                                    id: '39d5f633-9a71-4277-90d0-7c6e9bbddcd5',
                                    value: 0
                                }
                            },
                            column: {
                                id: 'fdd119eb-de41-45c5-a290-1dea04fb5bef',
                                name: 'patientType',
                                label: 'Tipo de doentes em TARV',
                                displayOrder: 0,
                                columns: [{
                                    id: '26c56b06-af89-4ff6-8a69-ed6a34b7516a',
                                    name: 'new',
                                    label: 'Novos',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'New',
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
                                    id: '59eba1cd-04d7-44a2-98df-604d00efe120',
                                    name: 'newColumn0',
                                    label: 'Manutenção',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Maintenance',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Manutenção',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Maintenance',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '7152ed19-dce0-431a-8875-c5b89585c285',
                                    name: 'newColumn1',
                                    label: 'Trânsito',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Transit',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Trânsito',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Transit',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'd530c97d-cfb2-47f6-92b5-c03a69968195',
                                    name: 'newColumn2',
                                    label: 'Transferências',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Transfers',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: 'Transferências',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Transfers',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '0fbed6c5-9759-4b0e-bd78-d70029c9b4ee',
                                    name: 'newColumn3',
                                    label: 'Alteração',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Alteration',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn3',
                                        sources: ['USER_INPUT'],
                                        label: 'Alteração',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Alteration',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: true
                            }
                        }, {
                            name: 'newSection8',
                            columns: {
                                new: {
                                    id: '12a709ae-ca26-40d8-9aba-665902f37d0a',
                                    value: 4
                                },
                                newColumn0: {
                                    id: '78a882b1-4395-43aa-8fb2-a5bc7ba56197',
                                    value: 2
                                }
                            },
                            column: {
                                id: '8e11bcb6-071a-11ed-a27f-acde48001122',
                                name: 'newSection8',
                                label: 'Total global',
                                displayOrder: 3,
                                columns: [{
                                    id: '8e11bfcc-071a-11ed-a27f-acde48001122',
                                    name: 'new',
                                    label: 'Total de pacientes em TARV na US',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the number of total de pacientes em TARV na US',
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
                                    id: '8e11c076-071a-11ed-a27f-acde48001122',
                                    name: 'newColumn0',
                                    label: 'Total de Meses de Terapêutica',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the number of total de Meses de Terapêutica',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de Meses de Terapêutica',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'record the number of total de Meses de Terapêutica',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }
                        }],
                        consultationNumberLineItems: [],
                        regimenLineItems: [{
                            regimen: {
                                id: 'd59f88d2-fbcf-4040-bcb2-6ea8c0590123',
                                code: '2alt3',
                                fullProductName: 'AZT+3TC+ATV/r',
                                active: true,
                                isCustom: false,
                                displayOrder: 69,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '8dd5324c-c737-41d3-a409-399f4c86c472',
                                    value: 0
                                },
                                community: {
                                    id: '41ba6055-d083-4f23-9a27-9088065de21f',
                                    value: 0
                                }
                            }
                        }, {
                            regimen: {
                                id: 'e1aa5e49-b25b-4e2d-9328-0a88d99e998e',
                                code: 'A2Fped Cpts',
                                fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 100/25)',
                                active: true,
                                isCustom: false,
                                displayOrder: 89,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'c0b90f70-96ce-4033-b8af-20071c64694b',
                                    value: 12
                                },
                                community: {
                                    id: '4d93f55b-6497-411f-90d7-25e948d2f5f2',
                                    value: 10
                                }
                            }
                        }, {
                            regimen: {
                                id: '28f52213-325f-4d30-b040-de9ef63519a7',
                                code: 'ABCPedXarope',
                                fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 80/20)',
                                active: true,
                                isCustom: false,
                                displayOrder: 100,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'fa1355ec-67e8-4f49-bb16-da43ba72eced',
                                    value: 0
                                },
                                community: {
                                    id: 'd49610c2-4387-48d8-9922-e1c8161b66ef',
                                    value: 21
                                }
                            }
                        }, {
                            regimen: {
                                id: 'e1169d62-f0ca-4948-8a80-8b0ea4680597',
                                code: '2alt1',
                                fullProductName: 'TDF+3TC+ATV/r',
                                active: true,
                                isCustom: false,
                                displayOrder: 72,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '58f005f0-ba19-45c8-91dc-596b4df54a0a',
                                    value: 3
                                },
                                community: {
                                    id: '89689a8c-79d0-44b3-88f5-5437ce246f53',
                                    value: 2
                                }
                            }
                        }, {
                            regimen: {
                                id: '05c6962f-b06f-4b78-a501-2e931a2fb38b',
                                code: '1alt1',
                                fullProductName: 'ABC+3TC+DTG',
                                active: true,
                                isCustom: false,
                                displayOrder: 66,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '2a9e78e6-a063-4259-9a4b-f63aa5381a4a',
                                    value: 4
                                },
                                community: {
                                    id: '67c16734-46ed-44f6-8dfa-1cea2d8e3d45',
                                    value: 3
                                }
                            }
                        }, {
                            regimen: {
                                id: '8e2d520b-3ea7-4b97-aa23-2a2976597c6c',
                                code: 'A2Fped Xarope',
                                fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 80/20)',
                                active: true,
                                isCustom: false,
                                displayOrder: 101,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'be186a30-2fa0-4bf0-9f3a-3c30ba919412',
                                    value: 0
                                },
                                community: {
                                    id: 'f4f16efe-23ff-41b8-b0df-4ddc18915829',
                                    value: 4
                                }
                            }
                        }, {
                            regimen: {
                                id: 'd35c5d0f-f63a-4a8b-ae71-c357c71b86f4',
                                code: '2alt2',
                                fullProductName: 'ABC+3TC+ATV/r',
                                active: true,
                                isCustom: false,
                                displayOrder: 65,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '76b33c17-86d8-4962-a579-b10bf77c812f',
                                    value: 0
                                },
                                community: {
                                    id: '74bbb306-1e29-49d4-bf2e-be23231b3812',
                                    value: 12
                                }
                            }
                        }, {
                            regimen: {
                                id: '4134c58a-a394-491d-9b70-953e3e89a17c',
                                code: 'ABC12',
                                fullProductName: 'ABC+3TC+LPV/r',
                                active: true,
                                isCustom: false,
                                displayOrder: 50,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '5abe7e42-3b5f-4a86-bca3-495ad71dc23f',
                                    value: 12
                                },
                                community: {
                                    id: '57012793-74c7-4a09-b753-1ca570e72d37',
                                    value: 10
                                }
                            }
                        }, {
                            regimen: {
                                id: '9c694968-9bbd-4ecf-949d-8cbefafd601c',
                                code: 'X6APed',
                                fullProductName: 'ABC+3TC+DTG (2DFCped+DTG50)',
                                active: true,
                                isCustom: false,
                                displayOrder: 84,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '727944f5-a1b1-4f8e-9e1d-f06171ad2d37',
                                    value: 22
                                },
                                community: {
                                    id: 'b51ef887-9fc7-48ee-bf0b-886780f00de0',
                                    value: 45
                                }
                            }
                        }, {
                            regimen: {
                                id: '56e512d7-e190-4781-940e-0215b22768ac',
                                code: 'ABCPedCpts',
                                fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 100/25)',
                                active: true,
                                isCustom: false,
                                displayOrder: 86,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '62eced98-bc3a-45ce-b2f2-2724a17236fc',
                                    value: 12
                                },
                                community: {
                                    id: 'e39e5451-fa62-4093-b4b3-035b61c72f2b',
                                    value: 14
                                }
                            }
                        }, {
                            regimen: {
                                id: 'c11d30e8-209a-48d1-956d-fe3837e086bf',
                                code: '1aLTLD',
                                fullProductName: 'TDF+3TC+DTG',
                                active: true,
                                isCustom: false,
                                displayOrder: 73,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '2a871d81-f4e3-4b3b-b933-5d75d0640fef',
                                    value: 2
                                },
                                community: {
                                    id: '7d1f47dc-c7e4-49a1-a61b-82d937da8928',
                                    value: 3
                                }
                            }
                        }, {
                            regimen: {
                                id: 'cf09202f-3f44-438b-b79a-f541ba04ff4f',
                                code: 'ABCPedGranulos',
                                fullProductName: 'ABC+3TC+LPV/r (2DFC+LPV/r 40/10)',
                                active: true,
                                isCustom: false,
                                displayOrder: 87,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'df8fc5bc-6eb0-427b-8f6d-0f2b556be9f9',
                                    value: 5
                                },
                                community: {
                                    id: 'a5041110-2cb4-4aed-9145-f4d6ab786ed5',
                                    value: 9
                                }
                            }
                        }, {
                            regimen: {
                                id: 'e07904c0-4ad6-415c-bd8d-8252f2f9b5ac',
                                code: '1alt2',
                                fullProductName: 'AZT+3TC+DTG',
                                active: true,
                                isCustom: false,
                                displayOrder: 70,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: '056ee834-f40c-427b-abb0-bd75464c2e9a',
                                    value: 12
                                },
                                community: {
                                    id: '3a7c94b9-348a-4380-85bc-6e2f3fb21850',
                                    value: 14
                                }
                            }
                        }, {
                            regimen: {
                                id: '2a32712d-837c-4e49-be01-363bfc7dedb4',
                                code: 'C7A',
                                fullProductName: 'TDF+3TC+LPV/r',
                                active: true,
                                isCustom: false,
                                displayOrder: 12,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'fdd8c8ce-f670-4295-b26b-526d8461dc7a',
                                    value: 1
                                },
                                community: {
                                    id: '753aade8-6681-4a4a-b3bc-c3a44031569a',
                                    value: 0
                                }
                            }
                        }, {
                            regimen: {
                                id: '9c90fc20-be66-4f23-a06a-865a59919668',
                                code: 'A2Fped Granulos',
                                fullProductName: 'AZT+3TC+LPV/r (2DFC+LPV/r 40/10)',
                                active: true,
                                isCustom: false,
                                displayOrder: 90,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c254a-e53b-11eb-8494-acde48001122',
                                    code: 'PAEDIATRICS',
                                    name: 'Paediatrics',
                                    displayOrder: 2
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'd9cc50c5-0e51-4281-9edf-b2478f7a9aac',
                                    value: 3
                                },
                                community: {
                                    id: '135fd64a-5cb0-4e96-8d51-9d4b7d277b6c',
                                    value: 0
                                }
                            }
                        }, {
                            regimen: {
                                id: 'd8b4aa79-2d8c-4a92-a0a7-de7932fb5f8a',
                                code: 'A4A',
                                fullProductName: 'TDF+3TC+EFV',
                                active: true,
                                isCustom: false,
                                displayOrder: 5,
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                                regimenCategory: {
                                    id: '873c2202-e53b-11eb-8494-acde48001122',
                                    code: 'ADULTS',
                                    name: 'Adults',
                                    displayOrder: 1
                                }
                            },
                            name: null,
                            columns: {
                                patients: {
                                    id: 'f8971d89-3b4a-4b32-a295-cb33d01ac9b4',
                                    value: 0
                                },
                                community: {
                                    id: '0f77f17c-c1b9-431d-b223-74247e13c7d4',
                                    value: 0
                                }
                            }
                        }, {
                            regimen: null,
                            name: 'total',
                            columns: {
                                patients: {
                                    id: '4b26e6d2-79f2-44f2-a7bd-52a2cb103780',
                                    value: 88
                                },
                                community: {
                                    id: '1a0851a5-b176-4303-80f3-23db3d16cfb1',
                                    value: 147
                                }
                            }
                        }],
                        regimenSummaryLineItems: [{
                            name: 'total',
                            columns: {
                                patients: {
                                    id: 'baabcaac-1acc-431a-9c42-aef55bdfcb80',
                                    value: 44
                                },
                                community: {
                                    id: '62b0f8d8-10ea-4ae0-90c4-7f0d019b535a',
                                    value: 46
                                }
                            },
                            column: {
                                id: '23afa289-ce84-4659-afc3-ddb5274f5e15',
                                name: 'total',
                                label: 'Total',
                                indicator: 'SU',
                                displayOrder: 3,
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
                                source: 'CALCULATED',
                                columns: []
                            }
                        }, {
                            name: 'newColumn0',
                            columns: {
                                patients: {
                                    id: '54de4665-0390-4f3a-8f52-2103872b735c',
                                    value: 14
                                },
                                community: {
                                    id: 'f8f29f5e-6446-4a47-84bf-4b78ef61e144',
                                    value: 15
                                }
                            },
                            column: {
                                id: '44189ce2-dfb3-4d77-95c4-fec1dbfd7d12',
                                name: 'newColumn0',
                                label: '2ª Linha',
                                indicator: 'N',
                                displayOrder: 1,
                                isDisplayed: true,
                                option: null,
                                definition: 'display on the second part of the regimen section as the second line',
                                tag: null,
                                columnDefinition: {
                                    id: null,
                                    name: 'newColumn0',
                                    sources: ['USER_INPUT'],
                                    label: '2ª Linha',
                                    indicator: 'N',
                                    mandatory: false,
                                    isDisplayRequired: false,
                                    canBeChangedByUser: true,
                                    supportsTag: true,
                                    definition: 'display on the second part of the regimen section as the second line',
                                    canChangeOrder: true,
                                    columnType: null,
                                    displayOrder: 1,
                                    options: []
                                },
                                source: 'USER_INPUT',
                                columns: []
                            }
                        }, {
                            name: '1stLinhas',
                            columns: {
                                patients: {
                                    id: '4f8d41ee-f17d-4a5b-9b6e-9f0faef75fe9',
                                    value: 20
                                },
                                community: {
                                    id: '8a60a199-24a5-49da-8990-279049fec0e2',
                                    value: 10
                                }
                            },
                            column: {
                                id: '3ba6801b-9bb9-4aaf-a9dd-b109e623d361',
                                name: '1stLinhas',
                                label: '1ª Linha',
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
                                source: 'USER_INPUT',
                                columns: []
                            }
                        }, {
                            name: 'newColumn1',
                            columns: {
                                patients: {
                                    id: '2bf990e5-8576-4b83-a3e9-d6b779905ada',
                                    value: 10
                                },
                                community: {
                                    id: '6219011e-9c8a-42b7-8735-7aa2bb03164a',
                                    value: 21
                                }
                            },
                            column: {
                                id: 'c076a36d-5f72-4fa7-b8a3-6f3f2d63fa6c',
                                name: 'newColumn1',
                                label: '3ª Linha',
                                indicator: 'N',
                                displayOrder: 2,
                                isDisplayed: true,
                                option: null,
                                definition: 'display on the second part of the regimen section as the 3rd line',
                                tag: null,
                                columnDefinition: {
                                    id: null,
                                    name: 'newColumn1',
                                    sources: ['USER_INPUT'],
                                    label: '3ª Linha',
                                    indicator: 'N',
                                    mandatory: false,
                                    isDisplayRequired: false,
                                    canBeChangedByUser: true,
                                    supportsTag: true,
                                    definition: 'display on the second part of the regimen section as the 3rd line',
                                    canChangeOrder: true,
                                    columnType: null,
                                    displayOrder: 2,
                                    options: []
                                },
                                source: 'USER_INPUT',
                                columns: []
                            }
                        }],
                        customRegimens: [{
                            id: '043723a3-7a04-4086-9ca9-87c560336fcf',
                            code: '3La',
                            fullProductName: 'TDF+3TC+RAL+DRV+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 76,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '0c62fad1-61ab-42d5-bd29-2097e53002cb',
                            code: '2Op1',
                            fullProductName: '2as Optimizadas ATV/r',
                            active: true,
                            isCustom: true,
                            displayOrder: 60,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '1a714554-e939-405b-b53c-444375cfc7c7',
                            code: '3Lb',
                            fullProductName: 'AZT+3TC+RAL+DRV+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 14,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '1d2eac88-b55c-4f35-b8ee-4d6680ee138d',
                            code: '2Op3',
                            fullProductName: '2as Optimizadas DRV+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 62,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '54d71cfb-cc01-4a7e-a7df-35983c22ce38',
                            code: '3Lbb',
                            fullProductName: 'ABC+3TC+RAL+DRV+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 68,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '5f0fa21c-f36e-4ddf-81e7-5834037d509d',
                            code: 'A2C',
                            fullProductName: 'AZT+3TC+ABC',
                            active: true,
                            isCustom: true,
                            displayOrder: 48,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'a413ad75-90d7-41be-8f85-e6425c25001f',
                            code: 'X5C',
                            fullProductName: 'ABC+3TC+NVP',
                            active: true,
                            isCustom: true,
                            displayOrder: 45,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'b86f55fb-e8dc-4abb-bff9-3a0864533680',
                            code: '2Op2',
                            fullProductName: '2as Optimizadas ATV/r+RAL',
                            active: true,
                            isCustom: true,
                            displayOrder: 61,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'b8c46e14-735b-4d0f-ab1f-00f16f033473',
                            code: 'PreEP',
                            fullProductName: 'TDF+FTC PreEP',
                            active: true,
                            isCustom: true,
                            displayOrder: 75,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'd2725429-5240-4c78-85f0-bad30b1cc2b9',
                            code: '1TB2',
                            fullProductName: 'ABC+3TC+RAL',
                            active: true,
                            isCustom: true,
                            displayOrder: 67,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'e95fc701-34d5-4775-9f3b-c2c664feae41',
                            code: '3op1',
                            fullProductName: '3a Linha adaptada DRV+RAL+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 63,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'ec6c7950-c62b-4177-b143-3e7ac0ae98d7',
                            code: '3L_3TC',
                            fullProductName: '3TC+RAL+DRV+RTV',
                            active: true,
                            isCustom: true,
                            displayOrder: 64,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'fccacdb0-b116-4978-b75e-422f9984222b',
                            code: 'X5A',
                            fullProductName: 'ABC+3TC+EFV',
                            active: true,
                            isCustom: true,
                            displayOrder: 6,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: 'a71d67b4-95ad-4b16-9486-919ae48b15a4',
                            code: 'A2Cped',
                            fullProductName: 'AZT+3TC+ABC (2FDC+ABC Baby)',
                            active: true,
                            isCustom: true,
                            displayOrder: 49,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c254a-e53b-11eb-8494-acde48001122',
                                code: 'PAEDIATRICS',
                                name: 'Paediatrics',
                                displayOrder: 2
                            }
                        }, {
                            id: '60fe5559-2bec-4b45-9a4b-404b2c7ba7ce',
                            code: 'A2F',
                            fullProductName: 'AZT+3TC+LPV/r',
                            active: true,
                            isCustom: true,
                            displayOrder: 1,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c2202-e53b-11eb-8494-acde48001122',
                                code: 'ADULTS',
                                name: 'Adults',
                                displayOrder: 1
                            }
                        }, {
                            id: '4e2626f2-efa3-418c-99fe-b3dd4b60e72f',
                            code: 'X5APed',
                            fullProductName: 'ABC+3TC+EFV Ped (2DFC+EFV 200)',
                            active: true,
                            isCustom: true,
                            displayOrder: 85,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c254a-e53b-11eb-8494-acde48001122',
                                code: 'PAEDIATRICS',
                                name: 'Paediatrics',
                                displayOrder: 2
                            }
                        }, {
                            id: 'c832c07b-93be-4d4b-a519-61eb3bfde716',
                            code: 'A2Aped',
                            fullProductName: 'AZT+3TC+NVP (3FDC Baby)',
                            active: true,
                            isCustom: true,
                            displayOrder: 4,
                            programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                            realProgramId: '6176fb66-580f-4238-9091-da1109a2d328',
                            regimenCategory: {
                                id: '873c254a-e53b-11eb-8494-acde48001122',
                                code: 'PAEDIATRICS',
                                name: 'Paediatrics',
                                displayOrder: 2
                            }
                        }],
                        ageGroupLineItems: [],
                        usageTemplate: {
                            kitUsage: [{
                                id: '7f9c15ee-a408-4f3f-be99-7c7b94f9ec4a',
                                name: 'collection',
                                label: 'KIT data collection',
                                displayOrder: 0,
                                columns: [{
                                    id: '87cd6f22-5997-4f4d-b759-f1427819205e',
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
                                }, {
                                    id: 'e369fcb1-4f81-4bfe-9710-1656c884f0a1',
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
                                }],
                                isDefault: true
                            }, {
                                id: '4b4d57de-6f98-45a5-9e33-7a514895fe9e',
                                name: 'service',
                                label: 'Services',
                                displayOrder: 1,
                                columns: [{
                                    id: '668a3a0c-a852-423c-b33d-348bd24c4af3',
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
                                }, {
                                    id: '6dd852e3-1f84-4ec9-b7d5-1a9591bfbd9a',
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
                                }],
                                isDefault: true
                            }],
                            patient: [{
                                id: 'fdd119eb-de41-45c5-a290-1dea04fb5bef',
                                name: 'patientType',
                                label: 'Tipo de doentes em TARV',
                                displayOrder: 0,
                                columns: [{
                                    id: '26c56b06-af89-4ff6-8a69-ed6a34b7516a',
                                    name: 'new',
                                    label: 'Novos',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'New',
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
                                    id: '59eba1cd-04d7-44a2-98df-604d00efe120',
                                    name: 'newColumn0',
                                    label: 'Manutenção',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Maintenance',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Manutenção',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Maintenance',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '7152ed19-dce0-431a-8875-c5b89585c285',
                                    name: 'newColumn1',
                                    label: 'Trânsito',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Transit',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Trânsito',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Transit',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'd530c97d-cfb2-47f6-92b5-c03a69968195',
                                    name: 'newColumn2',
                                    label: 'Transferências',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Transfers',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: 'Transferências',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Transfers',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '0fbed6c5-9759-4b0e-bd78-d70029c9b4ee',
                                    name: 'newColumn3',
                                    label: 'Alteração',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Alteration',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn3',
                                        sources: ['USER_INPUT'],
                                        label: 'Alteração',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Alteration',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: true
                            }, {
                                id: '8e6c8636-c7c7-4023-a36f-b62482e4aa0f',
                                name: 'newSection0',
                                label: 'Faixa Etária dos Pacientes TARV',
                                displayOrder: 1,
                                columns: [{
                                    id: '2a1574c0-7a8a-4996-90b4-94ffcc20a6db',
                                    name: 'new',
                                    label: 'Adultos',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Age range for patients in ARV treatment',
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
                                    id: 'ea51f61e-282c-459d-8984-c3c7a049a663',
                                    name: 'newColumn0',
                                    label: 'Pediátricos 0 aos 4 anos',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 0 to 4 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 0 aos 4 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 0 to 4 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'eb82abd4-69cf-4d7b-8173-cd39391a9075',
                                    name: 'newColumn1',
                                    label: 'Pediátricos 5 aos 9 anos',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 5 to 9 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 5 aos 9 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 5 to 9 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'b925556f-403d-43eb-a5fd-256b841357b1',
                                    name: 'newColumn2',
                                    label: 'Pediátricos 10 aos 14 anos',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Pediatric from 10 to 14 years old',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: 'Pediátricos 10 aos 14 anos',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Pediatric from 10 to 14 years old',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }, {
                                id: 'fafc926a-6283-469e-9c16-dac65e1e97a2',
                                name: 'newSection1',
                                label: 'Profilaxia',
                                displayOrder: 2,
                                columns: [{
                                    id: '7a28622b-fed2-41bd-a760-bcb5d2766ce1',
                                    name: 'new',
                                    label: 'PPE',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'PPE',
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
                                    id: '6c14d830-bd19-4daa-a946-44e4da3449a7',
                                    name: 'newColumn1',
                                    label: 'Criança Exposta',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Exposed Child',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Criança Exposta',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Exposed Child',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }, {
                                id: '8e11bcb6-071a-11ed-a27f-acde48001122',
                                name: 'newSection8',
                                label: 'Total global',
                                displayOrder: 3,
                                columns: [{
                                    id: '8e11bfcc-071a-11ed-a27f-acde48001122',
                                    name: 'new',
                                    label: 'Total de pacientes em TARV na US',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the number of total de pacientes em TARV na US',
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
                                    id: '8e11c076-071a-11ed-a27f-acde48001122',
                                    name: 'newColumn0',
                                    label: 'Total de Meses de Terapêutica',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the number of total de Meses de Terapêutica',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de Meses de Terapêutica',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'record the number of total de Meses de Terapêutica',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: false
                            }, {
                                id: 'b7ad5b4b-88e7-46e4-a586-32c60d95b92f',
                                name: 'newSection2',
                                label: 'Tipo de Dispensa - Dispensa para 6 Mensal (DS)',
                                displayOrder: 4,
                                columns: [{
                                    id: 'b2bc0e56-de53-4e14-b87f-258fc3cf33dc',
                                    name: 'new',
                                    label: '5 meses atrás',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '5 months ago',
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
                                    id: 'de8ef9de-41a7-45a2-8dd6-8862fa0e4559',
                                    name: 'newColumn0',
                                    label: '4 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '4 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: '4 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '4 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '534ce710-dad3-41f3-a6ce-6ed899d15fbe',
                                    name: 'newColumn1',
                                    label: '3 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '3 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: '3 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '3 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '4c88d45f-e664-419d-82d9-a76b8f2646f2',
                                    name: 'newColumn2',
                                    label: '2 meses atrás',
                                    indicator: 'N',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '2 months ago',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn2',
                                        sources: ['USER_INPUT'],
                                        label: '2 meses atrás',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: '2 months ago',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 3,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'dc40bd4b-2e3f-4930-8a3f-53462bb84442',
                                    name: 'newColumn3',
                                    label: 'Mês Anterior',
                                    indicator: 'N',
                                    displayOrder: 4,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Last month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn3',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Anterior',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Last month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 4,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'e6b1075b-3ad6-4d3a-ab0b-7cdb92a565d3',
                                    name: 'newColumn4',
                                    label: 'Levantaram no mês',
                                    indicator: 'N',
                                    displayOrder: 5,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn4',
                                        sources: ['USER_INPUT'],
                                        label: 'Levantaram no mês',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 5,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: 'b17d4182-aaf2-49ce-8797-ede98633b26c',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 6,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }, {
                                id: 'a6799705-99a5-465a-95b9-2a938be0d0b3',
                                name: 'newSection3',
                                label: 'Tipo de Dispensa - Dispensa para 3 Mensal (DT)',
                                displayOrder: 5,
                                columns: [{
                                    id: 'e64abeb2-7473-42b5-aca7-9ac711644369',
                                    name: 'new',
                                    label: '2 meses atrás',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: '2 months ago',
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
                                    id: '45a022dd-5322-43ec-8cb2-ff43bdab19ab',
                                    name: 'newColumn0',
                                    label: 'Mês Anterior',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Last month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Anterior',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Last month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '5419e234-9b8f-4c2e-9199-3ddb2a8c2815',
                                    name: 'newColumn1',
                                    label: 'Levantaram no mês',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Levantaram no mês',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '11812c5d-8026-4fe2-b4b3-c1ae3e476380',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }, {
                                id: '5c714814-021d-4aa9-b4da-7b4e4f5680f6',
                                name: 'newSection4',
                                label: 'Tipo de Dispensa - Dispensa Mensal (DM)',
                                displayOrder: 6,
                                columns: [{
                                    id: '320df9b5-2828-4c5a-91e1-cbc57156d929',
                                    name: 'new',
                                    label: 'Levantaram no mês',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month',
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
                                    id: 'e43a5e4b-c4fd-4536-b749-c636de0b61ad',
                                    name: 'total',
                                    label: 'Total de pacientes com tratamento',
                                    indicator: 'PD',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }, {
                                id: '3432aa12-d011-448a-bd89-7255bf6b1a87',
                                name: 'newSection5',
                                label: 'Tipo de Dispensa - Mês Corrente',
                                displayOrder: 7,
                                columns: [{
                                    id: 'a496bac7-28f6-4fd4-947f-2b8abf7aa972',
                                    name: 'new',
                                    label: 'Mês Corrente-DS',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DS',
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
                                    id: '8107462c-fa1d-47d4-800d-0c93272ac1bb',
                                    name: 'newColumn0',
                                    label: 'Mês Corrente-DT',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DT',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Corrente-DT',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month-DT',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '98b066b3-9952-44cd-8bdb-6ee93b52929a',
                                    name: 'newColumn1',
                                    label: 'Mês Corrente-DM',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Within this month-DM',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Mês Corrente-DM',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Within this month-DM',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '2ddcc161-82cc-4a00-a32d-4f6b11153d0d',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }, {
                                id: '61204681-71ea-48bb-8c32-ceb91787f8bc',
                                name: 'newSection6',
                                label: 'Tipo de Dispensa - Total de pacientes com tratamento',
                                displayOrder: 8,
                                columns: [{
                                    id: 'ac33c901-104c-4e97-b9af-1d82e6d1558b',
                                    name: 'new',
                                    label: 'Total de pacientes com tratamento-DS',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment-DS',
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
                                    id: '2a7fcc6a-2b69-44a2-a4de-a82c13dbe5ab',
                                    name: 'newColumn0',
                                    label: 'Total de pacientes com tratamento-DM',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total patients with treatment-DM',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de pacientes com tratamento-DM',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Total patients with treatment-DM',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '8a503c16-aa92-48a2-960a-396f69c16190',
                                    name: 'newColumn1',
                                    label: 'Total de pacientes com tratamento-DT',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total de pacientes com tratamento-DT',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: 'Total de pacientes com tratamento-DT',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'Total de pacientes com tratamento-DT',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }, {
                                    id: '7e3fa423-ac99-4476-ac2f-e493a00239bc',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'PD',
                                    displayOrder: 3,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Total',
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
                                    source: 'CALCULATED'
                                }],
                                isDefault: false
                            }, {
                                id: 'f783361b-2c14-4b1b-8510-896073d175d2',
                                name: 'newSection7',
                                label: 'Tipo de Dispensa - Ajuste',
                                displayOrder: 9,
                                columns: [{
                                    id: '6b65e385-6239-42af-99a1-2f652f54d1ea',
                                    name: 'new',
                                    label: 'Ajuste',
                                    indicator: 'PD',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'Ajustment',
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
                                }],
                                isDefault: false
                            }],
                            regimen: [{
                                id: 'd129537c-8c90-4d46-a696-428b7c6c6638',
                                name: 'regimen',
                                label: 'Regimen',
                                displayOrder: 0,
                                columns: [{
                                    id: '3e0b6ba5-f0ea-40f0-93a5-a93e503b52f0',
                                    name: 'code',
                                    label: 'FNM',
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
                                    id: 'bb1d41be-4153-4e5c-9644-e7a93f3c2419',
                                    name: 'community',
                                    label: 'Farmácia Comunitária',
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
                                }, {
                                    id: '6391b7c1-63a7-4da7-9195-b11ec801e29e',
                                    name: 'patients',
                                    label: 'Total doentes',
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
                                        label: 'Total doentes',
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
                                    id: 'd68d1767-eeec-484f-97cf-44e37915b407',
                                    name: 'regiment',
                                    label: 'REGIME TERAPÊUTICO',
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
                                }],
                                isDefault: true
                            }, {
                                id: '1dd521fd-aa52-4505-9237-1b5ab89934f8',
                                name: 'summary',
                                label: 'Linhas terapêuticas',
                                displayOrder: 1,
                                columns: [{
                                    id: '3ba6801b-9bb9-4aaf-a9dd-b109e623d361',
                                    name: '1stLinhas',
                                    label: '1ª Linha',
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
                                        definition: 'display on the second part of the regimen section '
                                        + 'as the first lines',
                                        canChangeOrder: false,
                                        columnType: 'NUMERIC',
                                        displayOrder: 0,
                                        options: []
                                    },
                                    source: 'USER_INPUT',
                                    columns: []
                                }, {
                                    id: '44189ce2-dfb3-4d77-95c4-fec1dbfd7d12',
                                    name: 'newColumn0',
                                    label: '2ª Linha',
                                    indicator: 'N',
                                    displayOrder: 1,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'display on the second part of the regimen section as the second line',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn0',
                                        sources: ['USER_INPUT'],
                                        label: '2ª Linha',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'display on the second part of the' +
                                        'regimen section as the second line',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 1,
                                        options: []
                                    },
                                    source: 'USER_INPUT',
                                    columns: []
                                }, {
                                    id: 'c076a36d-5f72-4fa7-b8a3-6f3f2d63fa6c',
                                    name: 'newColumn1',
                                    label: '3ª Linha',
                                    indicator: 'N',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'display on the second part of the regimen section as the 3rd line',
                                    tag: null,
                                    columnDefinition: {
                                        id: null,
                                        name: 'newColumn1',
                                        sources: ['USER_INPUT'],
                                        label: '3ª Linha',
                                        indicator: 'N',
                                        mandatory: false,
                                        isDisplayRequired: false,
                                        canBeChangedByUser: true,
                                        supportsTag: true,
                                        definition: 'display on the second part of the regimen section as the 3rd line',
                                        canChangeOrder: true,
                                        columnType: null,
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT',
                                    columns: []
                                }, {
                                    id: '23afa289-ce84-4659-afc3-ddb5274f5e15',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'SU',
                                    displayOrder: 3,
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
                                    source: 'CALCULATED',
                                    columns: []
                                }],
                                isDefault: true
                            }],
                            consultationNumber: [{
                                id: '0b53120e-5cb8-4dea-9072-01361f2801e3',
                                name: 'number',
                                label: 'Consultation Number',
                                displayOrder: 0,
                                columns: [{
                                    id: '31f8148e-bcc8-4f1a-8ef5-235529fda9b2',
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
                                    id: '64f82b3b-6fe6-47af-b829-e893c357c820',
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
                                id: '47ff6a3d-5159-4b4c-bfa4-5c5980ad8c3d',
                                name: 'project',
                                label: 'Test Project',
                                displayOrder: 0,
                                columns: [{
                                    id: '699712b8-6e02-48c8-9e17-19589f4c254f',
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
                                }],
                                isDefault: true
                            }, {
                                id: '71a0a5fd-64a2-4d7b-a552-8a4c29974da4',
                                name: 'outcome',
                                label: 'Test Outcome',
                                displayOrder: 1,
                                columns: [{
                                    id: '80a13208-e800-4ee2-9f3e-9104677538fe',
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
                                    id: '1caebf30-8193-48b3-a10b-7f041c9a6599',
                                    name: 'positive',
                                    label: 'Positive',
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
                                    id: '374c4e10-b358-4a77-8f7f-928570266ba2',
                                    name: 'unjustified',
                                    label: 'Unjustified',
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
                                        definition: 'record the unjustified test outcome '
                                        + 'quantity for each test project',
                                        canChangeOrder: false,
                                        columnType: 'NUMERIC',
                                        displayOrder: 2,
                                        options: []
                                    },
                                    source: 'USER_INPUT'
                                }],
                                isDefault: true
                            }, {
                                id: '0442304c-fbdd-4d03-a176-bc5a6fed623f',
                                name: 'service',
                                label: 'Services',
                                displayOrder: 2,
                                columns: [{
                                    id: 'ecc07964-0ac7-4467-9e04-cdd1228b777a',
                                    name: 'APES',
                                    label: 'APES',
                                    indicator: 'SV',
                                    displayOrder: 2,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the related test outcomes for APES',
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
                                    id: 'd7698fa8-491a-4b0d-bb0f-b2dc1deae6c7',
                                    name: 'HF',
                                    label: 'HF',
                                    indicator: 'SV',
                                    displayOrder: 0,
                                    isDisplayed: true,
                                    option: null,
                                    definition: 'record the test outcome for my facility',
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
                                    id: 'a2fa8726-89b0-4fbb-88a1-94fbb7aa79e3',
                                    name: 'total',
                                    label: 'Total',
                                    indicator: 'SV',
                                    displayOrder: 1,
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
                                    source: 'USER_INPUT'
                                }],
                                isDefault: true
                            }],
                            usageInformation: [{
                                id: 'f9a7f670-b6fd-48d7-b0ec-7330293acfe6',
                                name: 'information',
                                label: 'Product Usage Information',
                                displayOrder: 0,
                                columns: [{
                                    id: '40790eb7-ce2b-493c-9162-4cd23f1b5bb9',
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
                                }, {
                                    id: '2b2001a1-0f8c-43f5-aefe-4525d67cdf8c',
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
                                }],
                                isDefault: true
                            }, {
                                id: '3d5a5331-40cb-45b0-a2ed-05b962cfbfa5',
                                name: 'service',
                                label: 'Services',
                                displayOrder: 1,
                                columns: [{
                                    id: '3fc2b2f1-e81a-452f-916d-b5bd34e0cf83',
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
                                    id: '18f1e8c8-924a-4f42-8cae-9a2f5b603ad6',
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
                            }],
                            ageGroup: []
                        },
                        requisitionNumber: 'RNR-NO010805110000002',
                        eTag: null,
                        availableFullSupplyProducts: [{
                            productCode: '08S42',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina/Lamivudina/Nevirapina; 150mg+300mg+200mg 60Cps; Embalagem',
                            description: 'Zidov+Lam+Nevir;Emb(300+150+200)mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'a8ee644e-4c48-4831-8108-3b3577757ecf'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:41.382Z'
                            },
                            id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68/2',
                            _rev: '2-e331b83761354a58851b41dd23a09d7b',
                            archived: false
                        }, {
                            productCode: '08S17Y',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina (AZT); 50mg/5mL 100ml; Susp',
                            description: 'Zidovudina;Sol oral(50mg/5mL 100ml)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '92856d1f-79c2-4af2-968c-958f97c4eb32'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:54.795Z'
                            },
                            id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9/2',
                            _rev: '2-0339fab216384e6cacba9ca4b732ea43',
                            archived: false
                        }, {
                            productCode: '08S30Y',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Darunavir; 600mg 60Comp; Embalagem',
                            description: 'Darunavir;Emb(600mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'af319b00-6ce6-479c-b6a5-01f30a307b12'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:55.087Z'
                            },
                            id: '70110486-794d-4a45-b58d-efe60bafe101',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '70110486-794d-4a45-b58d-efe60bafe101/2',
                            _rev: '2-47f5838f73f341f29c961f93c4dacd4c',
                            archived: false
                        }, {
                            productCode: '08S34B',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Estavudina+Lamivudina+Nevirapina; 6mg + ' +
                            '30mg +50mg, 60 Cps (Baby); Embalagem',
                            description: 'Estav+Lamiv+Nev;Baby Emb(6+30+50)mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '190100e7-cb7d-4e9b-ac51-ac6c71e59c51'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:05.878Z'
                            },
                            id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72/2',
                            _rev: '2-2f9d391e4a27460fa99c5d129b59aa3a',
                            archived: false
                        }, {
                            productCode: '08S01',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir sulfato (ABC); 300mg,60comp; Embalagem',
                            description: 'Abacavir ;Emb(300mg,60comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '22b7f45f-6915-4b57-9450-a61a69fa33d7'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 4,
                                lastUpdated: '2022-07-04T06:45:10.343Z'
                            },
                            id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3/4',
                            _rev: '2-6783f2f53cf548c09bb8c1f462c215d2',
                            archived: false
                        }, {
                            productCode: '08S30Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Darunavir; 300mg 120Comp; Embalagem',
                            description: 'Darunavir;Emb(300mg 120Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '5de66096-5ec3-4177-8d1b-45b80d49a523'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:55.249Z'
                            },
                            id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11/2',
                            _rev: '2-e9eb245e7e5a43f39db95886a20c4140',
                            archived: false
                        }, {
                            productCode: '08S18Y',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+600mg 30Comp; Embalagem',
                            description: 'Tenof+Lamiv+Efavir;Emb(300+300+600mg 30Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'd32d0522-58eb-46a6-bb2e-bf77bdddb1c9'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:51.908Z'
                            },
                            id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97/2',
                            _rev: '2-1cbe5b8502e74ab189072553134b18fd',
                            archived: false
                        }, {
                            productCode: '08S18XII',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 180 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'b7fd29a0-2409-4976-ac9a-076a3c480b80'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:41.161Z'
                            },
                            id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033',
                            lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                            latest: false,
                            _id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033/2',
                            _rev: '2-146d09ae8a9345e080432430318c50b6',
                            archived: false
                        }, {
                            productCode: '08S32Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Estavudina/Lamivudina; 6mg+30mg,60Comp ; Embalagem',
                            description: 'Estavudina+Lamivudina;Emb(6mg+30mg,60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'd35d3513-9f31-4066-b8ef-722cac53a7f9'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:59.993Z'
                            },
                            id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                            lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                            latest: false,
                            _id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e/2',
                            _rev: '2-4127fc2240104038aedc023d8c9180d8',
                            archived: false
                        }, {
                            productCode: '08S01ZW',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 120mg+60mg 60Comp; ',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'f6b427b6-2cf5-4c82-9315-db6a9162591d'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:25.23Z'
                            },
                            id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba/2',
                            _rev: '2-9c268e1812904f4fb0c6ace123d6554f',
                            archived: false
                        }, {
                            productCode: '08S09',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Didanosina (DDI) libertacao lenta; 400mg 30Caps; Embalagem',
                            description: 'Didanosina EC;Emb(400mg 30Caps)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'a3a44c92-6350-4d41-94bc-0c89d463aa80'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:09.351Z'
                            },
                            id: '630066dd-68bc-46ab-82b9-66ea01d3cb66',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '630066dd-68bc-46ab-82b9-66ea01d3cb66/2',
                            _rev: '2-fbb382ffab244734bf25707f7a682d41',
                            archived: false
                        }, {
                            productCode: '08S18XI',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 90 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '81e9b96e-9aad-405c-85a7-844f14d0c867'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:36.844Z'
                            },
                            id: '1940111b-d224-44ac-9010-2004b39d9a39',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '1940111b-d224-44ac-9010-2004b39d9a39/2',
                            _rev: '2-2cf6a12f0f3f48f88a4893f3c915747a',
                            archived: false
                        }, {
                            productCode: '08S42B',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina/Lamivudina/Nevirapina;' +
                            ' 60mg+30mg+50mg 60 Comprimidos; Embalagem',
                            description: 'Zidov+Lamiv+Nev;Emb (60mg+30mg+50mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '4ebbd9c1-5d33-404f-bc71-cae851fb9a9f'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:43.817Z'
                            },
                            id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9/2',
                            _rev: '1-59c2ef0b67544f329a2d1398ee76c7ca',
                            archived: false
                        }, {
                            productCode: '08S39B',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lopinavir/Ritonavir; 100mg+25mg 60Comp; Embalagem',
                            description: 'Lopinavir+Ritonavir;Emb(100mg+25mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '60f794a9-1213-437e-b7d2-46383ac12737'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:38.099Z'
                            },
                            id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a/2',
                            _rev: '2-343e2c6dab5049de9e0ac3c9d5f7572b',
                            archived: false
                        }, {
                            productCode: '08S23',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Nevirapina (NVP); 50mg/5mL 240mL; Susp',
                            description: 'Nevirapina;Susp(50mg/5mL 240ml)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'd4422a66-1888-4159-a180-b57600518824'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:15.416Z'
                            },
                            id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1/2',
                            _rev: '2-22dd77ef90c048ababd055f0815cd6ea',
                            archived: false
                        }, {
                            productCode: '08S16',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina (AZT); 200mg/20mL; Inj',
                            description: 'Zidovudina;Inj(200mg/20mL)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'ea53bc49-0efd-4490-b4a5-2f3720c49414'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:07.751Z'
                            },
                            id: 'cf6da234-677b-4797-a60f-ba55e5154f66',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'cf6da234-677b-4797-a60f-ba55e5154f66/2',
                            _rev: '2-46b93cd521a6473a9b5d028fb2daa855',
                            archived: false
                        }, {
                            productCode: '08S21',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Efavirenz (EFV); 600mg 30Comp; Embalagem',
                            description: 'Efavirenz;Emb(600mg 30Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'b8d48d2a-ed2f-4d1e-a8da-b5c7deebb4c0'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:15.796Z'
                            },
                            id: '23d4fb12-1300-41ff-963e-562ee13903eb',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '23d4fb12-1300-41ff-963e-562ee13903eb/2',
                            _rev: '2-08a83df5e36042759e6314b6b0df5e2b',
                            archived: false
                        }, {
                            productCode: '08S19',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Efavirenz (EFV); 50mg 30Caps; Embalagem',
                            description: 'Efavirenz;Emb(50mg 30Caps)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '192180f4-cc7a-42f8-a9a8-d89151fe200d'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:07.411Z'
                            },
                            id: 'c59ae025-2c3b-492e-86d2-513be8be76f3',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'c59ae025-2c3b-492e-86d2-513be8be76f3/2',
                            _rev: '2-bc9e8d77fee3425bba711f4accf7b14c',
                            archived: false
                        }, {
                            productCode: '08S38Y',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lopinavir + Ritonavir ; 40 mg+10 mg 120Caps; Cap Gran orais',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '9a1a3d3a-abe1-4487-8f23-45572e7d0a33'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:37.655Z'
                            },
                            id: '198ade2c-353d-41d5-9462-bddc6636fef1',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '198ade2c-353d-41d5-9462-bddc6636fef1/2',
                            _rev: '2-ccb9da148b064f8fb49ac45cf9b7be03',
                            archived: false
                        }, {
                            productCode: '08S30ZXi',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Dolutegravir; 10 mg 30 Comp; ',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '91f616b9-1043-4225-88d4-1af5e6cc74bb'
                            },
                            extraData: {},
                            meta: {
                                versionNumber: 1,
                                lastUpdated: '2022-07-21T06:21:33.659Z'
                            },
                            id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c',
                            lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                            archived: false,
                            latest: true,
                            _id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c/1',
                            _rev: '1-49a0a1d5786c4661955ba01ae972751b'
                        }, {
                            productCode: '08S01Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir sulfato (ABC); 60mg, 60comp Baby; Embalagem',
                            description: 'Abacavir ;Emb(60mg, 60comp(Baby))',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'dd334f09-4b7a-474a-bac9-b16c8b84fd96'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 5,
                                lastUpdated: '2022-07-04T06:43:23.266Z'
                            },
                            id: 'f3d39029-5c4f-4608-908d-0cea937d4045',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: 'f3d39029-5c4f-4608-908d-0cea937d4045/5',
                            _rev: '1-cb72f9e84f424905aa07903ff30d4d61',
                            archived: false
                        }, {
                            productCode: '08S18W',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 30 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'd9190f34-b06a-4cd4-ac0f-b98669e04a09'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:51.507Z'
                            },
                            id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003/2',
                            _rev: '2-3a685290b3da46c390fc400b82a0e232',
                            archived: false
                        }, {
                            productCode: '08S30ZX',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Dolutegravir ; 10 mg 90 Comp; ',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '8477f616-4d9b-4495-a68c-f546d8e0649a'
                            },
                            extraData: {},
                            meta: {
                                versionNumber: 1,
                                lastUpdated: '2022-07-21T06:19:03.225Z'
                            },
                            id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                            lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                            archived: false,
                            latest: true,
                            _id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6/1',
                            _rev: '1-36deb6da50724ebdaf877717c5d99045'
                        }, {
                            productCode: '08S39Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lopinavir/Ritonavir; 200mg+50mg 120Comp; Embalagem',
                            description: 'Lopinavir+Ritonavir;Emb(200mg+50mg 120Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '326ee22e-1f03-4783-b48b-d70085f09476'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:44.262Z'
                            },
                            id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c/2',
                            _rev: '2-6de7b954e0a547b299c01174cda1f1e3',
                            archived: false
                        }, {
                            productCode: '08S32',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Estavudina/Lamivudina; 30mg+150mg 60Comp; Embalagem',
                            description: 'Estavudina+Lamivudina;Emb(30mg+150mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'cd438f43-d6f3-4752-a939-8916c42e7b49'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:12.713Z'
                            },
                            id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e/2',
                            _rev: '2-330ccf77bb2b4dd991bcedb31d003139',
                            archived: false
                        }, {
                            productCode: '08S01ZWi',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 120mg+60mg 30Comp; ',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '37c7589e-c678-4a28-b0a0-c68a37144db3'
                            },
                            extraData: {},
                            meta: {
                                versionNumber: 1,
                                lastUpdated: '2022-07-21T06:37:32.945Z'
                            },
                            id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                            lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                            archived: false,
                            latest: true,
                            _id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0/1',
                            _rev: '1-b9bef0a936914842b8f448c3746a650e'
                        }, {
                            productCode: '08S40',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina/Lamivudina; 300mg+150mg 60Comp; Embalagem',
                            description: 'Zidov+Lamiv;Emb(300mg+150mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '987f7b38-892d-4ba9-a732-a238ad6aac7f'
                            },
                            extraData: {
                                isHiv: true
                            },
                            meta: {
                                versionNumber: 3,
                                lastUpdated: '2022-07-04T03:34:04.445Z'
                            },
                            id: 'f5160677-3212-4aa4-89bc-19bb507e9f84',
                            lastModified: 'Mon, 04 Jul 2022 03:34:32 GMT',
                            latest: false,
                            _id: 'f5160677-3212-4aa4-89bc-19bb507e9f84/3',
                            _rev: '2-8b1c27c1129641ab8e9fd29bc900bd18',
                            archived: false
                        }, {
                            productCode: '08S14',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lamivudina(3TC); 50mg/5mL 240mL; Sol Oral',
                            description: 'Lamivudina;Sol oral(50mg/5mL 240mL)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '60f773d7-9e65-40e3-ab9d-cac0aaa4959e'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:08.078Z'
                            },
                            id: '53b4248b-879c-4012-8a0d-1609a65a2a31',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '53b4248b-879c-4012-8a0d-1609a65a2a31/2',
                            _rev: '2-0978a73f3482471eba96b5963afbab50',
                            archived: false
                        }, {
                            productCode: '08S01ZY',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 600mg+300mg, 30Comp; Embalagem',
                            description: 'Abacavir+Lamivudina;Emb(600+300mg 30Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'e6a210d1-b5b0-4ad4-b34d-38983d44cee5'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:24.941Z'
                            },
                            id: '81239d4b-179a-4b32-bf31-b773b9393165',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '81239d4b-179a-4b32-bf31-b773b9393165/2',
                            _rev: '2-502a313fc20c413183686e1369c96111',
                            archived: false
                        }, {
                            productCode: '08S18',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir (TDF); 300mg 30Comp; Embalagem',
                            description: 'Tenofovir;Emb(300mg 30 Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'f3c683fc-5807-4f43-afd4-497e834f340f'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:07.527Z'
                            },
                            id: '95c7909c-404e-4808-aad7-1494ce55eea1',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '95c7909c-404e-4808-aad7-1494ce55eea1/2',
                            _rev: '2-9b386e7e31c344078cf9c002fe5b4ef0',
                            archived: false
                        }, {
                            productCode: '08S18Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir/Lamivudina; 300+300mg 30Comp; Embalagem',
                            description: 'Tenof+Lamiv;Emb(300+300mg 30Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '42bf2a05-03fa-4dc4-b927-a37636f336fd'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:52.542Z'
                            },
                            id: 'dfe3d7ba-a675-4c79-8699-fba147184421',
                            lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                            latest: false,
                            _id: 'dfe3d7ba-a675-4c79-8699-fba147184421/2',
                            _rev: '2-bb354ecbfef447aca2f0037918d48277',
                            archived: false
                        }, {
                            productCode: '08S30ZZ',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Raltegravir; 400mg 60Comp; Embalagem',
                            description: 'Raltegravir;Emb(400mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '200436b9-3b35-4936-b31b-8baf828d7c7d'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:40.479Z'
                            },
                            id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14/2',
                            _rev: '1-35d63f888c2a4c5daebc2da2fddda9b7',
                            archived: false
                        }, {
                            productCode: '08S18X',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 30 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'e0b9632b-64f2-438a-b990-13eae8c26ff8'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:51.783Z'
                            },
                            id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67/2',
                            _rev: '2-72d16932eba14a51b8bf01c5e9b6dcfc',
                            archived: false
                        }, {
                            productCode: '08S22',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Nevirapina (NVP); 200mg 60Comp; Embalagem',
                            description: 'Nevirapina;Emb(200mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '22222a0f-588e-443b-ba16-1e6f78a5379f'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:15.561Z'
                            },
                            id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8/2',
                            _rev: '2-614047b2cbea4e22abaef843c1524035',
                            archived: false
                        }, {
                            productCode: '08S23Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Nevirapina (NVP); 50mg 60Comp Disp; Embalagem',
                            description: 'Nevirapina (NVP);Emb(50mg 60Comp Disp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'bdb2f31f-7cb3-4ca9-b823-1bf1da797539'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:48.003Z'
                            },
                            id: '80d915bf-fb55-4632-81ae-3c3e636a50dc',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '80d915bf-fb55-4632-81ae-3c3e636a50dc/2',
                            _rev: '2-446ddcccfc9844878f9abe249f3e1f92',
                            archived: false
                        }, {
                            productCode: '08S17',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina (AZT); 50mg/5mL 240mL; Sol ',
                            description: 'Zidovudina;Sol oral(50mg/5mL 240ml)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '9e4a7267-7011-4ad4-8a9f-10f2d97851d1'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:07.644Z'
                            },
                            id: 'a399f564-fbc9-47af-a3fb-ea4387072847',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'a399f564-fbc9-47af-a3fb-ea4387072847/2',
                            _rev: '2-389400ecf6824f53b8420ad58465d650',
                            archived: false
                        }, {
                            productCode: '08S08',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Didanosina (DDI) libertacao lenta; 250mg 30Caps; Embalagem',
                            description: 'Didanosina EC;Emb(250mg 30Caps)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'fda2be83-a4e0-4b19-97dd-1e0fe544ca10'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:09.461Z'
                            },
                            id: '32d78103-14f0-4f7c-b396-8ef93ca033c5',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '32d78103-14f0-4f7c-b396-8ef93ca033c5/2',
                            _rev: '2-58059b10d452496691727532036e888c',
                            archived: false
                        }, {
                            productCode: '08S13',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lamivudina(3TC); 150mg 60Comp; Embalagem',
                            description: 'Lamivudina;Emb(150mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'ffac4b78-0a95-4486-bfee-75ffd80ae238'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:08.186Z'
                            },
                            id: '60b12949-749c-4ed5-b7de-ea18f57be754',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '60b12949-749c-4ed5-b7de-ea18f57be754/2',
                            _rev: '2-72e67b6c41af4b619fad766666e80c3d',
                            archived: false
                        }, {
                            productCode: '08S36',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Estavudina/Lamivudina/Nevirapina; 200+150+30mg 60Comp; Embalagem',
                            description: 'Estav+Lamiv+Nevir;Emb(30+150+200mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '0de514df-d3dc-46a7-a10e-bb99f0f3c75b'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:12.486Z'
                            },
                            id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba/2',
                            _rev: '2-7e03938dc41e442b95ee460c5161a3f2',
                            archived: false
                        }, {
                            productCode: '08S30YX',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Darunavir; 400mg 60Comp; Embalagem',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'd0c225ed-6f11-421e-a048-0641f388372f'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:41.655Z'
                            },
                            id: '403e3f47-d1b5-482a-864c-05d8a6086970',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: '403e3f47-d1b5-482a-864c-05d8a6086970/2',
                            _rev: '1-a5d7ef79f5444e17881bda219707c80e',
                            archived: false
                        }, {
                            productCode: '08S01ZZ',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 60mg+30mg, 60Cps; Embalagem',
                            description: 'Abacavir+Lamivudina;Emb(60+30mg 60 Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '3fb10c75-5495-47a0-a82e-dce68dad2f7a'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:25.448Z'
                            },
                            id: '4b81061e-508e-4e40-87f7-24c86fd1a713',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '4b81061e-508e-4e40-87f7-24c86fd1a713/2',
                            _rev: '2-4b3b865735a84aa8ad7c5d9bfa538825',
                            archived: false
                        }, {
                            productCode: '08S30',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Saquinavir ; 200mg 270Caps; Embalagem',
                            description: 'Saquinavir;Emb(200mg 270Caps)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'ee8cb0fa-4ae5-4513-8f5c-72e4e3811613'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:12.951Z'
                            },
                            id: '5c28f59c-e27b-4e79-a017-298b02ec27a3',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '5c28f59c-e27b-4e79-a017-298b02ec27a3/2',
                            _rev: '2-65318be639be4c09a759904ae390c7bb',
                            archived: false
                        }, {
                            productCode: '08S39Y',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lopinavir/Ritonavir (Kaletra); 80mg + 20mg; Sol ',
                            description: 'Lopinavir+Ritonavir (Kaletra);Sol (80mg + 20mg)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: 'e11a7b32-3a60-4e8d-86fd-74e020423652'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:44.147Z'
                            },
                            id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1/2',
                            _rev: '2-af0b8ee2eb0b44078dc86d61aa9687ee',
                            archived: false
                        }, {
                            productCode: '08S17Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina (AZT); 50mg/5mL 200ml; Susp',
                            description: 'Zidovudina;Sol oral(50mg/5mL 200ml)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '08f64873-7570-447c-b12b-980d0cd2a84f'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:55.035Z'
                            },
                            id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416/2',
                            _rev: '2-530f72c9bd31448988f60f335e5238a5',
                            archived: false
                        }, {
                            productCode: '08S18WII',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 180 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '92f7f0a8-667b-479a-996e-b0249f439a2c'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:28.915Z'
                            },
                            id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4/2',
                            _rev: '1-1c8f14a9084749f789310eeddaaa2357',
                            archived: false
                        }, {
                            productCode: '08S40Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Lamivudina+Zidovudina; 30mg+60mg, 60 Comprimidos; Embalagem',
                            description: 'Lamivudina+Zidovudina;Emb(30mg+60mg,60Comps)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '976d1688-e631-420a-8dfa-c8efe03bae8a'
                            },
                            extraData: {
                                isTracer: false,
                                isHiv: true
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:37.317Z'
                            },
                            id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454/2',
                            _rev: '1-3c87fb285a3447c1ad4e4370584a871a',
                            archived: false
                        }, {
                            productCode: '08S29',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Ritonavir ; 100mg 60 comp; Embalagem',
                            description: 'Ritonavir;Emb(100mg 60 comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '98259b08-b0c6-47af-83d3-896f4c902e89'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:14.577Z'
                            },
                            id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc/2',
                            _rev: '2-75ef1a2085ba42a8a2c9006777d9ee8e',
                            archived: false
                        }, {
                            productCode: '08S18WI',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 90 Comp; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '93808911-bd1f-4c3c-899f-407c8a163c76'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:47:37.785Z'
                            },
                            id: '7119f253-4f95-4fb2-9186-f0a426434cda',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '7119f253-4f95-4fb2-9186-f0a426434cda/2',
                            _rev: '2-e835a6886206419a9c69214268218f84',
                            archived: false
                        }, {
                            productCode: '08S30WZ',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Atazanavir 300mg/ritonavir 100mg 30 Comp ; 300+100mg; Comp',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '00533814-9950-4e90-ae28-be5228ae2b90'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:44:14.294Z'
                            },
                            id: '4702bf14-6f91-454d-8539-03e2e2afd0ea',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: '4702bf14-6f91-454d-8539-03e2e2afd0ea/2',
                            _rev: '1-f2c106407ef448a28dc204d99455850d',
                            archived: false
                        }, {
                            productCode: '08S15',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Zidovudina (AZT); 300mg 60Comp; Embalagem',
                            description: 'Zidovudina;Emb(300mg 60Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '450989ce-d162-416d-a98f-8628436aa153'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:07.968Z'
                            },
                            id: '75fccffe-5575-4074-9ac7-af29f452cec2',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '75fccffe-5575-4074-9ac7-af29f452cec2/2',
                            _rev: '2-b3ba89c0e0a54af4afb97dd77effe595',
                            archived: false
                        }, {
                            productCode: '08S03Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Didanosina (DDI); 25mg 60comp; Embalagem',
                            description: 'Didanosina;Emb (25mg 60 Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '9acb28d4-5797-442f-926f-4fe476d0bd75'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:43:26.454Z'
                            },
                            id: '95c00deb-9454-4bb1-a347-dad18c576a82',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: true,
                            _id: '95c00deb-9454-4bb1-a347-dad18c576a82/2',
                            _rev: '1-d27f13a5b2a24fe19900c224d478c601',
                            archived: false
                        }, {
                            productCode: '08S29Z',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Ritonavir; 100mg 30 comp; Embalagem',
                            description: '',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '1c5ab750-91ed-41b6-a8c8-8d180fa911ae'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:46:04.943Z'
                            },
                            id: '03746692-24a0-4944-9a79-a3d144fbe262',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '03746692-24a0-4944-9a79-a3d144fbe262/2',
                            _rev: '2-f1ba1292ab8f405cb1b85742bdc4325f',
                            archived: false
                        }, {
                            productCode: '08S20',
                            dispensable: {
                                dispensingUnit: 'each',
                                displayUnit: 'each'
                            },
                            fullProductName: 'Efavirenz (EFV); 200mg 90Comp; Embalagem',
                            description: 'Efavirenz;Emb(200mg 90Comp)',
                            netContent: 1,
                            packRoundingThreshold: 1,
                            roundToZero: false,
                            programs: [{
                                programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                                orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                                orderableCategoryDisplayName: 'Default',
                                orderableCategoryDisplayOrder: 0,
                                active: true,
                                fullSupply: true,
                                displayOrder: 0
                            }],
                            children: [],
                            identifiers: {
                                tradeItem: '1089d33d-fb05-491e-aca2-5c6580c13839'
                            },
                            extraData: {
                                isTracer: false
                            },
                            meta: {
                                versionNumber: 2,
                                lastUpdated: '2022-07-04T06:45:16.063Z'
                            },
                            id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                            lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                            latest: false,
                            _id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58/2',
                            _rev: '2-55089cc905eb45c1aad3367dc7d19c63',
                            archived: false
                        }],
                        availableNonFullSupplyProducts: []
                    },
                    processScheduled: false,
                    pur: true
                }
            },
            $resolved: true,
            availableFullSupplyProducts: [{
                productCode: '08S42',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina/Lamivudina/Nevirapina; 150mg+300mg+200mg 60Cps; Embalagem',
                description: 'Zidov+Lam+Nevir;Emb(300+150+200)mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'a8ee644e-4c48-4831-8108-3b3577757ecf'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:41.382Z'
                },
                id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '9a11dbf4-84fd-415a-9e43-4b852a27ba68/2',
                _rev: '2-e331b83761354a58851b41dd23a09d7b',
                archived: false
            }, {
                productCode: '08S17Y',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina (AZT); 50mg/5mL 100ml; Susp',
                description: 'Zidovudina;Sol oral(50mg/5mL 100ml)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '92856d1f-79c2-4af2-968c-958f97c4eb32'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:54.795Z'
                },
                id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '6e1dfa47-8f9b-437d-bfbd-ace0adc8c2a9/2',
                _rev: '2-0339fab216384e6cacba9ca4b732ea43',
                archived: false
            }, {
                productCode: '08S30Y',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Darunavir; 600mg 60Comp; Embalagem',
                description: 'Darunavir;Emb(600mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'af319b00-6ce6-479c-b6a5-01f30a307b12'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:55.087Z'
                },
                id: '70110486-794d-4a45-b58d-efe60bafe101',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '70110486-794d-4a45-b58d-efe60bafe101/2',
                _rev: '2-47f5838f73f341f29c961f93c4dacd4c',
                archived: false
            }, {
                productCode: '08S34B',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Estavudina+Lamivudina+Nevirapina; 6mg + 30mg +50mg, 60 Cps (Baby); Embalagem',
                description: 'Estav+Lamiv+Nev;Baby Emb(6+30+50)mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '190100e7-cb7d-4e9b-ac51-ac6c71e59c51'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:05.878Z'
                },
                id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '8e2e2fa1-6bd4-4fc4-ac5c-e0ec1d013d72/2',
                _rev: '2-2f9d391e4a27460fa99c5d129b59aa3a',
                archived: false
            }, {
                productCode: '08S01',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir sulfato (ABC); 300mg,60comp; Embalagem',
                description: 'Abacavir ;Emb(300mg,60comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '22b7f45f-6915-4b57-9450-a61a69fa33d7'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 4,
                    lastUpdated: '2022-07-04T06:45:10.343Z'
                },
                id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'e1c78c05-7292-4155-be9a-d451fe0bfdd3/4',
                _rev: '2-6783f2f53cf548c09bb8c1f462c215d2',
                archived: false
            }, {
                productCode: '08S30Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Darunavir; 300mg 120Comp; Embalagem',
                description: 'Darunavir;Emb(300mg 120Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '5de66096-5ec3-4177-8d1b-45b80d49a523'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:55.249Z'
                },
                id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '6d6fa8cb-47d7-4d41-a8b5-970208b66d11/2',
                _rev: '2-e9eb245e7e5a43f39db95886a20c4140',
                archived: false
            }, {
                productCode: '08S18Y',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+600mg 30Comp; Embalagem',
                description: 'Tenof+Lamiv+Efavir;Emb(300+300+600mg 30Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'd32d0522-58eb-46a6-bb2e-bf77bdddb1c9'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:51.908Z'
                },
                id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'd7ef5d15-7a7e-4873-92ef-9dfb3b98fc97/2',
                _rev: '2-1cbe5b8502e74ab189072553134b18fd',
                archived: false
            }, {
                productCode: '08S18XII',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 180 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'b7fd29a0-2409-4976-ac9a-076a3c480b80'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:41.161Z'
                },
                id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033',
                lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                latest: false,
                _id: 'c0da3070-1140-4c0f-a34f-42f6d0da4033/2',
                _rev: '2-146d09ae8a9345e080432430318c50b6',
                archived: false
            }, {
                productCode: '08S32Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Estavudina/Lamivudina; 6mg+30mg,60Comp ; Embalagem',
                description: 'Estavudina+Lamivudina;Emb(6mg+30mg,60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'd35d3513-9f31-4066-b8ef-722cac53a7f9'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:59.993Z'
                },
                id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e',
                lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                latest: false,
                _id: '0e80e2f0-defe-4187-a77f-bb1cf6f0d69e/2',
                _rev: '2-4127fc2240104038aedc023d8c9180d8',
                archived: false
            }, {
                productCode: '08S01ZW',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 120mg+60mg 60Comp; ',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'f6b427b6-2cf5-4c82-9315-db6a9162591d'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:25.23Z'
                },
                id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '6f089b7c-b7df-4a10-b264-fbcbc8174eba/2',
                _rev: '2-9c268e1812904f4fb0c6ace123d6554f',
                archived: false
            }, {
                productCode: '08S09',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Didanosina (DDI) libertacao lenta; 400mg 30Caps; Embalagem',
                description: 'Didanosina EC;Emb(400mg 30Caps)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'a3a44c92-6350-4d41-94bc-0c89d463aa80'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:09.351Z'
                },
                id: '630066dd-68bc-46ab-82b9-66ea01d3cb66',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '630066dd-68bc-46ab-82b9-66ea01d3cb66/2',
                _rev: '2-fbb382ffab244734bf25707f7a682d41',
                archived: false
            }, {
                productCode: '08S18XI',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 90 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '81e9b96e-9aad-405c-85a7-844f14d0c867'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:36.844Z'
                },
                id: '1940111b-d224-44ac-9010-2004b39d9a39',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '1940111b-d224-44ac-9010-2004b39d9a39/2',
                _rev: '2-2cf6a12f0f3f48f88a4893f3c915747a',
                archived: false
            }, {
                productCode: '08S42B',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina/Lamivudina/Nevirapina; 60mg+30mg+50mg 60 Comprimidos; Embalagem',
                description: 'Zidov+Lamiv+Nev;Emb (60mg+30mg+50mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '4ebbd9c1-5d33-404f-bc71-cae851fb9a9f'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:43.817Z'
                },
                id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: '8744efa8-dd7f-425d-bcf4-73c5e6f38da9/2',
                _rev: '1-59c2ef0b67544f329a2d1398ee76c7ca',
                archived: false
            }, {
                productCode: '08S39B',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lopinavir/Ritonavir; 100mg+25mg 60Comp; Embalagem',
                description: 'Lopinavir+Ritonavir;Emb(100mg+25mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '60f794a9-1213-437e-b7d2-46383ac12737'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:38.099Z'
                },
                id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '9f8b3f20-ae6f-49af-b7a9-ab645057562a/2',
                _rev: '2-343e2c6dab5049de9e0ac3c9d5f7572b',
                archived: false
            }, {
                productCode: '08S23',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Nevirapina (NVP); 50mg/5mL 240mL; Susp',
                description: 'Nevirapina;Susp(50mg/5mL 240ml)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'd4422a66-1888-4159-a180-b57600518824'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:15.416Z'
                },
                id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'c880689e-bd21-4c78-a0a9-5aa6137378c1/2',
                _rev: '2-22dd77ef90c048ababd055f0815cd6ea',
                archived: false
            }, {
                productCode: '08S16',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina (AZT); 200mg/20mL; Inj',
                description: 'Zidovudina;Inj(200mg/20mL)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'ea53bc49-0efd-4490-b4a5-2f3720c49414'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:07.751Z'
                },
                id: 'cf6da234-677b-4797-a60f-ba55e5154f66',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'cf6da234-677b-4797-a60f-ba55e5154f66/2',
                _rev: '2-46b93cd521a6473a9b5d028fb2daa855',
                archived: false
            }, {
                productCode: '08S21',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Efavirenz (EFV); 600mg 30Comp; Embalagem',
                description: 'Efavirenz;Emb(600mg 30Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'b8d48d2a-ed2f-4d1e-a8da-b5c7deebb4c0'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:15.796Z'
                },
                id: '23d4fb12-1300-41ff-963e-562ee13903eb',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '23d4fb12-1300-41ff-963e-562ee13903eb/2',
                _rev: '2-08a83df5e36042759e6314b6b0df5e2b',
                archived: false
            }, {
                productCode: '08S19',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Efavirenz (EFV); 50mg 30Caps; Embalagem',
                description: 'Efavirenz;Emb(50mg 30Caps)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '192180f4-cc7a-42f8-a9a8-d89151fe200d'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:07.411Z'
                },
                id: 'c59ae025-2c3b-492e-86d2-513be8be76f3',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'c59ae025-2c3b-492e-86d2-513be8be76f3/2',
                _rev: '2-bc9e8d77fee3425bba711f4accf7b14c',
                archived: false
            }, {
                productCode: '08S38Y',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lopinavir + Ritonavir ; 40 mg+10 mg 120Caps; Cap Gran orais',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '9a1a3d3a-abe1-4487-8f23-45572e7d0a33'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:37.655Z'
                },
                id: '198ade2c-353d-41d5-9462-bddc6636fef1',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '198ade2c-353d-41d5-9462-bddc6636fef1/2',
                _rev: '2-ccb9da148b064f8fb49ac45cf9b7be03',
                archived: false
            }, {
                productCode: '08S30ZXi',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Dolutegravir; 10 mg 30 Comp; ',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '91f616b9-1043-4225-88d4-1af5e6cc74bb'
                },
                extraData: {},
                meta: {
                    versionNumber: 1,
                    lastUpdated: '2022-07-21T06:21:33.659Z'
                },
                id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c',
                lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                archived: false,
                latest: true,
                _id: 'b956ced2-6b28-4ae3-9667-96e57a18d70c/1',
                _rev: '1-49a0a1d5786c4661955ba01ae972751b'
            }, {
                productCode: '08S01Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir sulfato (ABC); 60mg, 60comp Baby; Embalagem',
                description: 'Abacavir ;Emb(60mg, 60comp(Baby))',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'dd334f09-4b7a-474a-bac9-b16c8b84fd96'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 5,
                    lastUpdated: '2022-07-04T06:43:23.266Z'
                },
                id: 'f3d39029-5c4f-4608-908d-0cea937d4045',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: 'f3d39029-5c4f-4608-908d-0cea937d4045/5',
                _rev: '1-cb72f9e84f424905aa07903ff30d4d61',
                archived: false
            }, {
                productCode: '08S18W',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 30 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'd9190f34-b06a-4cd4-ac0f-b98669e04a09'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:51.507Z'
                },
                id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'f8bdb62d-916a-425c-a0fa-6671fbed0003/2',
                _rev: '2-3a685290b3da46c390fc400b82a0e232',
                archived: false
            }, {
                productCode: '08S30ZX',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Dolutegravir ; 10 mg 90 Comp; ',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '8477f616-4d9b-4495-a68c-f546d8e0649a'
                },
                extraData: {},
                meta: {
                    versionNumber: 1,
                    lastUpdated: '2022-07-21T06:19:03.225Z'
                },
                id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6',
                lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                archived: false,
                latest: true,
                _id: '45466f61-7187-4a11-b0ce-60a7e8c9d6d6/1',
                _rev: '1-36deb6da50724ebdaf877717c5d99045'
            }, {
                productCode: '08S39Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lopinavir/Ritonavir; 200mg+50mg 120Comp; Embalagem',
                description: 'Lopinavir+Ritonavir;Emb(200mg+50mg 120Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '326ee22e-1f03-4783-b48b-d70085f09476'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:44.262Z'
                },
                id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'bad19761-2e7d-4783-8eb6-7b82a2dd8b1c/2',
                _rev: '2-6de7b954e0a547b299c01174cda1f1e3',
                archived: false
            }, {
                productCode: '08S32',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Estavudina/Lamivudina; 30mg+150mg 60Comp; Embalagem',
                description: 'Estavudina+Lamivudina;Emb(30mg+150mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'cd438f43-d6f3-4752-a939-8916c42e7b49'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:12.713Z'
                },
                id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '4a23647e-00f8-46d9-a3d2-7394e54a5f3e/2',
                _rev: '2-330ccf77bb2b4dd991bcedb31d003139',
                archived: false
            }, {
                productCode: '08S01ZWi',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 120mg+60mg 30Comp; ',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '37c7589e-c678-4a28-b0a0-c68a37144db3'
                },
                extraData: {},
                meta: {
                    versionNumber: 1,
                    lastUpdated: '2022-07-21T06:37:32.945Z'
                },
                id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0',
                lastModified: 'Thu, 21 Jul 2022 06:37:32 GMT',
                archived: false,
                latest: true,
                _id: '7b6ff832-611a-4b7e-a971-9d65b6bb66c0/1',
                _rev: '1-b9bef0a936914842b8f448c3746a650e'
            }, {
                productCode: '08S40',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina/Lamivudina; 300mg+150mg 60Comp; Embalagem',
                description: 'Zidov+Lamiv;Emb(300mg+150mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '987f7b38-892d-4ba9-a732-a238ad6aac7f'
                },
                extraData: {
                    isHiv: true
                },
                meta: {
                    versionNumber: 3,
                    lastUpdated: '2022-07-04T03:34:04.445Z'
                },
                id: 'f5160677-3212-4aa4-89bc-19bb507e9f84',
                lastModified: 'Mon, 04 Jul 2022 03:34:32 GMT',
                latest: false,
                _id: 'f5160677-3212-4aa4-89bc-19bb507e9f84/3',
                _rev: '2-8b1c27c1129641ab8e9fd29bc900bd18',
                archived: false
            }, {
                productCode: '08S14',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lamivudina(3TC); 50mg/5mL 240mL; Sol Oral',
                description: 'Lamivudina;Sol oral(50mg/5mL 240mL)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '60f773d7-9e65-40e3-ab9d-cac0aaa4959e'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:08.078Z'
                },
                id: '53b4248b-879c-4012-8a0d-1609a65a2a31',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '53b4248b-879c-4012-8a0d-1609a65a2a31/2',
                _rev: '2-0978a73f3482471eba96b5963afbab50',
                archived: false
            }, {
                productCode: '08S01ZY',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 600mg+300mg, 30Comp; Embalagem',
                description: 'Abacavir+Lamivudina;Emb(600+300mg 30Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'e6a210d1-b5b0-4ad4-b34d-38983d44cee5'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:24.941Z'
                },
                id: '81239d4b-179a-4b32-bf31-b773b9393165',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '81239d4b-179a-4b32-bf31-b773b9393165/2',
                _rev: '2-502a313fc20c413183686e1369c96111',
                archived: false
            }, {
                productCode: '08S18',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir (TDF); 300mg 30Comp; Embalagem',
                description: 'Tenofovir;Emb(300mg 30 Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'f3c683fc-5807-4f43-afd4-497e834f340f'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:07.527Z'
                },
                id: '95c7909c-404e-4808-aad7-1494ce55eea1',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '95c7909c-404e-4808-aad7-1494ce55eea1/2',
                _rev: '2-9b386e7e31c344078cf9c002fe5b4ef0',
                archived: false
            }, {
                productCode: '08S18Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir/Lamivudina; 300+300mg 30Comp; Embalagem',
                description: 'Tenof+Lamiv;Emb(300+300mg 30Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '42bf2a05-03fa-4dc4-b927-a37636f336fd'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:52.542Z'
                },
                id: 'dfe3d7ba-a675-4c79-8699-fba147184421',
                lastModified: 'Mon, 04 Jul 2022 06:48:29 GMT',
                latest: false,
                _id: 'dfe3d7ba-a675-4c79-8699-fba147184421/2',
                _rev: '2-bb354ecbfef447aca2f0037918d48277',
                archived: false
            }, {
                productCode: '08S30ZZ',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Raltegravir; 400mg 60Comp; Embalagem',
                description: 'Raltegravir;Emb(400mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '200436b9-3b35-4936-b31b-8baf828d7c7d'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:40.479Z'
                },
                id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: 'd5d4b2dc-bd2b-4d21-875f-ef1ebcaf0a14/2',
                _rev: '1-35d63f888c2a4c5daebc2da2fddda9b7',
                archived: false
            }, {
                productCode: '08S18X',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir/Lamivudina/Efavirenz; 300+300+400mg 30 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'e0b9632b-64f2-438a-b990-13eae8c26ff8'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:51.783Z'
                },
                id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '61bdc478-1dc0-4eaf-ab84-cac59b31ca67/2',
                _rev: '2-72d16932eba14a51b8bf01c5e9b6dcfc',
                archived: false
            }, {
                productCode: '08S22',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Nevirapina (NVP); 200mg 60Comp; Embalagem',
                description: 'Nevirapina;Emb(200mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '22222a0f-588e-443b-ba16-1e6f78a5379f'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:15.561Z'
                },
                id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '7b8a2d8e-6028-4755-a2d5-5b82d0e883b8/2',
                _rev: '2-614047b2cbea4e22abaef843c1524035',
                archived: false
            }, {
                productCode: '08S23Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Nevirapina (NVP); 50mg 60Comp Disp; Embalagem',
                description: 'Nevirapina (NVP);Emb(50mg 60Comp Disp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'bdb2f31f-7cb3-4ca9-b823-1bf1da797539'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:48.003Z'
                },
                id: '80d915bf-fb55-4632-81ae-3c3e636a50dc',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '80d915bf-fb55-4632-81ae-3c3e636a50dc/2',
                _rev: '2-446ddcccfc9844878f9abe249f3e1f92',
                archived: false
            }, {
                productCode: '08S17',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina (AZT); 50mg/5mL 240mL; Sol ',
                description: 'Zidovudina;Sol oral(50mg/5mL 240ml)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '9e4a7267-7011-4ad4-8a9f-10f2d97851d1'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:07.644Z'
                },
                id: 'a399f564-fbc9-47af-a3fb-ea4387072847',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'a399f564-fbc9-47af-a3fb-ea4387072847/2',
                _rev: '2-389400ecf6824f53b8420ad58465d650',
                archived: false
            }, {
                productCode: '08S08',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Didanosina (DDI) libertacao lenta; 250mg 30Caps; Embalagem',
                description: 'Didanosina EC;Emb(250mg 30Caps)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'fda2be83-a4e0-4b19-97dd-1e0fe544ca10'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:09.461Z'
                },
                id: '32d78103-14f0-4f7c-b396-8ef93ca033c5',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '32d78103-14f0-4f7c-b396-8ef93ca033c5/2',
                _rev: '2-58059b10d452496691727532036e888c',
                archived: false
            }, {
                productCode: '08S13',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lamivudina(3TC); 150mg 60Comp; Embalagem',
                description: 'Lamivudina;Emb(150mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'ffac4b78-0a95-4486-bfee-75ffd80ae238'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:08.186Z'
                },
                id: '60b12949-749c-4ed5-b7de-ea18f57be754',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '60b12949-749c-4ed5-b7de-ea18f57be754/2',
                _rev: '2-72e67b6c41af4b619fad766666e80c3d',
                archived: false
            }, {
                productCode: '08S36',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Estavudina/Lamivudina/Nevirapina; 200+150+30mg 60Comp; Embalagem',
                description: 'Estav+Lamiv+Nevir;Emb(30+150+200mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '0de514df-d3dc-46a7-a10e-bb99f0f3c75b'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:12.486Z'
                },
                id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '5438085b-6dd2-4217-bd11-ea0e3fc0bfba/2',
                _rev: '2-7e03938dc41e442b95ee460c5161a3f2',
                archived: false
            }, {
                productCode: '08S30YX',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Darunavir; 400mg 60Comp; Embalagem',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'd0c225ed-6f11-421e-a048-0641f388372f'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:41.655Z'
                },
                id: '403e3f47-d1b5-482a-864c-05d8a6086970',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: '403e3f47-d1b5-482a-864c-05d8a6086970/2',
                _rev: '1-a5d7ef79f5444e17881bda219707c80e',
                archived: false
            }, {
                productCode: '08S01ZZ',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Abacavir (ABC)+Lamivudina (3TC); 60mg+30mg, 60Cps; Embalagem',
                description: 'Abacavir+Lamivudina;Emb(60+30mg 60 Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '3fb10c75-5495-47a0-a82e-dce68dad2f7a'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:25.448Z'
                },
                id: '4b81061e-508e-4e40-87f7-24c86fd1a713',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '4b81061e-508e-4e40-87f7-24c86fd1a713/2',
                _rev: '2-4b3b865735a84aa8ad7c5d9bfa538825',
                archived: false
            }, {
                productCode: '08S30',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Saquinavir ; 200mg 270Caps; Embalagem',
                description: 'Saquinavir;Emb(200mg 270Caps)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'ee8cb0fa-4ae5-4513-8f5c-72e4e3811613'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:12.951Z'
                },
                id: '5c28f59c-e27b-4e79-a017-298b02ec27a3',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '5c28f59c-e27b-4e79-a017-298b02ec27a3/2',
                _rev: '2-65318be639be4c09a759904ae390c7bb',
                archived: false
            }, {
                productCode: '08S39Y',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lopinavir/Ritonavir (Kaletra); 80mg + 20mg; Sol ',
                description: 'Lopinavir+Ritonavir (Kaletra);Sol (80mg + 20mg)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: 'e11a7b32-3a60-4e8d-86fd-74e020423652'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:44.147Z'
                },
                id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'bfe1dab3-a9f7-479a-afb3-f608151dc3f1/2',
                _rev: '2-af0b8ee2eb0b44078dc86d61aa9687ee',
                archived: false
            }, {
                productCode: '08S17Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina (AZT); 50mg/5mL 200ml; Susp',
                description: 'Zidovudina;Sol oral(50mg/5mL 200ml)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '08f64873-7570-447c-b12b-980d0cd2a84f'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:55.035Z'
                },
                id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'dc453eef-bee1-41e8-a750-ff5d1b6d0416/2',
                _rev: '2-530f72c9bd31448988f60f335e5238a5',
                archived: false
            }, {
                productCode: '08S18WII',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 180 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '92f7f0a8-667b-479a-996e-b0249f439a2c'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:28.915Z'
                },
                id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: 'b37951fa-8f51-447a-96d5-43a6dce56bf4/2',
                _rev: '1-1c8f14a9084749f789310eeddaaa2357',
                archived: false
            }, {
                productCode: '08S40Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Lamivudina+Zidovudina; 30mg+60mg, 60 Comprimidos; Embalagem',
                description: 'Lamivudina+Zidovudina;Emb(30mg+60mg,60Comps)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '976d1688-e631-420a-8dfa-c8efe03bae8a'
                },
                extraData: {
                    isTracer: false,
                    isHiv: true
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:37.317Z'
                },
                id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: '6129fafb-6e91-4d57-93ea-a34c2b5fb454/2',
                _rev: '1-3c87fb285a3447c1ad4e4370584a871a',
                archived: false
            }, {
                productCode: '08S29',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Ritonavir ; 100mg 60 comp; Embalagem',
                description: 'Ritonavir;Emb(100mg 60 comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '98259b08-b0c6-47af-83d3-896f4c902e89'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:14.577Z'
                },
                id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: 'ff4a766b-07b2-4930-b2a4-558cfff6f5fc/2',
                _rev: '2-75ef1a2085ba42a8a2c9006777d9ee8e',
                archived: false
            }, {
                productCode: '08S18WI',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Tenofovir+Lamivudina+Dolutegravir; 300+300+50mg 90 Comp; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '93808911-bd1f-4c3c-899f-407c8a163c76'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:47:37.785Z'
                },
                id: '7119f253-4f95-4fb2-9186-f0a426434cda',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '7119f253-4f95-4fb2-9186-f0a426434cda/2',
                _rev: '2-e835a6886206419a9c69214268218f84',
                archived: false
            }, {
                productCode: '08S30WZ',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Atazanavir 300mg/ritonavir 100mg 30 Comp ; 300+100mg; Comp',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '00533814-9950-4e90-ae28-be5228ae2b90'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:44:14.294Z'
                },
                id: '4702bf14-6f91-454d-8539-03e2e2afd0ea',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: '4702bf14-6f91-454d-8539-03e2e2afd0ea/2',
                _rev: '1-f2c106407ef448a28dc204d99455850d',
                archived: false
            }, {
                productCode: '08S15',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Zidovudina (AZT); 300mg 60Comp; Embalagem',
                description: 'Zidovudina;Emb(300mg 60Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '450989ce-d162-416d-a98f-8628436aa153'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:07.968Z'
                },
                id: '75fccffe-5575-4074-9ac7-af29f452cec2',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '75fccffe-5575-4074-9ac7-af29f452cec2/2',
                _rev: '2-b3ba89c0e0a54af4afb97dd77effe595',
                archived: false
            }, {
                productCode: '08S03Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Didanosina (DDI); 25mg 60comp; Embalagem',
                description: 'Didanosina;Emb (25mg 60 Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '9acb28d4-5797-442f-926f-4fe476d0bd75'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:43:26.454Z'
                },
                id: '95c00deb-9454-4bb1-a347-dad18c576a82',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: true,
                _id: '95c00deb-9454-4bb1-a347-dad18c576a82/2',
                _rev: '1-d27f13a5b2a24fe19900c224d478c601',
                archived: false
            }, {
                productCode: '08S29Z',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Ritonavir; 100mg 30 comp; Embalagem',
                description: '',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '1c5ab750-91ed-41b6-a8c8-8d180fa911ae'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:46:04.943Z'
                },
                id: '03746692-24a0-4944-9a79-a3d144fbe262',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '03746692-24a0-4944-9a79-a3d144fbe262/2',
                _rev: '2-f1ba1292ab8f405cb1b85742bdc4325f',
                archived: false
            }, {
                productCode: '08S20',
                dispensable: {
                    dispensingUnit: 'each',
                    displayUnit: 'each'
                },
                fullProductName: 'Efavirenz (EFV); 200mg 90Comp; Embalagem',
                description: 'Efavirenz;Emb(200mg 90Comp)',
                netContent: 1,
                packRoundingThreshold: 1,
                roundToZero: false,
                programs: [{
                    programId: '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                    orderableDisplayCategoryId: '40b66746-01f4-11eb-afa4-4c32759554d9',
                    orderableCategoryDisplayName: 'Default',
                    orderableCategoryDisplayOrder: 0,
                    active: true,
                    fullSupply: true,
                    displayOrder: 0
                }],
                children: [],
                identifiers: {
                    tradeItem: '1089d33d-fb05-491e-aca2-5c6580c13839'
                },
                extraData: {
                    isTracer: false
                },
                meta: {
                    versionNumber: 2,
                    lastUpdated: '2022-07-04T06:45:16.063Z'
                },
                id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58',
                lastModified: 'Mon, 04 Jul 2022 06:48:35 GMT',
                latest: false,
                _id: '08ac4a8e-3174-4825-97ae-b6328c7c3a58/2',
                _rev: '2-55089cc905eb45c1aad3367dc7d19c63',
                archived: false
            }],
            availableNonFullSupplyProducts: [],
            $isEditable: false,
            idempotencyKey: '7bcdcb0e-8d55-42fc-8965-8325962c0793'
        };
        this.vm = this.$controller('siglusAnalyticsReportCustomizeTBController', {
            facility: this.facility,
            requisition: this.requisition,
            openlmisDateFilter: this.openlmisDateFilter,
            siglusTemplateConfigureService: this.siglusTemplateConfigureService
        });
        this.vm.$onInit();
    });

    describe('getValueByKey', function() {
        it('should expose empty string when patientLineItems is empty', function() {
            this.vm.requisition.patientLineItems = [];

            expect(this.vm.getValueByKey('test', 1)).toEqual('');
        });

        it('should expose empty string when key is undefined', function() {
            this.vm.mergedPatientMap = {
                test: {
                    column: {
                        columns: [
                            {
                                name: 'hello'
                            },
                            {
                                name: 'world'
                            }
                        ]
                    },
                    columns: {
                        hello: 1,
                        wordl: 2
                    }
                }
            };

            expect(this.vm.getValueByKey('test2', 1)).toEqual('');
        });

        it('should expose right result', function() {
            this.vm.mergedPatientMap = {
                test: {
                    column: {
                        columns: [
                            {
                                name: 'hello'
                            },
                            {
                                name: 'world'
                            }
                        ]
                    },
                    columns: {
                        hello: {
                            value: 1
                        },
                        world: {
                            value: 2
                        }
                    }
                }
            };

            expect(this.vm.getValueByKey('test', 1)).toEqual(2);
        });
    });

    describe('getSignaure', function() {
        it('should return right results when approve is undefined', function() {
            var signaure = {};

            expect(this.vm.getSignaure(signaure)).toEqual({});
        });

        it('should return right results when approve`s length is 0', function() {
            var signaure = {
                approve: []
            };

            expect(this.vm.getSignaure(signaure)).toEqual({
                approve: ''
            });
        });

        it('should return right results when approve`s length is not 0', function() {
            var signaure = {
                approve: ['hello', 'world']
            };

            expect(this.vm.getSignaure(signaure)).toEqual({
                approve: 'hello,world'
            });
        });
    });
});
