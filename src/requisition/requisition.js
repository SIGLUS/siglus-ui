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
     * @name requisition.Requisition
     *
     * @description
     * Responsible for supplying requisition with additional methods.
     */
    angular
        .module('requisition')
        .factory('Requisition', requisitionFactory);

    requisitionFactory.$inject = [
        '$q', '$resource', 'requisitionUrlFactory', 'RequisitionTemplate', 'LineItem', 'REQUISITION_STATUS',
        'COLUMN_SOURCES', 'localStorageFactory', 'dateUtils', '$filter', 'TEMPLATE_COLUMNS', 'authorizationService',
        'REQUISITION_RIGHTS', 'UuidGenerator', 'requisitionCacheService',
        // SIGLUS-REFACTOR: starts here
        'siglusRequisitionUtils', 'calculationFactory'
        // SIGLUS-REFACTOR: ends here
    ];

    function requisitionFactory($q, $resource, requisitionUrlFactory, RequisitionTemplate, LineItem, REQUISITION_STATUS,
                                COLUMN_SOURCES, localStorageFactory, dateUtils, $filter, TEMPLATE_COLUMNS,
                                authorizationService, REQUISITION_RIGHTS, UuidGenerator, requisitionCacheService,
                                siglusRequisitionUtils, calculationFactory) {

        var offlineRequisitions = localStorageFactory('requisitions'),
            // SIGLUS-REFACTOR: starts here
            resource = $resource(requisitionUrlFactory('/api/siglusapi/requisitions/:id'), {}, {
            // SIGLUS-REFACTOR: ends here
                authorize: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    // SIGLUS-REFACTOR: starts here
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/:id/authorize'),
                    // SIGLUS-REFACTOR: ends here
                    method: 'POST'
                },
                save: {
                    method: 'PUT',
                    headers: {
                        'If-Match': getETag
                    },
                    transformRequest: transformRequisition
                },
                submit: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    // SIGLUS-REFACTOR: starts here
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/:id/submit'),
                    // SIGLUS-REFACTOR: ends here
                    method: 'POST'
                },
                approve: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    // SIGLUS-REFACTOR: starts here
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/:id/approve'),
                    // SIGLUS-REFACTOR: ends here
                    method: 'POST'
                },
                reject: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/:id/reject'),
                    method: 'PUT'
                },
                skip: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    url: requisitionUrlFactory('/api/requisitions/:id/skip'),
                    method: 'PUT'
                },
                remove: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    // SIGLUS-REFACTOR: starts here
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/:id'),
                    // SIGLUS-REFACTOR: ends here
                    method: 'DELETE'
                },
                createForClient: {
                    headers: {
                        'Idempotency-Key': getIdempotencyKey
                    },
                    // SIGLUS-REFACTOR: starts here
                    url: requisitionUrlFactory('/api/siglusapi/requisitions/clients/:id'),
                    // SIGLUS-REFACTOR: ends here
                    method: 'POST',
                    transformRequest: transformRequisition
                }
            });

        Requisition.prototype.$authorize = authorize;
        Requisition.prototype.$save = save;
        Requisition.prototype.$submit = submit;
        Requisition.prototype.$remove = remove;
        Requisition.prototype.$approve = approve;
        Requisition.prototype.$reject = reject;
        Requisition.prototype.$createForClient = createForClient;
        Requisition.prototype.$skip = skip;
        Requisition.prototype.$isInitiated = isInitiated;
        Requisition.prototype.$isSubmitted = isSubmitted;
        Requisition.prototype.$isApproved = isApproved;
        Requisition.prototype.$isAuthorized = isAuthorized;
        Requisition.prototype.$isInApproval = isInApproval;
        Requisition.prototype.$isReleased = isReleased;
        Requisition.prototype.$isRejected = isRejected;
        Requisition.prototype.$isSkipped = isSkipped;
        Requisition.prototype.$isAfterAuthorize = isAfterAuthorize;
        Requisition.prototype.$getProducts = getProducts;
        // #286 high level approver can skip some products in requisition
        Requisition.prototype.skipAllLineItems = skipAllLineItems;
        Requisition.prototype.unskipAllLineItems = unskipAllLineItems;
        // #286 ends here
        Requisition.prototype.getAvailableNonFullSupplyProducts = getAvailableNonFullSupplyProducts;
        Requisition.prototype.getAvailableFullSupplyProducts = getAvailableFullSupplyProducts;
        Requisition.prototype.getSkippedFullSupplyProducts = getSkippedFullSupplyProducts;
        Requisition.prototype.addLineItem = addLineItem;
        Requisition.prototype.addLineItems = addLineItems;
        Requisition.prototype.deleteLineItem = deleteLineItem;
        Requisition.prototype.unskipFullSupplyProducts = unskipFullSupplyProducts;
        // SIGLUS-REFACTOR: starts here
        Requisition.prototype.addProductLineItem = addProductLineItem;
        Requisition.prototype.getSkippedProducts = getSkippedProducts;
        Requisition.prototype.$isAfterApprove = isAfterApprove;
        Requisition.prototype.$isReleasedWithoutOrder = isReleasedWithoutOrder;
        // SIGLUS-REFACTOR: ends here
        Requisition.prototype.getColumns = getColumns;

        return Requisition;

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name requisition
         *
         * @description
         * Adds all needed methods and information from template to given requisition.
         *
         * @param  {Resource} source           resource with requisition
         * @param  {Resource} statusMessages   resource with status messages
         * @return {Requisition}               requisition with methods
         */
        function Requisition(source, statusMessages) {
            var requisition = this;

            Object.assign(this, source);

            this.template = new RequisitionTemplate(this.template, this);
            this.$statusMessages = $filter('orderBy')(statusMessages, '-createdDate');

            this.requisitionLineItems = [];
            source.requisitionLineItems.forEach(function(lineItem) {
                var newLineItem = new LineItem(lineItem, requisition);
                if (shouldPopulateApprovedQuantity(requisition)) {
                    setDefaultApprovedQuantity(newLineItem, requisition);
                    reCaculatePacksToShip(newLineItem, requisition);
                }
                requisition.requisitionLineItems.push(newLineItem);
            });

            this.$isEditable = isEditable(this);

            if (!this.idempotencyKey) {
                generateIdempotencyKey(this);
            }
            // SIGLUS-REFACTOR: starts here
            clearErrors(this);
            // SIGLUS-REFACTOR: ends here
        }

        // SIGLUS-REFACTOR: starts here
        function shouldPopulateApprovedQuantity(requisition) {
            return !requisition.extraData.isSaved && canApprove(requisition) && requisition.isExternalApproval;
        }

        function shouldApplyEstimatedQuantity(requisition) {
            var programId = _.get(requisition, [ 'program', 'id']);
            return requisition.template.getColumn(TEMPLATE_COLUMNS.ESTIMATED_QUANTITY).isDisplayed && [
                '10845cb9-d365-4aaa-badd-b4fa39c6a26a',
                'a24f19a8-3743-4a1a-a919-e8f97b5719ad',
                'bff50392-0a46-4da3-8adc-d47a37fb6a9f'
            ].includes(programId);
        }

        function setDefaultApprovedQuantity(lineItem, requisition) {
            if (!(lineItem.skipped) && _.isUndefined(lineItem.approvedQuantity)) {
                if (requisition.template.getColumn(TEMPLATE_COLUMNS.SUGGESTED_QUANTITY).isDisplayed) {
                    lineItem.approvedQuantity = lineItem.suggestedQuantity;
                } else if (requisition.template.getColumn(TEMPLATE_COLUMNS.AUTHORIZED_QUANTITY).isDisplayed) {
                    lineItem.approvedQuantity = lineItem.authorizedQuantity;
                } else if (requisition.template.getColumn(TEMPLATE_COLUMNS.THEORETICAL_QUANTITY_TO_REQUEST)
                    .isDisplayed) {
                    lineItem.approvedQuantity = lineItem.theoreticalQuantityToRequest;
                } else if (requisition.template.getColumn(TEMPLATE_COLUMNS.REQUESTED_QUANTITY).isDisplayed) {
                    lineItem.approvedQuantity = lineItem.requestedQuantity;
                } else if (shouldApplyEstimatedQuantity(requisition)) {
                    lineItem.approvedQuantity = lineItem.estimatedQuantity;
                } else {
                    lineItem.approvedQuantity = null;
                }
            }
        }

        function reCaculatePacksToShip(lineItem, requisition) {
            lineItem.packsToShip = calculationFactory.packsToShip(lineItem, requisition);
        }

        function clearErrors(requisition) {
            requisition.$error = undefined;
            angular.forEach(requisition.kitUsageLineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.services), function(serviceName) {
                    lineItem.services[serviceName].$error = undefined;
                });
            });
            angular.forEach(requisition.usageInformationLineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.informations), function(information) {
                    angular.forEach(Object.keys(lineItem.informations[information].orderables), function(orderableId) {
                        lineItem.informations[information].orderables[orderableId].$error = undefined;
                    });
                });
            });
            siglusRequisitionUtils.clearTestConsumptionError(requisition.testConsumptionLineItems);
            removeBasicLineItemsError(requisition.patientLineItems);
            removeBasicLineItemsError(requisition.consultationNumberLineItems);
            removeBasicLineItemsError(requisition.regimenLineItems);
            removeBasicLineItemsError(requisition.regimenSummaryLineItems);
        }

        function removeBasicLineItemsError(lineItems) {
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    lineItem.columns[columnName].$error = undefined;
                });
            });
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name authorize
         *
         * @description
         * Authorizes requisition.
         *
         * @return {Promise} requisition promise
         */
        function authorize() {
            var requisition = this;
            return handlePromise(resource.authorize({
                id: requisition.id,
                idempotencyKey: this.idempotencyKey
            }, {}).$promise, function(authorized) {
                updateRequisition(requisition, authorized);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name remove
         *
         * @description
         * Removes requisition.
         *
         * @return {Promise} promise that resolves after requisition is deleted
         */
        function remove() {
            var requisition = this;
            return handlePromise(resource.remove({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }).$promise, function() {
                offlineRequisitions.removeBy('id', requisition.id);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name save
         *
         * @description
         * Saves requisition.
         *
         * @return {Promise} requisition promise
         */
        function save() {
            var availableOffline = this.$availableOffline,
                id = this.id;
            return handlePromise(resource.save({
                id: this.id
            }, this).$promise, function(saved) {
                saveToStorage(saved, availableOffline);
            }, function(saved) {
                if (saved.status === 409 || saved.status === 403) {
                    // in case of conflict or unauthorized, remove requisition from storage
                    offlineRequisitions.removeBy('id', id);
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name submit
         *
         * @description
         * Submits requisition.
         *
         * @return {Promise} requisition promise
         */
        function submit() {
            var requisition = this;
            return handlePromise(resource.submit({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(submitted) {
                updateRequisition(requisition, submitted);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name approve
         *
         * @description
         * Approves requisition.
         *
         * @return {Promise} promise that resolves when requisition is approved
         */
        function approve() {
            var requisition = this;
            return handlePromise(resource.approve({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(approved) {
                updateRequisition(requisition, approved);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name reject
         *
         * @description
         * Rejects requisition.
         *
         * @return {Promise} promise that resolves when requisition is rejected
         */
        function reject() {
            var requisition = this;
            return handlePromise(resource.reject({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(rejected) {
                updateRequisition(requisition, rejected);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        function createForClient() {
            // this.id = null;
            this.requisitionLineItems.forEach(function(lineItem) {
                lineItem[TEMPLATE_COLUMNS.AUTHORIZED_QUANTITY] = lineItem.requestedQuantity;
            });
            return handlePromise(resource.createForClient({
                id: this.facility.id,
                idempotencyKey: this.idempotencyKey
            }, this).$promise);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skip
         *
         * @description
         * Skips requisition.
         *
         * @return {Promise} promise that resolves when requisition is skipped
         */
        function skip() {
            var requisition = this;
            return handlePromise(resource.skip({
                id: requisition.id,
                idempotencyKey: requisition.idempotencyKey
            }, {}).$promise, function(requisition) {
                offlineRequisitions.removeBy('id', requisition.id);
            }, function(data) {
                handleFailure(data, requisition);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isInitiated
         *
         * @description
         * Responsible for checking if requisition is initiated.
         * Returns true only if requisition status equals initiated.
         *
         * @return {Boolean} is requisition initiated
         */
        function isInitiated() {
            return this.status === REQUISITION_STATUS.INITIATED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isSubmitted
         *
         * @description
         * Responsible for checking if requisition is submitted.
         * Returns true only if requisition status equals submitted.
         *
         * @return {Boolean} is requisition submitted
         */
        function isSubmitted() {
            return this.status === REQUISITION_STATUS.SUBMITTED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isAuthorized
         *
         * @description
         * Responsible for checking if requisition is authorized.
         * Returns true only if requisition status equals authorized.
         *
         * @return {Boolean} is requisition authorized
         */
        function isAuthorized() {
            return this.status === REQUISITION_STATUS.AUTHORIZED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isApproved
         *
         * @description
         * Responsible for checking if requisition is approved.
         * Returns true only if requisition status equals approved.
         *
         * @return {Boolean} is requisition approved
         */
        function isApproved() {
            return this.status === REQUISITION_STATUS.APPROVED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isInApproval
         *
         * @description
         * Responsible for checking if requisition is in approval.
         * Returns true only if requisition status equals in approval.
         *
         * @return {Boolean} is requisition in approval
         */
        function isInApproval() {
            return this.status === REQUISITION_STATUS.IN_APPROVAL;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isReleased
         *
         * @description
         * Responsible for checking if requisition is released.
         * Returns true only if requisition status equals released.
         *
         * @return {Boolean} is requisition released
         */
        function isReleased() {
            return this.status === REQUISITION_STATUS.RELEASED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isRejected
         *
         * @description
         * Responsible for checking if requisition is rejected.
         * Returns true only if requisition status equals rejected.
         *
         * @return {Boolean} is requisition rejected
         */
        function isRejected() {
            return this.status === REQUISITION_STATUS.REJECTED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isSkipped
         *
         * @description
         * Responsible for checking if requisition is skipped.
         * Returns true only if requisition status equals skipped.
         *
         * @return {Boolean} is requisition skipped
         */
        function isSkipped() {
            return this.status === REQUISITION_STATUS.SKIPPED;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isAfterAuthorize
         *
         * @description
         * Checks if this requisition was authorized.
         * Will return true if this requisition has authorized status, or any later status.
         *
         * @return {Boolean} true if this requisition's status is an after authorize status
         */
        function isAfterAuthorize() {
            return [REQUISITION_STATUS.AUTHORIZED, REQUISITION_STATUS.IN_APPROVAL,
                REQUISITION_STATUS.APPROVED, REQUISITION_STATUS.RELEASED,
                REQUISITION_STATUS.RELEASED_WITHOUT_ORDER].indexOf(this.status) !== -1;
        }

        function isAfterApprove() {
            return [REQUISITION_STATUS.IN_APPROVAL,
                REQUISITION_STATUS.APPROVED, REQUISITION_STATUS.RELEASED,
                REQUISITION_STATUS.RELEASED_WITHOUT_ORDER].indexOf(this.status) !== -1;
        }

        function isReleasedWithoutOrder() {
            return this.status === REQUISITION_STATUS.RELEASED_WITHOUT_ORDER;
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name isEditable
         *
         * @description
         * Checks if this requisition is editable based on its status and user rights.
         *
         * @return {boolean} true if this requisition is editable, false otherwise
         */
        function isEditable(requisition) {
            return canSubmit(requisition)
                || canAuthorize(requisition)
                || canApprove(requisition)
                || canDelete(requisition);
        }

        function canSubmit(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_CREATE, requisition)
                && (requisition.$isInitiated() || requisition.$isRejected());
        }

        function canAuthorize(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition)
                && (requisition.$isInitiated() || requisition.$isRejected() || requisition.$isSubmitted());
        }

        function canApprove(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_APPROVE, requisition)
                && (requisition.$isAuthorized() || requisition.$isInApproval());
        }

        function canDelete(requisition) {
            return hasRight(REQUISITION_RIGHTS.REQUISITION_DELETE, requisition)
                && hasRight(REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition)
                && requisition.$isSubmitted();
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getAvailableNonFullSupplyProducts
         *
         * @description
         * Returns a list of available non full supply products that does not have a line item
         * added.
         *
         * @return  {Array} the array of available non full supply line items
         */
        function getAvailableNonFullSupplyProducts() {
            return filterOutOrderablesWithLineItems(
                this.availableNonFullSupplyProducts,
                this.requisitionLineItems
            );
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getAvailableFullSupplyProducts
         *
         * @description
         * Returns a list of available full supply products that does not have a line item added.
         *
         * @return  {Array} the array of available full supply line items
         */
        function getAvailableFullSupplyProducts() {
            return filterOutOrderablesWithLineItems(
                this.availableFullSupplyProducts,
                this.requisitionLineItems
            );
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getSkippedFullSupplyProducts
         *
         * @description
         * Returns a list of skipped full supply products that does not have a line item added.
         *
         * @return  {Array} the array of skipped full supply products
         */
        function getSkippedFullSupplyProducts() {
            return this.requisitionLineItems
                .filter(function(requisitionLineItem) {
                    return requisitionLineItem.$program.fullSupply && requisitionLineItem.skipped;
                })
                .map(function(lineItem) {
                    return lineItem.orderable;
                });
        }

        // #352: can add skipped products
        function getSkippedProducts() {
            return this.requisitionLineItems
                .filter(function(requisitionLineItem) {
                    return requisitionLineItem.skipped;
                })
                .map(function(lineItem) {
                    var orderable = lineItem.orderable;
                    orderable.skipped = true;
                    return orderable;
                });
        }
        // #352: ends here

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name addLineItem
         *
         * @description
         * Creates a new line item based on the given orderable, requested quantity and explanation.
         * If requisition status does not allow for adding line items an exception will be thrown.
         * If a line item for the given orderable exists an exception will be thrown.
         * If the given orderable is not on the list of available non full supply products an
         * exception will be thrown.
         *
         * @param   {Object}    orderable                       the orderable
         * @param   {integer}   requestedQuantity               the requested quantity
         * @param   {string}    requestedQuantityExplanation    the explanation
         */
        function addLineItem(orderable, requestedQuantity, requestedQuantityExplanation) {
            var orderableProgram = getOrderableProgramById(orderable.programs, this.program.id);

            this.requisitionLineItems.push(new LineItem({
                orderable: orderable,
                requestedQuantity: requestedQuantity,
                requestedQuantityExplanation: requestedQuantityExplanation,
                pricePerPack: orderableProgram.pricePerPack,
                $deletable: true
            }, this));
        }

        // SIGLUS-REFACTOR: add new method addProductLineItem
        function addProductLineItem(lineItem) {
            var orderableProgram = _.first(lineItem.orderable.programs);
            var newLineItem = new LineItem(_.assign(lineItem, {
                pricePerPack: orderableProgram.pricePerPack,
                $deletable: true
            }), this);
            this.requisitionLineItems.push(newLineItem);
            return newLineItem;
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name addLineItems
         *
         * @description
         * Creates new line items based on the given orderables.
         *
         * @param {Object} orderable  the orderables
         */
        function addLineItems(orderables) {
            var requisition = this;
            orderables.forEach(function(orderable) {
                requisition.addLineItem(orderable);
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name deleteLineItem
         *
         * @description
         * Removes the given line item from the requisition.
         * If requisition status does not allow for removing line items an exception will be thrown.
         * If line item is not part of the requisition an exception will be thrown.
         * If line item is full supply an exception will be thrown.
         *
         * @param   {LineItem}  lineItem    the line item to be deleted
         */
        function deleteLineItem(lineItem) {
            var lineItemIndex = this.requisitionLineItems.indexOf(lineItem);
            this.requisitionLineItems.splice(lineItemIndex, 1);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name getProducts
         *
         * @description
         * Returns a list of products.
         *
         * @param   {Boolean} nonFullSupply the flag defining wether full supply or non full supply
         *                                  products should be returned
         * @return  {List}                  the list of products
         */
        function getProducts(nonFullSupply) {
            return $filter('filter')(this.requisitionLineItems, {
                $program: {
                    fullSupply: !nonFullSupply
                }
            });
        }

        // #286 high level approver can skip some products in requisition
        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skipAllLineItems
         *
         * @description
         * Skips all line items.
         */
        function skipAllLineItems() {
            this.requisitionLineItems.forEach(function(lineItem) {
                if (lineItem.canBeSkipped()) {
                    lineItem.skipped = true;
                }
            });
        }

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name skipAllLineItems
         *
         * @description
         * Unskips all line items.
         */
        function unskipAllLineItems() {
            this.requisitionLineItems.forEach(function(lineItem) {
                lineItem.skipped = false;
            });
        }
        // #286 ends here

        /**
         * @ngdoc method
         * @methodOf requisition.Requisition
         * @name unskipFullSupplyProducts
         *
         * @description
         * Unskip line items for the passed full supply products.
         */
        function unskipFullSupplyProducts(products) {
            var productIds = products.map(function(product) {
                return product.id;
            });

            this.requisitionLineItems
                .filter(function(lineItem) {
                    return productIds.indexOf(lineItem.orderable.id) > -1;
                })
                .forEach(function(lineItem) {
                    lineItem.skipped = false;
                });
        }

        function getOrderableProgramById(programs, programId) {
            return programs.filter(function(program) {
                return program.programId === programId;
            })[0];
        }

        function filterOutOrderablesWithLineItems(orderables, lineItems) {
            var alreadyAddedOrderableIdList = lineItems.map(function(lineItem) {
                return _.get(lineItem, ['orderable', 'id']);
            });
            return orderables.filter(function(orderable) {
                return !alreadyAddedOrderableIdList.includes(orderable.id);
            });
        }

        function handlePromise(promise, success, failure) {
            var deferred = $q.defer();

            promise
                .then(function(response) {
                    if (success) {
                        success(response);
                    }
                    deferred.resolve(response);
                })
                .catch(function(response) {
                    if (failure) {
                        failure(response);
                    }
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        function updateRequisition(requisition, updated) {
            var availableOffline = requisition.$availableOffline;

            requisition.modifiedDate = updated.modifiedDate;
            requisition.status = updated.status;
            requisition.statusChanges = updated.statusChanges;

            if (requisition.$isAuthorized()) {
                populateApprovedQuantity(requisition);
            }

            generateIdempotencyKey(requisition);

            saveToStorage(requisition, availableOffline);
        }

        function saveToStorage(requisition, shouldSave) {
            if (shouldSave) {
                requisition.$modified = false;
                requisition.$availableOffline = true;
                requisitionCacheService.cacheRequisition(requisition);
            }
        }

        function populateApprovedQuantity(requisition) {
            if (requisition.template.getColumn(TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY).isDisplayed) {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    if (!(lineItem.skipped)) {
                        if (lineItem.requestedQuantity === null) {
                            lineItem.approvedQuantity = lineItem.calculatedOrderQuantity;
                        } else {
                            lineItem.approvedQuantity = lineItem.requestedQuantity;
                        }
                    }
                });
            } else {
                angular.forEach(requisition.requisitionLineItems, function(lineItem) {
                    if (!(lineItem.skipped)) {
                        lineItem.approvedQuantity = lineItem.requestedQuantity;
                    }
                });
            }
        }

        function transformRequisition(requisition) {
            var columns = requisition.template.columnsMap,
                requestBody = angular.copy(requisition);

            angular.forEach(requestBody.requisitionLineItems, function(lineItem) {
                transformLineItem(lineItem, columns);
                delete lineItem.$program;
                delete lineItem.$errors;

                lineItem.orderable = {
                    id: lineItem.orderable.id,
                    versionNumber: lineItem.orderable.meta.versionNumber
                };
                if (!lineItem.approvedProduct.versionNumber) {
                    lineItem.approvedProduct.versionNumber = lineItem.approvedProduct.meta.versionNumber;
                }
            });

            requestBody.processingPeriod.startDate = dateUtils.toStringDate(
                requestBody.processingPeriod.startDate
            );
            requestBody.processingPeriod.endDate = dateUtils.toStringDate(
                requestBody.processingPeriod.endDate
            );

            requestBody.program = {
                id: requestBody.program.id
            };

            requestBody.facility = {
                id: requestBody.facility.id
            };

            delete requestBody.availableNonFullSupplyProducts;
            delete requestBody.availableFullSupplyProducts;
            delete requestBody.availableProducts;
            delete requestBody.stockAdjustmentReasons;
            delete requestBody.template;

            return angular.toJson(requestBody);
        }

        function getETag(config) {
            return config.data.eTag;
        }

        function getIdempotencyKey(config) {
            var key = config.params.idempotencyKey;
            if (key) {
                delete config.params.idempotencyKey;
                return key;
            }
        }

        function handleFailure(data, requisition) {
            if (data.status !== 409) {
                generateIdempotencyKey(requisition);
            }
        }

        // #517: admin can set details of suggested quantity
        function transformLineItem(lineItem, columns) {
            angular.forEach(columns, function(column) {
                if (TEMPLATE_COLUMNS.AUTHORIZED_QUANTITY === column.name) {
                    return;
                }
                if (!column.$display || (column.source === COLUMN_SOURCES.CALCULATED
                    && column.name !== TEMPLATE_COLUMNS.SUGGESTED_QUANTITY
                    && column.name !== TEMPLATE_COLUMNS.EXPIRATION_DATE)) {
                    lineItem[column.name] = null;
                }
            });
        }
        // #517: ends here

        function hasRight(right, requisition) {
            return authorizationService.hasRight(right, {
                programId: requisition.program.id,
                facilityId: requisition.facility.id
            });
        }

        function generateIdempotencyKey(requisition) {
            var newId = new UuidGenerator().generate();
            requisition.idempotencyKey = newId;
        }

        function getColumns(isInitForClient) {
            var columns = this.template.getColumns();
            if (isInitForClient) {
                columns = columns.filter(function(column) {
                    return column.name !== 'expirationDate';
                });
                columns.forEach(function(column) {
                    if (column.source === 'STOCK_CARDS') {
                        column.source = 'USER_INPUT';
                    }
                    if (column.source === 'USER_INPUT') {
                        column.$required = true;
                    }
                });
            }
            return columns;
        }
    }

})();
