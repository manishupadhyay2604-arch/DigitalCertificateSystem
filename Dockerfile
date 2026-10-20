
FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY Backend ./Backend

RUN javac -d . Backend/*.java

EXPOSE 8080

CMD ["java", "-cp", ".", "DigitalCertificateSystem.Backend.Main"]
