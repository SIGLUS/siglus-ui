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
describe('siglusRequisitionUtils', function() {

    var siglusRequisitionUtils, lineItems;

    beforeEach(function() {
        module('requisition');

        inject(function($injector) {
            siglusRequisitionUtils = $injector.get('siglusRequisitionUtils');
        });
    });

    describe('getBasicLineItemsTotal', function() {
        beforeEach(function() {
            lineItems = [{
                columns: {
                    patients: {
                        value: undefined
                    }
                }
            }, {
                columns: {
                    patients: {
                        value: undefined
                    }
                }
            }];
        });

        it('should return undefined if line items value are undefined', function() {
            expect(siglusRequisitionUtils.getBasicLineItemsTotal(lineItems, {
                name: 'patients'
            })).toBeUndefined();
        });

        it('should return undefined if a item has no value property', function() {
            lineItems.push({
                columns: {
                    patients: {}
                }
            });

            expect(siglusRequisitionUtils.getBasicLineItemsTotal(lineItems, {
                name: 'patients'
            })).toBeUndefined();
        });

        it('should return undefined if a item value is null', function() {
            lineItems.push({
                columns: {
                    patients: {
                        value: null
                    }
                }
            });

            expect(siglusRequisitionUtils.getBasicLineItemsTotal(lineItems, {
                name: 'patients'
            })).toBeUndefined();
        });

        it('should return total if a item value is not empty', function() {
            lineItems[0].columns.patients.value = 10;

            expect(siglusRequisitionUtils.getBasicLineItemsTotal(lineItems, {
                name: 'patients'
            })).toBe(10);
        });

        it('should return total if all items value are not empty', function() {
            lineItems[0].columns.patients.value = 10;
            lineItems[1].columns.patients.value = 10;

            expect(siglusRequisitionUtils.getBasicLineItemsTotal(lineItems, {
                name: 'patients'
            })).toBe(20);
        });
    });
});
