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

describe('LineItem', function() {

    var LineItem, requisitionLineItem, authorizationServiceSpy, program, facility, calculationFactory,
        lineItem, REQUISITION_RIGHTS, userAlwaysHasRight, userHasCreateRight, userHasAuthorizedRight,
        userHasApprovedRight;

    beforeEach(function() {
        module('requisition');

        calculationFactory = jasmine.createSpyObj('calculationFactory', ['totalCost', 'adjustedConsumption']);
        calculationFactory.totalCost.andReturn(20);

        module(function($provide) {
            $provide.factory('calculationFactory', function() {
                return calculationFactory;
            });
        });

        module('openlmis-templates', function($provide) {

            authorizationServiceSpy = jasmine.createSpyObj('authorizationService', ['hasRight', 'isAuthenticated']);
            $provide.service('authorizationService', function() {
                return authorizationServiceSpy;
            });

            userAlwaysHasRight = true;
            authorizationServiceSpy.hasRight.andCallFake(function(right) {
                if (userAlwaysHasRight) {
                    return true;
                }
                if (userHasApprovedRight && right === REQUISITION_RIGHTS.REQUISITION_APPROVE) {
                    return true;
                }
                if (userHasAuthorizedRight && right === REQUISITION_RIGHTS.REQUISITION_AUTHORIZE) {
                    return true;
                }
                if (userHasCreateRight && right === REQUISITION_RIGHTS.REQUISITION_CREATE) {
                    return true;
                }
                return false;
            });

            authorizationServiceSpy.isAuthenticated.andReturn(true);
        });

        inject(function(_LineItem_, _TEMPLATE_COLUMNS_, _REQUISITION_RIGHTS_) {
            REQUISITION_RIGHTS = _REQUISITION_RIGHTS_;
            LineItem = _LineItem_;
        });

        var template = jasmine.createSpyObj('template', ['getColumns']);
        template.columnsMap = [
            {
                name: 'requestedQuantity',
                source: 'USER_INPUT',
                $type: 'NUMERIC',
                $display: true
            },
            {
                name: 'requestedQuantityExplanation',
                source: 'USER_INPUT',
                $type: 'TEXT',
                $display: true
            },
            {
                name: 'totalCost',
                source: 'CALCULATED',
                $type: 'CURRENCY',
                $display: true
            },
            {
                name: 'adjustedConsumption',
                source: 'CALCULATED',
                $type: 'NUMERIC',
                $display: true
            },
            {
                name: 'columnWithoutCalculations',
                source: 'CALCULATED',
                $type: 'NUMERIC',
                $display: true
            },
            {
                name: 'pricePerPack',
                source: 'REFERENCE_DATA',
                $type: 'CURRENCY',
                $display: true
            }

        ];
        template.getColumns.andCallFake(function() {
            return template.columnsMap;
        });

        program = {
            id: '1',
            name: 'program1'
        };
        facility = {
            id: '2',
            name: 'facility2'
        };

        requisitionLineItem = {
            $program: {
                fullSupply: true
            },
            orderable: {
                id: '1',
                fullProductName: 'product',
                productCode: 'P1',
                programs: [
                    {
                        programId: program.id
                    }
                ]
            },
            requestedQuantity: 10,
            requestedQuantityExplanation: 'explanation'
        };

        this.requisition = jasmine.createSpyObj('requisition', ['$isApproved', '$isAuthorized', '$isInApproval',
            '$isReleased', '$isInitiated', '$isSubmitted', '$isRejected']);
        this.requisition.$isApproved.andReturn(false);
        this.requisition.$isAuthorized.andReturn(false);
        this.requisition.$isInitiated.andReturn(false);
        this.requisition.$isReleased.andReturn(false);
        this.requisition.$isSubmitted.andReturn(false);
        this.requisition.$isRejected.andReturn(false);
        this.requisition.requisitionLineItems = [requisitionLineItem];
        this.requisition.program = program;
        this.requisition.facility = facility;
        this.requisition.status = 'SUBMITTED';
        this.requisition.template = template;
        this.requisition.processingPeriod = {
            startDate: [2016, 4, 1],
            endDate: [2016, 4, 30]
        };
        lineItem = new LineItem(requisitionLineItem, this.requisition);
    });

    it('should add needed properties and methods to requisition line item', function() {
        expect(lineItem.orderable).toEqual(requisitionLineItem.orderable);
        expect(lineItem.$errors).toEqual({});
        expect(lineItem.$program).toEqual(requisitionLineItem.orderable.programs[0]);
        expect(angular.isFunction(lineItem.getFieldValue)).toBe(true);
        expect(angular.isFunction(lineItem.updateFieldValue)).toBe(true);
        // #227: user can add both full supply & non-fully supply product
        expect(this.requisition.template.getColumns).toHaveBeenCalledWith();
        // #227: ends here
    });

    it('should get pricePerPack value from line item if $program.pricePerPack is undefined', function() {
        requisitionLineItem = {
            $program: {
                fullSupply: true,
                pricePerPack: 5.2
            },
            orderable: {
                id: '1',
                fullProductName: 'product',
                productCode: 'P1',
                programs: [
                    {
                        programId: program.id,
                        pricePerPack: 5.2
                    }
                ]
            },
            requestedQuantity: 10,
            requestedQuantityExplanation: 'explanation'
        };
        lineItem = new LineItem(requisitionLineItem, this.requisition);

        expect(lineItem.getFieldValue('pricePerPack')).toEqual(5.2);
    });

    describe('updateFieldValue', function() {

        it('should not update values in line item if they are set', function() {
            lineItem.updateFieldValue(this.requisition.template.columnsMap[0], this.requisition);
            lineItem.updateFieldValue(this.requisition.template.columnsMap[1], this.requisition);

            expect(lineItem.requestedQuantity).toEqual(requisitionLineItem.requestedQuantity);
            expect(lineItem.requestedQuantityExplanation).toEqual(requisitionLineItem.requestedQuantityExplanation);
        });

        it('should update values in line item if they are undefined', function() {
            lineItem.requestedQuantity = undefined;
            lineItem.requestedQuantityExplanation = undefined;
            lineItem.totalCost = undefined;

            lineItem.updateFieldValue(this.requisition.template.columnsMap[0], this.requisition);
            lineItem.updateFieldValue(this.requisition.template.columnsMap[1], this.requisition);
            lineItem.updateFieldValue(this.requisition.template.columnsMap[2], this.requisition);
            lineItem.updateFieldValue(this.requisition.template.columnsMap[5], this.requisition);

            expect(lineItem.requestedQuantity).toEqual(null);
            expect(lineItem.requestedQuantityExplanation).toEqual('');
            expect(lineItem.totalCost).toEqual(20);
            expect(lineItem.pricePerPack).toEqual(null);
        });

        it('should call proper calculation method when column name is Adjusted Consumption', function() {
            lineItem.updateFieldValue(this.requisition.template.columnsMap[3], this.requisition);

            expect(calculationFactory.adjustedConsumption).toHaveBeenCalledWith(lineItem, this.requisition);
        });

        it('should call proper calculation method when column name is calculated and not Adjusted Consumption',
            function() {
                lineItem.updateFieldValue(this.requisition.template.columnsMap[2], this.requisition);

                expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItem, this.requisition);
            });

        it('should set null if there is no calculation method for given column', function() {
            lineItem.columnWithoutCalculations = 100;

            lineItem.updateFieldValue(this.requisition.template.columnsMap[4], this.requisition);

            expect(lineItem.columnWithoutCalculations).toBe(null);
        });
    });

    // #286 high level approver can skip some products in requisition
    describe('canBeSkipped', function() {

        it('should return true if line item can be skipped', function() {
            lineItem.approvedQuantity = '';

            var result = lineItem.canBeSkipped();

            expect(result).toBe(true);
        });

        it('should return false if line item cannot be skipped', function() {
            lineItem.approvedQuantity = 100;

            var result = lineItem.canBeSkipped();

            expect(result).toBe(false);
        });

        // it('should return false if requisition status is authorized', function() {
        //     lineItem.requestedQuantity = 0;
        //     lineItem.requestedQuantityExplanation = '';
        //     this.requisition.$isAuthorized.andReturn(true);
        //
        //     var result = lineItem.canBeSkipped(this.requisition);
        //
        //     expect(result).toBe(false);
        // });
        //
        // it('should return false if requisition status is in approval', function() {
        //     lineItem.requestedQuantity = 0;
        //     lineItem.requestedQuantityExplanation = '';
        //     this.requisition.$isInApproval.andReturn(true);
        //
        //     var result = lineItem.canBeSkipped(this.requisition);
        //
        //     expect(result).toBe(false);
        // });
        //
        // it('should return false if requisition status is approved', function() {
        //     lineItem.requestedQuantity = 0;
        //     lineItem.requestedQuantityExplanation = '';
        //     this.requisition.$isApproved.andReturn(true);
        //
        //     var result = lineItem.canBeSkipped(this.requisition);
        //
        //     expect(result).toBe(false);
        // });
        //
        // it('should return false if requisition status is released', function() {
        //     lineItem.requestedQuantity = 0;
        //     lineItem.requestedQuantityExplanation = '';
        //     this.requisition.$isReleased.andReturn(true);
        //
        //     var result = lineItem.canBeSkipped(this.requisition);
        //
        //     expect(result).toBe(false);
        // });
    });
    // #286 ends here
});
