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
        'siglusStockEventService', 'STOCKMANAGEMENT_RIGHTS'
        // SIGLUS-REFACTOR: ends here
    ];

    function service($resource, stockmanagementUrlFactory, $filter, messageService, openlmisDateFilter,
                     productNameFilter, stockEventFactory, siglusStockEventService, STOCKMANAGEMENT_RIGHTS) {
        // SIGLUS-REFACTOR: starts here
        var resource = $resource(stockmanagementUrlFactory('/api/siglusapi/physicalInventories'), {}, {
            get: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/physicalInventories/:id')
            },
            createInitialInventory: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories')
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
            },
            getApprovedProducts: {
                url: stockmanagementUrlFactory('/api/siglusapi/approvedProducts/brief'),
                method: 'GET',
                isArray: true
            }
        });

        // SIGLUS-REFACTOR: ends here
        var locationResource = $resource(stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories'), {}, {
            getDraftByLocation: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories'),
                isArray: true
            },
            getProductsByLocation: {
                method: 'get',
                url: stockmanagementUrlFactory('/api/siglusapi/stockCardSummariesWithLocation')
            },
            find: {
                method: 'GET',
                url: stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories/subDraft')
            },
            deleteSubDraftByLocation: {
                method: 'DELETE',
                url: stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories/subDraft'),
                hasBody: true,
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            },
            getSOH: {
                method: 'POST',
                url: stockmanagementUrlFactory('/api/siglusapi/locations'),
                isArray: true
            },
            saveDraftWithLocation: {
                method: 'PUT',
                url: stockmanagementUrlFactory('/api/siglusapi/location/physicalInventories/subDraft')
            },
            submitSubDraftWithLocation: {
                method: 'POST',
                url: stockmanagementUrlFactory(
                    '/api/siglusapi/location/physicalInventories/subDraftSubmit?isByLocation=true'
                )
            }
        });

        this.getDraft = getDraft;
        this.createDraft = createDraft;
        this.createLocationDraft = createLocationDraft;
        this.getConflictDraft = getConflictDraft;
        this.getPhysicalInventory = getPhysicalInventory;
        this.getPhysicalInventorySubDraft = getPhysicalInventorySubDraft;
        this.search = search;
        this.saveDraft = saveDraft;
        this.saveDraftWithLocation = saveDraftWithLocation;
        this.deleteDraft = deleteDraft;
        this.deleteDraftList = deleteDraftList;
        this.deleteSubDraftByLocation = deleteSubDraftByLocation;
        this.submitPhysicalInventory = submitPhysicalInventory;
        this.submitSubPhysicalInventory = submitSubPhysicalInventory;
        this.getLocationPhysicalInventorySubDraft = getLocationPhysicalInventorySubDraft;
        // SIGLUS-REFACTOR: starts here
        this.getInitialDraft = getInitialDraft;
        this.getSohByLocation = getSohByLocation;
        this.validateConflictProgram = validateConflictProgram;
        this.getDraftByLocation = getDraftByLocation;
        this.getStockProductsByLocation = getStockProductsByLocation;
        this.getApprovedProducts = getApprovedProducts;
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
        function saveDraftWithLocation(draft, locationManagementOption) {
            var physicalInventory = angular.copy(draft);

            // SIGLUS-REFACTOR: Filter not added items
            physicalInventory.lineItems = _.map(draft.lineItems, function(item) {
                if (item.id) {
                    return {
                        id: item.id,
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
                        programId: item.programId,
                        area: item.area,
                        locationCode: item.locationCode,
                        skipped: item.skipped
                    };
                }
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
                    programId: item.programId,
                    area: item.area,
                    locationCode: item.locationCode,
                    skipped: item.skipped
                };
            });
            // SIGLUS-REFACTOR: ends here
            return locationResource.saveDraftWithLocation(
                {
                    isByLocation: locationManagementOption === 'location'
                },
                siglusStockEventService.formatPayload(physicalInventory)
            ).$promise;
        }
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

        function getSohByLocation(ids) {
            var orderableIds = _.filter(ids, function(id) {
                return !!id;
            });
            return locationResource.getSOH({
                extraData: true
            }, orderableIds ? orderableIds : []).$promise;
        }

        function getDraftByLocation(facility, program) {
            return locationResource.getDraftByLocation({
                facility: facility,
                program: program,
                isDraft: true,
                isByLocation: true
            })
                .$promise;
        }

        function validateConflictProgram(program, facility, draft) {
            return resource.validateConflictProgram({
                program: program,
                facility: facility,
                draft: draft,
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
         * @param  {String}  programId  program id
         * @param  {String}  facilityId  current facility id
         * @param  {Array}  subDraftIds  subDraft id list
         * @param  {Boolean}  flag  deprecated
         * @param  {Array}  orderableIds  orderable id list
         * @return {Promise}     physical inventory promise
         */

        // TODO: deprecated, nowhere to use
        function getStockProductsByLocation(
            programId,
            facilityId,
            subDraftIds,
            flag,
            orderableIds
        ) {
            return locationResource.getProductsByLocation(flag ? {
                programId: programId,
                facilityId: facilityId,
                rightName: STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT,
                subDraftIds: subDraftIds,
                orderableIds: orderableIds
            } : {
                programId: programId,
                facilityId: facilityId,
                rightName: STOCKMANAGEMENT_RIGHTS.INVENTORIES_EDIT,
                subDraftIds: subDraftIds,
                orderableIds: orderableIds
            }).$promise;
        }

        function getPhysicalInventory(id) {
            return resource.get({
                id: id
            })
                .$promise
                .then(function(response) {
                    return siglusStockEventService.formatResponse(response);
                });
        }

        function getPhysicalInventorySubDraft(subDraftIds) {
            return resource.find({
                subDraftIds: subDraftIds
            }).$promise;
        }

        function getLocationPhysicalInventorySubDraft(id, locationManagementOption) {
            var params = {
                subDraftIds: id,
                isByLocation: locationManagementOption === 'location'
            };
            return locationResource.find(params).$promise;
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
         * @param  {Number}  splitNum subDraft number
         * @param  {Boolean}  isInitialInventory is initial inventory
         * @param  {String}  locationManagementOption 'location' or 'product' or undefined
         * @param  {Boolean}  enableLocationManagement if true means with location, otherwise without location
         * @return {Promise}          physical inventory promise
         */
        function createDraft(
            program,
            facility,
            splitNum,
            isInitialInventory,
            locationManagementOption,
            enableLocationManagement
        ) {
            var result = '';
            if (isInitialInventory) {
                if (enableLocationManagement) {
                    result = resource.createInitialInventory({
                        splitNum: Number(splitNum),
                        initialPhysicalInventory: true,
                        isByLocation: true,
                        locationManagementOption: 'location'
                    }, {
                        programId: program,
                        facilityId: facility
                    }).$promise;
                } else {
                    result = resource.save({
                        splitNum: Number(splitNum),
                        initialPhysicalInventory: true
                    }, {
                        programId: program,
                        facilityId: facility
                    }).$promise;
                }
            } else {
                result = resource.save({
                    splitNum: Number(splitNum),
                    locationManagementOption: locationManagementOption
                }, {
                    programId: program,
                    facilityId: facility
                }).$promise;
            }
            return result;
        }

        function createLocationDraft(program, facility, splitNum, isInitialInventory, locationManagementOption) {
            var params = locationManagementOption === 'product' ? {
                splitNum: Number(splitNum),
                locationManagementOption: locationManagementOption
            } : {
                splitNum: Number(splitNum),
                locationManagementOption: locationManagementOption,
                isByLocation: true

            };
            if (isInitialInventory) {
                params = locationManagementOption === 'product' ? {
                    splitNum: Number(splitNum),
                    locationManagementOption: locationManagementOption,
                    initialPhysicalInventory: true
                } : {
                    splitNum: Number(splitNum),
                    locationManagementOption: locationManagementOption,
                    isByLocation: true,
                    initialPhysicalInventory: true
                };
            }
            return locationResource.save(params, {
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

            if (!_.isEmpty(keyword)) {
                keyword = keyword.trim();
                result = _.filter(lineItems, function(item) {
                    var searchableFields = item.orderable.productCode ? [
                        item.orderable.productCode,
                        productNameFilter(item.orderable),
                        item.locationCode
                    ] : [
                        item.locationCode
                    ];
                    return _.any(searchableFields, function(field) {
                        return field && field.toLowerCase().contains(keyword.toLowerCase());
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
            return resource.update(draft).$promise;
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

        function deleteSubDraftByLocation(ids, locationManagementOption) {
            return locationResource.deleteSubDraftByLocation({
                isByLocation: locationManagementOption === 'location'
            }, ids).$promise;
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
         * @param  {String} locationManagementOption Physical inventory by location or product (or undefined)
         * @return {Promise}                  Submitted Physical Inventory
         */
        function submitSubPhysicalInventory(physicalInventory, locationManagementOption) {
            var draft = angular.copy(physicalInventory);

            // SIGLUS-REFACTOR: Filter not added items
            draft.lineItems = _.map(physicalInventory.lineItems, function(item) {
                return {
                    id: _.get(item, 'id'),
                    orderableId: _.get(item, ['orderable', 'id']),
                    quantity: item.quantity,
                    extraData: _.get(item, 'extraData'),
                    lot: _.get(item, 'lot'),
                    stockAdjustments: _.get(item, 'stockAdjustments'),
                    reasonFreeText: _.get(item, 'reasonFreeText'),
                    stockCardId: _.get(item, 'stockCardId'),
                    programId: _.get(item, 'programId'),
                    area: _.get(item, 'area'),
                    locationCode: _.get(item, 'locationCode'),
                    skipped: item.skipped
                };
            });
            // SIGLUS-REFACTOR: ends here
            if (locationManagementOption === 'location' || locationManagementOption === 'product') {
                return locationResource.submitSubDraftWithLocation(draft).$promise;
            }
            return resource.submit(draft).$promise;
        }

        function submitPhysicalInventory(physicalInventory, withLocation, historyData) {
            var event = stockEventFactory.createFromPhysicalInventory(physicalInventory, withLocation);
            var submitData = _.assign({}, event, {
                historyData: JSON.stringify(historyData)
            });

            if (withLocation) {
                return siglusStockEventService.locationSubmit(submitData);
            }
            // SIGLUS-REFACTOR: starts here
            return siglusStockEventService.submit(submitData);
            // SIGLUS-REFACTOR: ends here
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

        function getApprovedProducts(facilityId, programId) {
            return resource.getApprovedProducts({
                facilityId: facilityId,
                programId: programId
            }).$promise;
        }
    }
})();
