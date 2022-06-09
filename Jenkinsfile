pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    environment {
      PATH = "/usr/local/bin/:$PATH"
      COMPOSE_PROJECT_NAME = "${env.JOB_NAME}-${BRANCH_NAME}"
      IMAGE_REPO = "siglusdevops/siglus-ui"
      IMAGE_TAG = "${BRANCH_NAME}-${GIT_COMMIT}"
      IMAGE_NAME = "${IMAGE_REPO}:${IMAGE_TAG}"
    }
    stages {
        stage('Build') {
            steps {
                println "gradle: build"
                withCredentials([file(credentialsId: 'settings.dev.env', variable: 'ENV_FILE')]) {
                    sh '''
                        sudo rm -rf .env node_modules build .tmp lcov.info
                        cp $ENV_FILE .env
                        docker-compose pull
                        docker-compose down --volumes
                        docker-compose run --entrypoint /dev-ui/build.sh siglus-ui
                        docker-compose down --volumes
                        docker build -t ${IMAGE_NAME} .
                        if [ "$GIT_BRANCH" = "release" ]; then
                          echo "set latest tag for release image"
                          docker build -t ${IMAGE_REPO}:latest .
                        fi
                    '''
                }
                println "test converage: check"
                sh '''
                    coverage_threshold=82
                    coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -1`;
                    coverage_int=`awk -v var="$coverage" 'BEGIN {print int(var)}'`
                    echo "Current test coverage: $coverage%.";
                    if [ $coverage_int -lt $coverage_threshold ];
                    then
                        echo "Error: current test coverage is less than $coverage_threshold%, please add unit tests before push code to ensure test coverage reaches $coverage_threshold%.";
                        exit 1
                    else
                      echo "Congratulations! Test coverage is more than $coverage_threshold%."
                    fi;
                '''
                println "sonarqube: analysis"
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONARQUBE_TOKEN')]) {
                    sh '''
                        if [ "$GIT_BRANCH" = "master" ]; then
                            cp -r .tmp/javascript/src/ .
                            sed 's|SF:/app/.tmp/javascript/|SF:|g' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov.info > lcov.info
                            /home/ec2-user/sonar/sonar-scanner-4.6.0.2311-linux/bin/sonar-scanner -Dsonar.projectKey=siglus-ui \
                            -Dsonar.sources=src -Dsonar.tests=src \
                            -Dsonar.inclusions=src/siglus-**/*.js,src/**/siglus-*.js \
                            -Dsonar.test.inclusions=src/siglus-**/*.spec.js,src/**/siglus-*.spec.js \
                            -Dsonar.host.url=http://localhost:9000 -Dsonar.login=$SONARQUBE_TOKEN -Dsonar.javascript.lcov.reportPaths=lcov.info
                        fi
                    '''
                }
                println "docker: push image"
                withCredentials([usernamePassword(credentialsId: "docker-hub", usernameVariable: "USER", passwordVariable: "PASS")]) {
                    sh '''
                        set +x
                        docker login -u $USER -p $PASS
                        docker push ${IMAGE_NAME}
                        if [ "$GIT_BRANCH" = "release" ]; then
                          echo "push latest tag for release image"
                          docker push ${IMAGE_REPO}:latest
                        fi
                    '''
                }
            }
        }
        stage('Notify to build reference-ui master') {
            when {
                branch 'master'
            }
            steps {
                sh 'echo IMAGE_TAG: ${IMAGE_TAG}'
                build job: '../siglus-reference-ui/master', wait: false, parameters: [[$class: 'StringParameterValue', name: 'SIGLUS_UI_IMAGE_TAG', value: "${env.IMAGE_TAG}"]]
            }
        }
        stage('Notify to build reference-ui release') {
            when {
                branch 'release'
            }
            steps {
                sh 'echo IMAGE_TAG: ${IMAGE_TAG}'
                build job: '../siglus-reference-ui/release', wait: false, parameters: [[$class: 'StringParameterValue', name: 'SIGLUS_UI_IMAGE_TAG', value: "${env.IMAGE_TAG}"]]
            }
        }
    }
}
