pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '50'))
    }
    environment {
      PATH = "/usr/local/bin/:$PATH"
      COMPOSE_PROJECT_NAME = "${env.JOB_NAME}-${BRANCH_NAME}"
    }
    stages {
        stage('Build') {
            steps {
                withCredentials([file(credentialsId: 'setting_env', variable: 'ENV_FILE')]) {
                    sh '''
                        rm -f .env
                        cp $ENV_FILE .env
                        if [ "$GIT_BRANCH" != "master" ]; then
                            sed -i '' -e "s#^TRANSIFEX_PUSH=.*#TRANSIFEX_PUSH=false#" .env  2>/dev/null || true
                        fi
                        docker-compose pull
                        docker-compose down --volumes
                        docker-compose run --entrypoint /dev-ui/build.sh siglus-ui
                        docker-compose build image
                        docker-compose down --volumes
                    '''
                }
            }
        }
        stage('Check Test Coverage') {
            steps {
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
            }
        }
        stage('SonarQube Analysis') {
            when {
                branch 'dev'
            }
            steps {
                withCredentials([string(credentialsId: 'sonarqube_token', variable: 'SONARQUBE_TOKEN')]) {
                    sh '''
                        cp -r .tmp/javascript/src/ .
                        sed 's|SF:/app/.tmp/javascript/|SF:|g' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov.info > lcov.info
                        /ebs2/sonar/sonar-scanner-4.3.0.2102-linux/bin/sonar-scanner -Dsonar.projectKey=siglus-ui -Dsonar.sources=. -Dsonar.host.url=http://13.234.176.65:9000 -Dsonar.login=$SONARQUBE_TOKEN -Dsonar.javascript.lcov.reportPaths=lcov.info
                        rm -rf node_modules build .tmp yarn.lock lcov.info
                    '''
                }
            }
        }
        stage('Push image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "cad2f741-7b1e-4ddd-b5ca-2959d40f62c2", usernameVariable: "USER", passwordVariable: "PASS")]) {
                    sh '''
                        set +x
                        docker login -u $USER -p $PASS
                        IMAGE_TAG=${BRANCH_NAME}-$(git rev-parse HEAD)
                        docker tag siglusdevops/siglus-ui:latest siglusdevops/siglus-ui:${IMAGE_TAG}
                        docker push siglusdevops/siglus-ui:${IMAGE_TAG}
                        docker push siglusdevops/siglus-ui:latest
                        docker rmi siglusdevops/siglus-ui:${IMAGE_TAG} siglusdevops/siglus-ui:latest
                    '''
                }
            }
        }
        stage('Notify to build reference-ui dev') {
                    when {
                        branch 'dev'
                    }
                    steps {
                        build job: '../siglus-reference-ui/dev', wait: false
                    }
                }
        stage('Notify to build reference-ui master') {
            when {
                branch 'master'
            }
            steps {
                build job: '../siglus-reference-ui/master', wait: false
            }
        }
        stage('Notify to build reference-ui release') {
            when {
                branch 'release-1.2'
            }
            steps {
                build job: '../siglus-reference-ui/release-1.2', wait: false
            }
        }
    }
}
