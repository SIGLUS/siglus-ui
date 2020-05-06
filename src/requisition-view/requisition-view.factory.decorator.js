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
     * @name requisition-view.requisitionViewFactory
     *
     * @description
     * Decorates requisitionViewFactory with new additional methods.
     */

    angular.module('requisition-view')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('requisitionViewFactory', decorator);
    }

    decorator.$inject = ['$delegate', '$q', 'permissionService', 'REQUISITION_RIGHTS'];

    function decorator($delegate, $q, permissionService, REQUISITION_RIGHTS) {
        $delegate.hasSubmitRight = hasSubmitRight;
        $delegate.canSubmitAndAuthorize = canSubmitAndAuthorize;
        $delegate.hasAuthorizeRight = hasAuthorizeRight;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf requisition-view.requisitionViewFactory
         * @name hasSubmitRight
         *
         * @description
         * Determines whether the user has submit right or not.
         *
         * @param  {String} userId id of user to check
         * @param  {Object} requisition requisition to check
         * @return {Boolean}
         */
        function hasSubmitRight(userId, requisition) {
            return hasRightForProgramAndFacility(userId, REQUISITION_RIGHTS.REQUISITION_CREATE, requisition);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.requisitionViewFactory
         * @name canSubmitAndAuthorize
         *
         * @description
         * Determines whether the user has authorize right and submit right or not.
         *
         * @param  {String} userId id of user to check
         * @param  {Object} requisition requisition to check
         * @return {Boolean}
         */
        function canSubmitAndAuthorize(userId, requisition) {
            if (requisition.$isInitiated() || requisition.$isRejected()) {
                return $q.all([
                    hasRightForProgramAndFacility(userId, REQUISITION_RIGHTS.REQUISITION_CREATE, requisition),
                    hasRightForProgramAndFacility(userId, REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition)
                ]).then(function(responses) {
                    var hasCreateRight = responses[0],
                        hasAuthorizeRight = responses[1];

                    if (hasCreateRight && hasAuthorizeRight) {
                        return $q.resolve(true);
                    }
                    return $q.resolve(false);
                });
            }
            return $q.resolve(false);
        }

        /**
         * @ngdoc method
         * @methodOf requisition-view.requisitionViewFactory
         * @name hasAuthorizeRight
         *
         * @description
         * Determines whether the user has authorize right or not.
         *
         * @param  {String} userId id of user to check
         * @param  {Object} requisition requisition to check
         * @return {Boolean}
         */
        function hasAuthorizeRight(userId, requisition) {
            return hasRightForProgramAndFacility(userId, REQUISITION_RIGHTS.REQUISITION_AUTHORIZE, requisition);
        }

        function hasRightForProgramAndFacility(userId, rightName, requisition) {
            return permissionService.hasPermission(userId, {
                right: rightName,
                programId: requisition.program.id,
                facilityId: requisition.facility.id
            })
                .then(function() {
                    return $q.resolve(true);
                })
                .catch(function() {
                    return $q.resolve(false);
                });
        }
    }
})();
