package DigitalCertificateSystem.Backend;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CertificateManager {

    private List<Certificate> certificates;

    public CertificateManager(String filePath) throws IOException {

        certificates = new ArrayList<>();
        loadCertificates(filePath);
    }

    private void loadCertificates(String filePath) throws IOException {

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {

            String line;

            br.readLine();

            while ((line = br.readLine()) != null) {

                String[] data = line.split(",", -1);

                if (data.length != 4) {
                    continue;
                }

                Certificate certificate = new Certificate(
                    data[0].trim(),
                    data[1].trim(),
                    data[2].trim(),
                    data[3].trim()
                );

                certificates.add(certificate);
            }
        }
    }

    public Certificate findCertificate(String certificateId) {

        for (Certificate certificate : certificates) {

            if (certificate.getCertificateId()
                    .equalsIgnoreCase(certificateId.trim())) {

                return certificate;
            }
        }

        return null;
    }
}
