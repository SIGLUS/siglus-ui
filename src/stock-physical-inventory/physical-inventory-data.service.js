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

    angular
        .module('stock-physical-inventory')
        .service('physicalInventoryDataService', physicalInventoryDataService);

    physicalInventoryDataService.$inject = [];

    function physicalInventoryDataService() {
        this.displayLineItemsGroup = undefined;
        this.draft = undefined;
        this.reasons = undefined;
        this.facilityId = undefined;
        this.setDisplayLineItemsGroup = function(facilityId, displayLineItemsGroup) {
            this.facilityId = facilityId;
            this.displayLineItemsGroup = displayLineItemsGroup;
        };
        this.getDisplayLineItemsGroup = function(facilityId) {
            return this.facilityId === facilityId ? this.displayLineItemsGroup : undefined;
        };

        this.setDraft = function(facilityId, draft) {
            this.facilityId = facilityId;
            this.draft = draft;
        };
        this.getDraft = function(facilityId) {
            return this.facilityId === facilityId ? this.draft : undefined;
        };

        this.getReasons = function(facilityId) {
            return this.facilityId === facilityId ? this.reasons : undefined;
        };

        this.setReasons = function(facilityId, reasons) {
            this.facilityId = facilityId;
            this.reasons = reasons;
        };

        this.clear = function() {
            this.displayLineItemsGroup = undefined;
            this.draft = undefined;
            this.reasons = undefined;
            this.facilityId = undefined;
        };
    }

})();
