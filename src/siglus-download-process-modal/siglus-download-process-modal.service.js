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
   * @ngdoc service
   * @name siglus-alert-confirm-modal.alertConfirmModalService
   *
   * @description
   * Service allows to display alert modal with custom message.
   */
    angular
        .module('openlmis-modal')
        .service('siglusDownloadProcessModalService', siglusDownloadProcessModalService);

    siglusDownloadProcessModalService.$inject = [
        '$q', 'openlmisModalService'
    ];

    function siglusDownloadProcessModalService($q, openlmisModalService) {

        var modal;

        this.currentIndex = 0;
        this.totalCount = 0;

        this.open = open;

        function open(config) {
            if (modal) {
                return $q.reject();
            }

            this.totalCount = config.totalCount;
            this.currentIndex = config.currentIndex;

            modal = openlmisModalService.createDialog({
                controller: 'siglusDownloadProcessModalController',
                controllerAs: 'vm',
                templateUrl: 'siglus-download-process-modal/siglus-download-process-modal.html',
                show: true,
                resolve: {
                    title: function() {
                        return config.title;
                    },
                    currentCount: function() {
                        return config.currentCount;
                    },
                    totalCount: function() {
                        return config.totalCount;
                    },
                    message: function() {
                        return config.message;
                    }
                }
            });

            modal.promise.finally(function() {
                modal = undefined;
            });

            return modal.promise;
        }
    }
})();
