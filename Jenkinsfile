pipeline {
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '50'))
        disableConcurrentBuilds()
    }
    environment {
      PATH = "/usr/local/bin/:$PATH"
      COMPOSE_PROJECT_NAME = "${env.JOB_NAME}-${BRANCH_NAME}"
    }
    stages {
        stage('Build') {
            steps {
                fetch_setting_env()
                sh '''
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
        stage('Notify to build reference-ui') {
            steps {
                build job: '../siglus-reference-ui', wait: false
            }
        }
    }
}

def fetch_setting_env() {
    withCredentials([file(credentialsId: 'setting_env', variable: 'SETTING_ENV')]) {
        sh '''
            rm -f .env
            cp $SETTING_ENV .env
        '''
    }
}

def deploy(app_env) {
    withCredentials([file(credentialsId: "setting_env_${app_env}", variable: 'SETTING_ENV')]) {
        withEnv(["APP_ENV=${app_env}", "CONSUL_HOST=${app_env}.siglus.us.internal:8500", "DOCKER_HOST=tcp://${app_env}.siglus.us.internal:2376"]) {
            sh '''
                IMAGE_TAG=$(git rev-parse HEAD)
                rm -f docker-compose*
                rm -f .env
                rm -f settings.env
                rm -rf siglus-ref-distro
                git clone https://github.com/SIGLUS/siglus-ref-distro
                cd siglus-ref-distro

                cp $SETTING_ENV settings.env
                sed -i "s#<APP_ENV>#${APP_ENV}#g" settings.env
                echo "OL_REFERENCE_UI_VERSION=${IMAGE_TAG}" > .env

                echo "dergregister reference-ui on ${APP_ENV} consul"
                docker -H ${DOCKER_HOST} exec $(docker ps | grep reference-ui | awk '{print $NF}') node consul/registration.js -c deregister -f consul/config.json
                docker -H ${DOCKER_HOST} stop $(docker ps | grep reference-ui | awk '{print $NF}')

                docker-compose -H ${DOCKER_HOST} -f docker-compose-aws-${APP_ENV}.yml -p siglus-ref-distro up --no-deps --force-recreate -d reference-ui
            '''
        }
    }
}
