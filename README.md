## Docker & CI/CD

This repository contains both services:

- `cafe-backend` (Spring Boot + MongoDB)
- `cafe-frontend` (React + Vite served by Nginx)

### Run locally with Docker Compose

Requirements: Docker Desktop.

```bash
docker compose up --build
```

Services:
- MongoDB: localhost:27017
- Backend: http://localhost:8080
- Frontend: http://localhost:5173

Environment variables can be overridden in `docker-compose.yml`.

### GitHub Actions (GHCR)

Workflow `.github/workflows/docker.yml` builds and pushes images to GHCR on push to `main`:

- ghcr.io/<owner>/<repo>/cafe-backend:latest, <sha>
- ghcr.io/<owner>/<repo>/cafe-frontend:latest, <sha>

No extra secrets required; it uses the built-in `GITHUB_TOKEN` with `packages: write` permission.

### Jenkins pipeline (Docker Hub)

`Jenkinsfile` builds and pushes to Docker Hub. Configure:

- Jenkins credential ID `dockerhub` (username/password)
- Update the `REPO` env to your Docker Hub username or org

Run the pipeline; it will tag with the Jenkins `${BUILD_NUMBER}` and `latest`.

### Notes

- Frontend Nginx proxies `/api/` to the backend service name `backend` in Docker Compose.
- Backend expects MongoDB at `SPRING_DATA_MONGODB_URI` (defaults to `mongodb://mongo:27017/cafe`).
- For production, set a strong `APP_JWTSECRET` and consider externalizing configuration via secrets.
# Cafe App (Spring Boot + React)

This repo contains:
- cafe-backend: Spring Boot 3 + MongoDB + JWT
- cafe-frontend: React + Vite, built and served via Nginx (with /api proxy to backend)
- docker-compose.yml: One command to run the whole stack

## Quick start with Docker

Requirements:
- Docker Desktop installed and running

Steps:
1. (Optional) Create a .env file at repo root to override defaults. See .env.example.
2. Build images and start containers:
   - docker compose build --no-cache
   - docker compose up -d
3. Open the app:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - MongoDB: localhost:27017

Stop everything:
- docker compose down

## Publish images to Docker Hub

1. Set your Docker Hub username and desired tag in `.env` (see `.env.example`):
   - DOCKERHUB_USERNAME=yourname
   - TAG=latest
2. Login to Docker Hub:
   - docker login
3. Build and push:
   - pwsh ./scripts/push.ps1 -Tag latest
   or
   - docker compose build backend frontend
   - docker compose push backend frontend

This will publish:
- <yourname>/cafe-backend:<tag>
- <yourname>/cafe-frontend:<tag>

## Run on another machine (pull only)

On the target machine:
1. Create `.env` with the same DOCKERHUB_USERNAME and TAG, and any backend env overrides (Mongo URI, JWT).
2. Pull and run with the release compose (no build contexts needed):
   - docker compose -f docker-compose.release.yml pull
   - docker compose -f docker-compose.release.yml up -d

   ## Jenkins (CentOS) pipeline

   We include a `Jenkinsfile` that:
   - Builds backend and frontend Docker images via compose
   - Pushes to Docker Hub using Jenkins credentials
   - Optionally deploys using `docker-compose.release.yml` on the Jenkins agent

   Prerequisites on the Jenkins (CentOS) node:
   - Docker Engine + Docker Compose v2 (`docker compose`)
   - Jenkins agent user is in the `docker` group or can run `docker` with sudo (adjust pipeline if sudo is required)

   Jenkins setup:
   1. Create Credentials of type “Username with password” with ID: `dockerhub`
      - Username: your Docker Hub username
      - Password: your Docker Hub password or PAT
   2. Create a Multibranch Pipeline or Pipeline job pointing to this repo.
   3. Parameters:
      - TAG (string): leave blank to auto-use `build-${BUILD_NUMBER}`
      - DEPLOY (boolean): if true, the job will pull and run the images on the agent using `docker-compose.release.yml`.

   Notes:
   - The compose files interpolate `DOCKERHUB_USERNAME` and `TAG` from environment; the pipeline exports them before running compose.
   - To pass app secrets (e.g., Mongo URI, JWT secret), set them in a `.env` file present on the agent workspace or export them in Jenkins node env, as `docker-compose.release.yml` will read from environment.

## Configuration (.env)
You can override these:

- SPRING_DATA_MONGODB_URI: mongodb connection string (default: mongodb://mongo:27017/cafe-backend)
- APP_JWTSECRET: JWT signing secret
- APP_JWTEXPIRATIONMS: JWT expiration in milliseconds (default: 86400000)

Create a .env file at the repo root to set them. Example is provided in `.env.example`.

## Development (optional)
- Backend: run in IDE or `./mvnw spring-boot:run` in cafe-backend
- Frontend: `npm i` then `npm run dev` in cafe-frontend (Vite dev server on 5173)

## Notes
- Frontend container uses Nginx and proxies /api to backend service name `backend` in compose.
- If you use a remote MongoDB Atlas URI, ensure network access is allowed from your machine/IP.

## CI/CD (Docker + Jenkins) – updated

This repo includes a top-level `Jenkinsfile` and `docker-compose.deploy.yml` to streamline image build/push and optional deployment.

What it does:
- Builds and tags two Docker images (backend and frontend) using the Dockerfiles inside each app
- Pushes both `:latest` and a version tag (`<BUILD_NUMBER>-<git_short_sha>`) to your registry
- Optionally deploys to a remote server over SSH by copying the compose file and a generated `.env`

Requirements:
- Jenkins agent with Docker Engine and Docker Compose v2
- Jenkins Credentials:
   - `DOCKER_REGISTRY_CREDENTIALS` (Username/Password for registry login)
   - `SSH_DEPLOY_KEY` (SSH Username with private key) for remote deploy
   - Optional: `MONGO_URI` (Secret Text) and `JWT_SECRET` (Secret Text) for backend runtime

Pipeline parameters:
- REGISTRY (default `docker.io`)
- REGISTRY_NAMESPACE (your Docker Hub username or GHCR owner)
- BACKEND_IMAGE (`cafe-backend` by default)
- FRONTEND_IMAGE (`cafe-frontend` by default)
- DEPLOY (boolean, default off)
- DEPLOY_HOST (e.g. `ubuntu@1.2.3.4`)
- DEPLOY_PATH (remote directory, default `/opt/cafe-app`)

Deploy compose file:
- `docker-compose.deploy.yml` uses env var substitution: set `BACKEND_IMAGE`, `FRONTEND_IMAGE`, `SPRING_DATA_MONGODB_URI`, `APP_JWTSECRET`, `APP_JWTEXPIRATIONMS` via `.env` or CI
- A template `.env.example` is provided

Manual deploy quickstart:
1) Copy `.env.example` to `.env` and fill real values
2) Run:
```
docker compose --env-file .env -f docker-compose.deploy.yml pull
docker compose --env-file .env -f docker-compose.deploy.yml up -d
```

