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
     * @name referencedata-user.UserRepositoryImpl
     *
     * @description
     * Default implementation of the UserRepository interface. Responsible for combining server responses into single
     * object to be passed to the User class constructor.
     */
    angular
        .module('referencedata-user')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('UserRepositoryImpl', decorator);
    }

    decorator.$inject = ['$delegate', '$q', 'InitialInventoryResource'];

    function decorator($delegate, $q, InitialInventoryResource) {

        $delegate.prototype.get = get;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf referencedata-user.UserRepositoryImpl
         * @name get
         *
         * @description
         * Retrieves the user with the given ID from the OpenLMIS server.
         *
         * @param  {String}  id the id of the user
         * @return {Promise}    the promise resolving to combined JSON which can be used for creating instance of the
         *                      User class
         */
        function get(id) {
            return $q.all([
                this.referenceDataUserResource.get(id),
                this.userContactDetailsResource.get(id),
                this.authUserResource.get(id)
            ]).then(function(responses) {
                var referenceDataUser = responses[0],
                    userContactDetails = responses[1],
                    authUser = responses[2];

                return combineResponses(referenceDataUser, userContactDetails, authUser);
            });
        }

        function combineResponses(referenceDataUser, userContactDetails, authUser) {
            if (userContactDetails) {
                referenceDataUser.phoneNumber = userContactDetails.phoneNumber;
                referenceDataUser.email = userContactDetails.emailDetails.email;
                referenceDataUser.verified = userContactDetails.emailDetails.emailVerified;
                referenceDataUser.allowNotify = userContactDetails.allowNotify;
            }

            if (authUser) {
                referenceDataUser.enabled = authUser.enabled;
            }

            if (referenceDataUser.homeFacilityId) {
                return new InitialInventoryResource().query({
                    facility: referenceDataUser.homeFacilityId
                })
                    .then(function(initialStatus) {
                        referenceDataUser.canInitialInventory = initialStatus.canInitialInventory;
                        return referenceDataUser;
                    });
            }

            return referenceDataUser;
        }

    }

})();
