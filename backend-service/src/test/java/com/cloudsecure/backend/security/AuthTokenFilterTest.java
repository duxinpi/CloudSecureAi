package com.cloudsecure.backend.security;

import com.cloudsecure.backend.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthTokenFilter Tests")
class AuthTokenFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    private UserDetails userDetails;
    private static final String TEST_USERNAME = "testuser";
    private static final String VALID_TOKEN = "valid.jwt.token";
    private static final String INVALID_TOKEN = "invalid.jwt.token";
    private static final String BEARER_PREFIX = "Bearer ";

    @BeforeEach
    void setUp() {
        // Clear security context before each test
        SecurityContextHolder.clearContext();
        
        // Create test user details
        userDetails = User.builder()
                .username(TEST_USERNAME)
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .build();
    }

    @Test
    @DisplayName("Should authenticate user with valid JWT token")
    void testDoFilterInternal_WithValidToken_ShouldAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + VALID_TOKEN);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(TEST_USERNAME);
        when(userDetailsService.loadUserByUsername(TEST_USERNAME)).thenReturn(userDetails);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(VALID_TOKEN);
        verify(jwtUtils).getUserNameFromJwtToken(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(TEST_USERNAME);
        verify(filterChain).doFilter(request, response);

        // Verify authentication was set in security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(TEST_USERNAME, ((UserDetails) authentication.getPrincipal()).getUsername());
        assertTrue(authentication.isAuthenticated());
    }

    @Test
    @DisplayName("Should not authenticate with invalid JWT token")
    void testDoFilterInternal_WithInvalidToken_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + INVALID_TOKEN);
        when(jwtUtils.validateJwtToken(INVALID_TOKEN)).thenReturn(false);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(INVALID_TOKEN);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should not authenticate when token is null")
    void testDoFilterInternal_WithNullToken_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should not authenticate when Authorization header is empty")
    void testDoFilterInternal_WithEmptyHeader_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("");

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should not authenticate when Authorization header does not start with Bearer")
    void testDoFilterInternal_WithoutBearerPrefix_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Basic " + VALID_TOKEN);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should handle exception during authentication gracefully")
    void testDoFilterInternal_WithException_ShouldHandleGracefully() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + VALID_TOKEN);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(TEST_USERNAME);
        when(userDetailsService.loadUserByUsername(TEST_USERNAME))
                .thenThrow(new RuntimeException("User not found"));

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> authTokenFilter.doFilterInternal(request, response, filterChain));

        // Verify filter chain continues even with exception
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set due to exception
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should continue filter chain even when token validation fails")
    void testDoFilterInternal_AlwaysContinuesFilterChain() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + INVALID_TOKEN);
        when(jwtUtils.validateJwtToken(INVALID_TOKEN)).thenReturn(false);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should extract token correctly from Bearer Authorization header")
    void testParseJwt_WithValidBearerToken_ShouldExtractToken() throws ServletException, IOException {
        // Arrange
        String expectedToken = "extracted.token.value";
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + expectedToken);
        when(jwtUtils.validateJwtToken(expectedToken)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(expectedToken)).thenReturn(TEST_USERNAME);
        when(userDetailsService.loadUserByUsername(TEST_USERNAME)).thenReturn(userDetails);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(expectedToken);
        verify(jwtUtils).getUserNameFromJwtToken(expectedToken);
    }

    @Test
    @DisplayName("Should handle whitespace-only Authorization header")
    void testDoFilterInternal_WithWhitespaceHeader_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("   ");

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should handle Bearer prefix without token")
    void testDoFilterInternal_WithBearerPrefixOnly_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer ");

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        // Empty token after "Bearer " should still be passed to validation
        verify(jwtUtils).validateJwtToken("");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should set authentication details correctly")
    void testDoFilterInternal_ShouldSetAuthenticationDetails() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + VALID_TOKEN);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(TEST_USERNAME);
        when(userDetailsService.loadUserByUsername(TEST_USERNAME)).thenReturn(userDetails);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertNotNull(authentication.getDetails());
        assertEquals(userDetails, authentication.getPrincipal());
        assertNull(authentication.getCredentials());
        assertFalse(authentication.getAuthorities().isEmpty());
    }

    @Test
    @DisplayName("Should handle multiple filter calls independently")
    void testDoFilterInternal_MultipleCalls_ShouldHandleIndependently() throws ServletException, IOException {
        // First call - valid token
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + VALID_TOKEN);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(TEST_USERNAME);
        when(userDetailsService.loadUserByUsername(TEST_USERNAME)).thenReturn(userDetails);

        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        Authentication firstAuth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(firstAuth);

        // Clear context for second call
        SecurityContextHolder.clearContext();

        // Second call - invalid token
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + INVALID_TOKEN);
        when(jwtUtils.validateJwtToken(INVALID_TOKEN)).thenReturn(false);

        authTokenFilter.doFilterInternal(request, response, filterChain);
        
        Authentication secondAuth = SecurityContextHolder.getContext().getAuthentication();
        assertNull(secondAuth);

        // Verify filter chain was called twice
        verify(filterChain, times(2)).doFilter(request, response);
    }

    @Test
    @DisplayName("Should handle JWT validation exception")
    void testDoFilterInternal_WithJwtValidationException_ShouldHandleGracefully() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(BEARER_PREFIX + VALID_TOKEN);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenThrow(new RuntimeException("JWT validation error"));

        // Act & Assert
        assertDoesNotThrow(() -> authTokenFilter.doFilterInternal(request, response, filterChain));

        // Verify filter chain continues
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }

    @Test
    @DisplayName("Should handle case-sensitive Bearer prefix")
    void testDoFilterInternal_WithLowercaseBearer_ShouldNotAuthenticate() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("bearer " + VALID_TOKEN);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(filterChain).doFilter(request, response);

        // Verify no authentication was set
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNull(authentication);
    }
}

