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
describe('requisitionGridCell', function() {

    beforeEach(function() {
        this.getCompiledElement = getCompiledElement;

        module('siglus-requisition-grid-cell');

        inject(function($injector) {
            this.$compile = $injector.get('$compile');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionValidator = $injector.get('requisitionValidator');
        });

        this.scope = this.$rootScope.$new();
        this.scope.lineItemField = {
            value: 0
        };

        spyOn(this.requisitionValidator, 'validateSiglusLineItemField');
    });

    it('should validate line item filed after updating field', function() {
        var element = this.getCompiledElement(),
            input = element.find('input');

        input.controller('ngModel').$setViewValue('1000');
        this.scope.$apply();

        expect(this.requisitionValidator.validateSiglusLineItemField).toHaveBeenCalledWith(
            this.scope.lineItemField
        );
    });

    function getCompiledElement() {
        var rootElement = angular.element('<div siglus-requisition-grid-cell' +
            ' line-item-field="lineItemField"></div>');
        var compiledElement = this.$compile(rootElement)(this.scope);
        angular.element('body').append(compiledElement);
        this.scope.$digest();
        return compiledElement;
    }
});
