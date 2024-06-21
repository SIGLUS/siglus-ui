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
     * @name requisition-validation.requisitionValidator
     *
     * @description
     * Decorates requisitionValidator with new additional method.
     */
    angular.module('requisition-validation')
        .config(config);

    config.$inject = ['$provide'];

    function config($provide) {
        $provide.decorator('requisitionValidator', decorator);
    }

    decorator.$inject = ['$delegate', '$filter', 'siglusRequisitionUtils', 'messageService', 'COLUMN_TYPES',
        'MAX_INTEGER_VALUE', 'siglusColumnUtils', 'SIGLUS_SERVICE_TYPES'];

    function decorator($delegate, $filter, siglusRequisitionUtils, messageService, COLUMN_TYPES, MAX_INTEGER_VALUE,
                       siglusColumnUtils, SIGLUS_SERVICE_TYPES) {
        $delegate.validateTotalEqualOfRegimen = validateTotalEqualOfRegimen;
        $delegate.validateSiglusLineItemField = validateSiglusLineItemField;
        $delegate.validateTestConsumptionLineItems = validateTestConsumptionLineItems;
        $delegate.siglusValidRequisition = siglusValidRequisition;
        $delegate.validateTotalColumn = validateTotalColumn;
        $delegate.validateAgeGroupLineItems = validateAgeGroupLineItems;

        return $delegate;

        function validateTotalColumn(column) {
            if (_.isNumber(column.value)) {
                validateSiglusLineItemField(column);
                // required value error occurred when submit requisition, it should not be cleared
            } else if (column.$error !== messageService.get('requisitionValidation.required')) {
                column.$error = undefined;
            }
        }

        function areAllLineItemsSkipped(requisition) {
            var error = requisition.$error;
            if (requisition.template.extension.enableProduct
                && $delegate.areAllLineItemsSkipped(requisition.requisitionLineItems)) {
                var message = requisition.$isAuthorized() || requisition.$isInApproval()
                    ? 'requisitionValidation.approveAllLineItemsSkipped'
                    : 'requisitionView.allLineItemsSkipped';
                error = error || messageService.get(message);
            }
            return !!(requisition.$error = error);
        }

        function siglusValidRequisition(requisition) {
            requisition.$error = undefined;
            var isValid = siglusValidRequisitionField(requisition);
            if (!isValid) {
                requisition.$error = messageService.get('requisitionView.rnrHasErrors');
            }
            isValid = isValid && !areAllLineItemsSkipped(requisition);
            isValid = isValid && validateTotalEqualOfRegimen(requisition);
            isValid = isValid && !isUsageInformationEmpty(requisition);
            isValid = isValid && !isTestConsumptionEmpty(requisition);
            isValid = isValid && !isTotalWithoutServices(requisition);
            return isValid;
        }

        function siglusValidRequisitionField(requisition) {
            var isValid = true;
            isValid = validateConsultationNumber(requisition) && isValid;
            isValid = validateKitUsage(requisition) && isValid;
            isValid = $delegate.validateRequisition(requisition) && isValid;
            isValid = validateRegimen(requisition) && isValid;
            isValid = validateUsageInformation(requisition) && isValid;
            isValid = validatePatient(requisition) && isValid;
            isValid = validateTestConsumption(requisition) && isValid;
            isValid = validateAgeGroup(requisition) && isValid;

            return isValid;
        }

        function validateRegimen(requisition) {
            var valid = true;
            if (siglusRequisitionUtils.hasRegimen(requisition)) {
                valid = validateBasicLineItems(requisition.regimenLineItems) && valid;
                valid = validateBasicLineItems(requisition.regimenSummaryLineItems) && valid;
            }
            return valid;
        }

        function validateBasicLineItems(lineItems) {
            var valid = true;
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(Object.keys(lineItem.columns), function(columnName) {
                    valid = validateSiglusLineItemField(lineItem.columns[columnName]) && valid;
                });
            });
            return valid;
        }

        function validateKitUsage(requisition) {
            var valid = true;
            if (requisition.template.extension.enableKitUsage && !requisition.emergency) {
                angular.forEach(requisition.kitUsageLineItems, function(lineItem) {
                    angular.forEach(Object.keys(lineItem.services), function(serviceName) {
                        valid = validateSiglusLineItemField(lineItem.services[serviceName]) && valid;
                    });
                });
            }
            return valid;
        }

        function validateSiglusLineItemField(lineItemField) {
            var error;

            error = nonEmpty(lineItemField.value);

            if (validateSiglusNumeric(lineItemField)) {
                error = error || messageService.get('requisitionValidation.numberTooLarge');
            }
            return !(lineItemField.$error = error);
        }

        function validateSiglusNumeric(lineItem) {
            // return lineItem.columnDefinition.columnType === COLUMN_TYPES.NUMERIC &&
            // lineItem.value > MAX_INTEGER_VALUE;
            return lineItem.value > MAX_INTEGER_VALUE;
        }

        function validateUsageInformation(requisition) {
            var valid = true;
            if (requisition.template.extension.enableUsageInformation && !requisition.emergency) {
                angular.forEach(requisition.usageInformationLineItems, function(lineItem) {
                    angular.forEach(Object.keys(lineItem.informations), function(information) {
                        angular.forEach(Object.keys(lineItem.informations[information].orderables),
                            function(orderableId) {
                                valid = validateSiglusLineItemField(lineItem.informations[information]
                                    .orderables[orderableId]) && valid;
                            });
                    });
                });
            }
            return valid;
        }

        function validateTestConsumption(requisition) {
            if (requisition.template.extension.enableRapidTestConsumption && !requisition.emergency) {
                return validateTestConsumptionLineItems(requisition.testConsumptionLineItems);
            }
            return true;
        }

        function validatePatient(requisition) {
            if (requisition.template.extension.enablePatient && !requisition.emergency) {
                return validateBasicLineItems(requisition.patientLineItems);
            }
            return true;
        }

        function isTestOutcomesFilled(fields) {
            return _.find(fields, function(field) {
                return isNotEmpty(field.value);
            });
        }

        function isTotalAndCalculated(lineItem) {
            return siglusColumnUtils.isTotal(lineItem)
                && !siglusColumnUtils.isUserInput(lineItem);
        }

        function getServiceLineItems(lineItems) {
            return lineItems.filter(function(lineItem) {
                return !siglusColumnUtils.isTotal(lineItem) && !siglusColumnUtils.isAPES(lineItem);
            });
        }

        function getTestConsumptionFieldValue(lineItem, project, outcome) {
            return lineItem.projects[project.name].outcomes[outcome.name].value;
        }

        function validateTestConsumptionLineItems(lineItems) {
            var isValid = true;
            siglusRequisitionUtils.clearTestConsumptionError(lineItems);
            angular.forEach(lineItems, function(lineItem) {
                angular.forEach(_.values(lineItem.projects), function(testProject) {
                    var fields = _.values(testProject.outcomes);
                    if (isTestOutcomesFilled(fields)) {
                        angular.forEach(fields, function(field) {
                            if (!isTotalAndCalculated(lineItem)) {
                                isValid = validateSiglusLineItemField(field) && isValid;
                            }
                            isValid = validateTotal(lineItems, testProject, field) && isValid;
                            isValid = validateAPES(lineItems, testProject, field) && isValid;
                        });
                        isValid = validateTestOutcomeField(fields) && isValid;
                    }
                });
            });
            return isValid;
        }

        function validateAgeGroup(requisition) {
            if (requisition.template.extension.enableAgeGroup && !requisition.emergency) {
                return validateAgeGroupLineItems(requisition.ageGroupLineItems);
            }
            return true;
        }

        function validateAgeGroupLineItems(lineItems) {
            var isValid = true;
            lineItems.forEach(function(lineItem) {
                _.values(lineItem.columns).forEach(function(column) {
                    isValid = validateSiglusLineItemField(column) && isValid;
                });
            });
            return isValid;
        }

        function validateTestOutcomeField(testOutcomeFields) {
            if (testOutcomeFields.length > 3) {
                console.log(testOutcomeFields);
            }
            var isValid = true;
            var consumoField = testOutcomeFields.find(siglusColumnUtils.isConsumo);
            var positiveField = testOutcomeFields.find(siglusColumnUtils.isPositive);
            if (!_.isUndefined(positiveField)) {
                if (isNotEmpty(consumoField.value)
                    && isNotEmpty(positiveField.value)
                    && positiveField.value > consumoField.value) {
                    var error = messageService.get('requisitionValidation.positiveLargerThanConsumo');
                    consumoField.$error = error;
                    positiveField.$error = error;
                    isValid = false;
                }
            }
            if (isValid) {
                return validateTestOutcomePositiveField(testOutcomeFields);
            }
            return isValid;
        }

        function validateTestOutcomePositiveField(testOutcomeFields) {
            var isValid = true;
            var consumoField = testOutcomeFields.find(siglusColumnUtils.isConsumo);
            var positiveHivField = testOutcomeFields.find(siglusColumnUtils.isPositiveHiv);
            var positiveSyphilisField = testOutcomeFields.find(siglusColumnUtils.isPositiveSyphilis);
            if (_.isUndefined(positiveHivField) || _.isUndefined(positiveSyphilisField)) {
                return isValid;
            }
            if (isNotEmpty(consumoField.value)
                && isNotEmpty(positiveHivField.value)
                && isNotEmpty(positiveSyphilisField.value)
                && positiveHivField.value + positiveSyphilisField.value > consumoField.value) {
                var error = messageService.get('requisitionValidation.positiveLargerThanConsumo');
                consumoField.$error = error;
                positiveHivField.$error = error;
                positiveSyphilisField.$error = error;
                isValid = false;
            }
            return isValid;
        }

        function validateTotal(lineItems, project, outcome) {
            var isValid = true;
            var serviceLineItems = getServiceLineItems(lineItems);
            var totalLineItem = lineItems.find(siglusColumnUtils.isTotal);
            if (!siglusColumnUtils.isUserInput(totalLineItem)) {
                return isValid;
            }
            var totalField = totalLineItem.projects[project.name].outcomes[outcome.name];
            var serviceField;
            angular.forEach(serviceLineItems, function(lineItem) {
                serviceField = lineItem.projects[project.name].outcomes[outcome.name];
                if (isNotEmpty(serviceField.value) && !isNotEmpty(totalField.value)) {
                    isValid = validateSiglusLineItemField(totalField) && isValid;
                }
            });
            return isValid;
        }

        function validateAPES(lineItems, project, outcome) {
            var isValid = true;
            var totalLineItem = lineItems.find(siglusColumnUtils.isTotal);
            var apesLineItem = lineItems.find(siglusColumnUtils.isAPES);
            if (_.isUndefined(apesLineItem)) {
                return isValid;
            }
            var apesField = apesLineItem.projects[project.name].outcomes[outcome.name];

            if (isNotEmpty(getTestConsumptionFieldValue(totalLineItem, project, outcome))
                && !isNotEmpty(getTestConsumptionFieldValue(apesLineItem, project, outcome))) {
                isValid = validateSiglusLineItemField(apesField) && isValid;
            }
            return isValid;
        }

        function isUsageInformationEmpty(requisition) {
            if (!requisition.template.extension.enableUsageInformation || requisition.emergency) {
                return false;
            }
            if (requisition.usageInformationLineItems.length === 0) {
                requisition.$error = requisition.$error
                    || messageService.get('requisitionValidation.emptyUsageInformation');
                return true;
            }
        }

        function isTestConsumptionEmpty(requisition) {
            if (!requisition.template.extension.enableRapidTestConsumption || requisition.emergency) {
                return false;
            }
            var isEmpty = true;
            angular.forEach(requisition.testConsumptionLineItems, function(lineItem) {
                angular.forEach(_.values(lineItem.projects), function(testProject) {
                    angular.forEach(_.values(testProject.outcomes), function(outcome) {
                        isEmpty = isEmpty && !isNotEmpty(outcome.value);
                    });
                });
            });
            if (isEmpty) {
                requisition.$error = requisition.$error
                    || messageService.get('requisitionValidation.emptyTestConsumption');
            }
            return isEmpty;
        }

        function isTotalWithoutServices(requisition) {
            if (!requisition.template.extension.enableRapidTestConsumption || requisition.emergency) {
                return false;
            }
            var totalLineItem = requisition.testConsumptionLineItems.find(siglusColumnUtils.isTotal);
            if (!siglusColumnUtils.isUserInput(totalLineItem)) {
                return false;
            }
            var isValid = true;
            var serviceLineItems = getServiceLineItems(requisition.testConsumptionLineItems);
            var isAllServiceLineItemsEmpty;
            _.values(_.first(serviceLineItems).projects).some(function(project) {
                _.values(project.outcomes).some(function(outcome) {
                    isAllServiceLineItemsEmpty = _.reduce(serviceLineItems, function(isEmpty, serviceLineItem) {
                        return isEmpty &&
                            !isNotEmpty(getTestConsumptionFieldValue(serviceLineItem, project, outcome));
                    }, true);
                    if (isNotEmpty(getTestConsumptionFieldValue(totalLineItem, project, outcome)) &&
                        isAllServiceLineItemsEmpty) {
                        isValid = false;
                    }
                    return !isValid;
                });
                return !isValid;
            });
            if (!isValid) {
                requisition.$error = requisition.$error
                    || messageService.get('requisitionValidation.totalWithoutServices');
            }
            return !isValid;
        }

        function validateConsultationNumber(requisition) {
            if (requisition.template.extension.enableConsultationNumber && !requisition.emergency) {
                return validateBasicLineItems(requisition.consultationNumberLineItems);
            }
            return true;
        }

        function isNotEmpty(value) {
            return _.isNumber(value) && !_.isNaN(value);
        }

        function validateTotalEqualOfRegimen(requisition) {
            var isValid = true;
            if (noCommentWhenEnableRegimen(requisition) &&
                validateBasicLineItems(requisition.regimenLineItems) &&
                validateBasicLineItems(requisition.regimenSummaryLineItems)) {
                isValid = isRegimenColumnEqual(requisition, SIGLUS_SERVICE_TYPES.PATIENTS) &&
                    isRegimenColumnEqual(requisition, SIGLUS_SERVICE_TYPES.COMMUNITY);
            }
            if (!isValid) {
                requisition.$error = requisition.$error
                    || messageService.get('requisitionValidation.totalNotEqual');
            }
            return isValid;
        }

        function isRegimenColumnEqual(requisition, columnName) {
            if (_.first(requisition.regimenLineItems).columns[columnName] &&
                _.first(requisition.regimenSummaryLineItems).columns[columnName]) {
                var regimenTotal = getRegimenTotal(requisition.regimenLineItems, columnName);
                var summaryTotal = getRegimenTotal(requisition.regimenSummaryLineItems, columnName);
                return regimenTotal === summaryTotal;
            }
            return true;
        }

        function getRegimenTotal(lineItems, columnName) {
            var totalItem = _.find(lineItems, function(item) {
                return item.column && siglusColumnUtils.isTotal(item.column);
            });
            if (siglusColumnUtils.isCalculated(totalItem.column)) {
                return siglusRequisitionUtils.getRegimenLineItemsTotal(
                    lineItems, {
                        name: columnName
                    }
                );
            }
            return totalItem.columns[columnName].value;
        }

        function noCommentWhenEnableRegimen(requisition) {
            return !requisition.draftStatusMessage && _.isEmpty(requisition.$statusMessages) &&
                siglusRequisitionUtils.hasRegimen(requisition);
        }

        function nonEmpty(value) {
            if (value === null || value === undefined || value === '') {
                return messageService.get('requisitionValidation.required');
            }
        }
    }
})();
