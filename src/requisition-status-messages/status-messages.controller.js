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
     * @name requisition-status-messages.controller:StatusMessagesController
     *
     * @description
     * Responsible for adding new status messages.
     */
    angular
        .module('requisition-status-messages')
        .controller('StatusMessagesController', controller);

    controller.$inject = ['$scope', 'statusMessagesHistoryModalService'];

    function controller($scope, statusMessagesHistoryModalService) {
        var vm = this;

        /**
         * @ngdoc property
         * @propertyOf requisition-status-messages.controller:StatusMessagesController
         * @name requisition
         * @type {Object}
         *
         * @description
         * The requisition to which status message will be added.
         */
        vm.requisition = $scope.requisition;

        /**
         * @ngdoc property
         * @propertyOf requisition-status-messages.controller:StatusMessagesController
         * @name isTextAreaVisible
         * @type {Boolean}
         *
         * @description
         * Visibility of text area.
         */
        vm.isTextAreaVisible = false;

        // SIGLUS-REFACTOR: starts here
        vm.$onInit = function() {
            $scope.$watch('forceOpen', function(newValue) {
                if (newValue) {
                    vm.isTextAreaVisible = true;
                }
                $scope.forceOpen = false;
            });
        };
        // SIGLUS-REFACTOR: ends here

        // Functions

        vm.displayRequisitionHistory = displayRequisitionHistory;
        vm.displayAddComment = displayAddComment;
        vm.addComment = addComment;
        vm.removeComment = removeComment;
        vm.displayEditComment = displayEditComment;

        /**
         * @ngdoc method
         * @methodOf requisition-status-messages.controller:StatusMessagesController
         * @name addComment
         *
         * @description
         * Responsible for adding draft of comment to requisition.
         */
        function addComment() {
            vm.isTextAreaVisible = true;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-status-messages.controller:StatusMessagesController
         * @name removeComment
         *
         * @description
         * Responsible for clearing draft.
         */
        function removeComment() {
            vm.requisition.draftStatusMessage = null;
            vm.isTextAreaVisible = false;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-status-messages.controller:StatusMessagesController
         * @name displayRequisitionHistory
         *
         * @description
         * Responsible for displaying requisition status message history.
         */
        function displayRequisitionHistory() {
            statusMessagesHistoryModalService.show(vm.requisition);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-status-messages.controller:StatusMessagesController
         * @name displayAddComment
         *
         * @description
         * Responsible for checking if requisition does not have a draft.
         * If text area is not visible and draftStatusMessage is not set and requisition is editable then button will be
         * displayed. Otherwise add button will not be displayed.
         */
        function displayAddComment() {
            // SIGLUS-REFACTOR: starts here
            return !vm.requisition.draftStatusMessage && !vm.isTextAreaVisible
                && vm.requisition.$isEditable && !vm.requisition.isHistory;
            // SIGLUS-REFACTOR: ends here
        }

        /**
         * @ngdoc method
         * @methodOf requisition-status-messages.controller:StatusMessagesController
         * @name displayEditComment
         *
         * @description
         * Responsible for displaying text area and removing button of comment in requisition.
         * Only if add button is not displayed and requisition is editable.
         */
        function displayEditComment() {
            // SIGLUS-REFACTOR: starts here
            return !vm.displayAddComment() && vm.requisition.$isEditable && !vm.requisition.isHistory;
            // SIGLUS-REFACTOR: ends here
        }
    }
})();
