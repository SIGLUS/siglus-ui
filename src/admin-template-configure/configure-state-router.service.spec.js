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

describe('configureStateRouterService', function() {

    beforeEach(function() {
        module('admin-template-configure');

        inject(function($injector) {
            this.$rootScope = $injector.get('$rootScope');
            this.loadingModalService = $injector.get('loadingModalService');
            this.notificationService = $injector.get('notificationService');
            this.configureStateRouterService = $injector.get('configureStateRouterService');
        });

        spyOn(this.loadingModalService, 'close');
        spyOn(this.notificationService, 'error');

        this.createState = function(name) {
            return {
                name: name
            };
        };
    });

    it('should prevent state change if template is invalid', function() {
        this.configureStateRouterService.initialize({
            isValid: function() {
                return false;
            }
        });
        this.$rootScope.$broadcast('$stateChangeStart',
            this.createState('openlmis.administration.requisitionTemplates.configure.columns'));

        expect(this.loadingModalService.close).toHaveBeenCalled();
        expect(this.notificationService.error).toHaveBeenCalledWith('adminProgramTemplate.template.invalid');
    });

    it('should not get notification if template is invalid and tostate is home', function() {
        this.configureStateRouterService.initialize({
            isValid: function() {
                return false;
            }
        });
        this.$rootScope.$broadcast('$stateChangeStart', this.createState('openlmis.home'));

        expect(this.loadingModalService.close).not.toHaveBeenCalled();
        expect(this.notificationService.error).not.toHaveBeenCalled();
    });

    it('should not get notification if template is valid', function() {
        this.configureStateRouterService.initialize({
            isValid: function() {
                return true;
            }
        });
        this.$rootScope.$broadcast('$stateChangeStart',
            this.createState('openlmis.administration.requisitionTemplates.configure.settings'));

        expect(this.loadingModalService.close).not.toHaveBeenCalled();
        expect(this.notificationService.error).not.toHaveBeenCalled();
    });
});
