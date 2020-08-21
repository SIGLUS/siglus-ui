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
        .module('requisition-template')
        .factory('RequisitionTemplateDataBuilder', RequisitionTemplateDataBuilder);

    RequisitionTemplateDataBuilder.$inject = [
        'ObjectReferenceDataBuilder', 'RequisitionColumnDataBuilder', 'TEMPLATE_COLUMNS',
        'RequisitionTemplate'
    ];

    function RequisitionTemplateDataBuilder(ObjectReferenceDataBuilder,
                                            RequisitionColumnDataBuilder, TEMPLATE_COLUMNS,
                                            RequisitionTemplate) {

        RequisitionTemplateDataBuilder.prototype.build = build;
        RequisitionTemplateDataBuilder.prototype.buildJson = buildJson;
        RequisitionTemplateDataBuilder.prototype.withSkipColumn = withSkipColumn;
        RequisitionTemplateDataBuilder.prototype.buildWithSkipColumn = buildWithSkipColumn;

        return RequisitionTemplateDataBuilder;

        function RequisitionTemplateDataBuilder() {
            RequisitionTemplateDataBuilder.instanceNumber =
                (RequisitionTemplateDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = RequisitionTemplateDataBuilder.instanceNumber;
            this.createdDate = '2016-06-14T12:00:00Z';
            this.modifiedDate = '2016-06-14T12:00:00Z';
            this.numberOfPeriodsToAverage = 3;
            this.name = 'Template ' + instanceNumber;
            this.populateStockOnHandFromStockCards = false;
            this.program = new ObjectReferenceDataBuilder()
                .withId('program-id-' + instanceNumber)
                .build();
            this.facilityTypes = [
                new ObjectReferenceDataBuilder()
                    .withId('facility-type-' + instanceNumber)
                    .build()
            ];
            this.columnsMap = {
                productCode: new RequisitionColumnDataBuilder()
                    .buildProductCodeColumn(),
                productName: new RequisitionColumnDataBuilder()
                    .buildProductNameColumn(),
                stockOnHand: new RequisitionColumnDataBuilder()
                    .buildStockOnHandColumn(),
                requestedQuantity: new RequisitionColumnDataBuilder()
                    .buildRequestedQuantityColumn(),
                requestedQuantityExplanation: new RequisitionColumnDataBuilder()
                    .buildRequestedQuantityExplanationColumn(),
                beginningBalance: new RequisitionColumnDataBuilder()
                    .buildBeginningBalanceColumn()
            };
        }

        function build() {
            return new RequisitionTemplate(this.buildJson());
        }

        function buildJson() {
            return {
                createdDate: this.createdDate,
                modifiedDate: this.modifiedDate,
                numberOfPeriodsToAverage: this.numberOfPeriodsToAverage,
                name: this.name,
                populateStockOnHandFromStockCards: this.populateStockOnHandFromStockCards,
                program: this.program,
                facilityTypes: this.facilityTypes,
                columnsMap: this.columnsMap
            };
        }

        // SIGLUS-REFACTOR: Only external approval can see APPROVED_QUANTITY, REMARKS, SUGGESTED_QUANTITY,
        // SKIPPED and PACKS_TO_SHIP if it's showPackToShipInApprovalPage
        function withSkipColumn(hideOptionSelected, requisition) {
            this.columnsMap.skipped = new RequisitionColumnDataBuilder()
                .buildSkipColumn(hideOptionSelected, requisition);
            return this;
        }
        // SIGLUS-REFACTOR: ends here

        function buildWithSkipColumn() {
            return this.withSkipColumn().build();
        }
    }

})();
