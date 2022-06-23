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

    /**
       * @ngdoc controller
       * @name stock-physical-inventory-draft-list.controller:PhysicalInventoryDraftListController
       *
       * @description
       * Controller for managing physical inventory.
       */
    angular
        .module('siglus-physical-inventory-draft-list')
        .controller('siglusPhysicalInventoryDraftListController', controller);

    controller.$inject = ['draftList',  'messageService', '$state', '$stateParams', 'programName', 'facility'];

    function controller(draftList, messageService, $state, $stateParams, programName, facility) {
        // console.log('#### programName', programName);
        var vm = this;
        vm.$onInit = onInit;
        vm.draftList = [];
        vm.programName = programName;
        vm.facility = facility;
        vm.getStatus = function(isStarter) {
            if (isStarter) {
                return messageService.get('stockPhysicalInventory.notStarted');
            }
            return messageService.get('stockPhysicalInventory.draft');

        };
        vm.clickActions = function(item) {
            // console.log(item);
            var stateParams = angular.copy($stateParams);
            stateParams.subDraftIds = item.subDraftId.join(',');
            $state.go('openlmis.stockmanagement.physicalInventory.draft', stateParams);
        };
        function onInit() {
            $state.current.label = programName;
            vm.draftList = draftList;
        }

    }
}

)();
