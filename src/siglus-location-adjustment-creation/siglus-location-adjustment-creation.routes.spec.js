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

describe('openlmis.locationManagement.adjustment.creation', function() {
    var $state, $q, $rootScope, $location, siglusLocationAdjustmentService;

    function prepareInjector() {
        inject(function($injector) {
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            siglusLocationAdjustmentService = $injector.get('siglusLocationAdjustmentService');
        });
    }

    function prepareSpies() {
        spyOn(siglusLocationAdjustmentService, 'getDraft').andReturn($q.resolve({
            id: 12311
        }));
    }

    function getResolvedValue(name) {
        return $state.$current.locals.globals[name];
    }

    function goToUrl(url) {
        $location.url(url);
        $rootScope.$apply();
    }

    function init() {
        $state.go('openlmis.locationManagement.adjustment.creation',
            {
                draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719'
            });
        $rootScope.$apply();
    }

    beforeEach(function() {
        module('siglus-location-management');
        module('siglus-location-adjustment-creation');
        module('siglus-location-adjustment');
        prepareInjector();
        prepareSpies();
        init();
    });

    describe('facility resolve', function() {
        it('should return facility', function() {
            goToUrl('/locationManagement/adjustment/a24f19a8-3743-4a1a-a919-e8f97b5719/creation');
            $rootScope.$apply();

            expect(getResolvedValue('facility')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    facility: {
                        id: 'c9203423-123123-234234'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('facility')).toBeUndefined();
        });
    });

    describe('user resolve', function() {
        it('should return user', function() {
            goToUrl('/locationManagement/adjustment/a24f19a8-3743-4a1a-a919-e8f97b5719/creation');
            $rootScope.$apply();

            expect(getResolvedValue('user')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    user: {
                        id: 'c9203423-123123-234234'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('user')).toBeUndefined();
        });
    });

    describe('orderableGroups resolve', function() {
        it('should return orderableGroups', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    orderableGroups: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('orderableGroups')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    orderableGroups: []
                });
            $rootScope.$apply();

            expect(getResolvedValue('orderableGroups')).toBeUndefined();
        });
    });

    describe('draftInfo resolve', function() {
        it('should return draftInfo', function() {
            goToUrl('/locationManagement/adjustment/a24f19a8-3743-4a1a-a919-e8f97b5719/creation');
            $rootScope.$apply();

            expect(getResolvedValue('draftInfo')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    draftInfo: {
                        id: 'A000001'
                    }
                });
            $rootScope.$apply();

            expect(getResolvedValue('draftInfo')).toBeUndefined();
        });
    });

    describe('locations resolve', function() {
        it('should return locations', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    locations: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('locations')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    locations: []
                });
            $rootScope.$apply();

            expect(getResolvedValue('locations')).toBeUndefined();
        });
    });

    describe('areaLocationInfo resolve', function() {
        it('should return locations', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    areaLocationInfo: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('areaLocationInfo')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    areaLocationInfo: []
                });
            $rootScope.$apply();

            expect(getResolvedValue('areaLocationInfo')).toBeUndefined();
        });
    });

    describe('addedLineItems resolve', function() {
        it('should return locations', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    addedLineItems: undefined
                });
            $rootScope.$apply();

            expect(getResolvedValue('addedLineItems')).toBeUndefined();
        });

        it('should return $stateParams value', function() {
            $state.go('openlmis.locationManagement.adjustment.creation',
                {
                    draftId: 'a24f19a8-3743-4a1a-a919-e8f97b5719',
                    addedLineItems: []
                });
            $rootScope.$apply();

            expect(getResolvedValue('addedLineItems')).toBeUndefined();
        });
    });
});
