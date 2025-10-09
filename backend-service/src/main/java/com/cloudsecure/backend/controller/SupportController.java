package com.cloudsecure.backend.controller;

import com.cloudsecure.backend.dto.SupportRequest;
import com.cloudsecure.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/contact")
    public ResponseEntity<?> submitSupportRequest(@RequestBody SupportRequest request) {
        try {
            emailService.sendSupportEmail(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Support request submitted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to send support request: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}

