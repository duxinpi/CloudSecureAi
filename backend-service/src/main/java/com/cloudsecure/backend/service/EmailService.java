package com.cloudsecure.backend.service;

import com.cloudsecure.backend.dto.SupportRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;

    public void sendSupportEmail(SupportRequest request) throws MessagingException {
        logger.info("=== Sending Support Email ===");
        logger.info("From: {} ({})", request.getEmail(), request.getFirstName() + " " + request.getLastName());
        logger.info("Phone: {}", request.getPhone());
        logger.info("To: {}", request.getTo());
        logger.info("Message: {}", request.getMessage());
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set email properties
            helper.setFrom(request.getFrom());
            helper.setTo(request.getTo());
            helper.setSubject("CloudSecureAI Support Request from " + request.getFirstName() + " " + request.getLastName());
            
            // Create HTML email body
            String emailBody = buildEmailBody(request);
            helper.setText(emailBody, true); // true = HTML
            
            // Send the email
            mailSender.send(message);
            
            logger.info("Support email sent successfully to {}", request.getTo());
            logger.info("=============================");
            
        } catch (MessagingException e) {
            logger.error("Failed to send support email: {}", e.getMessage());
            throw e;
        }
    }
    
    private String buildEmailBody(SupportRequest request) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #3f51b5; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
                    .field { margin-bottom: 15px; }
                    .label { font-weight: bold; color: #3f51b5; }
                    .value { margin-top: 5px; }
                    .message-box { background-color: white; padding: 15px; border-left: 4px solid #3f51b5; margin-top: 10px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>CloudSecureAI Support Request</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">Name:</div>
                            <div class="value">%s %s</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value"><a href="mailto:%s">%s</a></div>
                        </div>
                        <div class="field">
                            <div class="label">Phone:</div>
                            <div class="value">%s</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="message-box">%s</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>This email was sent from CloudSecureAI Support Form</p>
                        <p>&copy; 2025 CloudSecureAI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getEmail(),
            request.getPhone(),
            request.getMessage().replace("\n", "<br>")
        );
    }
}

