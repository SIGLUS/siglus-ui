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
   * @name referencedata-facility.Facility
   *
   * @description
   * Represents a single facility.
   */
    angular
        .module('referencedata-facility')
        .factory('Facility', Facility);

    function Facility() {

        Facility.prototype.isManagedExternally = isManagedExternally;

        return Facility;

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.Facility
     * @name Facility
     *
     * @description
     * Creates a new instance of the Facility class.
     *
     * @param  {Object}  json the json representation of the facility
     */
        function Facility(json) {
            this.id = json.id;
            this.name = json.name;
            this.code = json.code;
            this.description = json.description;
            this.geographicZone = json.geographicZone;
            this.type = json.type;
            this.operator = json.operator;
            this.active = json.active;
            this.goLiveDate = json.goLiveDate;
            this.goDownDate = json.goDownDate;
            this.comment = json.comment;
            this.enabled = json.enabled;
            this.openLmisAccessible = json.openLmisAccessible;
            this.location = json.location;
            this.isAndroidDevice = json.isAndroidDevice;
            this.enableLocationManagement = json.enableLocationManagement;
            this.isNewFacility = json.isNewFacility;
            this.extraData = json.extraData;
            this.supportedPrograms = json.supportedPrograms || [];
            this.reportTypes = json.reportTypes || [];
            this.hasSuccessUploadLocations = json.hasSuccessUploadLocations || '';
        }

        /**
     * @ngdoc method
     * @methodOf referencedata-facility.Facility
     * @name isManagedExternally
     *
     * @description
     * Tells whether facility is managed by some external system (ex. FHIR).
     *
     * @return {boolean}  true if facility is managed externally, false otherwise
     */
        function isManagedExternally() {
            return !!this.extraData && String(this.extraData.isManagedExternally)
          === 'true';
        }

    }

})();
