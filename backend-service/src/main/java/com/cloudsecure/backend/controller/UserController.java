package com.cloudsecure.backend.controller;

import com.cloudsecure.backend.entity.User;
import com.cloudsecure.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private AuthService authService;
    
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileUpdateRequest updateRequest) {
        User currentUser = authService.getCurrentUser();
        if (currentUser != null) {
            // Update user information
            if (updateRequest.getFirstName() != null) {
                currentUser.setFirstName(updateRequest.getFirstName());
            }
            if (updateRequest.getLastName() != null) {
                currentUser.setLastName(updateRequest.getLastName());
            }
            if (updateRequest.getEmail() != null) {
                currentUser.setEmail(updateRequest.getEmail());
            }
            
            // Save updated user
            User updatedUser = authService.updateUser(currentUser);
            
            // Return updated profile
            UserProfileResponse response = new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getFirstName(),
                updatedUser.getLastName(),
                updatedUser.getRole().name(),
                updatedUser.getCreatedAt()
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("User not found");
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserProfile() {
        User currentUser = authService.getCurrentUser();
        if (currentUser != null) {
            // Create a response without password
            UserProfileResponse response = new UserProfileResponse(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail(),
                currentUser.getFirstName(),
                currentUser.getLastName(),
                currentUser.getRole().name(),
                currentUser.getCreatedAt()
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("User not found");
    }
    
    @GetMapping("/test")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> userAccess() {
        return ResponseEntity.ok("User Content.");
    }
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminAccess() {
        return ResponseEntity.ok("Admin Board.");
    }
    
    @PostMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().body(new ChangePasswordResponse(false, "User not found"));
        }

        // Validate request
        if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChangePasswordResponse(false, "Current password is required"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ChangePasswordResponse(false, "New password is required"));
        }

        // Get fresh user from database to ensure we have the latest password hash
        User user = authService.getUserById(currentUser.getId());
        if (user == null) {
            return ResponseEntity.badRequest().body(new ChangePasswordResponse(false, "User not found"));
        }

        // Change password - IMPORTANT: No password logging
        String errorMessage = authService.changePassword(
            request.getCurrentPassword(),
            request.getNewPassword(),
            user
        );

        if (errorMessage != null) {
            return ResponseEntity.badRequest().body(new ChangePasswordResponse(false, errorMessage));
        }

        // IMPORTANT: Do not log success with any password details
        return ResponseEntity.ok(new ChangePasswordResponse(true, "Password changed successfully"));
    }
    
    // Inner class for user profile update request
    public static class UserProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String email;
        
        public UserProfileUpdateRequest() {}
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    // Inner class for user profile response
    public static class UserProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private java.time.LocalDateTime createdAt;
        
        public UserProfileResponse(Long id, String username, String email, String firstName, 
                                 String lastName, String role, java.time.LocalDateTime createdAt) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
            this.createdAt = createdAt;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getRole() { return role; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    }

    // Inner class for change password request
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public ChangePasswordRequest() {}

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    // Inner class for change password response
    public static class ChangePasswordResponse {
        private boolean success;
        private String message;

        public ChangePasswordResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
