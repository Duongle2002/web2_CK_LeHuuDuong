pipeline {
  agent any

  options {
    timestamps()
    ansiColor('xterm')
  }

  parameters {
    string(name: 'TAG', defaultValue: '', description: 'Docker image tag (leave empty to use build number)')
    booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Pull and run containers on this Jenkins agent after push')
  }

  environment {
    // These will be set in the Prepare stage and via credentials
    TAG = ''
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          if (!params.TAG?.trim()) {
            env.TAG = "build-${env.BUILD_NUMBER}"
          } else {
            env.TAG = params.TAG
          }
          echo "Using TAG=${env.TAG}"
        }
        sh 'docker --version && docker compose version || true'
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker Login + Build + Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
          sh '''
            set -e
            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

            export TAG="${TAG}"
            export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"

            echo "Building images with TAG=$TAG for user=$DOCKERHUB_USERNAME"
            docker compose build backend frontend

            echo "Pushing images"
            docker compose push backend frontend
          '''
        }
      }
    }

    stage('Deploy (compose release)') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
          sh '''
            set -e
            # Ensure env available for compose interpolation
            export TAG="${TAG}"
            export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"

            # Pull and run published images on this host
            docker compose -f docker-compose.release.yml pull
            docker compose -f docker-compose.release.yml up -d
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
