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

    angular
        .module('siglus-location-movement')
        .service('siglusLocationMovementUpgradeService', siglusLocationMovementUpgradeService);

    siglusLocationMovementUpgradeService.$inject = ['currentUserService', 'programService', 'loadingModalService',
        'siglusLocationMovementService', 'confirmService', '$state', '$q', '$http', 'openlmisUrlFactory'];

    function siglusLocationMovementUpgradeService(currentUserService, programService, loadingModalService,
                                                  siglusLocationMovementService, confirmService, $state, $q,
                                                  $http, openlmisUrlFactory) {
        this.facilityId = undefined;
        this.needInitiallyMoveProduct = undefined;
        var service = this;

        this.checkShouldUpgradeMoveProduct = function() {
            var user = currentUserService.getUserInfo().$$state.value;
            return user && this.facilityId === user.homeFacilityId
            && this.needInitiallyMoveProduct !== undefined ? this.needInitiallyMoveProduct : false;
        };

        this.checkInited = function() {
            return this.facilityId !== undefined && this.needInitiallyMoveProduct !== undefined;
        };

        this.getNeedInitiallyMoveProduct = function(facilityId) {
            var defered = $q.defer();
            if (!facilityId) {
                return ;
            }
            $http.get(openlmisUrlFactory('/api/siglusapi/locationMovements?facilityId=' + facilityId))
                .then(function(response) {
                    service.facilityId = facilityId;
                    service.needInitiallyMoveProduct = response.data.needInitiallyMoveProduct;
                    defered.resolve('succuess');
                });
            return defered.promise;
        };

        this.init = function(facilityId) {
            if (!facilityId) {
                return ;
            }
            return $http.get(openlmisUrlFactory('/api/siglusapi/locationMovements?facilityId=' + facilityId))
                .then(function(response) {
                    service.facilityId = facilityId;
                    service.needInitiallyMoveProduct = response.data.needInitiallyMoveProduct;
                    if (service.needInitiallyMoveProduct
                        && $state.current.name !== 'openlmis.locationManagement.movement.creation') {
                        service.showConfirmAndStartVirtualMovement();
                    }
                });
        };

        this.startVirtualMovement = function() {
            loadingModalService.open();
            programService.getAllProductsProgram().then(function(programs) {
                var programId = _.get(programs, [0, 'id']);
                return siglusLocationMovementService.getMovementDrafts(programId).then(function(drafts) {
                    if (drafts.length > 0) {
                        var draftId = _.get(drafts, [0, 'id']);
                        return $state.go('openlmis.locationManagement.movement.creation', {
                            programId: programId,
                            draftId: draftId,
                            isVirtual: true
                        });
                    }
                    var user = currentUserService.getUserInfo().$$state.value;
                    var params = {
                        programId: programId,
                        facilityId: user.homeFacilityId,
                        userId: user.id
                    };
                    return siglusLocationMovementService.createMovementDraft(params).then(function(draft) {
                        return siglusLocationMovementService.initVirtualMovementDrafts(draft).then(function() {
                            return $state.go('openlmis.locationManagement.movement.creation', {
                                programId: programId,
                                draftId: draft.id,
                                isVirtual: true
                            });
                        });
                    });
                });
            });
        };

        this.showConfirmAndStartVirtualMovement = function() {
            loadingModalService.close();
            return confirmService.confirm('locationMovement.upgradePopup')
                .then(function() {
                    return service.startVirtualMovement();
                });
        };

        this.doneUpgrade = function() {
            var user = currentUserService.getUserInfo().$$state.value;
            this.facilityId = user.homeFacilityId;
            this.needInitiallyMoveProduct = false;
        };
    }

})();
