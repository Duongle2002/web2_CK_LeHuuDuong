pipeline {
  agent any

  options {
    timestamps()
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
        sh '''
          set -e
          docker --version || true
          if docker compose version >/dev/null 2>&1; then
            docker compose version
          elif docker-compose version >/dev/null 2>&1; then
            docker-compose version
          else
            echo "Docker Compose not found (v2 or v1). Please install 'docker compose' or 'docker-compose'." >&2
            exit 1
          fi
        '''
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
            # pick compose command (v2 preferred)
            COMPOSE="docker compose"
            if ! docker compose version >/dev/null 2>&1; then
              if docker-compose version >/dev/null 2>&1; then
                COMPOSE="docker-compose"
              else
                echo "Docker Compose not found (v2 or v1)." >&2; exit 1
              fi
            fi

            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

            export TAG="${TAG}"
            export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"

            echo "Building images with TAG=$TAG for user=$DOCKERHUB_USERNAME"
            $COMPOSE build backend frontend

            echo "Pushing images"
            $COMPOSE push backend frontend
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
            # pick compose command (v2 preferred)
            COMPOSE="docker compose"
            if ! docker compose version >/dev/null 2>&1; then
              if docker-compose version >/dev/null 2>&1; then
                COMPOSE="docker-compose"
              else
                echo "Docker Compose not found (v2 or v1)." >&2; exit 1
              fi
            fi

            # Ensure env available for compose interpolation
            export TAG="${TAG}"
            export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"

            # Pull and run published images on this host
            $COMPOSE -f docker-compose.release.yml pull
            $COMPOSE -f docker-compose.release.yml up -d
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
