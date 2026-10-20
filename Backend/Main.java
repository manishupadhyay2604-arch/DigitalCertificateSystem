
package DigitalCertificateSystem.Backend;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class Main {

    private static CertificateManager manager;

    public static void main(String[] args) throws IOException {

        manager = new CertificateManager("Backend/certificates.csv");

        String portValue = System.getenv("PORT");
        int port = (portValue != null)
                ? Integer.parseInt(portValue)
                : 8080;

        HttpServer server = HttpServer.create(
            new InetSocketAddress("0.0.0.0", port), 0
        );

        server.createContext("/verify", Main::verifyCertificate);

        server.start();

        System.out.println("Certificate Verification Server Started!");
        System.out.println("Server port: " + port);
        System.out.println("Verification endpoint: /verify?id=TCET2026001");
    }

    private static void verifyCertificate(HttpExchange exchange)
            throws IOException {

        exchange.getResponseHeaders().set(
            "Access-Control-Allow-Origin", "*"
        );
        exchange.getResponseHeaders().set(
            "Access-Control-Allow-Methods", "GET, OPTIONS"
        );
        exchange.getResponseHeaders().set(
            "Access-Control-Allow-Headers", "Content-Type"
        );

        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        if (!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            sendResponse(exchange, 405,
                "{\"error\":\"Method not allowed\"}");
            return;
        }

        String query = exchange.getRequestURI().getRawQuery();
        String certificateId = null;

        if (query != null) {
            for (String parameter : query.split("&")) {
                String[] pair = parameter.split("=", 2);

                if (pair.length == 2 && pair[0].equals("id")) {
                    certificateId = URLDecoder.decode(
                        pair[1], StandardCharsets.UTF_8
                    );
                    break;
                }
            }
        }

        if (certificateId == null || certificateId.trim().isEmpty()) {
            sendResponse(exchange, 400,
                "{\"error\":\"Certificate ID is required\"}");
            return;
        }

        Certificate certificate =
            manager.findCertificate(certificateId);

        if (certificate == null) {
            sendResponse(exchange, 404,
                "{\"found\":false,\"message\":\"Certificate Not Found\"}");
            return;
        }

        String response = "{"
            + "\"found\":true,"
            + "\"certificateId\":\"" + escapeJson(certificate.getCertificateId()) + "\","
            + "\"studentName\":\"" + escapeJson(certificate.getStudentName()) + "\","
            + "\"eventName\":\"" + escapeJson(certificate.getEventName()) + "\","
            + "\"issueDate\":\"" + escapeJson(certificate.getIssueDate()) + "\","
            + "\"status\":\"Valid\""
            + "}";

        sendResponse(exchange, 200, response);
    }

    private static String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }

    private static void sendResponse(
            HttpExchange exchange, int statusCode, String response)
            throws IOException {

        exchange.getResponseHeaders().set(
            "Content-Type", "application/json; charset=UTF-8"
        );

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);

        exchange.sendResponseHeaders(statusCode, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
