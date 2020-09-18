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
describe('siglusColumnUtils', function() {

    var siglusColumnUtils, COLUMN_SOURCES;

    beforeEach(function() {
        module('admin-template');

        inject(function($injector) {
            siglusColumnUtils = $injector.get('siglusColumnUtils');
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
        });
    });

    describe('isUserInput', function() {
        it('should return true if column source is user input', function() {
            var column = {
                source: COLUMN_SOURCES.USER_INPUT
            };

            expect(siglusColumnUtils.isUserInput(column)).toBe(true);
        });

        it('should return false if column source is reference date', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(siglusColumnUtils.isUserInput(column)).toBe(false);
        });
    });

    describe('isCalculated', function() {
        it('should return true if column source is caculated', function() {
            var column = {
                source: COLUMN_SOURCES.CALCULATED
            };

            expect(siglusColumnUtils.isCalculated(column)).toBe(true);
        });

        it('should return false if column source is reference date', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(siglusColumnUtils.isCalculated(column)).toBe(false);
        });
    });

    describe('isStockCards', function() {
        it('should return true if column source is stock cards', function() {
            var column = {
                source: COLUMN_SOURCES.STOCK_CARDS
            };

            expect(siglusColumnUtils.isStockCards(column)).toBe(true);
        });

        it('should return false if column source is reference date', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(siglusColumnUtils.isStockCards(column)).toBe(false);
        });
    });

    describe('isTotal', function() {
        it('should return true if column name is total', function() {
            var column = {
                name: 'total'
            };

            expect(siglusColumnUtils.isTotal(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(siglusColumnUtils.isTotal(column)).toBe(false);
        });
    });

    describe('columnDisplayName', function() {
        it('should return formatted source name', function() {
            var column = {
                source: COLUMN_SOURCES.REFERENCE_DATA
            };

            expect(siglusColumnUtils.columnDisplayName(column)).toBe('requisitionConstants.referenceData');
        });
    });

    describe('isAPES', function() {
        it('should return true if column name is APES', function() {
            var column = {
                name: 'APES'
            };

            expect(siglusColumnUtils.isAPES(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(siglusColumnUtils.isAPES(column)).toBe(false);
        });
    });

    describe('isPositive', function() {
        it('should return true if column name is positive', function() {
            var column = {
                name: 'positive'
            };

            expect(siglusColumnUtils.isPositive(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(siglusColumnUtils.isPositive(column)).toBe(false);
        });
    });

    describe('isConsumo', function() {
        it('should return true if column name is consumo', function() {
            var column = {
                name: 'consumo'
            };

            expect(siglusColumnUtils.isConsumo(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(siglusColumnUtils.isConsumo(column)).toBe(false);
        });
    });

    describe('isCode', function() {
        it('should return true if column name is code', function() {
            var column = {
                name: 'code'
            };

            expect(siglusColumnUtils.isCode(column)).toBe(true);
        });

        it('should return false if column name is HF', function() {
            var column = {
                name: 'HF'
            };

            expect(siglusColumnUtils.isCode(column)).toBe(false);
        });
    });
});
