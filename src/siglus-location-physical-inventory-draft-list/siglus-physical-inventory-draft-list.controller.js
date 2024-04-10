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
        .module('siglus-location-physical-inventory-draft-list')
        .controller('siglusLocationPhysicalInventoryDraftListController', controller);

    controller.$inject = [
        'draftList',
        'messageService',
        '$state',
        '$stateParams',
        'programName',
        'facility',
        'alertService',
        'alertConfirmModalService',
        'physicalInventoryService',
        'loadingModalService',
        'physicalInventoryDataService'
    ];

    function controller(
        draftList,
        messageService,
        $state,
        $stateParams,
        programName,
        facility,
        alertService,
        alertConfirmModalService,
        physicalInventoryService,
        loadingModalService
    ) {
        var vm = this;
        vm.isInitialInventory = $stateParams.canInitialInventory;
        vm.$onInit = onInit;
        vm.draftList = {};
        vm.programName = programName;
        vm.facility = facility;
        vm.isShowDeleteAndMerge = false;
        vm.getStatus = function(isStarter) {
            var statusMap = {
                NOT_YET_STARTED: 'stockPhysicalInventory.notStarted',
                DRAFT: 'stockPhysicalInventory.draft',
                SUBMITTED: 'stockPhysicalInventory.submitted'
            };
            return messageService.get(statusMap[isStarter]);

        };
        vm.actionType = function(isStarter) {
            var statusMap = {
                NOT_YET_STARTED: 'stockPhysicalInventory.start',
                DRAFT: 'stockPhysicalInventory.continue',
                SUBMITTED: 'PhysicalInventoryDraftList.view'
            };
            return messageService.get(statusMap[isStarter]);

        };
        vm.clickActions = function(item) {
            var stateParams = angular.copy($stateParams);
            stateParams.subDraftIds = item.subDraftId.join(',');
            stateParams.actionType = item.status;
            stateParams.draftNum = item.groupNum;
            if (vm.isInitialInventory) {
                return  $state.go('openlmis.locationManagement.initialInventory.draft', stateParams);
            }

            $state.go('openlmis.locationManagement.physicalInventory.draftList.draft', stateParams);
        };

        vm.deleteDrafts = function() {
            alertConfirmModalService.error(
                'PhysicalInventoryDraftList.deleteWarn',
                '',
                ['PhysicalInventoryDraftList.cancel', 'PhysicalInventoryDraftList.confirm']
            ).then(function() {
                loadingModalService.open();
                physicalInventoryService.deleteDraftList(draftList.physicalInventoryId).then(function() {
                    if (vm.isInitialInventory) {
                        return  $state.go('openlmis.home');
                    }
                    $state.go('openlmis.locationManagement.physicalInventory', $stateParams, {
                        reload: true
                    });
                })
                    .catch(function() {
                        loadingModalService.close();
                    });
            });
        };

        vm.isAllowedClick = function(drafts) {
            return _.size(_.get(drafts, 'subDrafts', [])) > 0;
        };

        vm.mergeDrafts = function() {
            if (isAllSubDraftsSubmit(vm.draftList.subDrafts)) {
                var stateParams = angular.copy($stateParams);
                stateParams.isMerged = true;
                stateParams.subDraftIds = _.map(vm.draftList.subDrafts, function(item) {
                    return item.subDraftId[0];
                }).join(',');
                if (vm.isInitialInventory) {
                    return $state.go('openlmis.locationManagement.initialInventory.draft', stateParams);
                }
                $state.go('openlmis.locationManagement.physicalInventory.draftList.draft', stateParams);
            } else {
                alertService.error('PhysicalInventoryDraftList.mergeError');
            }
        };

        vm.getTitle = function() {
            if (vm.isInitialInventory) {
                return messageService.get('stockPhysicalInventory.initialTitle');
            }
            return messageService.get('stockPhysicalInventory.title');
        };

        function isAllSubDraftsSubmit(draftsList) {
            return _.every(draftsList, function(item) {
                return item.status === 'SUBMITTED';
            });
        }

        // All drafts must be submitted before they can be merged.
        function onInit() {
            loadingModalService.close();
            if (!vm.isInitialInventory) {
                $state.current.label = programName;
            }
            draftList.subDrafts = _.sortBy(draftList.subDrafts, 'groupNum');
            vm.draftList = draftList;
            vm.isShowDeleteAndMerge = draftList.canMergeOrDeleteDrafts;
        }
    }
}

)();
