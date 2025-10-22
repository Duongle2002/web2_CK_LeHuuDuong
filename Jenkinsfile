pipeline {
  agent any

  options {
    timestamps()
  }

  parameters {
    string(name: 'TAG', defaultValue: '', description: 'Docker image tag (leave empty to use build number)')
    booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Pull and run containers on this Jenkins agent after push')
    booleanParam(name: 'PUSH', defaultValue: false, description: 'If true, push images to Docker Hub and deploy from registry; if false, build and run locally.')
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

    stage('Build (and push if requested)') {
      steps {
        script {
          def shell = '''
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
          '''

          if (params.PUSH) {
            withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
              sh """
                ${shell}
                echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

                export TAG="${TAG}"
                export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"

                echo "Building images with TAG=$TAG for user=$DOCKERHUB_USERNAME"
                $COMPOSE build backend frontend

                echo "Pushing images"
                $COMPOSE push backend frontend
              """
            }
          } else {
            // Local build without registry (no image tags)
            sh """
              ${shell}
              echo "Local build using docker-compose.local.yml (no push)"
              $COMPOSE -f docker-compose.local.yml build backend frontend
            """
          }
        }
      }
    }

    stage('Deploy') {
      when {
        expression { return params.DEPLOY }
      }
      steps {
        script {
          def shell = '''
            set -e
            COMPOSE="docker compose"
            if ! docker compose version >/dev/null 2>&1; then
              if docker-compose version >/dev/null 2>&1; then
                COMPOSE="docker-compose"
              else
                echo "Docker Compose not found (v2 or v1)." >&2; exit 1
              fi
            fi
          '''

          if (params.PUSH) {
            withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
              sh """
                ${shell}
                export TAG="${TAG}"
                export DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME"
                $COMPOSE -f docker-compose.release.yml pull
                $COMPOSE -f docker-compose.release.yml up -d
              """
            }
          } else {
            // Local deploy using locally built images
            sh """
              ${shell}
              $COMPOSE -f docker-compose.local.yml up -d
            """
          }
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
