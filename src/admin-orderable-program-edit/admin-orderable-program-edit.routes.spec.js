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

describe('openlmis.administration.orderables.edit.programs.edit route', function() {

    beforeEach(function() {
        module('admin-orderable-program-edit');

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.OrderableResource = $injector.get('OrderableResource');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            <!-- SIGLUS-REFACTOR: starts here -->
            this.programService = $injector.get('programService');
            <!-- SIGLUS-REFACTOR: ends here -->
            this.OrderableDataBuilder = $injector.get('OrderableDataBuilder');
            this.ProgramOrderableDataBuilder = $injector.get('ProgramOrderableDataBuilder');
            this.OrderableDisplayCategoryResource = $injector.get('OrderableDisplayCategoryResource');
            this.OrderableDisplayCategoryDataBuilder = $injector.get('OrderableDisplayCategoryDataBuilder');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
        });

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];

        this.orderableDisplayCategories = [
            new this.OrderableDisplayCategoryDataBuilder().build(),
            new this.OrderableDisplayCategoryDataBuilder().build(),
            new this.OrderableDisplayCategoryDataBuilder().build()
        ];

        this.orderable = new this.OrderableDataBuilder()
            .withPrograms([
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[0].id)
                    .buildJson(),
                new this.ProgramOrderableDataBuilder()
                    .withProgramId(this.programs[2].id)
                    .buildJson()
            ])
            .build();

        this.orderables = [
            this.orderable,
            new this.OrderableDataBuilder().build(),
            new this.OrderableDataBuilder().build()
        ];

        this.orderablesPage = new this.PageDataBuilder()
            .withContent(this.orderables)
            .build();

        spyOn(this.OrderableDisplayCategoryResource.prototype, 'query')
            .andReturn(this.$q.resolve(this.orderableDisplayCategories));
        spyOn(this.OrderableResource.prototype, 'query').andReturn(this.$q.resolve(this.orderablesPage));
        <!-- SIGLUS-REFACTOR: starts here -->
        spyOn(this.programService, 'getRealPrograms').andReturn(this.$q.resolve(this.programs));
        <!-- SIGLUS-REFACTOR: ends here -->

        this.goToState = function() {
            this.$location.url('/administration/orderables/' + this.orderable.id + '/programs'
                + '/edit/' + this.orderable.programs[0].programId);
            this.$rootScope.$apply();
        };

        this.getResolvedValue = function(name) {
            return this.$state.$current.locals.globals[name];
        };
    });

    describe('state', function() {

        it('should expose orderable display categories', function() {
            this.goToState();

            expect(this.getResolvedValue('orderableDisplayCategories')).toEqual(this.orderableDisplayCategories);
        });

        it('should expose program Orderable', function() {
            this.goToState();

            expect(this.getResolvedValue('programOrderable')).toEqual(this.orderable.programs[0]);
        });

        it('should resolve successNotificationKey', function() {
            this.goToState();

            var successNotificationKey = 'adminOrderableProgram.save.success';

            expect(this.getResolvedValue('successNotificationKey')).toEqual(successNotificationKey);
        });

        it('should resolve errorNotificationKey', function() {
            this.goToState();

            var errorNotificationKey = 'adminOrderableProgram.save.failure';

            expect(this.getResolvedValue('errorNotificationKey')).toEqual(errorNotificationKey);
        });

        it('should expose filtered Programs', function() {
            this.goToState();

            expect(this.getResolvedValue('filteredPrograms')).toEqual([this.programs[1]]);
        });

    });
});
