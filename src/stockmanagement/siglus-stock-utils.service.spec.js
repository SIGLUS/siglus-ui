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

describe('siglusStockUtilsService', function() {

    var service;

    beforeEach(function() {
        module('stockmanagement');
        inject(function($injector) {
            service = $injector.get('siglusStockUtilsService');
        });

    });

    describe('formatDate', function() {
        it('should format to string when input is a string date', function() {

            expect(service.formatDate('2022-08-01')).toEqual('2022-08-01');
        });

        it('should format to string when input is a date type', function() {
            var date = new Date();
            date.setUTCFullYear(2022, 8, 22);

            expect(service.formatDate(date)).toEqual('2022-09-22');
        });

        it('should return origin value when input is not true', function() {

            expect(service.formatDate('')).toEqual('');
        });

    });

    describe('getInitialDraftName', function() {
        it('should return Outros and locationFreeText string when destinationName is Outros and draft type is issue',
            function() {
                var iniitialDraftInfo = {
                    destinationId: 'A000001',
                    destinationName: 'Outros',
                    locationFreeText: 'number-01'
                };

                expect(service.getInitialDraftName(iniitialDraftInfo, 'issue')).toEqual('Outros: number-01');
            });

        it('should return destinationName string when destinationName is not Outros and draft type is issue',
            function() {
                var iniitialDraftInfo = {
                    destinationId: 'A000001',
                    destinationName: 'Centro de Saude de Ancuaze',
                    locationFreeText: ''
                };

                expect(service.getInitialDraftName(iniitialDraftInfo, 'issue')).toEqual('Centro de Saude de Ancuaze');
            });

        it('return Outros and locationFreeText string when destinationName is Outros and draft type is receive',
            function() {
                var iniitialDraftInfo = {
                    sourceId: 'A000001',
                    sourceName: 'Outros',
                    locationFreeText: 'source'
                };

                expect(service.getInitialDraftName(iniitialDraftInfo, 'receive')).toEqual('Outros: source');
            });

        it('should return destinationName string when destinationName is not Outros and draft type is receive',
            function() {
                var iniitialDraftInfo = {
                    sourceId: 'A000001',
                    sourceName: 'Centro de Saude de Ancuaze',
                    locationFreeText: ''
                };

                expect(service.getInitialDraftName(iniitialDraftInfo, 'receive')).toEqual('Centro de Saude de Ancuaze');
            });

    });

    describe('isExistInitialDraft', function() {
        it('should return true when initialDraftInfo include destinationId and draft type is issue', function() {

            var initialDraftInfo = {
                destinationId: 'A000001',
                destinationName: 'Centro de Saude de Ancuaze',
                locationFreeText: ''
            };

            expect(service.isExistInitialDraft(initialDraftInfo, 'issue')).toEqual(true);
        });

        it('should return true when initialDraftInfo include sourceId and draft type is receive', function() {

            var initialDraftInfo = {
                sourceId: 'A000001',
                sourceName: 'Centro de Saude de Ancuaze',
                locationFreeText: ''
            };

            expect(service.isExistInitialDraft(initialDraftInfo, 'receive')).toEqual(true);
        });
    });
});

