pipeline {
    agent { label 'docker'}
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
                        rm -rf .env node_modules build .tmp lcov.info
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
                println "test coverage: check"
                sh '''
                    coverage_threshold=52.00

                    statement_coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -1 | sed -n '1, 1p'`;
                    branch_coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -2 | sed -n '2, 1p'`;
                    function_coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -3 | sed -n '3, 1p'`;
                    line_coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -4 | sed -n '4, 1p'`;

                    branch_coverage_int=`awk -v var="$branch_coverage" 'BEGIN {print int(var)}'`

                    echo "Current statement coverage: $statement_coverage%.";
                    echo "Current branch coverage: $branch_coverage%.";
                    echo "Current function coverage: $function_coverage%.";
                    echo "Current line coverage: $line_coverage%.";

                    if [ $branch_coverage_int -lt $coverage_threshold ];
                    then
                        echo "Error: current branch coverage is less than $coverage_threshold%, please add unit tests before push code to ensure branch coverage reaches $coverage_threshold%.";
                        exit 1
                    else
                      echo "Congratulations! Branch coverage is more than $coverage_threshold%."
                    fi;
                '''
                println "docker: push image"
                withCredentials([usernamePassword(credentialsId: "docker-hub", usernameVariable: "USER", passwordVariable: "PASS")]) {
                    sh '''
                        echo $PASS | docker login -u $USER --password-stdin
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
        stage('Notify to build reference-ui showcase') {
            when {
                branch 'showcase'
            }
            steps {
                sh 'echo IMAGE_TAG: ${IMAGE_TAG}'
                build job: '../siglus-reference-ui/showcase', wait: false, parameters: [[$class: 'StringParameterValue', name: 'SIGLUS_UI_IMAGE_TAG', value: "${env.IMAGE_TAG}"]]
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
         stage('Notify to build reference-ui training') {
            when {
                branch 'training'
            }
            steps {
                sh 'echo IMAGE_TAG: ${IMAGE_TAG}'
                build job: '../siglus-reference-ui/training', wait: false, parameters: [[$class: 'StringParameterValue', name: 'SIGLUS_UI_IMAGE_TAG', value: "${env.IMAGE_TAG}"]]
            }
         }
    }
}
