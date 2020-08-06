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

describe('siglusArchivedProductService', function() {
    var OrderableGroupDataBuilder;

    beforeEach(function() {
        module('stock-archived-product');
        module('stock-orderable-group');

        inject(function($injector) {
            this.siglusArchivedProductService = $injector.get('siglusArchivedProductService');
            this.alertService = $injector.get('alertService');
            this.openlmisUrlFactory = $injector.get('openlmisUrlFactory');
            this.$httpBackend = $injector.get('$httpBackend');
            this.$rootScope = $injector.get('$rootScope');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        this.orderableGroup = new OrderableGroupDataBuilder().build();
    });

    describe('alterInfo', function() {
        beforeEach(function() {
            spyOn(this.alertService, 'info');
        });

        it('should not call the info method of alertService when the orderable group is not archived', function() {
            this.orderableGroup[0].orderable.archived = false;
            this.orderableGroup[1].orderable.archived = false;

            this.siglusArchivedProductService.alterInfo(this.orderableGroup);

            expect(this.alertService.info).not.toHaveBeenCalled();
        });

        it('should call the info method of alertService when the orderable group is archived', function() {
            this.orderableGroup[0].orderable.archived = false;
            this.orderableGroup[1].orderable.archived = true;

            this.siglusArchivedProductService.alterInfo(this.orderableGroup);

            expect(this.alertService.info).toHaveBeenCalled();
        });
    });

    describe('getArchivedOrderables', function() {

        beforeEach(function() {
            this.facilityId = 'facilityId';
            this.$httpBackend.when('GET', this.openlmisUrlFactory('/api/siglusapi/archivedproducts?facilityId='
                + this.facilityId))
                .respond(['id'], null);
        });

        it('should return promise', function() {
            var result = this.siglusArchivedProductService.getArchivedOrderables(this.facilityId);
            this.$httpBackend.flush();

            expect(result.then).not.toBeUndefined();
        });

        it('should resolve to array object', function() {
            var result;

            this.siglusArchivedProductService.getArchivedOrderables(this.facilityId).then(function(data) {
                result = data;
            });
            this.$httpBackend.flush();
            this.$rootScope.$apply();

            expect(angular.toJson(result)).toEqual(angular.toJson(['id']));
        });
    });
});