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
# Note: Spring will map these to properties
ENV SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/cafe-backend \
    APP_JWTSECRET=changemechangemechangemechangemechangeme \
    APP_JWTEXPIRATIONMS=86400000

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
