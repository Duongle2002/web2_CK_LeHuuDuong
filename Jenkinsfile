pipeline {
  agent any

  parameters {
    string(name: 'REPO', defaultValue: 'duongle2002', description: 'Docker Hub namespace (lowercase username or org)')
    string(name: 'DOCKERHUB_CRED_ID', defaultValue: 'dockerhub', description: 'Jenkins Credentials ID (Username with password) for Docker Hub login')
  }

  environment {
    REGISTRY = 'docker.io'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Init') {
      steps {
        script {
          // Ensure lowercase for Docker Hub repo path
          env.REPO_LC = params.REPO.trim().toLowerCase()
          env.IMAGE_BACKEND = "${env.REPO_LC}/cafe-backend"
          env.IMAGE_FRONTEND = "${env.REPO_LC}/cafe-frontend"
        }
      }
    }

    stage('Build backend image') {
      steps {
        sh 'docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER} -f cafe-backend/Dockerfile cafe-backend'
      }
    }

    stage('Build frontend image') {
      steps {
        sh 'docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} -f cafe-frontend/Dockerfile cafe-frontend'
      }
    }

    stage('Login & Push') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: params.DOCKERHUB_CRED_ID, passwordVariable: 'DH_PSW', usernameVariable: 'DH_USR')]) {
            sh 'echo ${DH_PSW} | docker login -u ${DH_USR} --password-stdin ${REGISTRY}'
          }
        }
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
