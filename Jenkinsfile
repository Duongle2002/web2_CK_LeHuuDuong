pipeline {
  agent any

  parameters {
    string(name: 'REPO', defaultValue: 'duongle2002', description: 'Docker Hub namespace (lowercase username or org)')
    string(name: 'DOCKERHUB_CRED_ID', defaultValue: 'dockerhub', description: 'Jenkins Credentials ID (Username with password) for Docker Hub login')
    booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy on this Jenkins agent (server) after pushing images')
    string(name: 'MONGO_URI_CRED_ID', defaultValue: 'prod-mongodb-uri', description: 'Credentials ID (Secret text) for MongoDB connection string')
    string(name: 'JWT_SECRET_CRED_ID', defaultValue: 'prod-jwt-secret', description: 'Credentials ID (Secret text) for JWT secret key')
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

    stage('Deploy (optional)') {
      when { expression { return params.DEPLOY } }
      steps {
        script {
          // Login again to ensure pulls work (handles private/rate-limited pulls)
          withCredentials([usernamePassword(credentialsId: params.DOCKERHUB_CRED_ID, passwordVariable: 'DH_PSW', usernameVariable: 'DH_USR')]) {
            sh 'echo ${DH_PSW} | docker login -u ${DH_USR} --password-stdin ${REGISTRY}'
          }

          // Bind secrets for environment
          withCredentials([
            string(credentialsId: params.MONGO_URI_CRED_ID, variable: 'MONGODB_URI'),
            string(credentialsId: params.JWT_SECRET_CRED_ID, variable: 'JWT_SECRET')
          ]) {
            // Render .env.production in workspace
            sh '''
cat > .env.production <<EOF
BACKEND_IMAGE=docker.io/${IMAGE_BACKEND}:latest
FRONTEND_IMAGE=docker.io/${IMAGE_FRONTEND}:latest
MONGODB_URI=${MONGODB_URI}
MONGO_PORT=27017
JWT_SECRET=${JWT_SECRET}
JWT_EXP_MS=86400000
HTTP_PORT=8080
FRONTEND_PORT=80
EOF
'''

            // Pull and start services on this agent (server)
            sh 'docker compose -f compose.production.yml --env-file .env.production pull'
            sh 'docker compose -f compose.production.yml --env-file .env.production up -d --remove-orphans'
          }
        }
      }
    }
  }
}
