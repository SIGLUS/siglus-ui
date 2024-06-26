// Karma configuration
// Generated on Fri Sep 11 2020 18:48:22 GMT+0800 (China Standard Time)

module.exports = function(config) {
    config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        plugins: [
            'karma-jasmine',
            'karma-coverage',
            'karma-chrome-launcher'
        ],

        // list of files / patterns to load in the browser
        files: [
            '.tmp/javascript/bower_components/jquery/dist/jquery.js',
            '.tmp/javascript/bower_components/angular/angular.js',
            '.tmp/javascript/bower_components/moment/moment.js',
            '.tmp/node_modules/angular-mocks/angular-mocks.js',
            '.tmp/javascript/bower_components/**/*.js',
            '.tmp/javascript/src/**/*.module.js',
            '.tmp/javascript/src/**/*.config.js',
            '.tmp/javascript/src/**/*.routes.js',
            '.tmp/javascript/src/**/*.js',
            '.tmp/javascript/tests/**/*builder.spec.js',
            // 'src/**/*.js',
            'src/**/*.spec.js'
        ],

        // list of files to exclude
        exclude: [
            'app.js'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '.tmp/javascript/src/**/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'lcov',
            dir: 'out/'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
