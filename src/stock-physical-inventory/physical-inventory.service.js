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
     * @name stock-physical-inventory.physicalInventoryService
     *
     * @description
     * Responsible for retrieving physical inventory information from server.
     */
    angular
        .module('stock-physical-inventory')
        .service('physicalInventoryService', service);

    service.$inject = [
        '$resource', 'stockmanagementUrlFactory', '$filter', 'messageService', 'openlmisDateFilter',
        'productNameFilter', 'stockEventFactory',
        // SIGLUS-REFACTOR: starts here
        'siglusStockEventService'
        // SIGLUS-REFACTOR: ends here
    ];

    function service($resource, stockmanagementUrlFactory, $filter, messageService, openlmisDateFilter,
                     productNameFilter, stockEventFactory, siglusStockEventService) {
        // SIGLUS-REFACTOR: starts here
        var resource = $resource(stockmanagementUrlFactory('/api/siglusapi/physicalInventories'), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/:id')
            },
            update: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/subDraft')
            },
            deleteDraftList: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/:id')
            },
            delete: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/subDraft'),
                hasBody: true,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            },
            find: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/subDraft')
            },
            getConflict: {
                method: 'GET',
                url: '/api/get-conflict-draft'
            },
            submit: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/subDraftSubmit')
            },
            validateConflictProgram: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/conflict')
            }
        });
        // SIGLUS-REFACTOR: ends here

        this.getDraft = getDraft;
        this.createDraft = createDraft;
        this.getConflictDraft = getConflictDraft;
        this.getPhysicalInventory = getPhysicalInventory;
        this.getPhysicalInventorySubDraft = getPhysicalInventorySubDraft;
        this.search = search;
        this.saveDraft = saveDraft;
        this.deleteDraft = deleteDraft;
        this.deleteDraftList = deleteDraftList;
        this.submitPhysicalInventory = submit;
        this.submitSubPhysicalInventory = subSubmit;
        // SIGLUS-REFACTOR: starts here
        this.getInitialDraft = getInitialDraft;

        this.validateConflictProgram = validateConflictProgram;
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name getDraft
         *
         * @description
         * Retrieves physical inventory draft by facility and program from server.
         *
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          physical inventory promise
         */
        function getDraft(program, facility) {
            return resource.query({
                program: program,
                facility: facility,
                isDraft: true
            })
                .$promise
                .then(function(response) {
                    siglusStockEventService.formatResponse(response);
                    return response;
                });
        }

        function validateConflictProgram(program, facility) {
            return resource.validateConflictProgram({
                program: program,
                facility: facility,
                isDraft: true
            })
                .$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name getPhysicalInventory
         *
         * @description
         * Retrieves physical inventory by id from server.
         *
         * @param  {String}  id  physical inventory UUID
         * @return {Promise}     physical inventory promise
         */
        function getPhysicalInventory(id) {
            return resource.get({
                id: id
            })
                .$promise
                .then(function(response) {
                    return siglusStockEventService.formatResponse(response);
                });
        }

        function getPhysicalInventorySubDraft(id) {
            return resource.find({
                subDraftIds: id
            })
                .$promise
                .then(function(response) {
                    return siglusStockEventService.formatResponse(response);
                });
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name createDraft
         *
         * @description
         * Creates physical inventory draft by facility and program from server.
         *
         * @param  {String}  program  Program UUID
         * @param  {String}  facility Facility UUID
         * @return {Promise}          physical inventory promise
         */
        function createDraft(program, facility, splitNum, isInitialInventory) {
            if (isInitialInventory) {
                return resource.save({
                    splitNum: Number(splitNum),
                    initialPhysicalInventory: true
                }, {
                    programId: program,
                    facilityId: facility
                }).$promise;
            }
            return resource.save({
                splitNum: Number(splitNum)
            }, {
                programId: program,
                facilityId: facility
            }).$promise;

        }

        function getConflictDraft(facilityId, programId) {
            return resource.getConflict({
                programId: programId,
                facilityId: facilityId
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name search
         *
         * @description
         * Searching from given line items by keyword.
         *
         * @param {String} keyword   keyword
         * @param {Array}  lineItems all line items
         * @return {Array} result    search result
         */
        function search(keyword, lineItems) {
            var result = lineItems;
            var hasLot = _.any(lineItems, function(item) {
                return item.lot;
            });

            if (!_.isEmpty(keyword)) {
                keyword = keyword.trim();
                result = _.filter(lineItems, function(item) {
                    var hasStockOnHand = !(_.isNull(item.stockOnHand) || _.isUndefined(item.stockOnHand));
                    var hasQuantity = !(_.isNull(item.quantity) || _.isUndefined(item.quantity)) &&
                        item.quantity !== -1;

                    var searchableFields = [
                        item.orderable.productCode, productNameFilter(item.orderable),
                        hasStockOnHand ? item.stockOnHand.toString() : '',
                        hasQuantity ? item.quantity.toString() : '',
                        getLot(item, hasLot),
                        // SIGLUS-REFACTOR: starts here
                        item.lot && item.lot.expirationDate ? openlmisDateFilter(item.lot.expirationDate) : ''
                        // SIGLUS-REFACTOR: ends here
                    ];
                    return _.any(searchableFields, function(field) {
                        return field.toLowerCase().contains(keyword.toLowerCase());
                    });
                });
            }

            return result;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name saveDraft
         *
         * @description
         * Saves physical inventory draft.
         *
         * @param  {Object} draft Draft that will be saved
         * @return {Promise}      Saved draft
         */
        // SIGLUS-REFACTOR: starts here
        function saveDraft(draft) {
            return resource.update(siglusStockEventService.formatPayload(draft)).$promise;
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name deleteDraft
         *
         * @description
         * Deletes physical inventory draft.
         *
         * @param  {String}   id  Draft that will be removed
         * @return {Promise}      Promise with response
         */

        function deleteDraftList(id) {
            return resource.deleteDraftList({
                id: id
            }).$promise;
        }

        function deleteDraft(ids, isInitialInventory) {
            if (isInitialInventory) {
                return resource.delete({
                    initialPhysicalInventory: true
                }, ids).$promise;
            }
            return resource.delete({}, ids).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf stock-physical-inventory.physicalInventoryService
         * @name submit
         *
         * @description
         * Submits physical inventory draft.
         *
         * @param  {Object} physicalInventory Draft that will be saved
         * @return {Promise}                  Submitted Physical Inventory
         */
        function subSubmit(physicalInventory) {
            var draft = angular.copy(physicalInventory);

            // SIGLUS-REFACTOR: Filter not added items
            draft.lineItems = _.map(physicalInventory.lineItems, function(item) {
                return {
                    orderableId: item.orderable.id,
                    lotId: item.lot ? item.lot.id : null,
                    lotCode: item.lot ? item.lot.lotCode : null,
                    expirationDate: item.lot ? item.lot.expirationDate : null,
                    quantity: item.quantity,
                    extraData: {
                        vvmStatus: item.vvmStatus
                    },
                    stockAdjustments: item.stockAdjustments,
                    reasonFreeText: item.reasonFreeText,
                    stockCardId: item.stockCardId,
                    programId: item.programId
                };
            });
            // SIGLUS-REFACTOR: ends here
            var event = siglusStockEventService.formatPayload(draft);
            // SIGLUS-REFACTOR: starts here
            return resource.submit(event).$promise;
            // SIGLUS-REFACTOR: ends here
        }

        function submit(physicalInventory) {
            var event = stockEventFactory.createFromPhysicalInventory(physicalInventory);
            // SIGLUS-REFACTOR: starts here
            return siglusStockEventService.submit(event);
            // SIGLUS-REFACTOR: ends here
        }

        function getLot(item, hasLot) {
            return item.lot ?
                item.lot.lotCode :
                (hasLot ? messageService.get('orderableGroupService.noLotDefined') : '');
        }

        // SIGLUS-REFACTOR: starts here
        function getInitialDraft(program, facility) {
            return resource.query({
                program: program,
                facility: facility,
                isDraft: true
            })
                .$promise
                .then(function(response) {
                    siglusStockEventService.formatResponse(response[0]);
                    return response;
                });
        }
        // SIGLUS-REFACTOR: ends here
    }
})();
