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
   * @name siglus-alert-confirm-modal.controller:AlertConfirmModalController
   *
   * @description
   * Exposes data to the alert modal view.
   */
    angular
        .module('openlmis-modal')
        .controller('siglusDownloadProcessModalController', siglusDownloadProcessModalController);

    siglusDownloadProcessModalController.$inject = ['$scope', 'title', 'message', 'currentCount', 'totalCount',
        'modalDeferred', 'siglusDownloadProcessModalService'];

    function siglusDownloadProcessModalController($scope, title, message, currentCount, totalCount, modalDeferred,
                                                  siglusDownloadProcessModalService) {
        var vm = this;

        vm.$onInit = onInit;

        vm.service = siglusDownloadProcessModalService;

        $scope.$watch(function() {
            return vm.service.currentIndex;
        }, function(newValue) {
            if (newValue > vm.service.totalCount) {
                modalDeferred.reject();
            }
        });

        function onInit() {
            vm.title = title;
            vm.message = message;
        }
    }

})();
