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
ENV SPRING_DATA_MONGODB_URI=mongodb+srv://huuduongle2002:Duongmb8602@cluster0.andq2.mongodb.net/cafe-backend \
    APP_JWTSECRET=9u8f7e6d5c4b3a29z1y0xwvuTSrQpLmNqR2t4y6u8i0oPqRs \
    APP_JWTEXPIRATIONMS=86400000

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

