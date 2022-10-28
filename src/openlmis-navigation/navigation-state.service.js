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
     * @name openlmis-navigation.navigationStateService
     *
     * @description
     * Reads routes set in UI-Router and returns all routes that are visible to
     * the user.
     *
     * When writing UI-Router routes, set the route with 'showInNavigation: true'
     * which will add the route to the navigation service. The parent state
     * from the UI-Router definition is used to create a hierarchy for navigation
     * states.
     *
     * The UI-Router State definitions can also be set with access rights, and
     * if the user has one of the rights, the route will be visible to the
     * user. To use this feature set 'accessRights' on the state definition
     * object.
     *
     * Lastly, navigation states can be marked if they have offline
     * functionality, which will make the UI-State appear accessible when a
     * user's browser is offline. This can be set by setting 'isOffline' to
     * true on the state definition object.
     *
     * @example
     * To use the navigation service, and related directives, add UI-Router
     * states similar to the following.
     *
     * ```
     * angular.module('example')
     * .config(function($stateProvider){
     *     $stateProvider.state('example', {
     *         url: '/example', // default argument from UI-Router
     *         showInNavigation: true, // allows navigation service to show items
     *         accessRights: ['example.right'], // an array of access rights that is checked against the user's rights
     *         isOffline: true, // make the UI display that the screen is functional offline
     *         label: 'message.key' // Label that is displayed in the navigation
     *     });
     * });
     * ```
     *
     */

    angular
        .module('openlmis-navigation')
        .service('navigationStateService', navigationStateService);

    navigationStateService.$inject = ['$state', '$filter', 'authorizationService', '$injector', '$q'];

    function navigationStateService($state, $filter, authorizationService, $injector, $q) {
        var service = this,
            promise;

        service.hasChildren = hasChildren;
        service.isSubmenu = isSubmenu;
        service.isOffline = isOffline;
        service.setUpStatesAvailability = setUpStatesAvailability;
        service.clearStatesAvailability = clearStatesAvailability;

        loadStates();

        /**
         * @ngdoc method
         * @methodOf openlmis-navigation.navigationStateService
         * @name hasChildren
         *
         * @description
         * Takes a state object and returns if the state should be displayed or not.
         *
         * @param  {Object}  state A state object as returned by UI-Router
         * @return {Boolean}       If the state has visible child states.
         */
        function hasChildren(state) {
            var result = false;
            angular.forEach(state.children, function(child) {
                result = result || child.$shouldDisplay;
            });
            return result;
        }

        /**
         *
         * @ngdoc method
         * @methodOf openlmis-navigation.navigationStateService
         * @name isSubmenu
         *
         * @description
         * Takes a state object and returns if the state has child states, but
         * isn't a root state.
         *
         * @param  {Object}  state A state object as returned by UI-Router
         * @return {Boolean}       If the state is a sub-menu
         */
        function isSubmenu(state) {
            return !isRoot(state) && hasChildren(state);
        }

        /**
         *
         * @ngdoc method
         * @methodOf openlmis-navigation.navigationStateService
         * @name isOffline
         *
         * @description
         * Returns true if state is available while offline.
         *
         * @param  {Object}  state A state object as returned by UI-Router
         * @return {Boolean}       If the state can be viewed while offline
         */
        function isOffline(state) {
            return state && state.isOffline;
        }

        /**
         * @ngdoc method
         * @methodOf openlmis-navigation.navigationStateService
         * @name setUpStatesAvailability
         *
         * @description
         * Sets up states availability based on the access rights and custom, per-state methods. This method will not
         * update states availability on subsequent calls until clearStatesAvailability methods is called.
         *
         * @return {Promise}  the promise resolved once the availability of all states is set
         */
        function setUpStatesAvailability() {
            if (promise) {
                return promise;
            }

            var promises = [];
            Object.keys(service.roots).forEach(function(root) {
                service.roots[root].forEach(function(root) {
                    promises.push(setShouldDisplayForParentState(root));
                });
            });

            promise = $q.all(promises);

            return promise;
        }

        this.clearPromise = function() {
            promise = null;
        };

        /**
         * @ngdoc method
         * @methodOf openlmis-navigation.navigationStateService
         * @name clearStatesAvailability
         *
         * @description
         * Clear the availability of all defined states.
         */
        function clearStatesAvailability() {
            $state.get().forEach(function(state) {
                state.$shouldDisplay = undefined;
            });
            promise = undefined;
        }

        function loadStates() {
            service.roots = {};

            $state.get().forEach(function(state) {
                if (state.showInNavigation) {
                    var parentName = getParentStateName(state);

                    var filtered = $filter('filter')($state.get(), {
                        name: parentName
                    }, true);

                    var parent = filtered[0];
                    if (parent.showInNavigation) {
                        addChildState(parent, state);
                    } else {
                        addToRoots(service.roots, parentName, state);
                    }

                    state.priority = state.priority === undefined ? 10 : state.priority;
                }
            });

            for (var root in service.roots) {
                service.roots[root] = sortStates(service.roots[root]);
            }
        }

        function getParentStateName(state) {
            var lastDot = state.name.lastIndexOf('.');
            return lastDot ? state.name.substring(0, lastDot) : '';
        }

        function addChildState(parent, state) {
            if (!parent.children) {
                parent.children = [];
            }
            parent.children.push(state);
        }

        function addToRoots(roots, parentName, state) {
            if (!roots[parentName]) {
                roots[parentName] = [];
            }
            roots[parentName].push(state);
        }

        function sortStates(states) {
            angular.forEach(states, function(state) {
                if (!state.priority) {
                    state.priority = 10;
                }
            });
            var sorted = $filter('orderBy')(states, ['-priority', 'name']);
            sorted.forEach(function(state) {
                if (state.children) {
                    state.children = sortStates(state.children);
                }
            });
            return sorted;
        }

        function isRoot(state) {
            for (var root in service.roots) {
                if (service.roots[root].indexOf(state) !== -1) {
                    return true;
                }
            }
            return false;
        }

        function setShouldDisplayForParentState(parentState) {
            var promises = [];
            if (parentState.children && parentState.children.length > 0) {
                parentState.children.forEach(function(childState) {
                    promises.push(setShouldDisplayForParentState(childState));
                });
            }
            return $q.all(promises)
                .then(function() {
                    return setShouldDisplay(parentState);
                });
        }

        function setShouldDisplay(state) {
            return canViewState(state)
                .then(function(canViewState) {
                    state.$shouldDisplay = state.showInNavigation
                        && canViewState
                        && (!state.abstract || hasChildren(state));
                });
        }

        function canViewState(state) {
            var canViewState = !state.accessRights
                || authorizationService.hasRights(state.accessRights, state.areAllRightsRequired);

            if (state.canAccess) {
                return $q.when($injector.invoke(state.canAccess))
                    .then(function(canAccess) {
                        return canAccess && canViewState;
                    });
            }

            return $q.resolve(canViewState);
        }

    }
})();
