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
                        rm -rf node_modules build .tmp yarn.lock
                    '''
                }
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube_token', variable: 'SONARQUBE_TOKEN')]) {
                    sh '/ebs2/sonar/sonar-scanner-4.3.0.2102-linux/bin/sonar-scanner -Dsonar.projectKey=siglus-ui -Dsonar.sources=. -Dsonar.host.url=http://13.234.176.65:9000 -Dsonar.login=$SONARQUBE_TOKEN'
                }
            }
        }
        stage('Push image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "cad2f741-7b1e-4ddd-b5ca-2959d40f62c2", usernameVariable: "USER", passwordVariable: "PASS")]) {
                    sh '''
                        set +x
                        docker login -u $USER -p $PASS
                        IMAGE_TAG=$(git rev-parse HEAD)
                        docker tag siglusdevops/siglus-ui:latest siglusdevops/siglus-ui:${IMAGE_TAG}
                        docker push siglusdevops/siglus-ui:${IMAGE_TAG}
                        docker push siglusdevops/siglus-ui:latest
                        docker rmi siglusdevops/siglus-ui:${IMAGE_TAG} siglusdevops/siglus-ui:latest
                    '''
                }
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
                branch 'release-*'
            }
            steps {
                build job: '../siglus-reference-ui/release-*', wait: false
            }
        }
    }
}
