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
     * @name proof-of-delivery.ProofOfDelivery
     *
     * @description
     * Represents a single Proof of Delivery in the OpenLMIS system.
     */
    angular
        .module('proof-of-delivery')
        .factory('ProofOfDelivery', factory);

    factory.$inject = ['ProofOfDeliveryLineItem', '$q', 'PROOF_OF_DELIVERY_STATUS', '$window',
        'accessTokenFactory', 'fulfillmentUrlFactory'];

    function factory(ProofOfDeliveryLineItem, $q, PROOF_OF_DELIVERY_STATUS) {

        ProofOfDelivery.prototype.validate = validate;
        ProofOfDelivery.prototype.save = save;
        ProofOfDelivery.prototype.confirm = confirm;
        ProofOfDelivery.prototype.isInitiated = isInitiated;
        ProofOfDelivery.prototype.hasProductsUseVvmStatus = hasProductsUseVvmStatus;

        return ProofOfDelivery;

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name ProofOfDelivery
         *
         * @description
         * Creates an instance of the ProofOfDelivery class.
         *
         * @param  {Object}                     json        the JSON representation of the Proof of
         *                                                  Delivery
         * @param  {ProofOfDeliveryRepository}  repository  the instance of the
         *                                                  ProofOfDeliveryRepository class
         */
        function ProofOfDelivery(json, repository) {
            angular.copy(json, this);
            this.repository = repository;
            this.lineItems = createLineItems(json.lineItems);
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name saved
         *
         * @description
         * Updates the Proof of Delivery in the repository.
         *
         * @return {Promise}    the promise resolved when save was successful or rejected if it was
         *                      not
         */
        function save() {
            return this.repository.update(this);
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name confirm
         *
         * @description
         * Changes the status of the Proof of Delivery to confirmed and saves it in the repository.
         *
         * @return {Promise}    the promise resolved when Proof of Delivery has been successfully
         *                      confirmed, rejected otherwise
         */
        function confirm() {
            var proofOfDelivery = this,
                copy = angular.copy(proofOfDelivery),
                errors = copy.validate();

            if (errors) {
                return $q.reject(errors);
            }

            copy.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;

            return copy.repository.update(copy)
                .then(function() {
                    proofOfDelivery.status = PROOF_OF_DELIVERY_STATUS.CONFIRMED;
                });
        }

        /**
         * @ngdoc methodOf
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name isInitiated
         *
         * @description
         * Returns whether Proof of Delivery has INITIATED status.
         *
         * @return {Boolean}    true if Proof of Delivery has INITIATED status, false otherwise
         */
        function isInitiated() {
            return this.status === PROOF_OF_DELIVERY_STATUS.INITIATED;
        }

        /**
         * @ngdoc methodOf
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name hasProductsUseVvmStatus
         *
         * @description
         * Checks whether any of Proof of Delivery Line Items is using VVM Status.
         *
         * @return {Boolean} true if any of Proof of Delivery Line Items use VVM Status
         */
        function hasProductsUseVvmStatus() {
            var result = false;

            this.lineItems.forEach(function(lineItem) {
                result = result || lineItem.useVvm;
            });

            return result;
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDelivery
         * @name validate
         *
         * @description
         * Validates the Proof of Delivery and returns a map of errors if it is invalid.
         * @param {isMerge} if it is not  final merge  do not  valid signature and  date.
         * @return {Object} the map of errors if the Proof of Delivery is invalid, undefined
         *                  otherwise
         */
        function validate(isMerge) {
            var errors = {};
            if (isMerge) {
                verifyNotEmpty(errors, this.receivedBy, 'receivedBy');
                // verifyNotEmpty(errors, this.preparedBy, 'preparedBy');
                // verifyNotEmpty(errors, this.conferredBy, 'conferredBy');
                verifyNotEmpty(errors, this.receivedDate, 'receivedDate');
            }

            var lineItemsErrors = [];
            this.lineItems.forEach(function(lineItem) {
                var lineItemErrors = lineItem.validate(isMerge);

                if (lineItemErrors) {
                    lineItemsErrors.push(lineItemErrors);
                }
            });

            if (lineItemsErrors.length) {
                errors.lineItems = lineItemsErrors;
            }

            return angular.equals(errors, {}) ? undefined : errors;
        }

        function createLineItems(jsonLineItems) {
            var lineItems = [];
            jsonLineItems.forEach(function(lineItem) {
                lineItems.push(new ProofOfDeliveryLineItem(lineItem));
            });
            return lineItems;
        }

        function verifyNotEmpty(errors, value, fieldName) {
            if (!value || value === '') {
                errors[fieldName] = 'proofOfDelivery.required';
            }
        }
    }

})();
