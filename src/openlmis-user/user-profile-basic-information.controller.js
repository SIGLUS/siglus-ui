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
     * @name openlmis-user.controller:UserProfileBasicInformationController
     *
     * @description
     * Allows user to see his own basic information on his profile.
     */
    angular
        .module('openlmis-user')
        .controller('UserProfileBasicInformationController', controller);

    controller.$inject = [
        'user', 'homeFacility', 'loadingModalService', 'notificationService',
        'userPasswordModalFactory', 'loginService', '$rootScope', '$state', 'alertService',
        'authUserService', 'pendingVerificationEmail', '$window'
    ];

    function controller(user, homeFacility, loadingModalService, notificationService,
                        userPasswordModalFactory, loginService, $rootScope, $state, alertService,
                        authUserService, pendingVerificationEmail, $window) {

        var vm = this;

        vm.$onInit = onInit;
        vm.updateProfile = updateProfile;
        vm.restoreProfile = restoreProfile;
        vm.changePassword = changePassword;
        vm.sendVerificationEmail = sendVerificationEmail;

        /**
         * @ngdoc property
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name user
         * @type {Object}
         *
         * @description
         * Contains user detailed info.
         */
        vm.user = undefined;

        /**
         * @ngdoc property
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name homeFacility
         * @type {Object}
         *
         * @description
         * Contains user home facility detailed info.
         */
        vm.homeFacility = undefined;

        /**
         * @ngdoc property
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name pendingEmailVerificationToken
         * @type {String}
         *
         * @description
         * Represents pending email verification.
         */
        vm.pendingVerificationEmail = undefined;

        /**
         * @ngdoc method
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name $onInit
         *
         * @description
         * Initialization method of the UserProfileBasicInformationController.
         */
        function onInit() {
            vm.user = user;
            vm.user.enabled = true;
            vm.homeFacility = homeFacility;
            vm.pendingVerificationEmail = pendingVerificationEmail;
        }

        /**
         * @ngdoc method
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name updateProfile
         *
         * @description
         * Updates user profile.
         */
        function updateProfile() {
            loadingModalService.open();

            return vm.user.save()
                .then(function() {
                    $state.go('openlmis.profile.basicInformation', undefined, {
                        reload: true
                    });
                    notificationService.success('openlmisUser.updateProfile.updateSuccessful');
                })
                .catch(function() {
                    notificationService.error('openlmisUser.updateProfile.updateFailed');
                    loadingModalService.close();
                });
        }

        /**
         * @ngdoc method
         * @propertyOf openlmis-user.controller:UserProfileBasicInformationController
         * @name restoreProfile
         *
         * @description
         * Restore user profile.
         */
        function restoreProfile() {
            loadingModalService.open();
            // $state.go('openlmis.profile.basicInformation', undefined, {
            //     reload: true
            // });
            $window.history.back();
            notificationService.success('openlmisUser.cancel.restoreSuccessful');
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-user.controller:UserProfileBasicInformationController
         * @name changePassword
         *
         * @description
         * Open password management modal allowing user to send a password reset link or change the password. After
         * successful action is taken the modal is closed and the user is logged out. User is brought back to the
         * user profile page if the modal is dismissed.
         */
        function changePassword() {
            userPasswordModalFactory.resetPassword(user)
                .then(function() {
                    loginService.logout()
                        .then(function() {
                            return alertService.info({
                                title: 'openlmisUser.passwordResetAlert.title',
                                message: 'openlmisUser.passwordResetAlert.message',
                                buttonLabel: 'openlmisUser.passwordResetAlert.label'
                            });
                        })
                        .then(function() {
                            $rootScope.$emit('openlmis-auth.logout');
                            $state.go('auth.login');
                        });
                });
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-user.controller:UserProfileBasicInformationController
         * @name sendVerificationEmail
         *
         * @description
         * Send a verification email to a user.
         */
        function sendVerificationEmail() {
            return authUserService.sendVerificationEmail(vm.user.id)
                .then(function() {
                    notificationService.success('openlmisUser.sendVerificationEmail.success');
                });
        }

    }

})();
