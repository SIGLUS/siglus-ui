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
     * @name proof-of-delivery.ProofOfDeliveryLineItem
     *
     * @description
     * Represents a single line item of Proof of Delivery.
     */
    angular
        .module('proof-of-delivery')
        .factory('ProofOfDeliveryLineItem', ProofOfDeliveryLineItem);

    function ProofOfDeliveryLineItem() {

        ProofOfDeliveryLineItem.prototype.validate = validate;
        ProofOfDeliveryLineItem.prototype.updateQuantityRejected = updateQuantityRejected;

        return ProofOfDeliveryLineItem;

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryLineItem
         * @name ProofOfDeliveryLineItem
         * @constructor
         *
         * @description
         * Creates an instance of ProofOfDeliveryLineItem class.
         *
         * @param   {Object}    json    the JSON to build the instance
         */
        function ProofOfDeliveryLineItem(json) {
            angular.copy(json, this);
            this.updateQuantityRejected();
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryLineItem
         * @name updateQuantityRejected
         *
         * @description
         * Updates the quantity returned based on the set quantity received.
         */
        function updateQuantityRejected() {
            if (isEmpty(this.quantityAccepted) || this.quantityShipped < this.quantityAccepted) {
                this.quantityRejected = 0;
            } else if (this.quantityAccepted < 0) {
                this.quantityRejected = this.quantityShipped;
            } else {
                this.quantityRejected = this.quantityShipped - this.quantityAccepted;
            }
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryLineItem
         * @name validate
         *
         * @description
         * Validates the line item and returns a map of errors.
         *
         * @return  {Object}    the map of errors
         */
        function validate() {
            var errors = {};

            validateQuantityAccepted(this, errors);
            validateRejectionReasonId(this, errors);
            validateVvmStatus(this, errors);
            if (!_.get(this, ['orderable', 'isKit'])) {
                validateLotCodeAndExpirationDate(this, errors);
            }

            return angular.equals(errors, {}) ? undefined : errors;
        }

        function validateQuantityAccepted(lineItem, errors) {
            if (isEmpty(lineItem.quantityAccepted)) {
                errors.quantityAccepted = 'proofOfDelivery.required';
            }

            if (lineItem.quantityAccepted < 0) {
                errors.quantityAccepted = 'proofOfDelivery.positive';
            }
        }

        function validateRejectionReasonId(lineItem, errors) {
            if (
                !isEmpty(lineItem.quantityAccepted) &&
                lineItem.quantityAccepted !== lineItem.quantityShipped &&
                !lineItem.rejectionReasonId
            ) {
                errors.rejectionReasonId = 'proofOfDelivery.required';
            }
        }

        function validateVvmStatus(lineItem, errors) {
            if (lineItem.quantityAccepted > 0 && lineItem.useVvm && !lineItem.vvmStatus) {
                errors.vvmStatus = 'proofOfDelivery.vvmStatusIsRequired';
            }

            if (lineItem.quantityAccepted === 0 && lineItem.vvmStatus) {
                errors.vvmStatus = 'proofOfDelivery.cannotSelectVvmStatusWhenNothingAccepted';
            }
        }

        function validateLotCodeAndExpirationDate(lineItem, errors) {

            if (isEmpty(_.get(lineItem, ['lot', 'lotCode']))) {
                errors.lotCode = 'proofOfDeliveryView.lotCodeRequired';
            }

            if (isEmpty(_.get(lineItem, ['lot', 'expirationDate']))) {
                errors.expirationDate = 'proofOfDeliveryView.expirationDateRequired';
            }
        }

        function isEmpty(data) {
            return data === undefined || data === null || data === '';
        }

    }
})();
