## Prerequisites
* Docker 1.11+
* Docker Compose 1.6+

## Quick Start
1. Develop in docker container `docker-compose run --service-ports siglus-ui`.
2. You should now be in an interactive shell inside the newly created development environment, build the project with: `npm install` and then run `grunt`.
3. Run `grunt build --openlmisServerURL=https://qa.siglus.us --noTest --noStyleguide --noDocs --serve` to start
4. Go to `http://localhost:9000/webapp/` to see the login page.

*Note:* To change the location of where the OpenLMIS-UI attemps to access OpenLMIS, use the command `grunt build --openlmisServerUrl=<openlmis server url> --serve`.

## Guide
See the [UI Extension Guide](http://docs.openlmis.org/en/latest/components/uiExtensionGuide.html) for more information.
See the [OpenLMIS Malawi](https://github.com/OpenLMIS-Malawi) for more example.
File naming and comment format:
1. Override file. Use the same name and path with original file when replacing the original file.
2. Css extension file. Add a new css file named [original name]-diff.scss with the same path of original file when modifying css.
3. Js extension file. Add a new file named [original name]-decorator.js with the same path of original file when using Angular decorator to modify js file.
4. Comment format.
```
// Html comment format
<!-- SIGLUS-REFACTOR/JIRA number: some comments/starts here -->
<!-- SIGLUS-REFACTOR/JIRA number: ends here -->

// Js comment format
// SIGLUS-REFACTOR/JIRA number: some comments/starts here
// SIGLUS-REFACTOR/JIRA number: ends here

```

## Building & Testing
See the [OpenLMIS/dev-ui project](https://github.com/OpenLMIS/dev-ui) for more information on what commands are available, below are the command you might use during a normal work day.

```shell
// Open docker in an interactive shell
> docker-compose run --service-ports siglus-ui

// Install dependencies 
$ npm install

// Run grunt
$ grunt

// Build and run the UI against a OpenLMIS server
$ grunt build --openlmisServerUrl=<openlmis server url> --serve

// Run unit tests
$ grunt karma:unit

// Run unit tests not in docker
// NOTE: make sure you have build your latest code, because siglus-ui have many other project dependency,
// so we have to load all the source code in .tmp folder. Use karma.config.js for unit test config in webstorm.
// So that you can run a any test you want.

// Run a watch process that will build and test your code
// NOTE: You must change a file at least once before your code is rebuilt
$ grunt watch --openlmisServerUrl=<openlmis server url> --serve

// Check test coverage
$ sh check-test-coverage.sh

```

### Built Artifacts
After the OpenLMIS-UI is built and being served, you can access the following documents:
- `http://localhost:9000/webapp/` The compiled OpenLMIS application
- `http://localhost:9000/docs/` JS Documentation created from the source code
- `http://localhost:9000/styleguide/` KSS Documentation created from the CSS


### Build Deployment Image
The specialized docker-compose.builder.yml is geared toward CI and build
servers for automated building, testing and docker image generation of
the UI module.

```shell
> docker-compose pull
> docker-compose run ./build.sh siglus-ui
> docker-compose build image
```

### Internationalization (i18n)
Transifex has been integrated into the development and build process. In order to sync with the project's resources in Transifex, you must provide values for the following keys: TRANSIFEX_USER, TRANSIFEX_PASSWORD.

For the development environment in Docker, you can sync with Transifex by running the sync_transifex.sh script. This will upload your source messages file to the Transifex project and download translated messages files.

The build process has syncing with Transifex seamlessly built-in.


### Config Talisman

Talisman is a tool that installs a hook to your repository to ensure that potential secrets or sensitive information do not leave the developer's workstation.
It validates the outgoing changeset for things that look suspicious - such as potential SSH keys, authorization tokens, private keys etc.

```
# download the talisman binary
curl https://thoughtworks.github.io/talisman/install.sh > ~/install-talisman.sh
chmod +x ~/install-talisman.sh
# go to project
cd siglus-ui
# delete pre-push if existed
rm .git/hooks/pre-push
# install new pre-push hook
~/install-talisman.sh
```
