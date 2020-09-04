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

describe('siglusArchivedProductCacheService', function() {
    var offlineArchivedProducts, facilityId, archivedProducts;

    beforeEach(function() {
        offlineArchivedProducts = jasmine.createSpyObj('archivedProducts', ['getBy', 'put']);
        facilityId = 'facility-id';
        archivedProducts = ['orderable-1', 'orderable-2'];

        module('siglus-stock-archived-product', function($provide) {
            $provide.service('localStorageFactory', function() {
                return function() {
                    return offlineArchivedProducts;
                };
            });
        });

        inject(function($injector) {
            this.siglusArchivedProductCacheService = $injector.get('siglusArchivedProductCacheService');
        });
    });

    describe('cacheArchivedOrderables', function() {
        it('should not call the put method of offlineArchivedProducts', function() {
            this.siglusArchivedProductCacheService.cacheArchivedOrderables(facilityId, archivedProducts);

            expect(offlineArchivedProducts.put).toHaveBeenCalledWith({
                id: facilityId,
                archivedProducts: archivedProducts
            });
        });
    });

    describe('getArchivedOrderables', function() {
        beforeEach(function() {
            offlineArchivedProducts.getBy.andReturn({
                archivedProducts: archivedProducts
            });
        });

        it('should get the archived orderables from cache', function() {

            expect(this.siglusArchivedProductCacheService.getArchivedOrderables(facilityId)).toEqual(archivedProducts);
        });
    });
});