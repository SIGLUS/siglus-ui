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

describe('SiglusTemplateConfigureSectionController', function() {

    //tested
    var vm;

    //mocks
    var tags;

    //injects
    var $rootScope, $scope, $controller, COLUMN_SOURCES, MAX_COLUMN_DESCRIPTION_LENGTH, SIGLUS_MAX_ADD_LENGTH,
        notificationService, templateValidator;

    beforeEach(function() {
        module('siglus-admin-template-configure-section');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            $controller = $injector.get('$controller');
            MAX_COLUMN_DESCRIPTION_LENGTH = $injector.get('MAX_COLUMN_DESCRIPTION_LENGTH');
            SIGLUS_MAX_ADD_LENGTH = $injector.get('SIGLUS_MAX_ADD_LENGTH');
            notificationService = $injector.get('notificationService');
            templateValidator = $injector.get('templateValidator');
        });

        tags = [
            'tag-1',
            'tag-2',
            'tag-3'
        ];

        vm = $controller('SiglusTemplateConfigureSectionController', {
            $scope: $scope
        });
        vm.section = {
            name: 'collection',
            columns: [{
                name: 'kitOpened',
                source: COLUMN_SOURCES.STOCK_CARDS,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.STOCK_CARDS],
                    supportsTag: true,
                    canChangeOrder: false
                }
            }, {
                name: 'new',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }]
        };
        vm.tags = tags;

        spyOn(notificationService, 'error');
        spyOn(templateValidator, 'getSiglusSectionError');

        vm.$onInit();
    });

    describe('onInit', function() {

        it('should set maxColumnDescriptionLength', function() {
            expect(vm.maxColumnDescriptionLength).toEqual(MAX_COLUMN_DESCRIPTION_LENGTH);
        });

        it('should set columnMap', function() {
            expect(vm.columnMap).toEqual({
                kitOpened: {
                    name: 'kitOpened',
                    source: COLUMN_SOURCES.STOCK_CARDS,
                    columnDefinition: {
                        sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.STOCK_CARDS],
                        supportsTag: true,
                        canChangeOrder: false
                    }
                },
                new: {
                    name: 'new',
                    columnDefinition: {
                        sources: [],
                        supportsTag: false,
                        canChangeOrder: true
                    }
                }
            });
        });

        it('should set availableTags', function() {
            expect(vm.availableTags).toEqual({
                kitOpened: [
                    'tag-1',
                    'tag-2',
                    'tag-3'
                ]
            });
        });
    });

    describe('canChangeSource', function() {

        it('should return true if sources definition length > 1', function() {
            expect(vm.canChangeSource(vm.section.columns[0])).toBe(true);
        });

        it('should return false if sources definition is empty', function() {
            expect(vm.canChangeSource(vm.section.columns[1])).toBe(false);
        });
    });

    describe('sourceDisplayName', function() {

        it('should return User input is source is USER_INPUT', function() {
            expect(vm.sourceDisplayName(COLUMN_SOURCES.USER_INPUT)).toBe('requisitionConstants.userInput');
        });
    });

    describe('canAssignTag', function() {

        it('should return true if column support tag and source is stock card', function() {
            expect(vm.canAssignTag(vm.section.columns[0])).toBe(true);
        });

        it('should return false if column support tag and source is user input', function() {
            vm.section.columns[0].source = COLUMN_SOURCES.USER_INPUT;

            expect(vm.canAssignTag(vm.section.columns[0])).toBe(false);
        });

        it('should return false if column does not support tag', function() {
            expect(vm.canAssignTag(vm.section.columns[1])).toBe(false);
        });
    });

    describe('refreshAvailableTags', function() {

        it('should set list of available tags to columns that supports tags', function() {
            vm.section.columns[0].tag = 'tag-1';
            vm.refreshAvailableTags();

            expect(vm.availableTags).toEqual({
                kitOpened: ['tag-2', 'tag-3', 'tag-1']
            });
        });

        it('should not set list of available tags to columns that not supports tags', function() {
            vm.refreshAvailableTags();

            expect(vm.availableTags.new).toBe(undefined);
        });
    });

    describe('addColumn', function() {

        beforeEach(function() {
            vm.onAddColumn = jasmine.createSpy().andCallFake(function() {
                vm.section.columns.push({
                    columnDefinition: {
                        supportsTag: true
                    }
                });
            });
        });

        it('should not add column is added column exceed SIGLUS_MAX_ADD_LENGTH', function() {
            for (var i = 0; i < SIGLUS_MAX_ADD_LENGTH; i++) {
                vm.section.columns.push({
                    columnDefinition: {}
                });
            }

            vm.addColumn();

            expect(vm.onAddColumn).not.toHaveBeenCalled();
        });

        it('should set newColumn0 for added column', function() {
            vm.addColumn();

            expect(vm.section.columns.length).toBe(3);
            expect(vm.section.columns[2].name).toBe('newColumn0');
        });

        it('should set newColumn1 for second added column', function() {
            vm.addColumn();
            vm.addColumn();

            expect(vm.section.columns.length).toBe(4);
            expect(vm.section.columns[3].name).toBe('newColumn1');
        });

        it('should update column map for second added column', function() {
            vm.addColumn();
            vm.addColumn();
            $rootScope.$apply();

            expect(vm.columnMap.newColumn0).toEqual({
                name: 'newColumn0',
                displayOrder: 2,
                columnDefinition: {
                    supportsTag: true
                }
            });

            expect(vm.columnMap.newColumn1).toEqual({
                name: 'newColumn1',
                displayOrder: 3,
                columnDefinition: {
                    supportsTag: true
                }
            });
        });

        it('should update label for added column', function() {
            vm.addColumn();
            vm.addColumn();

            expect(vm.availableTags).toEqual({
                kitOpened: ['tag-1', 'tag-2', 'tag-3'],
                newColumn0: ['tag-1', 'tag-2', 'tag-3'],
                newColumn1: ['tag-1', 'tag-2', 'tag-3']
            });
        });

        it('should update column display order', function() {
            vm.addColumn();
            $rootScope.$apply();

            expect(vm.section.columns[0].displayOrder).toBe(0);
            expect(vm.section.columns[1].displayOrder).toBe(1);
            expect(vm.section.columns[2].displayOrder).toBe(2);

            vm.addColumn();
            $rootScope.$apply();

            expect(vm.section.columns[3].displayOrder).toBe(3);
        });
    });

    describe('removeColumn', function() {

        it('should remove the index column', function() {

            vm.removeColumn(1);

            expect(vm.columnMap.new).toBeUndefined();
        });

        it('should update display order for all columns', function() {
            vm.section.columns.push(vm.section.columns[1]);
            vm.removeColumn(1);
            $rootScope.$apply();

            expect(vm.section.columns[0].displayOrder).toBe(0);
            expect(vm.section.columns[1].displayOrder).toBe(1);
        });

        it('should update tag for all columns if removed column has tag', function() {
            vm.section.columns[0].tag = 'tag-1';
            vm.section.columns[1].columnDefinition.supportsTag = true;
            vm.refreshAvailableTags();

            expect(vm.availableTags.new).toEqual(['tag-2', 'tag-3']);

            vm.removeColumn(0);

            expect(vm.availableTags.new).toEqual(['tag-1', 'tag-2', 'tag-3']);
        });
    });

    describe('overMaxColumnsLength', function() {

        it('should false if there are two added columns', function() {
            expect(vm.overMaxColumnsLength()).toBe(false);
        });

        it('should return true if added column exceed SIGLUS_MAX_ADD_LENGTH', function() {
            for (var i = 0; i < SIGLUS_MAX_ADD_LENGTH; i++) {
                vm.section.columns.push({
                    columnDefinition: {}
                });
            }

            expect(vm.overMaxColumnsLength()).toBe(true);
        });
    });

    describe('dropCallback', function() {

        it('notificationService should be called if dropStopIndex is before locked column', function() {
            vm.dropCallback({}, 0, vm.section.columns[1]);

            expect(notificationService.error).toHaveBeenCalledWith('adminProgramTemplate.canNotDropColumn');
        });

        it('notificationService should be called if droppedItem is locked', function() {
            vm.dropCallback({}, 1, vm.section.columns[0]);

            expect(notificationService.error).toHaveBeenCalledWith('adminProgramTemplate.canNotDropColumn');
        });

        it('should insert moved item if drop up', function() {
            var column = {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            };
            vm.section.columns.push(column);
            vm.dropCallback({}, 1, vm.section.columns[2]);

            expect(vm.section.columns).toEqual([{
                name: 'kitOpened',
                source: COLUMN_SOURCES.STOCK_CARDS,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.STOCK_CARDS],
                    supportsTag: true,
                    canChangeOrder: false
                }
            }, {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }, {
                name: 'new',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }]);
        });

        it('should insert moved item if drop down', function() {
            var column = {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            };
            vm.section.columns.push(column);
            vm.dropCallback({}, 3, vm.section.columns[1]);

            expect(vm.section.columns).toEqual([{
                name: 'kitOpened',
                source: COLUMN_SOURCES.STOCK_CARDS,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.STOCK_CARDS],
                    supportsTag: true,
                    canChangeOrder: false
                }
            }, {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }, {
                name: 'new',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }]);
        });

        it('noting should happened if dropped item index equal stop index', function() {
            var column = {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            };
            vm.section.columns.push(column);
            vm.dropCallback({}, 1, vm.section.columns[1]);

            expect(vm.section.columns).toEqual([{
                name: 'kitOpened',
                source: COLUMN_SOURCES.STOCK_CARDS,
                columnDefinition: {
                    sources: [COLUMN_SOURCES.USER_INPUT, COLUMN_SOURCES.STOCK_CARDS],
                    supportsTag: true,
                    canChangeOrder: false
                }
            }, {
                name: 'new',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }, {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: false,
                    canChangeOrder: true
                }
            }]);
        });
    });

    describe('sourceChanged', function() {

        it('should remove tag if column source change to stock card', function() {
            vm.section.columns[0].tag = 'tag-1';
            vm.section.columns[0].source = COLUMN_SOURCES.USER_INPUT;
            vm.sourceChanged(vm.section.columns[0]);

            expect(vm.section.columns[0].tag).toBe(null);
        });

        it('should refresh tag if column has tag', function() {
            var column = {
                name: 'new1',
                columnDefinition: {
                    sources: [],
                    supportsTag: true
                }
            };
            vm.section.columns.push(column);
            vm.section.columns[0].tag = 'tag-1';
            vm.refreshAvailableTags();

            expect(vm.availableTags.new1).toEqual(['tag-2', 'tag-3']);

            vm.section.columns[0].source = COLUMN_SOURCES.USER_INPUT;
            vm.sourceChanged(vm.section.columns[0]);

            expect(vm.availableTags.new1).toEqual(['tag-1', 'tag-2', 'tag-3']);
        });
    });

    describe('updateSectionError', function() {

        it('getSiglusSectionError should be called', function() {
            vm.updateSectionError();

            expect(templateValidator.getSiglusSectionError).toHaveBeenCalledWith(vm.section);
        });
    });
});
