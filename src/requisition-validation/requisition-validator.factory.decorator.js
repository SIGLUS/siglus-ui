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
        $delegate.validateUsageReport = validateUsageReport;
        $delegate.validateTotalEqualOfRegimen = validateTotalEqualOfRegimen;
        $delegate.isEmptyTable = isEmptyTable;
        $delegate.validateRapidTestReport = validateRapidTestReport;
        $delegate.validateARVPatientTotal = validateARVPatientTotal;
        $delegate.validateSiglusLineItemField = validateSiglusLineItemField;
        $delegate.validateTestConsumptionLineItems = validateTestConsumptionLineItems;
        $delegate.siglusValidRequisition = siglusValidRequisition;

        return $delegate;

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
            isValid = !areAllLineItemsSkipped(requisition) && isValid;
            isValid = !isTestConsumptionEmpty(requisition) && isValid;
            isValid = !isOnlyAPESFilled(requisition) && isValid;
            isValid = !isTotalWithoutServices(requisition) && isValid;
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
            return isValid;
        }

        function validateRegimen(requisition) {
            var valid = true;
            if (requisition.template.extension.enableRegimen && !requisition.emergency
                && requisition.regimenLineItems.length) {
                valid = validateBasicLineItems(requisition.regimenLineItems) && valid;
                valid = validateBasicLineItems(requisition.regimenDispatchLineItems) && valid;
                valid = validateTotalEqualOfRegimen(requisition) && valid;
                valid = validateTotalOfRegimen(requisition) && valid;
            }
            return valid;
        }

        function validateTotalOfRegimen(requisition) {
            var valid = true;
            var regimenColumns = getLineItemsColumns(requisition.regimenLineItems);
            var summaryColumns = getLineItemsColumns(requisition.regimenDispatchLineItems);
            valid = !_.some(regimenColumns, function(column) {
                return siglusRequisitionUtils
                    .getBasicLineItemsTotal(requisition.regimenLineItems, column) > MAX_INTEGER_VALUE;
            }) && valid;
            valid = !_.some(summaryColumns, function(column) {
                return siglusRequisitionUtils
                    .getBasicLineItemsTotal(requisition.regimenDispatchLineItems, column) > MAX_INTEGER_VALUE;
            }) && valid;
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

        function validateTestOutcomeField(testOutcomeFields) {
            var isValid = true;
            var consumoField = testOutcomeFields.find(siglusColumnUtils.isConsumo);
            var positiveField = testOutcomeFields.find(siglusColumnUtils.isPositive);
            if (_.isUndefined(positiveField)) {
                return isValid;
            }
            if (isNotEmpty(consumoField.value)
                && isNotEmpty(positiveField.value)
                && positiveField.value > consumoField.value) {
                var error = messageService.get('requisitionValidation.positiveLargerThanConsumo');
                consumoField.$error = error;
                positiveField.$error = error;
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

        function isOnlyAPESFilled(requisition) {
            if (!requisition.template.extension.enableRapidTestConsumption || requisition.emergency) {
                return false;
            }
            var flag = false;
            var totalLineItem = requisition.testConsumptionLineItems.find(siglusColumnUtils.isTotal);
            var apesLineItem = requisition.testConsumptionLineItems.find(siglusColumnUtils.isAPES);
            if (_.isUndefined(apesLineItem)) {
                return flag;
            }
            angular.forEach(requisition.testConsumptionLineItems, function(lineItem) {
                angular.forEach(_.values(lineItem.projects), function(project) {
                    angular.forEach(_.values(project.outcomes), function(outcome) {
                        if (isNotEmpty(getTestConsumptionFieldValue(apesLineItem, project, outcome))
                            && !isNotEmpty(getTestConsumptionFieldValue(totalLineItem, project, outcome))) {
                            flag =  true;
                        }
                    });
                });
            });
            if (flag) {
                requisition.$error = requisition.$error
                    || messageService.get('requisitionValidation.apeOnly');
            }
            return flag;
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

        function validateUsageReport(requisition) {
            var isValide = true;
            isValide = validateARVUsageReport(requisition, isValide);
            if (requisition.template.enableALUsageModule) {
                requisition.alLineItems.forEach(function(item) {
                    item.alDepartmentList.forEach(function(d) {
                        d.isRequiredConsumeCount = true;
                        d.isRequiredStockCount = true;
                    });
                });
                isValide = _.every(requisition.alLineItems, function(item) {
                    return _.every(item.alDepartmentList, function(d) {
                        return notNull(d.consumeCount) && notNull(d.stockCount);
                    });
                }) && isValide;
            }
            if (requisition.template.enableRapidTestProductModule) {
                isValide = validateRapidTestProduct(requisition) && isValide;
            }
            if (requisition.template.enableRapidTestServiceModule) {
                isValide = validateRapidTestReport(requisition) && isValide;
            }
            isValide = validateTotalEqualOfRegimen(requisition) && isValide;
            return isValide;
        }

        // extract method to reduce eslint complexity
        function validateARVUsageReport(requisition, isValide) {
            if (requisition.template.enableARVProductModule) {
                requisition.requisitionLineItems.forEach(function(item) {
                    item.isRequiredTotalConsumedQuantity = true;
                    item.isRequiredTotalLossesAndAdjustments = true;
                    item.isRequiredStockOnHand = true;
                });
                isValide = !_.some(requisition.requisitionLineItems, function(item) {
                    return nonEmpty(item.totalConsumedQuantity) || nonEmpty(item.totalLossesAndAdjustments) ||
                        nonEmpty(item.stockOnHand);
                }) && isValide;
            }
            if (requisition.template.enableARVTherapeuticRegimentModule) {
                requisition.regimenLineItems.forEach(function(item) {
                    item.isRequiredHFPatients = true;
                    item.isRequiredCHWPatients = true;
                });
                isValide = !_.some(requisition.regimenLineItems, function(item) {
                    return nonEmpty(item.hfPatients) || nonEmpty(item.chwPatients);
                }) && isValide;
            }
            if (requisition.template.enableARVTherapeuticLinesModule) {
                requisition.regimenDispatchLineItems.forEach(function(item) {
                    item.isRequiredHFPatients = true;
                    item.isRequiredCHWPatients = true;
                });
                isValide = !_.some(requisition.regimenDispatchLineItems, function(item) {
                    return nonEmpty(item.hfPatients) || nonEmpty(item.chwPatients);
                }) && isValide;
            }
            if (requisition.template.enableARVPatientModule) {
                requisition.patientLineItems.forEach(function(item) {
                    validateARVPatientTotal(item);
                });
                isValide = !_.some(requisition.patientLineItems, function(item) {
                    return nonEmpty(item.total);
                }) && isValide;
            }
            return isValide;
        }

        function validateRapidTestReport(requisition) {
            var isValid = true;
            if (isEmptyTable(requisition)) {
                return false;
            }
            var items = requisition.serviceLineItems;
            // reset before validate
            items.forEach(function(item) {
                item.error = null;
            });
            var groupByService = _.groupBy(items, function(item) {
                return item.service.code;
            });

            for (var key in groupByService) {
                if (groupByService.hasOwnProperty(key)
                    && key !== 'TOTAL') {
                    var groupByObject = _.groupBy(groupByService[key], function(item) {
                        return item.serviceColumn.name;
                    });

                    for (var object in groupByObject) {
                        if (groupByObject.hasOwnProperty(object)) {
                            var tests = groupByObject[object];
                            isValid = validteServiceItem(tests) && isValid;
                        }
                    }
                }
            }

            isValid = validateAPE(items) && isValid;
            return isValid;
        }

        function validteServiceItem(items) {
            var isTestsValid = true;

            var hasValue = _.some(items, function(item) {
                return _.isNumber(item.value);
            });
            if (hasValue) {
                items.forEach(function(item) {
                    if (!_.isNumber(item.value)) {
                        item.error = 'requisitionValidation.required';
                        isTestsValid = false;
                    }
                });
            }

            var consumoItem = items.filter(function(item) {
                return item.serviceColumn.subname === 'Consumo';
            })[0];

            var positiveItem = items.filter(function(item) {
                return item.serviceColumn.subname === 'Positive';
            })[0];

            if (_.isNumber(consumoItem.value)
                && _.isNumber(positiveItem.value)
                && positiveItem.value > consumoItem.value) {
                positiveItem.error = 'requisitionValidation.positiveLargerThanConsumo';
                consumoItem.error = 'requisitionValidation.positiveLargerThanConsumo';
                isTestsValid = false;
            }

            return isTestsValid;
        }

        function validateAPE(serviceLineItems) {
            var isValid = true;
            var groupByColumns = _.groupBy(serviceLineItems, function(item) {
                return item.serviceColumn.code;
            });

            for (var col in groupByColumns) {
                if (groupByColumns.hasOwnProperty(col)) {
                    var total = groupByColumns[col].find(function(item) {
                        return item.service.code === 'TOTAL';
                    });
                    var ape = groupByColumns[col].find(function(item) {
                        return item.service.code === 'APES';
                    });

                    if (_.isNumber(total.value) && (!_.isNumber(ape.value))) {
                        ape.error = 'requisitionValidation.required';
                        isValid = false;
                    }

                    if (!_.isNumber(total.value) && (_.isNumber(ape.value))) {
                        isValid = false;
                    }
                }
            }

            return isValid;
        }

        function isEmptyTable(requisition) {
            if (!requisition.template.enableRapidTestServiceModule) {
                return false;
            }
            var serviceLineItems = requisition.serviceLineItems;
            var flag = true;

            serviceLineItems.forEach(function(item) {
                if (_.isNumber(item.value)) {
                    flag = false;
                }
            });

            return flag;
        }

        function validateRapidTestProduct(requisition) {
            var lineItems = requisition.requisitionLineItems;
            var isValid = true;
            lineItems.forEach(function(lineItem) {
                if (!_.isNumber(lineItem.beginningBalance)) {
                    isValid = false;
                    lineItem.isRequiredBeginningBalance = true;
                }

                if (!_.isNumber(lineItem.stockOnHand)) {
                    isValid = false;
                    lineItem.isRequiredSOH = true;
                }
            });
            return isValid;
        }

        function validateTotalEqualOfRegimen(requisition) {
            if (noCommentWhenEnableRegimen(requisition)) {
                return isRegimenColumnEqual(requisition, SIGLUS_SERVICE_TYPES.PATIENTS) &&
                    isRegimenColumnEqual(requisition, SIGLUS_SERVICE_TYPES.COMMUNITY);
            }
            return true;
        }

        function isRegimenColumnEqual(requisition, columnName) {
            if (_.first(requisition.regimenLineItems).columns[columnName] &&
                _.first(requisition.regimenDispatchLineItems).columns[columnName]) {
                var regimenTotal = siglusRequisitionUtils.getBasicLineItemsTotal(
                    requisition.regimenLineItems, {
                        name: columnName
                    }
                );
                var summaryTotal = siglusRequisitionUtils.getBasicLineItemsTotal(
                    requisition.regimenDispatchLineItems, {
                        name: columnName
                    }
                );
                return regimenTotal === summaryTotal;
            }
            return true;
        }

        function noCommentWhenEnableRegimen(requisition) {
            return !requisition.draftStatusMessage && _.isEmpty(requisition.$statusMessages) &&
                requisition.template.extension.enableRegimen && !requisition.emergency &&
                requisition.regimenLineItems.length;
        }

        function getLineItemsColumns(lineItems) {
            return _.first(lineItems).columns;
        }

        function validateARVPatientTotal(item) {
            if (_.isNumber(item.total)) {
                item.$error = {
                    totalInvalid: false
                };
            } else {
                item.$error = {
                    totalInvalid: 'openlmisForm.required'
                };
            }
        }

        function notNull(val) {
            return val !== null && val !== undefined;
        }

        function nonEmpty(value) {
            if (value === null || value === undefined || value === '') {
                return messageService.get('requisitionValidation.required');
            }
        }
    }
})();
