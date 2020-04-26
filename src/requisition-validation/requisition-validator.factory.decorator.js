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

    decorator.$inject = ['$delegate', '$filter', 'requisitionUtils', 'messageService'];

    function decorator($delegate, $filter, requisitionUtils, messageService) {
        $delegate.validateRequisition = validateRequisition;
        $delegate.validateUsageReport = validateUsageReport;
        $delegate.validateTotalOfRegiment = validateTotalOfRegiment;
        $delegate.isOnlyAPES = isOnlyAPES;
        $delegate.isEmptyTable = isEmptyTable;
        $delegate.validateRapidTestReport = validateRapidTestReport;
        $delegate.validateARVPatientTotal = validateARVPatientTotal;

        return $delegate;

        /**
         * @ngdoc method
         * @methodOf requisition-validation.requisitionValidator
         * @name validateRequisition
         *
         * @description
         * Validates the given requisitions.
         *
         * @param  {Object}  requisition the requisition to be validated
         * @return {Boolean}             true if the requisition is valid, false otherwise
         */
        function validateRequisition(requisition) {
            var valid = true,
                validator = this,
                fullSupplyColumns = requisition.template.getColumns(),
                nonFullSupplyColumns = requisition.template.getColumns(true);

            angular.forEach($filter('filter')(requisition.requisitionLineItems, {
                $program: {
                    fullSupply: true
                }
            }), function(lineItem) {
                valid = validator.validateLineItem(lineItem, fullSupplyColumns, requisition) && valid;
            });

            angular.forEach($filter('filter')(requisition.requisitionLineItems, {
                $program: {
                    fullSupply: false
                }
            }), function(lineItem) {
                valid = validator.validateLineItem(lineItem, nonFullSupplyColumns, requisition) && valid;
            });

            valid = validateExtraData(requisition) && valid;

            return valid;
        }

        function validateExtraData(requisition) {
            var flag = true;
            if (requisition.template.enableKitUsage && !requisition.emergency) {
                flag = isNotEmpty(requisition.extraData.openedKitByCHW)
                    && isNotEmpty(requisition.extraData.openedKitByHF)
                    && isNotEmpty(requisition.extraData.receivedKitByCHW)
                    && isNotEmpty(requisition.extraData.receivedKitByHF);
            }
            if (requisition.template.enableConsultationNumber && !requisition.emergency) {
                flag = flag && isNotEmpty(requisition.extraData.consultationNumber);
            }
            return flag;
        }

        function isNotEmpty(value) {
            return _.isNumber(value) && !_.isNaN(value);
        }

        // extract method to reduce eslint complexity
        function usageReportARVProductModuleHelper(requisition, isValid) {
            requisition.requisitionLineItems.forEach(function(item) {
                item.isRequiredTotalConsumedQuantity = true;
                item.isRequiredTotalLossesAndAdjustments = true;
                item.isRequiredStockOnHand = true;
            });
            isValid = !_.some(requisition.requisitionLineItems, function(item) {
                return nonEmpty(item.totalConsumedQuantity) || nonEmpty(item.totalLossesAndAdjustments) ||
                    nonEmpty(item.stockOnHand);
            }) && isValid;
            return isValid;
        }

        // extract method to reduce eslint complexity
        function usageReportARVTherapeuticRegimentModuleHelper(requisition, isValid) {
            requisition.regimenLineItems.forEach(function(item) {
                item.isRequiredHFPatients = true;
                item.isRequiredCHWPatients = true;
            });
            isValid = !_.some(requisition.regimenLineItems, function(item) {
                return nonEmpty(item.hfPatients) || nonEmpty(item.chwPatients);
            }) && isValid;
            return isValid;
        }

        // extract method to reduce eslint complexity
        function usageReportARVTherapeuticLinesModuleHelper(requisition, isValid) {
            requisition.regimenDispatchLineItems.forEach(function(item) {
                item.isRequiredHFPatients = true;
                item.isRequiredCHWPatients = true;
            });
            isValid = !_.some(requisition.regimenDispatchLineItems, function(item) {
                return nonEmpty(item.hfPatients) || nonEmpty(item.chwPatients);
            }) && isValid;
            return isValid;
        }

        // extract method to reduce eslint complexity
        function usageReportARVPatientModuleHelper(requisition, isValid) {
            requisition.patientLineItems.forEach(function(item) {
                validateARVPatientTotal(item);
            });
            isValid = !_.some(requisition.patientLineItems, function(item) {
                return nonEmpty(item.total);
            }) && isValid;
            return isValid;
        }

        // extract method to reduce eslint complexity
        function usageReportALUsageModuleHelper(requisition, isValid) {
            requisition.alLineItems.forEach(function(item) {
                item.alDepartmentList.forEach(function(d) {
                    d.isRequiredConsumeCount = true;
                    d.isRequiredStockCount = true;
                });
            });
            isValid = _.every(requisition.alLineItems, function(item) {
                return _.every(item.alDepartmentList, function(d) {
                    return notNull(d.consumeCount) && notNull(d.stockCount);
                });
            }) && isValid;
            return isValid;
        }

        /* eslint-disable complexity */
        function validateUsageReport(requisition) {
            var isValid = true;
            if (requisition.template.enableARVProductModule) {
                isValid = usageReportARVProductModuleHelper(requisition, isValid);
            }
            if (requisition.template.enableARVTherapeuticRegimentModule) {
                isValid = usageReportARVTherapeuticRegimentModuleHelper(requisition, isValid);
            }
            if (requisition.template.enableARVTherapeuticLinesModule) {
                isValid = usageReportARVTherapeuticLinesModuleHelper(requisition, isValid);
            }
            if (requisition.template.enableARVPatientModule) {
                isValid = usageReportARVPatientModuleHelper(requisition, isValid);
            }
            if (requisition.template.enableALUsageModule) {
                isValid = usageReportALUsageModuleHelper(requisition, isValid);
            }
            if (requisition.template.enableRapidTestProductModule) {
                isValid = validateRapidTestProduct(requisition) && isValid;
            }
            if (requisition.template.enableRapidTestServiceModule) {
                isValid = validateRapidTestReport(requisition) && isValid;
            }
            isValid = validateTotalOfRegiment(requisition) && isValid;
            return isValid;
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

        function isOnlyAPES(requisition) {
            if (!requisition.template.enableRapidTestServiceModule) {
                return false;
            }
            var serviceLineItems = requisition.serviceLineItems;
            var flag = false;
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

                    if (!_.isNumber(total.value) && (_.isNumber(ape.value))) {
                        flag = true;
                    }
                }
            }

            return flag;
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

        function validateTotalOfRegiment(requisition) {
            var isValide = true;
            if (!requisition.draftStatusMessage && _.isEmpty(requisition.$statusMessages) &&
                requisition.template.enableARVTherapeuticLinesModule &&
                requisition.template.enableARVTherapeuticRegimentModule) {
                var totalPatientsOfRegiment = requisitionUtils.calculateTotal(
                    requisition.regimenLineItems, 'hfPatients'
                );
                var totalPharmacyOfRegiment = requisitionUtils.calculateTotal(
                    requisition.regimenLineItems, 'chwPatients'
                );
                var totalPatientsOfRegimentCategory = requisitionUtils.calculateTotal(
                    requisition.regimenDispatchLineItems, 'hfPatients'
                );
                var totalPharmacyOfRegimentCategory = requisitionUtils.calculateTotal(
                    requisition.regimenDispatchLineItems, 'chwPatients'
                );
                isValide = (totalPatientsOfRegiment === totalPatientsOfRegimentCategory) &&
                    (totalPharmacyOfRegiment === totalPharmacyOfRegimentCategory);
            }
            return isValide;
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
