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

describe('siglusLocationPhysicalInventoryDraftListController', function() {

    var $controller, draftList, programName,
        messageService, facility, vm, alertService,
        alertConfirmModalService, physicalInventoryService, loadingModalService;

    function prepareInjector() {
        inject(function($injector) {
            $controller = $injector.get('$controller');
            // $q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$stateParams = $injector.get('$stateParams');
            alertService = $injector.get('alertService');
            alertConfirmModalService = $injector.get('alertConfirmModalService');
            physicalInventoryService = $injector.get('physicalInventoryService');
            loadingModalService = $injector.get('loadingModalService');
            messageService = $injector.get('messageService');
        });
    }
    beforeEach(function() {
        module('siglus-location-physical-inventory-draft-list');
        module('stock-physical-inventory');
        module('stock-products');
        module('stock-orderable-group');
        module('siglus-alert-confirm-modal');

        prepareInjector();
        spyOn(this.$state, 'go');
        draftList = [];
        programName = 'test';
        vm = $controller('siglusLocationPhysicalInventoryDraftListController', {
            draftList: draftList,
            messageService: messageService,
            $state: this.$state,
            $stateParams: this.$stateParams,
            programName: programName,
            facility: facility,
            alertService: alertService,
            alertConfirmModalService: alertConfirmModalService,
            physicalInventoryService: physicalInventoryService,
            loadingModalService: loadingModalService
        });

        vm.$onInit();
    });

    describe('getStatus', function() {

        it('should return translate', function() {
            var isStarter = 'NOT_YET_STARTED';

            expect(vm.getStatus(isStarter)).toEqual(messageService.get('stockPhysicalInventory.notStarted'));
        });

    });

    describe('clickActions', function() {

        it('should go to initialInventory page', function() {
            vm.isInitialInventory = true;
            var item = {
                subDraftId: [1, 2],
                status: 'NOT_YET_STARTED',
                groupNum: '1'
            };
            var params = {
                subDraftIds: '1,2',
                actionType: 'NOT_YET_STARTED',
                draftNum: '1'
            };
            vm.clickActions(item);

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.locationManagement.initialInventory.draft', params);
        });

        it('should go to physicalInventory page', function() {
            vm.isInitialInventory = false;
            var item = {
                subDraftId: [1, 2],
                status: 'NOT_YET_STARTED',
                groupNum: '1'
            };
            var params = {
                subDraftIds: '1,2',
                actionType: 'NOT_YET_STARTED',
                draftNum: '1'
            };
            vm.clickActions(item);

            expect(this.$state.go).toHaveBeenCalledWith(
                'openlmis.locationManagement.physicalInventory.draftList.draft',
                params
            );
        });

    });

    describe('getTitle', function() {

        it('should return initial', function() {
            vm.isInitialInventory = true;

            expect(vm.getTitle()).toEqual(messageService.get('stockPhysicalInventory.initialTitle'));
        });

        it('should return pysical', function() {
            vm.isInitialInventory = false;

            expect(vm.getTitle()).toEqual(messageService.get('stockPhysicalInventory.title'));
        });

    });
});
