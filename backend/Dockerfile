# =======================================================
# Stage 1: Build Spring Boot JAR with Maven
# =======================================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

# Build JAR skipping unit tests for fast cloud compilation
RUN mvn clean package -DskipTests -Dmaven.test.skip=true

# =======================================================
# Stage 2: Minimal Alpine JRE 17 Runtime
# =======================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN mkdir -p /app/uploads
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
