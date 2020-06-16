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
     * @name admin-template.templateValidator
     *
     * @description
     * Provides methods for validating templates and columns.
     */
    angular
        .module('admin-template')
        .factory('templateValidator', factory);

    factory.$inject = [
        'UTF8_REGEX', 'MAX_COLUMN_DESCRIPTION_LENGTH', 'TEMPLATE_COLUMNS', 'COLUMN_SOURCES',
        'messageService',
        // SIGLUS-REFACTOR: starts here
        'notificationService', 'columnUtils'
        // SIGLUS-REFACTOR: ends here
    ];

    function factory(UTF8_REGEX, MAX_COLUMN_DESCRIPTION_LENGTH, TEMPLATE_COLUMNS,
                     COLUMN_SOURCES, messageService, notificationService, columnUtils) {

        var columnValidations = {
                averageConsumption: validateAverageConsumption,
                // SIGLUS-REFACTOR: starts here
                // requestedQuantity: validateRequestedQuantity,
                // SIGLUS-REFACTOR: ends here
                requestedQuantityExplanation: validateRequestedQuantityExplanation,
                totalStockoutDays: validateTotalStockoutDays,
                // #199: product sections for column changes
                // calculatedOrderQuantity: validateCalculatedOrderQuantity,
                // #199: ends here
                additionalQuantityRequired: validateAdditionalQuantityRequired
            },
            validator = {
                getColumnError: getColumnError,
                isTemplateValid: isTemplateValid,
                // #248: kit usage section configure
                getSiglusColumnError: getSiglusColumnError
                // #248: ends here
            };

        return validator;

        /**
         * @ngdoc method
         * @methodOf admin-template.templateValidator
         * @name isTemplateValid
         *
         * @description
         * Checks if the given template is valid.
         *
         * @param   {Object}    template    the template to be checked
         * @return  {Boolean}               true if the template is valid, false otherwise
         */
        function isTemplateValid(template) {
            var isValid = true,
                validator = this;

            angular.forEach(template.columnsMap, function(column) {
                isValid = isValid && !validator.getColumnError(column, template);
            });

            // SIGLUS-REFACTOR: starts here
            isValid = isValid && isOptionsValid(template);
            if (!isOptionsValid(template)) {
                notificationService.error('adminProgramTemplate.template.invalidOptions');
            }
            // SIGLUS-REFACTOR: ends here
            // #248: kit usage section configure
            angular.forEach(template.kitUsage, function(section) {
                angular.forEach(section.columns, function(column) {
                    isValid = isValid && !validator.getSiglusColumnError(column);
                });
            });
            // #248: ends here

            return isValid;
        }

        // SIGLUS-REFACTOR: starts here
        function isOptionsValid(template) {
            return !!template.extension && (template.extension.enableConsultationNumber ||
                template.extension.enableKitUsage || template.extension.enableProduct
                || template.extension.enablePatientLineItem || template.extension.enableRegimen
                || template.extension.enableRapidTestConsumption || template.extension.enableUsageInformation);
        }
        // SIGLUS-REFACTOR: ends here

        /**
         * @ngdoc method
         * @methodOf admin-template.templateValidator
         * @name getColumnError
         *
         * @description
         * Validates the given column for errors. If there are any, the first one will be returned.
         *
         * @param   {Object}    column      the column to be validated
         * @param   {Object}    template    the template the column comes from
         * @return  {String}                undefined if column is valid, error as string otherwise
         */
        function getColumnError(column, template) {
            var error = validateLabel(column.label) ||
                validateDefinition(column.definition) ||
                validateSource(column) ||
                validateOption(column) ||
                validateCalculated(column, template) ||
                validateUserInput(column) ||
                validateColumn(column, template) ||
                validateTag(column, template) ||
                validateSelectedStockCard(column, template) ||
                validateSuggestedQuantity(column, template);

            return error;
        }

        // #248: kit usage section configure
        function getSiglusColumnError(column) {
            var error = validateLabel(column.label) ||
                validateSiglusDefinition(column.definition) ||
                validateSiglusSource(column) ||
                validateOption(column) ||
                validateSiglusTag(column);

            return error;
        }
        // #248: ends here

        // #147: starts here
        function validateSuggestedQuantity(column, template) {
            if (column.name === TEMPLATE_COLUMNS.SUGGESTED_QUANTITY) {
                var isApprovedQuantityDisplayed = template.columnsMap[TEMPLATE_COLUMNS.APPROVED_QUANTITY].isDisplayed;
                var isSuggestedQuantityDisplayed = template.columnsMap[TEMPLATE_COLUMNS.SUGGESTED_QUANTITY].isDisplayed;
                if (isSuggestedQuantityDisplayed && !isApprovedQuantityDisplayed) {
                    return messageService.get('adminProgramTemplate.template.invalidSuggestedQuantity');
                }
            }
        }
        // #147: ends here

        function validateTag(column, template) {
            if (isEmpty(column.tag) &&
                template.populateStockOnHandFromStockCards &&
                column.columnDefinition.supportsTag) {
                return messageService.get('adminProgramTemplate.columnTagEmpty');
            }
        }

        // #248: kit usage section configure
        function validateSiglusTag(column) {
            if (isEmpty(column.tag) && columnUtils.isStockCards(column) &&
                column.columnDefinition.supportsTag) {
                return messageService.get('adminProgramTemplate.columnTagEmpty');
            }
        }
        // #248: ends here

        function validateLabel(label) {
            if (isEmpty(label)) {
                return messageService.get('adminProgramTemplate.columnLabelEmpty');
            }
            if (label.length < 2) {
                return messageService.get('adminProgramTemplate.columnLabelToShort');
            }
            if (!UTF8_REGEX.test(label)) {
                return messageService.get('adminProgramTemplate.columnLabelNotAllowedCharacters');
            }
        }

        function validateDefinition(definition) {
            if ((definition && definition.length > MAX_COLUMN_DESCRIPTION_LENGTH) || definition === undefined) {
                return messageService.get('adminProgramTemplate.columnDescriptionTooLong');
            }
        }

        function validateSiglusDefinition(definition) {
            if (isEmpty(definition)) {
                return messageService.get('adminProgramTemplate.columnDefinitionEmpty');
            }
            if ((definition && definition.length > MAX_COLUMN_DESCRIPTION_LENGTH)) {
                return messageService.get('adminProgramTemplate.columnDescriptionTooLong');
            }
        }

        function validateSource(column) {
            if (isEmpty(column.source)) {
                return messageService.get('adminProgramTemplate.emptyColumnSource');
            }
        }

        // #248: kit usage section configure
        function validateSiglusSource(column) {
            if (!_.isEmpty(column.columnDefinition.sources) && isEmpty(column.source)) {
                return messageService.get('adminProgramTemplate.emptyColumnSource');
            }
        }
        // #248: ends here

        function validateOption(column) {
            // #248: kit usage section configure
            if (column.isDisplayed && !_.isEmpty(column.columnDefinition.options) && !column.option) {
            // #248: ends here
                return messageService.get('adminProgramTemplate.emptyColumnOption');
            }
        }

        function validateColumn(column, template) {
            var customValidation = columnValidations[column.name];
            if (customValidation) {
                return customValidation(column, template);
            }
        }

        function validateAverageConsumption(column, template) {
            var periodsToAverage = template.numberOfPeriodsToAverage;
            if (isEmpty(periodsToAverage)) {
                return messageService.get('adminProgramTemplate.emptyNumberOfPeriods');
            }
            if (periodsToAverage < 2) {
                return messageService.get('adminProgramTemplate.invalidNumberOfPeriods');
            }
        }

        // SIGLUS-REFACTOR: starts here
        // function validateRequestedQuantity(column, template) {
        //     var wColumn = template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION];
        //
        //     if (column.isDisplayed && !wColumn.isDisplayed) {
        //         return messageService.get('adminProgramTemplate.columnDisplayMismatch') + wColumn.label;
        //     }
        // }
        // SIGLUS-REFACTOR: ends here

        function validateAdditionalQuantityRequired(column, template) {
            var aColumn = template.columnsMap[TEMPLATE_COLUMNS.ADJUSTED_CONSUMPTION];
            if (!aColumn.isDisplayed && column.isDisplayed) {
                return messageService.get('adminProgramTemplate.columnDisplayMismatch') + aColumn.label;
            }
        }

        function validateRequestedQuantityExplanation(column, template) {
            var jColumn = template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY];

            if (column.isDisplayed && !jColumn.isDisplayed) {
                return messageService.get('adminProgramTemplate.columnDisplayMismatch') + jColumn.label;
            }
        }

        function validateCalculated(column, template) {
            var dependencies = '',
                message;

            if (column.source === COLUMN_SOURCES.CALCULATED) {
                var circularDependencyArray = template.findCircularCalculatedDependencies(column.name);
                angular.forEach(circularDependencyArray, function(dependency) {
                    dependencies = dependencies + ' ' + template.columnsMap[dependency].label + ',';
                });
            }

            if (dependencies.length > 0) {
                // remove last comma
                dependencies = dependencies.substring(0, dependencies.length - 1);
                return messageService.get('adminProgramTemplate.calculatedError') + dependencies;
            }

            return message;
        }

        function validateUserInput(column) {
            // #199: product sections for column changes
            if (!isTotalStockoutDays(column) && !column.isDisplayed
                && column.source === COLUMN_SOURCES.USER_INPUT
                && column.columnDefinition.sources.length > 1) {
            // #199: ends here
                return messageService.get('adminProgramTemplate.shouldBeDisplayed') +
                    messageService.get('adminProgramTemplate.isUserInput');
            }
        }

        function isTotalStockoutDays(column) {
            return column.name === TEMPLATE_COLUMNS.TOTAL_STOCKOUT_DAYS;
        }

        function validateTotalStockoutDays(column, template) {
            if (!column.isDisplayed) {
                var nColumn = template.columnsMap.adjustedConsumption;
                if (nColumn.isDisplayed && nColumn.source === COLUMN_SOURCES.CALCULATED) {
                    return messageService.get('adminProgramTemplate.shouldBeDisplayedIfOtherIsCalculated', {
                        column: nColumn.label
                    });
                }

                var pColumn = template.columnsMap.averageConsumption;
                if (pColumn.isDisplayed && pColumn.source === COLUMN_SOURCES.CALCULATED) {
                    return messageService.get('adminProgramTemplate.shouldBeDisplayedIfOtherIsCalculated', {
                        column: pColumn.label
                    });
                }
            }
        }

        // #199: product sections for column changes
        // function validateCalculatedOrderQuantity(column, template) {
        //     var requestedQuantityColumn = template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY];
        //     var requestedQuantityExplanationColumn =
        //         template.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION];
        //
        //     if (!column.isDisplayed && (!requestedQuantityColumn.isDisplayed ||
        //         !requestedQuantityExplanationColumn.isDisplayed)) {
        //         return messageService.get('adminProgramTemplate.shouldDisplayRequestedQuantity', {
        //             calculatedOrderQuantity: column.label,
        //             requestedQuantity: requestedQuantityColumn.label,
        //             requestedQuantityExplanation: requestedQuantityExplanationColumn.label
        //         });
        //     }
        // }
        // #199: ends here

        function validateSelectedStockCard(column, template) {
            if (!template.populateStockOnHandFromStockCards && column.source === COLUMN_SOURCES.STOCK_CARDS) {
                return messageService.get('adminProgramTemplate.cannotSelectStockCard');
            }
        }

        function isEmpty(value) {
            return !value || !value.toString().trim();
        }
    }
})();
