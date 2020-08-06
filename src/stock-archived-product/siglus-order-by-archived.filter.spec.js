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

describe('order by archived filter', function() {
    var OrderableGroupDataBuilder;

    beforeEach(function() {
        module('stock-archived-product');
        module('stock-orderable-group');

        inject(function($injector) {
            this.$filter = $injector.get('$filter');
            OrderableGroupDataBuilder = $injector.get('OrderableGroupDataBuilder');
        });

        this.orderByArchivedFilter = this.$filter('siglusOrderByArchived');
        this.orderableGroups = [
            new OrderableGroupDataBuilder().build(),
            new OrderableGroupDataBuilder().build(),
            new OrderableGroupDataBuilder().build(),
            new OrderableGroupDataBuilder().build()
        ];
        this.orderableGroups[0][0].orderable.archived = true;
        this.orderableGroups[0][0].orderable.id = 'id-1';
        this.orderableGroups[1][0].orderable.archived = false;
        this.orderableGroups[1][0].orderable.id = 'id-2';
        this.orderableGroups[2][0].orderable.archived = false;
        this.orderableGroups[2][0].orderable.id = 'id-3';
        this.orderableGroups[3][0].orderable.archived = true;
        this.orderableGroups[3][0].orderable.id = 'id-4';
    });

    it('should return undefined for undefined', function() {
        expect(this.orderByArchivedFilter()).toBeUndefined();
    });

    it('should sort the orderable groups by archived flag', function() {
        var sortedOrderableGroups = this.orderByArchivedFilter(this.orderableGroups);

        expect(sortedOrderableGroups[0][0].orderable.id).toEqual('id-2');
        expect(sortedOrderableGroups[1][0].orderable.id).toEqual('id-3');
        expect(sortedOrderableGroups[2][0].orderable.id).toEqual('id-1');
        expect(sortedOrderableGroups[3][0].orderable.id).toEqual('id-4');
    });
});