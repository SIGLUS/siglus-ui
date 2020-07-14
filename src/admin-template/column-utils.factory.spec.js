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
describe('columnUtils', function() {

    var columnUtils, COLUMN_SOURCES;

    beforeEach(function() {
        module('admin-template');

        inject(function($injector) {
            columnUtils = $injector.get('columnUtils');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
        });
    });

    describe('isUserInput', function() {
        it('should return true if column source is user input', function() {
            var column = {
                source: COLUMN_SOURCES.USER_INPUT
            };

            expect(columnUtils.isUserInput(column)).toBe(true);
        });

        it('should return false if column source is reference date', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(columnUtils.isUserInput(column)).toBe(false);
        });
    });

    describe('isStockCards', function() {
        it('should return true if column source is stock cards', function() {
            var column = {
                source: COLUMN_SOURCES.STOCK_CARDS
            };

            expect(columnUtils.isStockCards(column)).toBe(true);
        });

        it('should return false if column source is reference date', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(columnUtils.isStockCards(column)).toBe(false);
        });
    });

    describe('isTotal', function() {
        it('should return true if column name is total', function() {
            var column = {
                name: 'total'
            };

            expect(columnUtils.isTotal(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(columnUtils.isTotal(column)).toBe(false);
        });
    });

    describe('columnDisplayName', function() {
        it('should return formatted source name', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(columnUtils.columnDisplayName(column)).toBe('requisitionConstants.referenceData');
        });
    });

    describe('isAPES', function() {
        it('should return true if column name is APES', function() {
            var column = {
                name: 'APES'
            };

            expect(columnUtils.isAPES(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(columnUtils.isAPES(column)).toBe(false);
        });
    });
});
