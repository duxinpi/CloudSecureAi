package com.cloudsecure.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.mail.*;
import javax.mail.internet.*;
import java.util.Properties;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

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
        logger.info("Attempting to send support email from {} to {}", fromEmail, toEmail);
        
        // Check if password is configured
        if (password == null || password.trim().isEmpty()) {
            String errorMsg = "Email password is not configured. Please set the EMAIL_PASSWORD environment variable.";
            logger.error(errorMsg);
            throw new Exception(errorMsg);
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.ssl.trust", smtpHost);
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.debug", "true"); // Enable debug mode

        logger.debug("SMTP Configuration - Host: {}, Port: {}, Username: {}", smtpHost, smtpPort, username);

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

            logger.info("Sending email...");
            Transport.send(mimeMessage);
            logger.info("Email sent successfully to: {}", toEmail);

        } catch (MessagingException e) {
            logger.error("Error sending email: {}", e.getMessage(), e);
            throw new Exception("Failed to send email: " + e.getMessage());
        }
    }
}

