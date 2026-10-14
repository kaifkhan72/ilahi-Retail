# =======================================================
# Stage 1: Build JAR using Maven and OpenJDK 17
# =======================================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package
COPY src ./src
RUN mvn clean package -DskipTests

# =======================================================
# Stage 2: Minimal Alpine JRE 17 Runtime
# =======================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create directory for image uploads
RUN mkdir -p /app/uploads

# Copy built JAR from builder
COPY --from=build /app/target/*.jar app.jar

# Render dynamically sets $PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Container-friendly memory parameters suited for Render's 512MB free tier
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
