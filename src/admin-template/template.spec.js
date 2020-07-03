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

describe('Template', function() {

    beforeEach(function() {
        module('admin-template');

        this.originalIncludes = Array.prototype.includes;
        Array.prototype.includes = function(entry) {
            return this.indexOf(entry) > -1;
        };

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.Template = $injector.get('Template');
            this.TemplateColumn = $injector.get('TemplateColumn');
            this.COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            this.TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
            this.TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            this.RequisitionColumn = $injector.get('RequisitionColumn');
            this.TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
        });

        this.templateJson = new this.TemplateDataBuilder()
            .withColumn(
                new this.TemplateColumnDataBuilder()
                    .withName('someColumn')
                    .build()
            )
            .buildJson();
    });

    describe('constructor', function() {

        it('should copy all possible fields', function() {
            this.template = new this.Template(this.templateJson);

            expect(this.template.createdDate).toEqual(this.templateJson.createdDate);
            expect(this.template.id).toEqual(this.templateJson.id);
            expect(this.template.numberOfPeriodsToAverage).toEqual(this.templateJson.numberOfPeriodsToAverage);
            expect(this.template.program.id).toEqual(this.templateJson.program.id);
            expect(this.template.populateStockOnHandFromStockCards)
                .toEqual(this.templateJson.populateStockOnHandFromStockCards);

            expect(this.template.name).toEqual(this.templateJson.name);
        });

        it('should wrap columns with class', function() {
            this.template = new this.Template(this.templateJson);

            for (var columnName in this.template.columnsMap) {
                expect(this.template.columnsMap[columnName] instanceof this.TemplateColumn).toBe(true);
            }
        });

        // #248: kit usage section configure
        it('should sort section column by displayOrder', function() {
            this.templateJson.kitUsage = [{
                name: 'collection',
                columns: [{
                    name: 'kitOpened',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: true
                    }
                }, {
                    name: 'new',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }]
            }];
            this.template = new this.Template(this.templateJson);

            expect(this.template.kitUsage).toEqual([{
                name: 'collection',
                columns: [{
                    name: 'new',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }, {
                    name: 'kitOpened',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: true
                    }
                }]
            }]);
        });
        // #248: ends here

        // #247: usage information section configure
        it('should sort section column of usageInformation by displayOrder', function() {
            this.templateJson.usageInformation = [{
                name: 'information',
                columns: [{
                    name: 'default information',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: true
                    }
                }, {
                    name: 'new information',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }]
            }];
            this.template = new this.Template(this.templateJson);

            expect(this.template.usageInformation).toEqual([{
                name: 'information',
                columns: [{
                    name: 'new information',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }, {
                    name: 'default information',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: true
                    }
                }]
            }]);
        });
        // #247: ends here

        // #341: test consumption section configure
        it('should sort section column of Test Consumption by displayOrder', function() {
            this.templateJson.testConsumption = [{
                name: 'outcome',
                columns: [{
                    name: 'default outcome',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }, {
                    name: 'new outcome',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }]
            }];
            this.template = new this.Template(this.templateJson);

            expect(this.template.testConsumption).toEqual([{
                name: 'outcome',
                columns: [{
                    name: 'new outcome',
                    displayOrder: 0,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }, {
                    name: 'default outcome',
                    source: null,
                    displayOrder: 1,
                    columnDefinition: {
                        sources: [],
                        supportsTag: false
                    }
                }]
            }]);
        });
        // #341: ends here
    });

    describe('move', function() {

        beforeEach(function() {
            this.template = new this.TemplateDataBuilder()
                .withoutColumns()
                .withTotalColumn()
                .withRemarksColumn()
                .withAverageConsumptionColumn()
                .withRequestedQuantityColumn()
                .withRequestedQuantityExplanationColumn()
                .build();
        });

        it('should move total column below remarks column', function() {
            var requisitionTemplate, columnCopy;

            requisitionTemplate = new this.Template(this.template);
            this.$rootScope.$apply();

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(2);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);

            columnCopy = angular.copy(requisitionTemplate.columnsMap.total);

            expect(requisitionTemplate.moveColumn(columnCopy, 2)).toBe(true);

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(1);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(2);
        });

        it('should move remarks column above total column', function() {
            var requisitionTemplate, columnCopy;

            requisitionTemplate = new this.Template(this.template);
            this.$rootScope.$apply();

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(2);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);

            columnCopy = angular.copy(requisitionTemplate.columnsMap.remarks);

            expect(requisitionTemplate.moveColumn(columnCopy, 0)).toBe(true);

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(1);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(2);
        });

        it('should not move column if canChangeOrder is set to false', function() {
            var requisitionTemplate, columnCopy;

            requisitionTemplate = new this.Template(this.template);
            this.$rootScope.$apply();

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(2);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);

            requisitionTemplate.columnsMap.remarks.columnDefinition.canChangeOrder = false;

            columnCopy = angular.copy(requisitionTemplate.columnsMap.remarks);

            expect(requisitionTemplate.moveColumn(columnCopy, 0)).toBe(false);

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(2);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);
        });

        it('should not move column if it is not between the same pinned columns', function() {
            var requisitionTemplate, columnCopy;

            this.template.columnsMap.beginningBalance = new this.TemplateColumnDataBuilder()
                .buildBeginningBalanceColumn();
            this.template.columnsMap.remarks.displayOrder = 3;

            requisitionTemplate = new this.Template(this.template);
            this.$rootScope.$apply();

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(3);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);

            columnCopy = angular.copy(requisitionTemplate.columnsMap.remarks);

            expect(requisitionTemplate.moveColumn(columnCopy, 0)).toBe(false);

            expect(requisitionTemplate.columnsMap.remarks.displayOrder).toBe(3);
            expect(requisitionTemplate.columnsMap.beginningBalance.displayOrder).toBe(2);
            expect(requisitionTemplate.columnsMap.total.displayOrder).toBe(1);
        });
    });

    describe('changePopulateStockOnHandFromStockCards', function() {

        it('should change stock based columns sources to stock cards', function() {
            this.template = new this.TemplateDataBuilder().withPopulateStockOnHandFromStockCards()
                .withColumn({
                    name: this.TEMPLATE_COLUMNS.STOCK_ON_HAND,
                    source: this.COLUMN_SOURCES.USER_INPUT
                })
                .withColumn({
                    name: this.TEMPLATE_COLUMNS.BEGINNING_BALANCE,
                    source: this.COLUMN_SOURCES.USER_INPUT
                })
                .build();

            this.template.changePopulateStockOnHandFromStockCards();

            expect(this.template.columnsMap.stockOnHand.source).toEqual(this.COLUMN_SOURCES.STOCK_CARDS);
            expect(this.template.columnsMap.beginningBalance.source).toEqual(this.COLUMN_SOURCES.STOCK_CARDS);
        });

        it('should change the source to user input when possible', function() {
            this.template = new this.TemplateDataBuilder()
                .withColumn(
                    new this.TemplateColumnDataBuilder()
                        .asBeginningBalanceColumn()
                        .withSource(this.COLUMN_SOURCES.STOCK_CARDS)
                        .build()
                )
                .build();

            this.template.changePopulateStockOnHandFromStockCards();

            expect(this.template.columnsMap.beginningBalance.source).toEqual(this.COLUMN_SOURCES.USER_INPUT);
        });

        it('should not change the source to stock card if it is the first available source',
            function() {
                this.template = new this.TemplateDataBuilder()
                    .withColumn(
                        new this.TemplateColumnDataBuilder()
                            .asAverageConsumptionColumn()
                            .withSources([
                                this.COLUMN_SOURCES.STOCK_CARDS,
                                this.COLUMN_SOURCES.CALCULATED
                            ])
                            .withSource(this.COLUMN_SOURCES.STOCK_CARDS)
                            .build()
                    )
                    .build();

                this.template.changePopulateStockOnHandFromStockCards();

                expect(this.template.columnsMap.averageConsumption.source).toEqual(this.COLUMN_SOURCES.CALCULATED);
            });

        it('should change the source to the first available that is not stock card when user input is not available',
            function() {
                this.template = new this.TemplateDataBuilder()
                    .withColumn(
                        new this.TemplateColumnDataBuilder()
                            .asAverageConsumptionColumn()
                            .withSources([
                                this.COLUMN_SOURCES.CALCULATED,
                                this.COLUMN_SOURCES.STOCK_CARDS
                            ])
                            .withSource(this.COLUMN_SOURCES.STOCK_CARDS)
                            .build()
                    )
                    .build();

                this.template.changePopulateStockOnHandFromStockCards();

                expect(this.template.columnsMap.averageConsumption.source).toEqual(this.COLUMN_SOURCES.CALCULATED);
            });
    });

    describe('hasColumns', function() {

        beforeEach(function() {
            this.template = new this.Template(this.templateJson);
        });

        it('should return true if template has columns', function() {
            expect(this.template.hasColumns()).toBe(true);
        });

        it('should return false if template has no columns', function() {
            this.template.columnsMap = {};

            expect(this.template.hasColumns()).toBe(false);
        });
    });

    describe('removeColumn', function() {

        beforeEach(function() {
            this.template = new this.Template(this.templateJson);
        });

        it('should resolve if column removal was successful', function() {
            var spy = jasmine.createSpy();

            this.template.removeColumn('someColumn').then(spy);
            this.$rootScope.$apply();

            expect(spy).toHaveBeenCalled();
            expect(this.template.columnsMap.someColumn).toBe(undefined);
        });

        it('should reject if column removal was not successful', function() {
            var spy = jasmine.createSpy();

            this.template.removeColumn('notExistingColumn').catch(spy);
            this.$rootScope.$apply();

            expect(spy).toHaveBeenCalled();
            expect(this.template.columnsMap.someColumn).not.toBe(undefined);
        });
    });

    describe('addColumn', function() {

        beforeEach(function() {
            this.template = new this.TemplateDataBuilder()
                .withoutColumns()
                .build();

            // SIGLUS-REFACTOR: starts here
            this.columnWithDefaultSource = {
                name: 'columnWithDefaultSource',
                label: 'new column',
                indicator: 'columnWithDefaultSource',
                defaultSource: 'USER_INPUT',
                sources: ['USER_INPUT', 'STOCK_CARDS'],
                options: ['OPTION_1'],
                definition: 'definition',
                defaultTag: 'tag',
                displayOrder: 0
            };

            this.columnWithoutDefaultSource = {
                name: 'columnWithoutDefaultSource',
                label: 'new column',
                indicator: 'columnWithoutDefaultSource',
                sources: ['USER_INPUT', 'STOCK_CARDS'],
                options: ['OPTION_1'],
                definition: 'definition',
                defaultTag: 'tag',
                displayOrder: 0
            };
            // SIGLUS-REFACTOR: ends here
        });

        // SIGLUS-REFACTOR: starts here
        it('should add displayed column', function() {
            this.template.addColumn(this.columnWithDefaultSource, true);

            expect(this.template.columnsMap.columnWithDefaultSource).toEqual({
                name: this.columnWithDefaultSource.name,
                label: this.columnWithDefaultSource.label,
                indicator: this.columnWithDefaultSource.indicator,
                displayOrder: this.columnWithDefaultSource.displayOrder,
                isDisplayed: true,
                source: this.columnWithDefaultSource.defaultSource,
                columnDefinition: this.columnWithDefaultSource,
                option: this.columnWithDefaultSource.options[0],
                definition: this.columnWithDefaultSource.definition,
                tag: this.columnWithDefaultSource.defaultTag
            });
        });

        it('should add hidden column', function() {
            this.template.addColumn(this.columnWithDefaultSource, false);

            expect(this.template.columnsMap.columnWithDefaultSource).toEqual({
                name: this.columnWithDefaultSource.name,
                label: this.columnWithDefaultSource.label,
                indicator: this.columnWithDefaultSource.indicator,
                displayOrder: this.columnWithDefaultSource.displayOrder,
                isDisplayed: false,
                source: this.columnWithDefaultSource.defaultSource,
                columnDefinition: this.columnWithDefaultSource,
                option: this.columnWithDefaultSource.options[0],
                definition: this.columnWithDefaultSource.definition,
                tag: this.columnWithDefaultSource.defaultTag
            });
        });
        // SIGLUS-REFACTOR: ends here

        it('should not add column if parameter is undefined', function() {
            this.template.addColumn(undefined);

            expect(this.template.columnsMap).toEqual({});
        });

        // SIGLUS-REFACTOR: starts here
        it('should set STOCK_CARDS as source if possible', function() {
            this.template.addColumn(this.columnWithoutDefaultSource, false);

            expect(this.template.columnsMap.columnWithoutDefaultSource).toEqual({
                name: this.columnWithoutDefaultSource.name,
                label: this.columnWithoutDefaultSource.label,
                indicator: this.columnWithoutDefaultSource.indicator,
                displayOrder: this.columnWithoutDefaultSource.displayOrder,
                isDisplayed: false,
                source: this.COLUMN_SOURCES.STOCK_CARDS,
                columnDefinition: this.columnWithoutDefaultSource,
                option: this.columnWithoutDefaultSource.options[0],
                definition: this.columnWithoutDefaultSource.definition,
                tag: this.columnWithoutDefaultSource.defaultTag
            });
        });

        it('should fallback to the first source option', function() {
            this.columnWithDefaultSource.sources =
                [this.COLUMN_SOURCES.CALCULATED, this.COLUMN_SOURCES.PREVIOUS_REQUISITION];

            this.template.addColumn(this.columnWithDefaultSource, false);

            expect(this.template.columnsMap.columnWithDefaultSource).toEqual({
                name: this.columnWithDefaultSource.name,
                label: this.columnWithDefaultSource.label,
                indicator: this.columnWithDefaultSource.indicator,
                displayOrder: this.columnWithDefaultSource.displayOrder,
                isDisplayed: false,
                source: this.COLUMN_SOURCES.CALCULATED,
                columnDefinition: this.columnWithDefaultSource,
                option: this.columnWithDefaultSource.options[0],
                definition: this.columnWithDefaultSource.definition,
                tag: this.columnWithDefaultSource.defaultTag
            });
        });
        // SIGLUS-REFACTOR: ends here
    });

    describe('create', function() {
        var repository;

        beforeEach(function() {
            repository = jasmine.createSpyObj('TemplateRepository', ['create']);
            repository.create.andReturn(true);

            this.template = new this.Template(this.templateJson, repository);
        });

        it('should call repository', function() {
            this.template.create();

            expect(repository.create).toHaveBeenCalledWith(this.template);
        });
    });

    describe('canAssignTag', function() {

        beforeEach(function() {
            this.templateJson.columnsMap.someColumn.columnDefinition.supportsTag = true;
            this.templateJson.populateStockOnHandFromStockCards = true;
            this.template = new this.Template(this.templateJson);
        });

        it('should return false if template has populateStockOnHandFromStockCards set to false', function() {
            this.template.populateStockOnHandFromStockCards = false;

            expect(this.template.canAssignTag('someColumn')).toBe(false);
        });

        it('should return false if column does not support tag', function() {
            this.template.columnsMap.someColumn.columnDefinition.supportsTag = false;

            expect(this.template.canAssignTag('someColumn')).toBe(false);
        });

        it('should return true if template has populateStockOnHandFromStockCards set to true and column supports tag',
            function() {
                expect(this.template.canAssignTag('someColumn')).toBe(true);
            });

        it('should return undefined if column with given name does not exist', function() {
            expect(this.template.canAssignTag('someNotExistingColumn')).toBeUndefined();
        });
    });

    afterEach(function() {
        Array.prototype.includes = this.originalIncludes;
    });

});
