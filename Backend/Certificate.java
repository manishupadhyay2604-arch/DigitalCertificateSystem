package DigitalCertificateSystem.Backend;

public class Certificate {

    private String certificateId;
    private String studentName;
    private String eventName;
    private String issueDate;

    public Certificate(String certificateId, String studentName,
                       String eventName, String issueDate) {

        this.certificateId = certificateId;
        this.studentName = studentName;
        this.eventName = eventName;
        this.issueDate = issueDate;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getEventName() {
        return eventName;
    }

    public String getIssueDate() {
        return issueDate;
    }
}
