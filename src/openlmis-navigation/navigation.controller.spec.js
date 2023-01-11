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

describe('NavigationController', function() {

    beforeEach(function() {
        module('openlmis-navigation');

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.navigationStateService = $injector.get('navigationStateService');
            this.$rootScope = $injector.get('$rootScope');
        });

        this.$scope = this.$rootScope.$new();

        this.mainRoot = [
            'subState1',
            'subState2'
        ];

        this.subRoot = [
            'subSubState1',
            'subSubState2'
        ];

        this.states = [
            'state1',
            'state2'
        ];

        this.navigationStateService.roots = {};

        spyOn(this.navigationStateService, 'hasChildren');
        this.initController = function() {
            this.vm = this.$controller('NavigationController', {
                $scope: this.$scope
            });
            this.vm.$onInit();
        };
    });

    describe('initialization', function() {

        beforeEach(function() {
            this.navigationStateService.roots = {
                '': this.mainRoot,
                subRoot: this.subRoot
            };
        });

        it('should expose navigationStateService.isSubmenu method', function() {
            this.initController();

            expect(this.vm.isSubmenu).toBe(this.navigationStateService.isSubmenu);
        });

        it('should expose navigationStateService.shouldDisplay method', function() {
            this.initController();

            expect(this.vm.shouldDisplay).toBe(this.navigationStateService.shouldDisplay);
        });

        it('should get root children if no root state or state list was given', function() {
            this.initController();

            expect(this.vm.states).toBe(this.mainRoot);
        });

        // it('should get state children if root states was given', function() {
        //     this.$scope.rootState = 'subRoot';
        //
        //     this.initController();
        //
        //     expect(this.vm.states).toEqual([ 'subSubState1', 'subSubState2' ]);
        // });

        it('should expose states if the state list was given', function() {
            this.$scope.states = this.states;

            this.initController();

            expect(this.vm.states).toBe(this.states);
        });

    });

    describe('hasChildren', function() {

        beforeEach(function() {

            this.initController();
        });

        it('should return visible children', function() {
            this.navigationStateService.hasChildren.andReturn(true);

            var result = this.vm.hasChildren('state');

            expect(result).toBe(true);
        });

        it('should call navigationStateService.hasChildren', function() {
            this.vm.hasChildren('state');

            expect(this.navigationStateService.hasChildren).toHaveBeenCalledWith('state');
        });

    });

});
