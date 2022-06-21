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

    controller.$inject = ['facility', 'programs', 'isDraft',
        'draftList', 'groupNum', 'saver', 'status', 'subDraftId',
        'messageService', '$state',
        'physicalInventoryFactory', 'FunctionDecorator',
        'physicalInventoryDraftListService'];

    function controller(facility, programs, isDraft, draftList,
                        groupNum, saver, status, subDraftId, messageService,
                        $state, physicalInventoryFactory,
                        FunctionDecorator, physicalInventoryDraftListService) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf stock-physical-inventory-draft-list.controller:PhysicalInventoryDraftListController
         * @name parameters
         * @type {Object}
         *
         * @description
         * parameters of draft list
         */
        vm.facility = facility;
        vm.programs = programs;
        vm.isDraft = isDraft;
        vm.draftList = draftList;
        vm.groupNum = groupNum;
        vm.saver = saver;
        vm.status = status;
        vm.subDraftId = subDraftId;

        // vm.editSubDraft = new FunctionDecorator()
        //     .decorateFunction(editSubDraft)
        //     .withLoading(true)
        //     .getDecoratedFunction();

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-draft-list.controller:PhysicalInventoryDraftListController
         * @name getDraftNumber
         *
         * @description
         * Responsible for getting draft number from physical inventory draft list.
         *
         * @param {Number} get draft number by get draftList
         */
        vm.getDraftNumber = function(groupNum) {
            if (groupNum) {
                return physicalInventoryDraftListService.getDraftList(
                    programs, facility, isDraft, groupNum
                ).then(function(groupNum) {
                    return groupNum;
                });
            }
            return undefined;
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getDraftStatus
         *
         * @description
         * Responsible for getting draft status from physical inventory draft list.
         *
         * @param {String} get draft status by get draftList
         */

        vm.getDraftStatus = function() {
            return physicalInventoryDraftListService.getDraftList(
                programs, facility, isDraft, groupNum
            ).then(function(status) {
                return status;
            });
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name getDraftSaver
         *
         * @description
         * Responsible for getting draft saver from physical inventory draft list.
         *
         * @param {string} get draft saver by get draftList
         */

        vm.getDraftSaver = function() {
            return physicalInventoryDraftListService.getDraftList(
                programs, facility, isDraft, groupNum
            ).then(function(saver) {
                return saver;
            });
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-draft-list.controller:PhysicalInventoryDraftListController
         * @name getSubDraftId
         *
         * @description
         * Responsible for getting sub draft id.
         *
         * @param {UUID} subDraftId Indicates id of sub draft.
         */
        vm.getSubDraftId = function() {
            return physicalInventoryDraftListService.getDraftList(
                programs, facility, isDraft, groupNum
            ).then(function(subDraftId) {
                return subDraftId === draftList.subDraftId;
            });
        };

        /**
         * @ngdoc method
         * @propertyOf stock-physical-inventory-list.controller:PhysicalInventoryListController
         * @name editSubDraft
         *
         * @description
         * Responsible for edit sub draft.
         *
         * @param {Object} draft Physical inventory draft
         */
        // function editSubDraft(draft) {
        //     if (subDraftId === draftList.subDraftId) {
        //         return physicalInventoryFactory.getDraft(draft.programId,
        //             draft.facilityId).then(function(draft) {
        //             if (subDraftId) {
        //                 $state.go(
        //                     'openlmis.stockmanagement.physicalInventory.draft',
        //                     {
        //                         id: subDraftId,
        //                         draft: draft,
        //                         program: program,
        //                         facility: facility
        //                     }
        //                 );
        //             } else {
        //                 physicalInventoryService.createDraft(program.id,
        //                     facility.id).then(function(data) {
        //                     draft.id = data.id;
        //                     $state.go(
        //                         'openlmis.stockmanagement.physicalInventory.draft',
        //                         {
        //                             id: draft.id,
        //                             draft: draft,
        //                             program: program,
        //                             facility: facility
        //                         }
        //                     );
        //                 });
        //             }
        //         });
    }
}

)();
