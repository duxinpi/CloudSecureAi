package com.cloudsecure.backend.service;

import com.cloudsecure.backend.dto.AuthResponse;
import com.cloudsecure.backend.dto.LoginRequest;
import com.cloudsecure.backend.dto.RegisterRequest;
import com.cloudsecure.backend.entity.User;
import com.cloudsecure.backend.repository.UserRepository;
import com.cloudsecure.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    // Common weak passwords list
    private static final List<String> COMMON_PASSWORDS = Arrays.asList(
        "password", "password123", "12345678", "123456789", "1234567890",
        "qwerty", "qwerty123", "abc123", "admin", "admin123",
        "letmein", "welcome", "monkey", "dragon", "master",
        "sunshine", "password1", "princess", "football", "iloveyou"
    );

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            User user = (User) authentication.getPrincipal();
            
            return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
        } catch (Exception e) {
            return new AuthResponse("Invalid username or password");
        }
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new AuthResponse("Username is already taken!");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return new AuthResponse("Email is already in use!");
        }
        
        // Create new user
        User user = new User(
            registerRequest.getUsername(),
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword())
        );
        
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        
        userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
        
        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Change user password with security validations
     * IMPORTANT: This method does NOT log passwords or sensitive data
     */
    public String changePassword(String currentPassword, String newPassword, User user) {
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return "Current password is incorrect";
        }

        // Validate new password
        String validationError = validatePassword(newPassword, user);
        if (validationError != null) {
            return validationError;
        }

        // Check if new password is same as current password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return "New password must be different from current password";
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // IMPORTANT: Do not log password change details - only generic success
        return null; // Success
    }

    /**
     * Validate password strength and security requirements
     * IMPORTANT: This method does NOT log passwords
     */
    private String validatePassword(String password, User user) {
        if (password == null || password.isEmpty()) {
            return "Password cannot be empty";
        }

        if (password.length() < 12) {
            return "Password must be at least 12 characters long";
        }

        if (password.length() > 128) {
            return "Password must be no more than 128 characters";
        }

        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            return "Password must contain at least one uppercase letter";
        }

        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            return "Password must contain at least one lowercase letter";
        }

        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            return "Password must contain at least one number";
        }

        if (!Pattern.compile("[!@#$%^&*(),.?\":{}|<>_+\\-=\\[\\]\\\\;'/~`|]").matcher(password).find()) {
            return "Password must contain at least one special character";
        }

        String lowerPassword = password.toLowerCase();
        for (String common : COMMON_PASSWORDS) {
            if (lowerPassword.contains(common) || common.contains(lowerPassword)) {
                return "Password is too common or weak. Please choose a stronger password";
            }
        }

        if (hasSequentialChars(password)) {
            return "Password cannot contain sequential characters (e.g., abc, 123, qwe)";
        }

        if (hasRepeatedChars(password)) {
            return "Password cannot contain repeated characters (e.g., aaaa, 1111)";
        }

        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            if (lowerPassword.contains(user.getUsername().toLowerCase())) {
                return "Password cannot contain your username";
            }
        }

        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            String emailPart = user.getEmail().split("@")[0].toLowerCase();
            if (!emailPart.isEmpty() && lowerPassword.contains(emailPart)) {
                return "Password cannot contain your email";
            }
        }

        return null; // Valid password
    }

    private boolean hasSequentialChars(String password) {
        String lowerPassword = password.toLowerCase();
        String[] sequences = {
            "abcdefghijklmnopqrstuvwxyz",
            "01234567890",
            "qwertyuiopasdfghjklzxcvbnm"
        };

        for (int i = 0; i < lowerPassword.length() - 2; i++) {
            String substr = lowerPassword.substring(i, i + 3);
            for (String seq : sequences) {
                if (seq.contains(substr) || new StringBuilder(seq).reverse().toString().contains(substr)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasRepeatedChars(String password) {
        for (int i = 0; i < password.length() - 2; i++) {
            if (password.charAt(i) == password.charAt(i + 1) && 
                password.charAt(i) == password.charAt(i + 2)) {
                return true;
            }
        }
        return false;
    }
}
