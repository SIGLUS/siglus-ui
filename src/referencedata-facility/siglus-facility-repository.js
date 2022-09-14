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

    /**
   * @ngdoc service
   * @name referencedata-facility.FacilityRepository
   *
   * @description
   * Repository for managing facilities used throughout the system.
   */
    angular
        .module('referencedata-facility')
        .factory('FacilityRepositoryOrigin', FacilityRepositoryOrigin);

    FacilityRepositoryOrigin.$inject = ['classExtender', 'OpenlmisRepository',
        'Facility', 'FacilityResourceOrigin'];

    function FacilityRepositoryOrigin(classExtender, OpenlmisRepository, Facility,
                                      FacilityResourceOrigin) {

        classExtender.extend(FacilityRepositoryOrigin, OpenlmisRepository);

        return FacilityRepositoryOrigin;

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.FacilityRepository
     * @name FacilityRepositoryOrigin
     * @constructor
     *
     * @description
     * Creates an instance of the FacilityRepository. If no implementation is given a default one will be used.
     * The default implementation is an instance of the FacilityResource class.
     *
     * @param {Object} impl the implementation to be used by the repository, defaults to FacilityResource
     */
        function FacilityRepositoryOrigin(impl) {
            this.super(Facility, impl || new FacilityResourceOrigin());
        }
    }
})();