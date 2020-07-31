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
        .module('requisition-view-section')
        .controller('SiglusRegimentController', controller);

    controller.$inject = ['templateConfigureService', 'SECTION_TYPES'];

    function controller(templateConfigureService, SECTION_TYPES) {

        var vm = this;

        vm.$onInit = onInit;

        function onInit() {
            vm.regimenLineItems = [{
                columns: {
                    code: {
                        id: '123',
                        value: undefined
                    },
                    regiment: {
                        id: '1234',
                        value: undefined
                    },
                    patients: {
                        id: '12345',
                        value: undefined
                    }
                },
                regimen: {
                    id: 'd5cac41c-e05d-11e9-a67f-0242ac1a0008',
                    code: 'AZT+3TC+NPVR',
                    name: 'AZT+3TC+NPVR',
                    active: true,
                    isCustom: false,
                    displayOrder: 5,
                    programId: 'eae5ab5a-cfd2-11e9-9535-0242ac130005',
                    regimenCategory: {
                        id: '3d250db0-de25-11e9-8785-0242ac130007',
                        code: 'ADULTS',
                        name: 'Adults',
                        displayOrder: 0
                    },
                    regimenDispatchLine: {
                        id: 'ba74b29a-e05d-11e9-a67f-0242ac1a0008',
                        code: '2ND_LINE',
                        name: '2a Linha',
                        displayOrder: 1
                    }
                }
            }, {
                columns: {
                    code: {
                        id: '123',
                        value: undefined
                    },
                    regiment: {
                        id: '1234',
                        value: undefined
                    },
                    patients: {
                        id: '12345',
                        value: undefined
                    }
                },
                regimen: {
                    id: 'd5cac41c-e05d-11e9-a67f-0242ac1a0008',
                    code: 'ABC+3TC+ATV/r',
                    name: 'ABC+3TC+ATV/r',
                    active: true,
                    isCustom: false,
                    displayOrder: 4,
                    programId: 'eae5ab5a-cfd2-11e9-9535-0242ac130005',
                    regimenCategory: {
                        id: '3d250db0-de25-11e9-8785-0242ac130007',
                        code: 'Paediatrics',
                        name: 'Paediatrics',
                        displayOrder: 1
                    },
                    regimenDispatchLine: {
                        id: 'ba74b29a-e05d-11e9-a67f-0242ac1a0008',
                        code: '1ND_LINE',
                        name: '1a Linha',
                        displayOrder: 0
                    }
                }
            }];
            vm.regimenDispatchLine = [{
                columns: {
                    lines: {
                        id: '123',
                        value: undefined
                    },
                    patients: {
                        id: '124',
                        value: undefined
                    },
                    community: {
                        id: '125',
                        value: undefined
                    }
                },
                regimenDispatchLine: {
                    id: 'ba74b29a-e05d-11e9-a67f-0242ac1a0008',
                    code: '2ND_LINE',
                    name: '2a Linha',
                    displayOrder: 1
                }
            }, {
                columns: {
                    lines: {
                        id: '123',
                        value: undefined
                    },
                    patients: {
                        id: '124',
                        value: undefined
                    },
                    community: {
                        id: '125',
                        value: undefined
                    }
                },
                regimenDispatchLine: {
                    id: 'ba74b29a-e05d-11e9-a67f-0242ac1a0008',
                    code: '1ND_LINE',
                    name: '1a Linha',
                    displayOrder: 0
                }
            }];
            enhanceLineItems(vm.regimenLineItems, SECTION_TYPES.REGIMEN);
            enhanceLineItems(vm.regimenDispatchLine, SECTION_TYPES.SUMMARY);
        }

        function enhanceLineItems(lineItems, sectionName) {
            var section = templateConfigureService.getSectionByName(vm.sections, sectionName);
            var columnsMap = templateConfigureService.getSectionColumnsMap(section);
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName] = angular.merge({},
                        columnsMap[columnName], lineItem.columns[columnName]);
                });
            });
        }
    }

})();
