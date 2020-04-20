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
     * @name admin-template.Template
     *
     * @description
     * Decorates Template with additional attribute.
     */
    angular.module('admin-template')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('Template', decorator);
    }

    decorator.$inject = ['$delegate', 'TemplateColumn', 'RequisitionColumn'];

    function decorator($delegate, TemplateColumn, RequisitionColumn) {
        angular.copy($delegate, Template);
        Template.prototype = $delegate.prototype;

        return Template;

        /**
         * @ngdoc method
         * @methodOf admin-template.Template
         * @name Template
         *
         * @description
         * Creates a new instance of the Template.
         *
         * @param  {Object}             template   the JSON representation of the Template
         * @param  {TemplateRepository} repository the Template Repository
         * @return {Reason}                        the Reason object
         */
        function Template(template, repository) {
            this.createdDate = template.createdDate;
            this.id = template.id;
            this.numberOfPeriodsToAverage = template.numberOfPeriodsToAverage;
            this.program = template.program;
            this.populateStockOnHandFromStockCards = template.populateStockOnHandFromStockCards;
            this.columnsMap = {};
            this.facilityTypes = template.facilityTypes;
            this.name = template.name;
            this.enableConsultationNumber = template.enableConsultationNumber;
            this.enableKitUsage = template.enableKitUsage;
            this.enableProductModule = template.enableProductModule;

            for (var columnName in template.columnsMap) {
                this.columnsMap[columnName] = new TemplateColumn(template.columnsMap[columnName]);
            }

            var columns = this.columnsMap;
            angular.forEach(this.columnsMap, function(column) {
                addDependentColumnValidation(column, columns);
            });

            this.repository = repository;
        }

        function addDependentColumnValidation(column, columns) {
            var dependencies = RequisitionColumn.columnDependencies(column);
            if (dependencies && dependencies.length > 0) {
                angular.forEach(dependencies, function(dependency) {
                    if (columns[dependency]) {
                        if (!columns[dependency].$dependentOn) {
                            columns[dependency].$dependentOn = [];
                        }
                        columns[dependency].$dependentOn.push(column.name);
                    }
                });
            }
        }
    }
})();
