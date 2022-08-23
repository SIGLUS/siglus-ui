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

describe('siglusMovementFilterService', function() {

    var siglusMovementFilterService;

    function prepareInjector() {
        inject(function($injector) {
            siglusMovementFilterService = $injector.get('siglusMovementFilterService');
        });
    }

    beforeEach(function() {
        module('siglus-location-movement');

        prepareInjector();
    });

    describe('filterMovementList method', function() {
        it('should filter addedLineItems when keyword has mapped productName or productCode', function() {
            var kitItem = [
                {
                    productName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT - each',
                    productCode: '26B02',
                    orderableId: '78cbc8df6-e9e7-48f3-a749-fe9913ckl23'
                }

            ];
            var addedLineItems = [
                [
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    },
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    }

                ],
                kitItem
            ];

            expect(siglusMovementFilterService.filterMovementList('KIT AL/APE', addedLineItems)).toEqual([kitItem]);
        });

        it('should return origin addedLineItems when keyword is empty', function() {
            var kitItem = [
                {
                    productName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT - each',
                    productCode: '26B02',
                    orderableId: '78cbc8df6-e9e7-48f3-a749-fe9913ckl23'
                }

            ];
            var addedLineItems = [
                [
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    },
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    }

                ],
                kitItem
            ];

            expect(siglusMovementFilterService.filterMovementList('', addedLineItems)).toEqual(addedLineItems);
        });

        it('should return empty array when keyword  not match items', function() {
            var kitItem = [
                {
                    productName: 'KIT AL/APE (Artemeter+Lumefantrina); 75 Tratamentos+ 200 Tests; KIT - each',
                    productCode: '26B02',
                    orderableId: '78cbc8df6-e9e7-48f3-a749-fe9913ckl23'
                }

            ];
            var addedLineItems = [
                [
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    },
                    {
                        productName: 'Rifampicina+Isoniazida; 150mg+150mg; Comp - each',
                        productCode: '08L07Y',
                        orderableId: '45bc8df6-e9e7-48f3-a749-fe9913cdc17e'
                    }

                ],
                kitItem
            ];

            expect(siglusMovementFilterService.filterMovementList('ac2632', addedLineItems)).toEqual([]);
        });

    });

});
