package com.cloudsecure.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

@Service
public class EmailService {

    @Value("${email.smtp.host:smtp-mail.outlook.com}")
    private String smtpHost;

    @Value("${email.smtp.port:587}")
    private String smtpPort;

    @Value("${email.username:sadhwanijosue35@outlook.com}")
    private String username;

    @Value("${email.password:}")
    private String password;

    @Value("${email.from:sadhwanijosue35@outlook.com}")
    private String fromEmail;

    @Value("${email.to:sadhwanijosue35@outlook.com}")
    private String toEmail;

    public void sendSupportEmail(String firstName, String lastName, String phone, String email, String message) throws Exception {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.ssl.trust", smtpHost);
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message mimeMessage = new MimeMessage(session);
            mimeMessage.setFrom(new InternetAddress(fromEmail));
            mimeMessage.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            mimeMessage.setSubject("CloudSecureAI Support Request from " + firstName + " " + lastName);

            String emailBody = String.format(
                "Support Request Details:\n\n" +
                "Name: %s %s\n" +
                "Email: %s\n" +
                "Phone: %s\n\n" +
                "Message:\n%s",
                firstName, lastName, email, phone, message
            );

            mimeMessage.setText(emailBody);

            Transport.send(mimeMessage);
            System.out.println("Email sent successfully to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Error sending email: " + e.getMessage());
            throw new Exception("Failed to send email: " + e.getMessage());
        }
    }
}

