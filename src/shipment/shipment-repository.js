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
     * @name shipment.ShipmentRepository
     *
     * @description
     * Interface for managing shipments.
     */
    angular
        .module('shipment')
        .factory('ShipmentRepository', ShipmentRepository);

    ShipmentRepository.inject = [
        'Shipment', 'OpenlmisRepository', 'classExtender', 'ShipmentRepositoryImpl'
    ];

    function ShipmentRepository(Shipment, OpenlmisRepository, classExtender, ShipmentRepositoryImpl) {

        classExtender.extend(ShipmentRepository, OpenlmisRepository);

        ShipmentRepository.prototype.createDraft = createDraft;
        ShipmentRepository.prototype.updateDraft = updateDraft;
        ShipmentRepository.prototype.getByOrderId = getByOrderId;
        ShipmentRepository.prototype.getDraftByOrderId = getDraftByOrderId;
        ShipmentRepository.prototype.deleteDraft = deleteDraft;

        return ShipmentRepository;

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepository
         * @name ShipmentRepository
         * @constructor
         *
         * @description
         * Creates an object of the ShipmentRepository class. It no implementation is provided it
         * will use an instance of the ShipmentRepositoryImpl class by default.
         */
        function ShipmentRepository(impl) {
            this.super(Shipment, impl || new ShipmentRepositoryImpl());
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepository
         * @name updateDraft
         *
         * @description
         * Updates the given shipment draft on the OpenLMIS server.
         *
         * @param  {Object}  draft the shipment draft
         * @return {Promise}       returns a promise resolving when the update was successful,
         *                         rejects if anything goes wrong
         */
        function updateDraft(draft) {
            return this.impl.updateDraft(draft);
        }

        function deleteDraft(draft) {
            return this.impl.deleteDraft(draft);
        }

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepository
         * @name createDraft
         *
         * @description
         * Creates a new shipment draft on the OpenLMIS server.
         *
         * @param  {Object}  json the JSON representation of the shipment draft
         * @return {Promise}      returns a promise resolving to the instance of Shipment class
         *                        created based on the provided JSON object, rejects if anything
         *                        goes wrong
         */
        // #372: Improving Fulfilling Order performance
        function createDraft(json, order, stockCardSummaries) {
            var repository = this;

            return this.impl.createDraft(json, order, stockCardSummaries)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }
        // #372: ends here

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepository
         * @name getDraftByOrderId
         *
         * @description
         * Retrieves a shipment draft for order with given ID from the OpenLMIS server.
         *
         * @param  {Object}  orderId the order ID
         * @return {Promise}         returns a promise resolving to the instance of Shipment class
         *                           created based on the provided JSON object, rejects if anything
         *                           goes wrong
         */
        // #372: Improving Fulfilling Order performance
        function getDraftByOrderId(order, stockCardSummaries) {
            var repository = this;
            return this.impl.getDraftByOrderId(order, stockCardSummaries)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }
        // #372: ends here

        /**
         * @ngdoc method
         * @methodOf shipment.ShipmentRepository
         * @name getByOrderId
         *
         * @description
         * Retrieves a shipment for order with given ID from the OpenLMIS server.
         *
         * @param  {Object}  orderId the order ID
         * @return {Promise}         returns a promise resolving to the instance of Shipment class
         *                           created based on the provided JSON object, rejects if anything
         *                           goes wrong
         */
        function getByOrderId(orderId) {
            var repository = this;

            return this.impl.getByOrderId(orderId)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }

    }

})();