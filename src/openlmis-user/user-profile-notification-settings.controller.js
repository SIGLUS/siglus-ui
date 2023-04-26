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
     * @name openlmis-user.controller:UserProfileNotificationSettingsController
     *
     * @description
     * Allows user to see his notification settings.
     */
    angular
        .module('openlmis-user')
        .controller('UserProfileNotificationSettingsController', controller);

    controller.$inject = [
        'digestConfigurations', 'userSubscriptions', 'UserSubscriptionResource', 'user', '$state', 'FunctionDecorator',
        'NOTIFICATION_CHANNEL', 'OpenlmisMainStateService'
    ];

    function controller(digestConfigurations, userSubscriptions, UserSubscriptionResource, user, $state,
                        FunctionDecorator, NOTIFICATION_CHANNEL, OpenlmisMainStateService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.getChannelLabel = NOTIFICATION_CHANNEL.getLabel;
        vm.validateSubscription = validateSubscription;

        vm.saveUserSubscriptions = new FunctionDecorator()
            .decorateFunction(saveUserSubscriptions)
            .withSuccessNotification('openlmisUser.userSubscriptionsHaveBeenUpdatedSuccessfully')
            .withErrorNotification('openlmisUser.failedToUpdateUserSubscriptions')
            .withLoading(true)
            .getDecoratedFunction();

        vm.isLocalMachine = false;
        OpenlmisMainStateService.getMachineType().then(function(res) {
            vm.isLocalMachine = Boolean(!_.get(res, ['data', 'onlineWeb']));
        });

        /**
         * @ngdoc property
         * @propertyOf openlmis-user.controller:UserProfileNotificationSettingsController
         * @type {Array}
         * @name digestConfigurations
         *
         * @description
         * The list of digest configurations available in the system.
         */
        vm.digestConfigurations = undefined;

        /**
         * @ngdoc property
         * @propertyOf openlmis-user.controller:UserProfileNotificationSettingsController
         * @type {Array}
         * @name userSubscriptions
         *
         * @description
         * The list of user subscription to digest configurations.
         */
        vm.userSubscriptions = undefined;

        /**
         * @ngdoc method
         * @propertyOf openlmis-user.controller:UserProfileNotificationSettingsController
         * @name $onInit
         *
         * @description
         * Initialization method of the UserProfileNotificationSetttingsController.
         */
        function onInit() {
            vm.digestConfigurations = digestConfigurations;
            vm.channels = NOTIFICATION_CHANNEL.getChannels();

            vm.userSubscriptionsMap = digestConfigurations.reduce(function(map, configuration) {
                var filtered = userSubscriptions.filter(function(subscription) {
                    return configuration.id === subscription.digestConfiguration.id;
                });

                if (filtered.length) {
                    map[configuration.id] = filtered[0];
                } else {
                    map[configuration.id] = {
                        useDigest: false,
                        preferredChannel: NOTIFICATION_CHANNEL.EMAIL,
                        cronExpression: undefined,
                        digestConfiguration: configuration
                    };
                }

                return map;
            }, {});
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-user.controller:UserProfileNotificationSettingsController
         * @name validateSubscription
         *
         * @description
         * Check whether given subscription is valid.
         *
         * @return {string}  the key of the error message, undefined otherwise
         */
        function validateSubscription(subscription) {
            if (isChannelInvalid(subscription)) {
                return 'openlmisUser.onlyEmailChannelIsSupportedForDigestMessage';
            }
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-user.controller:UserProfileNotificationSettingsController
         * @name saveUserSubscriptions
         *
         * @description
         * Saves the user subscriptions on the server.
         * 
         * @return {Promise}  the promise resolved once saving is complete.
         */
        function saveUserSubscriptions() {
            var userSubscriptions = Object.keys(vm.userSubscriptionsMap)
                .map(mapToSubscription);

            return new UserSubscriptionResource()
                .create(userSubscriptions, {
                    userId: user.id
                })
                .then(function() {
                    $state.reload();
                });
        }

        function mapToSubscription(digestConfigurationId) {
            var subscription = vm.userSubscriptionsMap[digestConfigurationId];

            return _.extend({}, subscription, {
                cronExpression: subscription.useDigest ? subscription.cronExpression : undefined
            });
        }

        function isChannelInvalid(subscription) {
            return subscription.useDigest
                && subscription.preferredChannel
                && NOTIFICATION_CHANNEL.EMAIL !== subscription.preferredChannel;
        }

    }

})();
