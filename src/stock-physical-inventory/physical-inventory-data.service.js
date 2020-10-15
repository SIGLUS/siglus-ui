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
        this.setDisplayLineItemsGroup = function(displayLineItemsGroup) {
            this.displayLineItemsGroup = displayLineItemsGroup;
        };
        this.getDisplayLineItemsGroup = function() {
            return this.displayLineItemsGroup;
        };

        this.setDraft = function(draft) {
            this.draft = draft;
        };
        this.getDraft = function() {
            return this.draft;
        };

        this.getReasons = function() {
            return this.reasons;
        };
        this.setReasons = function(reasons) {
            this.reasons = reasons;
        };
    }

})();
