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
     * @name proof-of-delivery.ProofOfDeliveryRepository
     *
     * @description
     * Repository of Proofs of Delivery. It's an abstraction layer over internals communicating with
     * the OpenLMIS server.
     */
    angular
        .module('proof-of-delivery')
        .factory('ProofOfDeliveryRepository', ProofOfDeliveryRepository);

    ProofOfDeliveryRepository.$inject = ['ProofOfDelivery'];

    function ProofOfDeliveryRepository(ProofOfDelivery) {

        ProofOfDeliveryRepository.prototype.get = get;
        ProofOfDeliveryRepository.prototype.update = update;

        // SIGLUS-REFACTOR: starts here
        ProofOfDeliveryRepository.prototype.getSubDraft = getSubDraft;
        ProofOfDeliveryRepository.prototype.getSubDraftWithLocation = getSubDraftWithLocation;
        ProofOfDeliveryRepository.prototype.getPodWithLocation = getPodWithLocation;
        ProofOfDeliveryRepository.prototype.updateSubDraft = updateSubDraft;
        ProofOfDeliveryRepository.prototype.updateSubDraftWithLocation = updateSubDraftWithLocation;
        ProofOfDeliveryRepository.prototype.deleteSubDraft = deleteSubDraft;
        ProofOfDeliveryRepository.prototype.deleteSubDraftWithLocation = deleteSubDraftWithLocation;
        ProofOfDeliveryRepository.prototype.mergeDraft = mergeDraft;
        ProofOfDeliveryRepository.prototype.mergeDraftWithLocation = mergeDraftWithLocation;
        ProofOfDeliveryRepository.prototype.submitDraft = submitDraft;
        ProofOfDeliveryRepository.prototype.submitDraftWithLocation = submitDraftWithLocation;
        // SIGLUS-REFACTOR: end here
        ProofOfDeliveryRepository.prototype.addLineItem = addLineItem;

        return ProofOfDeliveryRepository;

        function ProofOfDeliveryRepository(impl) {
            this.impl = impl;
        }

        /**
         * @ngdoc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepository
         * @name get
         *
         * @description
         * Retrieves Proof of Delivery by given UUID.
         *
         * @param   {string}    id  the UUID of the Proof of Delivery
         * @return  {Promise}       the promise resolving to instance of the ProofOfDelivery class
         */
        function get(id) {
            var repository = this;
            return this.impl.get(id)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }
        // SIGLUS-REFACTOR: starts here
        function getSubDraft(id, subDraftId) {
            var repository = this;
            return this.impl.getSubDraft(id, subDraftId)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }
        function getSubDraftWithLocation(id, subDraftId) {
            var repository = this;
            return this.impl.getSubDraftWithLocation(id, subDraftId)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }
        function getPodWithLocation(id) {
            var repository = this;
            return this.impl.getPodWithLocation(id)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }

        function updateSubDraft(id, subDraftId, pod, type) {
            return this.impl.updateSubDraft(id, subDraftId, pod, type);
        }
        function updateSubDraftWithLocation(id, subDraftId, pod, type, podLineItemLocation) {
            return this.impl.updateSubDraftWithLocation(id, subDraftId, pod, type, podLineItemLocation);
        }
        function submitDraftWithLocation(id, pod, podLineItemLocation) {
            return this.impl.submitDraftWithLocation(id, pod, podLineItemLocation);
        }
        function deleteSubDraft(id, subDraftId) {
            return this.impl.deleteSubDraft(id, subDraftId);
        }
        function deleteSubDraftWithLocation(id, subDraftId) {
            return this.impl.deleteSubDraftWithLocation(id, subDraftId);
        }
        function mergeDraft(id) {
            var repository = this;
            return this.impl.mergeDraft(id)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }
        function mergeDraftWithLocation(id) {
            var repository = this;
            return this.impl.mergeDraftWithLocation(id)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }

        function submitDraft(id, pod) {
            return this.impl.submitDraft(id, pod);
        }
        // SIGLUS-REFACTOR: end here

        /**
         * @ngodc method
         * @methodOf proof-of-delivery.ProofOfDeliveryRepository
         * @name update
         *
         * @description
         * Update the given Proof of Delivery in the repository.
         *
         * @param   {ProofOfDelivery}   proofOfDelivery the Proof of Delivery to update
         * @return  {Promise}                           the promise resolving to the update Proof
         *                                              of Delivery
         */
        // Deprecated: used in nowhere
        function update(proofOfDelivery) {
            var repository = this;
            return this.impl.update(proofOfDelivery)
                .then(function(json) {
                    return new ProofOfDelivery(json, repository);
                });
        }

        function addLineItem(podId, subDraftId, podLineItemId) {
            return this.impl.addLineItem(podId, subDraftId, podLineItemId);
        }
    }

})();
