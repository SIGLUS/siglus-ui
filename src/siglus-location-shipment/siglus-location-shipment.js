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
     * @name shipment.Shipment
     *
     * @description
     * Represents a single shipment (or shipment draft).
     */
    angular
        .module('siglus-location-shipment')
        .factory('SiglusLocationShipment', Shipment);

    // #400: add $resource, fulfillmentUrlFactory
    Shipment.$inject = ['SiglusLocationShipmentLineItem', 'ORDER_STATUS', '$q', '$resource', 'fulfillmentUrlFactory'];
    // #400: ends here

    function Shipment(ShipmentLineItem, ORDER_STATUS, $q, $resource, fulfillmentUrlFactory) {
        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        var resource = $resource(fulfillmentUrlFactory('/api/siglusapi/shipments'), {}, {
            create: {
                method: 'POST'
            }
        });
        // #400: ends here

        Shipment.prototype.canBeConfirmed = canBeConfirmed;
        Shipment.prototype.isEditable = isEditable;
        Shipment.prototype.save = save;
        Shipment.prototype.confirm = confirm;
        Shipment.prototype.delete = deleteDraft;
        Shipment.prototype.isInvalid = isInvalid;
        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        Shipment.prototype.createSuborder = createSuborder;
        // #400: ends here

        return Shipment;

        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name Shipment
         * @constructor
         *
         * @description
         * Creates an instance of the Shipment class. Also instantiates the shipment line items.
         *
         * @param {Object}             json       the JSON representation of the shipment (draft)
         * @param {ShipmentRepository} repository the instance of the ShipmentRepository class
         */
        function Shipment(json, repository) {
            angular.copy(json, this);
            this.repository = repository;

            this.lineItems = json.lineItems.map(function(lineItemJson) {
                return new ShipmentLineItem(lineItemJson);
            });
        }

        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name save
         *
         * @description
         * Saves the shipment. The shipment won't be saved it it is not editable.
         *
         * @return {Promise} the promise resolved when save is successful, rejected otherwise
         */
        function save() {
            if (!this.isEditable()) {
                return $q.reject();
            }
            return this.repository.updateDraft(this);
        }

        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name confirm
         *
         * @description
         * Confirm the shipment. The shipment won't be confirmed if it is invalid, is not editable
         * or has no line items.
         *
         * @return {Promise} the promise resolved when confirm is successful, rejected otherwise
         */
        function confirm() {
            if (this.isInvalid() || !this.isEditable() || !this.canBeConfirmed()) {
                return $q.reject();
            }

            return this.repository.create(this);
        }

        // #400: Facility user partially fulfill an order and create sub-order for an requisition
        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name createSuborder
         *
         * @description
         * Confirm the shipment. The sub-order won't be created if it is invalid, is not editable
         * or has no line items.
         *
         * @return {Promise} the promise resolved when create is successful, rejected otherwise
         */
        function createSuborder() {
            if (this.isInvalid() || !this.isEditable() || !this.canBeConfirmed()) {
                return $q.reject();
            }

            return resource.create({
                isSubOrder: true
            }, this).$promise;
        }
        // #400: ends here

        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name delete
         *
         * @description
         * Deletes the shipment. The shipment won't be deleted if it is not editable.
         *
         * @return {Promise} the promise resolved when delete is successful, rejected otherwise
         */
        function deleteDraft() {
            if (!this.isEditable()) {
                return $q.reject();
            }
            return this.repository.deleteDraft(this);
        }

        /**
         * @ngdoc methodOf
         * @methodOf shipment.Shipment
         * @name isInvalid
         *
         * @description
         * Validates the shipment and returns a map of errors. If the line item is valid,
         * undefined is returned. The shipment is invalid if any of the line items is invalid.
         *
         * @return {Object} the errors map if the shipment is invalid, undefined otherwise
         */
        function isInvalid() {
            var errors = {};

            var lineItemsErrors = [];
            this.lineItems.forEach(function(lineItem) {
                var lineItemErrors = lineItem.isInvalid();

                if (lineItemErrors) {
                    lineItemsErrors.push(lineItemErrors);
                }
            });

            if (lineItemsErrors.length) {
                errors.lineItems = lineItemsErrors;
            }

            return angular.equals(errors, {}) ? undefined : errors;
        }

        /**
         * @ngdoc method
         * @methodOf shipment-view.controller:ShipmentViewController
         * @name isEditable
         *
         * @description
         * Checks whether shipment is editable based on the related order status. Only shipments for
         * orders with status "Ordered" and "Fulfilling" can be edited.
         *
         * @return {boolean} true if shipment is editable, false otherwise
         */
        function isEditable() {
            return ORDER_STATUS.ORDERED === this.order.status ||
                ORDER_STATUS.FULFILLING === this.order.status ||
                // #400: Facility user partially fulfill an order and create sub-order for an requisition
                ORDER_STATUS.PARTIALLY_FULFILLED === this.order.status;
            // #400: ends here
        }

        /**
         * @ngdoc method
         * @methodOf shipment.Shipment
         * @name canBeConfirmed
         *
         * @description
         * Checks whether shipment can be confirmed. Shipment can be confirmed if it has at least
         * one line item.
         *
         * @return {boolean} true if shipment has at least one line item, false otherwise
         */
        function canBeConfirmed() {
            return this.lineItems.length > 0;
        }
    }

})();
