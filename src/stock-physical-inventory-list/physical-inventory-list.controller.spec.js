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

describe('PhysicalInventoryListController', function() {

    var $controller, $q, $state, physicalInventoryService,
        messageService, programs, facility, deferred,
        vm, programId, SiglusPhysicalInventoryCreationService, alertService, $scope, $rootScope;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            $q = $injector.get('$q');
            // $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            physicalInventoryService = $injector.get('physicalInventoryService');
            alertService = $injector.get('alertService');
            SiglusPhysicalInventoryCreationService = $injector.get('SiglusPhysicalInventoryCreationService');
            // physicalInventoryFactory = $injector.get('physicalInventoryFactory');
            messageService = $injector.get('messageService');
        });
    }

    function prepareSpies() {
        deferred = $q.defer();
        spyOn($state, 'go');
        spyOn(SiglusPhysicalInventoryCreationService, 'show').andReturn(deferred.promise);
        spyOn(physicalInventoryService, 'validateConflictProgram').andReturn(deferred.promise);
        spyOn(alertService, 'error');
        spyOn($scope, '$on');
    }

    function prepareData() {
        programs = [{
            name: 'HIV',
            id: '1'
        }, {
            name: 'TB',
            id: '2'
        }];
        facility = {
            id: '10134',
            name: 'National Warehouse',
            supportedPrograms: programs
        };

        vm = $controller('PhysicalInventoryListController', {
            facility: facility,
            programs: programs,
            program: programs[0],
            programId: programId,
            messageService: messageService,
            $scope: $scope
        });
    }

    beforeEach(function() {
        module('stock-orderable-group');
        module('stock-physical-inventory-list');

        prepareInjector();
        prepareSpies();
        prepareData();
    });

    describe('onInit', function() {

        it('should init programs and physical inventory drafts properly', function() {
            expect(vm.programs).toEqual(programs);
        });

        // TODO: the function should be tested in selection controller
        // it('should get physical inventory draft status', function() {
        //     expect(vm.getDraftStatus(true)).toEqual(messageService.get('stockPhysicalInventory.notStarted'));
        //
        //     expect(vm.getDraftStatus(false)).toEqual(messageService.get('stockPhysicalInventory.draft'));
        // });

    });

    // TODO: the function should be tested in selection controller
    // describe('editDraft', function() {
    //
    //     it('should go to physical inventory page when proceed', function() {
    //         var draft = {
    //             id: 123,
    //             programId: '1',
    //             starter: false
    //         };
    //         spyOn(physicalInventoryFactory, 'getDraft').andReturn(
    //             $q.when(draft)
    //         );
    //
    //         vm.editDraft(draft);
    //         $rootScope.$apply();
    //
    //         expect($state.go).toHaveBeenCalledWith(
    //             'openlmis.stockmanagement.physicalInventory.draft', {
    //                 id: draft.id,
    //                 draft: draft,
    //                 program: {
    //                     name: 'HIV',
    //                     id: '1'
    //                 },
    //                 facility: facility
    //             }
    //         );
    //     });
    //
    //     it('should create draft to get id and go to physical inventory when proceed',
    //         function() {
    //             var draft = {
    //                 programId: '1',
    //                 starter: false
    //             };
    //             var id = '456';
    //             spyOn(physicalInventoryFactory, 'getDraft').andReturn(
    //                 $q.when(draft)
    //             );
    //             spyOn(physicalInventoryService, 'createDraft').andReturn(
    //                 $q.resolve({
    //                     id: id
    //                 })
    //             );
    //
    //             vm.editDraft(draft);
    //             $rootScope.$apply();
    //
    //             expect(physicalInventoryService.createDraft).toHaveBeenCalledWith(
    //                 draft.programId, facility.id
    //             );
    //         });
    // });

    // TODO: the function should be tested in selection controller
    // describe('validateDraftStatus', function() {
    //     it('should do initial draft input config when current program has no draft', function() {
    //
    //         vm.validateDraftStatus(true, null);
    //
    //         deferred.resolve({
    //             canStartInventory: true,
    //             containDraftProgramsList: []
    //         });
    //         $rootScope.$apply();
    //
    //         expect(SiglusPhysicalInventoryCreationService.show).toHaveBeenCalled();
    //     });
    //
    //     it('should enter draft list page when current program has draft', function() {
    //
    //         vm.validateDraftStatus(false, null);
    //
    //         deferred.resolve({
    //             canStartInventory: true,
    //             containDraftProgramsList: []
    //         });
    //         $rootScope.$apply();
    //
    //         expect($state.go).toHaveBeenCalledWith('openlmis.stockmanagement.physicalInventory.draftList');
    //     });
    //
    //     it('should alert error hint when validate is false', function() {
    //
    //         vm.validateDraftStatus(false, null);
    //
    //         deferred.resolve({
    //             canStartInventory: false,
    //             containDraftProgramsList: ['1', '2']
    //         });
    //         $rootScope.$apply();
    //
    //         expect(alertService.error).toHaveBeenCalledWith('stockPhysicalInventory.conflictProgram',
    //             '',
    //             '',
    //             {
    //                 programName: 'HIV,TB'
    //             });
    //     });
    // });
});
