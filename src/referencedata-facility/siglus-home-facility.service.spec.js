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

describe('siglusHomeFacilityService', function() {
    var facilityFactory, $q, siglusHomeFacilityService, deferredSpy;
    beforeEach(function() {
        module('referencedata-facility');

        inject(function($injector) {
            facilityFactory = $injector.get('facilityFactory');
            siglusHomeFacilityService = $injector.get('siglusHomeFacilityService');
            $q = $injector.get('$q');
            spyOn(facilityFactory, 'getUserHomeFacility').andReturn($q.resolve({
                enableLocationManagement: true
            }));

            deferredSpy = jasmine.createSpyObj('deferred', ['resolve']);

            spyOn($q, 'defer').andReturn(deferredSpy);
        });
    });

    it('should return cached facility enableLocationManagement value when facility has exist', function() {
        siglusHomeFacilityService.facility = {
            enableLocationManagement: true
        };
        siglusHomeFacilityService.getLocationEnableStatus();

        expect(deferredSpy.resolve).toHaveBeenCalledWith(true);
    });

    it('should called api to get value when facility is not exist', function() {
        siglusHomeFacilityService.getLocationEnableStatus();

        expect(facilityFactory.getUserHomeFacility).toHaveBeenCalled();
    });
});
