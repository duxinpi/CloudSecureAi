package com.cloudsecure.backend.controller;

import com.cloudsecure.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<?> sendSupportMessage(@RequestBody SupportRequest request) {
        try {
            // Validate required fields
            if (request.getFirstName() == null || request.getFirstName().trim().isEmpty() ||
                request.getLastName() == null || request.getLastName().trim().isEmpty() ||
                request.getPhone() == null || request.getPhone().trim().isEmpty() ||
                request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                
                Map<String, String> error = new HashMap<>();
                error.put("error", "All fields are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Send email
            emailService.sendSupportEmail(
                request.getFirstName(),
                request.getLastName(),
                request.getPhone(),
                request.getEmail(),
                request.getMessage()
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", "Support request sent successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send support request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Inner class for request body
    public static class SupportRequest {
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private String message;

        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}

