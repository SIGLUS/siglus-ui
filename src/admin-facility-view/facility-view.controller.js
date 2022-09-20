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
       * @name admin-facility-view.controller:FacilityViewController
       *
       * @description
       * Controller for managing facility view screen.
       */
    angular
        .module('admin-facility-view')
        .controller('FacilityViewController', controller);

    controller.$inject = [
        '$q', '$state', 'facility', 'facilityTypes', 'geographicZones',
        'facilityOperators',
        'programs', 'FacilityRepository', 'loadingModalService',
        'notificationService', 'locationManagementService',
        'messageService',
        'alertConfirmModalService', '$stateParams', 'facilityService',
        'siglusFacilityViewRadioConfirmModalService'
    ];

    function controller($q, $state, facility, facilityTypes,
                        geographicZones,
                        facilityOperators,
                        programs, FacilityRepository, loadingModalService,
                        notificationService, locationManagementService,
                        messageService, alertConfirmModalService,
                        $stateParams, facilityService,
                        siglusFacilityViewRadioConfirmModalService) {

        var vm = this;

        vm.$onInit = onInit;
        vm.goToFacilityList = goToFacilityList;
        vm.saveFacilityDetails = saveFacilityDetails;
        vm.saveFacilityWithPrograms = saveFacilityWithPrograms;
        vm.addProgram = addProgram;
        vm.exportFile = exportFile;
        vm.upload = upload;
        vm.updateEnableLocationManagement = updateEnableLocationManagement;
        vm.selectedReport = null;
        vm.upgradeToWeb = upgradeToWeb;
        // vm.minDate = '2022-08-08';
        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name facility
         * @type {Object}
         *
         * @description
         * Contains facility object.
         */
        vm.facility = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name facilityTypes
         * @type {Array}
         *
         * @description
         * Contains all facility types.
         */
        vm.facilityTypes = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name geographicZones
         * @type {Array}
         *
         * @description
         * Contains all geographic zones.
         */
        vm.geographicZones = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name facilityOperators
         * @type {Array}
         *
         * @description
         * Contains all facility operators.
         */
        vm.facilityOperators = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name programs
         * @type {Array}
         *
         * @description
         * Contains all programs.
         */
        vm.programs = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name selectedTab
         * @type {String}
         *
         * @description
         * Contains currently selected tab.
         */
        vm.selectedTab = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name file
         * @type {Object}
         *
         * @description
         * Holds csv file.
         */
        vm.file = undefined;

        /**
         * @ngdoc property
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name invalidMessage
         * @type {String}
         *
         * @description
         * Holds form error message.
         */
        vm.invalidMessage = undefined;

        /**
         * @ngdoc method
         * @propertyOf admin-facility-view.controller:FacilityViewController
         * @name $onInit
         *
         * @description
         * Method that is executed on initiating FacilityListController.
         */
        function onInit() {
            vm.originalFacilityName = facility.name;
            vm.facility = angular.copy(facility);
            vm.enableValue = angular.copy(
                facility.enableLocationManagement
            );
            vm.isAndroid = angular.copy(
                facility.isAndroidDevice
            );
            vm.hasLocation = angular.copy(
                facility.hasSuccessUploadLocations
            );
            vm.configured = facility.hasSuccessUploadLocations
                ? messageService.get(
                    'adminFacilityView.alreadyConfigured'
                ) : messageService.get(
                    'adminFacilityView.notConfigured'
                );
            vm.isNewFacility = angular.copy(facility.isNewFacility);
            vm.facilityId = angular.copy(facility.id);
            vm.facilityWithPrograms = angular.copy(facility);
            vm.facilityTypes = facilityTypes;
            vm.geographicZones = geographicZones;
            vm.facilityOperators = facilityOperators;
            vm.programs = programs;
            vm.selectedTab = 0;
            vm.managedExternally = facility.isManagedExternally();
            if (!vm.facilityWithPrograms.supportedPrograms) {
                vm.facilityWithPrograms.supportedPrograms = [];
            }
            var programsCopy = angular.copy(vm.programs);
            vm.reportMap = {
                TR: 'MMIT',
                T: 'MMIA',
                TB: 'MMTB',
                VC: 'Balance Requisition',
                ML: 'AL'
            };
            var programsWithReportName = _.map(programsCopy,
                function(item) {
                    return angular.merge({
                        reportName: vm.reportMap[item.code]
                    }, item);
                });
            var programCodeByReports = _.map(
                vm.facilityWithPrograms.reportTypes,
                function(item) {
                    return item.programCode;
                }
            );
            vm.reports = programsWithReportName.filter(function(item) {
                return !_.contains(programCodeByReports, item.code);
            });

            vm.facilityWithPrograms.supportedPrograms.filter(
                function(supportedProgram) {
                    vm.programs = vm.programs.filter(function(program) {
                        return supportedProgram.id !== program.id;
                    });
                }
            );

        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name goToFacilityList
         *
         * @description
         * Redirects to facility list screen.
         */
        function goToFacilityList() {
            $state.go('openlmis.administration.facilities', {}, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name saveFacilityDetails
         *
         * @description
         * Saves facility details and redirects to facility list screen.
         */
        function saveFacilityDetails() {
            doSave(vm.facility,
                'adminFacilityView.saveFacility.success',
                'adminFacilityView.saveFacility.fail');
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name saveFacilityWithPrograms
         *
         * @description
         * Saves facility with supported programs and redirects to facility list screen.
         */
        function saveFacilityWithPrograms() {
            doSave(vm.facilityWithPrograms,
                'adminFacilityView.saveFacility.success',
                'adminFacilityView.saveFacility.fail');
        }

        vm.saveFacilityWithReports = function() {
            doSave(vm.facilityWithPrograms,
                'adminFacilityView.saveFacility.success',
                'adminFacilityView.saveFacility.fail');
        };

        vm.selectFileChange = function() {
            vm.invalidMessage = null;
        };

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name addProgram
         *
         * @description
         * Adds program to associated program list.
         */
        function addProgram() {
            var supportedProgram = angular.copy(vm.selectedProgram);

            vm.programs = vm.programs.filter(function(program) {
                return supportedProgram.id !== program.id;
            });

            supportedProgram.supportStartDate = vm.selectedStartDate;
            supportedProgram.supportActive = true;

            vm.selectedStartDate = null;
            vm.selectedProgram = null;

            vm.facilityWithPrograms.supportedPrograms.push(
                supportedProgram
            );

            return $q.when();
        }

        vm.addReport = function() {
            vm.facilityWithPrograms.reportTypes.push(angular.merge({
                startDate: vm.selectedStartDate,
                programCode: vm.selectedReport.code,
                name: 'Requisition',
                facilityId: vm.facility.id
            }, vm.selectedReport));
            vm.reports = _.filter(vm.reports, function(itm) {
                return itm.code !== vm.selectedReport.code;
            });
            vm.selectedReport = null;
            vm.selectedStartDate = null;
            return $q.when();
        };

        function doSave(facility, successMessage, errorMessage) {
            loadingModalService.open();
            return new facilityService.update(facility)
                .then(function(res) {
                    notificationService.success(successMessage);
                    goToFacilityList();
                    return $q.resolve(res);
                })
                .catch(function() {
                    notificationService.error(errorMessage);
                    loadingModalService.close();
                    return $q.reject();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name getExportUrl
         *
         * @description
         * Returns url for downloading csv file with all ideal stock amounts.
         *
         * @return {String} url for downloading csv.
         */
        function exportFile(facilityId) {
            facilityId = vm.facilityId;
            return locationManagementService.getDownloadUrl(facilityId);
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name upload
         *
         * @description
         * Uploads csv file with catalog item to the server.
         */
        function upload(facilityId) {
            facilityId = vm.facilityId;
            vm.invalidMessage = undefined;

            if (vm.file) {
                var loadingPromise = loadingModalService.open();
                locationManagementService.upload(vm.file, facilityId)
                    .then(function(data) {
                        var message = messageService.get(
                            'adminFacilityView.uploadSuccess',
                            {
                                amount: data.amount
                            }
                        );
                        loadingPromise.then(function() {
                            notificationService.success(message);
                        });
                        loadingModalService.close();
                        new FacilityRepository().get($stateParams.id)
                            .then(function(res) {
                                vm.facility = res;
                                vm.configured = messageService.get(
                                    'adminFacilityView.alreadyConfigured'
                                );
                            });
                    })
                    .catch(handleError);
                loadingModalService.close();
            } else {
                notificationService.error(
                    'adminIsaManage.fileIsNotSelected'
                );
            }
        }

        function handleError(error) {
            var businessErrorExtraData = error.data.businessErrorExtraData;
            var numberSplit = businessErrorExtraData.split('');
            var lastNumber = numberSplit.slice(-1);
            var firstEle = businessErrorExtraData[0];
            notificationService.error(
                'adminFacilityView.uploadFailed'
            );
            vm.file = null;
            var messageKey = error.data.messageKey;
            var messageKeyMap = {
                'siglusapi.error.upload.header.missing': {
                    message: 'adminFacilityView.siglusapi.error.upload.header.missing',
                    firstEle: null,
                    lastNumber: true
                },
                'siglusapi.error.upload.header.invalid': {
                    message: 'adminFacilityView.siglusapi.error.upload.header.invalid',
                    firstEle: null,
                    lastNumber: null
                },
                'siglusapi.error.upload.file.format.incorrect': {
                    message: 'adminFacilityView.siglusapi.error.upload.file.format.incorrect',
                    firstEle: null,
                    lastNumber: null
                },
                'siglusapi.error.upload.file.empty': {
                    message: 'adminFacilityView.siglusapi.error.upload.file.empty',

                    firstEle: null,
                    lastNumber: null
                },
                'siglusapi.error.upload.row.missing': {
                    message: 'adminFacilityView.siglusapi.error.upload.row.missing',
                    firstEle: null,
                    lastNumber: null
                },
                'siglusapi.error.upload.duplicate.locationCode': {
                    message: 'adminFacilityView.siglusapi.error.upload.duplicate.locationCode',
                    firstEle: true,
                    lastNumber: true
                }
            };
            vm.invalidMessage = messageService.get(
                messageKeyMap[messageKey]['message'],
                {
                    lastNumber: messageKeyMap[messageKey].lastNumber
                        ? lastNumber : '',
                    firstEle: messageKeyMap[messageKey].firstEle ? firstEle
                        : ''
                }
            );
            loadingModalService.close();
            document.getElementById('fileupload').value = '';
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-view.controller:FacilityViewController
         * @name enableLocationManagement
         *
         * @description
         * Uploads csv file with catalog item to the server.
         */

        function updateEnableLocationManagement() {
            var facility = vm.facility;
            if (facility.isAndroidDevice) {
                return;
            }
            var enableValue = vm.enableValue;
            if (enableValue) {
                siglusFacilityViewRadioConfirmModalService.error(
                    'adminFacilityView.locationManagement.closeSwitch',
                    '',
                    ['adminFacilityView.close',
                        'adminFacilityView.confirm']
                ).then(function() {
                    facility.enableLocationManagement = !vm.enableValue;
                    new locationManagementService
                        .update(vm.facility.id, facility, 'locationManagement')
                        .then(function() {
                            vm.enableValue = !vm.enableValue;
                            notificationService.success(
                                'adminFacilityView.disabledLocation'
                            );
                        });
                });
                return;
            }
            if (!enableValue && !facility.hasSuccessUploadLocations) {
                alertConfirmModalService.error(
                    'adminFacilityView.locationManagement.closeSwitchWithoutConfigure',
                    '',
                    ['adminFacilityView.close',
                        'adminFacilityView.confirm']
                );
                return;
            }
            if (!enableValue && facility.hasSuccessUploadLocations) {
                facility.enableLocationManagement = !vm.enableValue;
                new locationManagementService
                    .update(vm.facility.id + 1, facility, 'locationManagement')
                    .then(function() {
                        vm.enableValue = !vm.enableValue;
                        notificationService.success(
                            'adminFacilityView.enableLocation'
                        );
                    })
                    .catch(function(error) {
                        if (error.status === 500) {
                            siglusFacilityViewRadioConfirmModalService.error(
                                'adminFacilityView.uploadFailed',
                                '',
                                ['adminFacilityView.close',
                                    'adminFacilityView.confirm']
                            );
                        }
                    });
                return;
            }
            facility.enableLocationManagement = !vm.enableValue;
            new locationManagementService
                .update(vm.facility.id, facility, 'locationManagement')
                .then(function() {
                    vm.enableValue = !vm.enableValue;
                    notificationService.success(
                        'adminFacilityView.enableLocation'
                    );
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-facility-add.controller:FacilityAddController
         * @name upgradeToWeb
         *
         * @description
         * upgrade android device to web
         */
        function upgradeToWeb() {
            siglusFacilityViewRadioConfirmModalService.error(
                'adminFacilityView.locationManagement.upgradeWebUser',
                '',
                ['adminFacilityView.close',
                    'adminFacilityView.confirm']
            ).then(function() {
                loadingModalService.open();
                facilityService.upgradeToWeb(vm.facilityId).then(function() {
                    new FacilityRepository().get($stateParams.id)
                        .then(function(res) {
                            loadingModalService.close();
                            vm.facility = res;
                            notificationService.success(
                                'adminFacilityView.upgradSuccess'
                            );
                        });
                })
                    .catch(function() {
                        loadingModalService.close();
                        notificationService.success(
                            'adminFacilityView.upgradFailed'
                        );
                    });
            });
        }

    }
}
)();
