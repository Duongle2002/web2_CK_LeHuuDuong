# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --prefer-offline --no-audit --progress=false --legacy-peer-deps || npm i --legacy-peer-deps
COPY . .
RUN npm run build

# ---- Runtime stage ----
# Serve static files with Nginx
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/ ./
# Basic nginx config
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root   /usr/share/nginx/html;
  index  index.html;
  location / {
    try_files $uri /index.html;
  }
  # Reverse proxy API calls to Spring Boot in Docker compose
  location /api/ {
    proxy_pass http://backend:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
