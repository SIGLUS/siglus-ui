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

    angular
        .module('requisition')
        .factory('RequisitionDataBuilder', RequisitionDataBuilder);

    RequisitionDataBuilder.$inject = [
        'RequisitionLineItemDataBuilder', 'FacilityDataBuilder', 'ProgramDataBuilder',
        'PeriodDataBuilder', 'RequisitionTemplateDataBuilder', 'OrderableDataBuilder',
        'REQUISITION_STATUS', 'ReasonDataBuilder', 'Requisition', 'ProgramOrderableDataBuilder'
    ];

    function RequisitionDataBuilder(RequisitionLineItemDataBuilder, FacilityDataBuilder,
                                    ProgramDataBuilder, PeriodDataBuilder,
                                    RequisitionTemplateDataBuilder, OrderableDataBuilder,
                                    REQUISITION_STATUS, ReasonDataBuilder, Requisition,
                                    ProgramOrderableDataBuilder) {

        RequisitionDataBuilder.prototype.build = build;
        RequisitionDataBuilder.prototype.buildJson = buildJson;
        RequisitionDataBuilder.prototype.withCreatedDate = withCreatedDate;
        RequisitionDataBuilder.prototype.withRequisitionLineItems = withRequisitionLineItems;
        RequisitionDataBuilder.prototype.withProgram = withProgram;
        RequisitionDataBuilder.prototype.withProcessingPeriod = withProcessingPeriod;
        RequisitionDataBuilder.prototype.withFacility = withFacility;
        RequisitionDataBuilder.prototype.withStockAdjustmentReasons = withStockAdjustmentReasons;
        RequisitionDataBuilder.prototype.withAvailableProducts = withAvailableProducts;
        RequisitionDataBuilder.prototype.buildSubmitted = buildSubmitted;
        RequisitionDataBuilder.prototype.buildAuthorized = buildAuthorized;
        RequisitionDataBuilder.prototype.buildInApproval = buildInApproval;
        RequisitionDataBuilder.prototype.buildApproved = buildApproved;
        RequisitionDataBuilder.prototype.buildReleased = buildReleased;
        RequisitionDataBuilder.prototype.buildSkipped = buildSkipped;
        RequisitionDataBuilder.prototype.buildRejected = buildRejected;
        RequisitionDataBuilder.prototype.buildEmergency = buildEmergency;

        return RequisitionDataBuilder;

        function RequisitionDataBuilder() {
            RequisitionDataBuilder.instanceNumber =
                (RequisitionDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = RequisitionDataBuilder.instanceNumber;

            this.id = 'requisition-id-' + instanceNumber;
            this.createdDate = '2016-06-14T12:00:00Z';
            this.modifiedDate = '2016-06-14T12:00:00.000Z';
            this.program = new ProgramDataBuilder().build();
            this.requisitionLineItems = [
                new RequisitionLineItemDataBuilder()
                    .fullSupplyForProgram(this.program)
                    .buildJson(),
                new RequisitionLineItemDataBuilder()
                    .nonFullSupplyForProgram(this.program)
                    .buildJson()
            ];
            this.draftStatusMessage = 'Requisition ' + instanceNumber + ' status message draft';
            this.facility = new FacilityDataBuilder().build();
            this.processingPeriod = new PeriodDataBuilder().build();
            this.status = REQUISITION_STATUS.INITIATED;
            this.emergency = false;
            this.supplyingFacility = 'supplying-facility-id-' + instanceNumber;
            this.supervisoryNode = 'supervisory-node-id-' + instanceNumber;
            this.template = new RequisitionTemplateDataBuilder().buildJson();
            this.eTag = 'W/1';

            var programsForNonFullSupplyOrderables = [
                new ProgramOrderableDataBuilder()
                    .withFullSupply()
                    .buildJson(),
                new ProgramOrderableDataBuilder()
                    .withProgramId(this.program.id)
                    .withOrderableCategoryDisplayOrder(1)
                    .withPricePerPack(20.77)
                    .buildJson()
            ];

            var programsForFullSupplyOrderables = [
                new ProgramOrderableDataBuilder()
                    .withProgramId('program-id-1' + instanceNumber)
                    .withOrderableDisplayCategoryId('orderable-display-category-id-1' + instanceNumber)
                    .withOrderableCategoryDisplayName('Category 1' + instanceNumber)
                    .buildJson(),
                new ProgramOrderableDataBuilder()
                    .withProgramId(this.program.id)
                    .withOrderableDisplayCategoryId('orderable-display-category-id-2' + instanceNumber)
                    .withOrderableCategoryDisplayName('Category 2' + instanceNumber)
                    .withOrderableCategoryDisplayOrder(1)
                    .withPricePerPack(20.77)
                    .withFullSupply()
                    .buildJson()
            ];

            this.availableProducts = [
                new OrderableDataBuilder().withPrograms(programsForFullSupplyOrderables)
                    .buildJson(),
                new OrderableDataBuilder().withPrograms(programsForFullSupplyOrderables)
                    .buildJson(),
                new OrderableDataBuilder().withPrograms(programsForFullSupplyOrderables)
                    .buildJson(),
                new OrderableDataBuilder().withPrograms(programsForNonFullSupplyOrderables)
                    .buildJson(),
                new OrderableDataBuilder().withPrograms(programsForNonFullSupplyOrderables)
                    .buildJson(),
                new OrderableDataBuilder().withPrograms(programsForNonFullSupplyOrderables)
                    .buildJson()
            ];

            this.statusChanges = {
                INITIATED: {
                    authorId: 'author-id-' + instanceNumber,
                    changeDate: '2018-02-21T10:59:02.758Z'
                }
            };
            this.statusHistory = [{
                status: REQUISITION_STATUS.INITIATED,
                statusMessageDto: null,
                authorId: 'author-id-' + instanceNumber,
                previousStatusChangeId: null,
                createdDate: '2018-02-21T10:59:02.758Z'
            }];
            this.datePhysicalStockCountCompleted = null;
            this.stockAdjustmentReasons = [
                new ReasonDataBuilder().build(),
                new ReasonDataBuilder().build(),
                new ReasonDataBuilder().build(),
                new ReasonDataBuilder().build()
            ];
        }

        function buildJson() {
            var builder = this;
            return {
                id: builder.id,
                createdDate: builder.createdDate,
                modifiedDate: builder.modifiedDate,
                requisitionLineItems: builder.requisitionLineItems,
                draftStatusMessage: builder.draftStatusMessage,
                facility: builder.facility,
                program: builder.program,
                processingPeriod: builder.processingPeriod,
                status: builder.status,
                emergency: builder.emergency,
                supplyingFacility: builder.supplyingFacility,
                supervisoryNode: builder.supervisoryNode,
                template: builder.template,
                availableProducts: builder.availableProducts,
                statusChange: builder.statusChange,
                statusHistory: builder.statusHistory,
                datePhysicalStockCountCompleted: builder.datePhysicalStockCountCompleted,
                stockAdjustmentReasons: builder.stockAdjustmentReasons,
                eTag: builder.eTag,
                // SIGLUS-REFACTOR: starts here
                extraData: {
                    isSaved: true
                }
                // SIGLUS-REFACTOR: ends here
            };
        }

        function buildSubmitted() {
            this.status = REQUISITION_STATUS.SUBMITTED;
            return this.build();
        }

        function buildAuthorized() {
            this.status = REQUISITION_STATUS.AUTHORIZED;
            return this.build();
        }

        function buildInApproval() {
            this.status = REQUISITION_STATUS.IN_APPROVAL;
            return this.build();
        }

        function buildApproved() {
            this.status = REQUISITION_STATUS.APPROVED;
            return this.build();
        }

        function buildReleased() {
            this.status = REQUISITION_STATUS.RELEASED;
            return this.build();
        }

        function buildSkipped() {
            this.status = REQUISITION_STATUS.SKIPPED;
            return this.build();
        }

        function buildRejected() {
            this.status = REQUISITION_STATUS.REJECTED;
            return this.build();
        }

        function buildEmergency() {
            this.emergency = true;
            return this.build();
        }

        function build() {
            return spyOnMethods(new Requisition(this.buildJson()));
        }

        function withCreatedDate(createdDate) {
            this.createdDate = createdDate;
            return this;
        }

        function withRequisitionLineItems(requisitionLineItems) {
            this.requisitionLineItems = requisitionLineItems;
            return this;
        }

        function withProgram(program) {
            this.program = program;
            return this;
        }

        function withProcessingPeriod(processingPeriod) {
            this.processingPeriod = processingPeriod;
            return this;
        }

        function withFacility(facility) {
            this.facility = facility;
            return this;
        }

        function withStockAdjustmentReasons(stockAdjustmentReasons) {
            this.stockAdjustmentReasons = stockAdjustmentReasons;
            return this;
        }

        function withAvailableProducts(availableProducts) {
            this.availableProducts = availableProducts;
            return this;
        }

        function spyOnMethods(requisition) {
            spyOn(requisition, '$isInitiated').andCallThrough();
            spyOn(requisition, '$isRejected').andCallThrough();
            spyOn(requisition, '$isApproved').andCallThrough();
            spyOn(requisition, '$isSubmitted').andCallThrough();
            spyOn(requisition, '$isAuthorized').andCallThrough();
            spyOn(requisition, '$isInApproval').andCallThrough();
            spyOn(requisition, '$isReleased').andCallThrough();
            spyOn(requisition, '$isAfterAuthorize').andCallThrough();
            spyOn(requisition, '$isSkipped').andCallThrough();
            spyOn(requisition, 'addLineItem').andCallThrough();
            spyOn(requisition, 'addLineItems').andCallThrough();
            spyOn(requisition, 'deleteLineItem').andCallThrough();
            spyOn(requisition, 'getAvailableFullSupplyProducts').andCallThrough();
            spyOn(requisition, 'getAvailableNonFullSupplyProducts').andCallThrough();
            spyOn(requisition, 'unskipFullSupplyProducts').andCallThrough();
            spyOn(requisition, 'getSkippedFullSupplyProducts').andCallThrough();
            spyOn(requisition, '$skip').andCallThrough();
            spyOn(requisition, '$save').andCallThrough();
            spyOn(requisition, '$approve').andCallThrough();
            spyOn(requisition, '$reject').andCallThrough();
            spyOn(requisition, '$remove').andCallThrough();
            spyOn(requisition, '$submit').andCallThrough();
            spyOn(requisition, '$authorize').andCallThrough();

            spyOn(requisition.template, 'getColumns').andCallThrough();
            spyOn(requisition.template, 'hasSkipColumn').andCallThrough();
            spyOn(requisition.template, 'hideSkippedLineItems').andCallThrough();

            return requisition;
        }
    }

})();
