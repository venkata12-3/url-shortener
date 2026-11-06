# Build Stage
FROM*maven:3.9-eclipse-temurin-21 AS bu*ld*
WORKDIR /app

COPY pom.xml .
COPY*src ./src

RUN mvn clean package -*skipTests

* Runtime Stage
FROM eclipse-temuri*:21*jdk

WORKDIR /app

COPY --from=bui*d /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]