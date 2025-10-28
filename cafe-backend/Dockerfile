# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first for better caching
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy fat jar from builder stage
COPY --from=build /app/target/*-SNAPSHOT.jar /app/app.jar

# Default envs (override in runtime/compose)
# NOTE: Do NOT hardcode secrets (DB URIs, JWT secrets) in Dockerfile. Provide them at runtime
# via environment (.env.production), Docker secrets, or your orchestration system.
# Example (set in your compose file or CI/CD):
# SPRING_DATA_MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
# APP_JWTSECRET=<your-jwt-secret>
ENV APP_JWTEXPIRATIONMS=86400000

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

