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

describe('FacilityRepositoryOrigin', function() {

    beforeEach(function() {
        this.OpenlmisRepositoryMock = jasmine.createSpy('OpenlmisRepository');
        this.facilityResourceOriginMock = jasmine.createSpy(
            'FacilityResourceOrigin'
        );

        var OpenlmisRepositoryMock = this.OpenlmisRepositoryMock,
            facilityResourceOriginMock = this.facilityResourceOriginMock;
        module('referencedata-facility', function($provide) {
            $provide.factory('OpenlmisRepository', function() {
                return OpenlmisRepositoryMock;
            });

            $provide.factory('FacilityResourceOrigin', function() {
                return function() {
                    return facilityResourceOriginMock;
                };
            });
        });

        inject(function($injector) {
            this.FacilityRepositoryOrigin = $injector.get('FacilityRepositoryOrigin');
            this.Facility = $injector.get('Facility');
        });
    });

    describe('constructor', function() {

        it('should extend OpenlmisRepository', function() {
            new this.FacilityRepositoryOrigin();

            expect(this.OpenlmisRepositoryMock).toHaveBeenCalledWith(this.Facility,
                this.facilityResourceOriginMock);
        });

        it('should pass the given implementation', function() {
            var implMock = jasmine.createSpyObj('impl', ['create']);

            new this.FacilityRepositoryOrigin(implMock);

            expect(this.OpenlmisRepositoryMock).toHaveBeenCalledWith(this.Facility,
                implMock);
        });

    });

});