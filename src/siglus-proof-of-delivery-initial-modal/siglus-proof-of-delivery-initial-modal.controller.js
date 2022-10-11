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
   * @name proof-of-delivery-initial-modal.controller:SiglusProofOfDeliveryInitialModalController
   *
   * @description
   * Manages proof of delivery draft initital modal
   */
    angular
        .module('siglus-proof-of-delivery-initial-modal')
        .controller('SiglusProofOfDeliveryInitialModalController', controller);

    controller.$inject = [
        'loadingModalService',
        'modalDeferred',
        '$state',
        '$stateParams',
        'orderCode',
        'proofOfDeliveryManageService',
        'orderId',
        'podId'
    ];

    function controller(
        loadingModalService,
        modalDeferred,
        $state,
        $stateParams,
        orderCode,
        proofOfDeliveryManageService,
        orderId,
        podId
    ) {
        var vm = this;
        vm.$onInit = onInit;
        vm.showConflictStatus = false;
        vm.splitNum = null;
        vm.confirm = confirm;
        vm.showError = false;
        vm.showRequired = false;
        vm.orderCode = undefined;

        function onInit() {
            vm.orderCode = orderCode;
        }

        vm.changeShowError = function() {
            vm.showGTnumber = false;
            if (vm.isValid(vm.splitNum)) {
                vm.showError = false;
            }
            if (!_.isNull(vm.splitNum)) {
                vm.showRequired = false;
            }
        };

        vm.isValid = function(val) {
            return val > 0 && val <= 10;
        };

        vm.confirm = function() {
            if (vm.showConflictStatus) {
                $state.reload();
                modalDeferred.reject();
                return;
            }
            if (_.isNull(vm.splitNum)) {
                vm.showRequired = true;
                vm.showError = false;
                return;
            }

            if (vm.isValid(vm.splitNum)) {
                loadingModalService.open();
                proofOfDeliveryManageService.createDraft(
                    orderId, podId, vm.splitNum
                ).then(function() {
                    modalDeferred.resolve();
                    loadingModalService.close();
                    $stateParams.drafts = null;
                    $state.go('openlmis.orders.podManage.draftList', {
                        orderId: orderId,
                        podId: podId,
                        orderCode: orderCode
                    });
                })
                    .catch(function(err) {
                        loadingModalService.close();
                        if (err.data.messageKey
              === 'siglusapi.error.draft.number.greater.than.preset.products') {
                            vm.showGTnumber = true;
                        }
                        if (err.data.messageKey
              === 'siglusapi.error.proofOfDelivery.sub.drafts.already.existed') {
                            vm.showConflictStatus = true;
                        }
                    });
            } else {
                vm.showError = true;
            }
        };
    }
})();
