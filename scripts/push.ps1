param(
  [string]$Tag = $env:TAG
)

if (-not $env:DOCKERHUB_USERNAME) {
  Write-Error "Please set DOCKERHUB_USERNAME in .env or environment"
  exit 1
}

if (-not $Tag) { $Tag = "latest" }

Write-Host "Using Docker Hub: $($env:DOCKERHUB_USERNAME) / tag: $Tag"

$ErrorActionPreference = 'Stop'

# Ensure Docker is logged in
try {
  docker info | Out-Null
} catch {
  Write-Error "Docker Desktop not running?"
  exit 1
}

# Build with tags and push
$env:TAG = $Tag

# Build backend and frontend images
Write-Host "Building images..."
docker compose build backend frontend

Write-Host "Pushing images..."
docker compose push backend frontend

Write-Host "Done. Images pushed:"
Write-Host " - $($env:DOCKERHUB_USERNAME)/cafe-backend:$Tag"
Write-Host " - $($env:DOCKERHUB_USERNAME)/cafe-frontend:$Tag"
