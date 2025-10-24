pipeline {
  agent any

  environment {
    REGISTRY_CRED = credentials('dockerhub') // configure in Jenkins
    REGISTRY = 'docker.io'
    REPO = 'duongle2002' // TODO: change to your Docker Hub user/org
    IMAGE_BACKEND = "${REPO}/cafe-backend"
    IMAGE_FRONTEND = "${REPO}/cafe-frontend"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build backend image') {
      steps {
        script {
          sh 'docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER} -f cafe-backend/Dockerfile cafe-backend'
        }
      }
    }

    stage('Build frontend image') {
      steps {
        script {
          sh 'docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} -f cafe-frontend/Dockerfile cafe-frontend'
        }
      }
    }

    stage('Login & Push') {
      steps {
        sh 'echo ${REGISTRY_CRED_PSW} | docker login -u ${REGISTRY_CRED_USR} --password-stdin ${REGISTRY}'
        sh 'docker tag ${IMAGE_BACKEND}:${BUILD_NUMBER} ${IMAGE_BACKEND}:latest'
        sh 'docker tag ${IMAGE_FRONTEND}:${BUILD_NUMBER} ${IMAGE_FRONTEND}:latest'
        sh 'docker push ${IMAGE_BACKEND}:${BUILD_NUMBER}'
        sh 'docker push ${IMAGE_BACKEND}:latest'
        sh 'docker push ${IMAGE_FRONTEND}:${BUILD_NUMBER}'
        sh 'docker push ${IMAGE_FRONTEND}:latest'
      }
    }
  }
}
