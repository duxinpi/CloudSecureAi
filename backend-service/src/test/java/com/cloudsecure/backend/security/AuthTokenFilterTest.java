package com.cloudsecure.backend.security;

import com.cloudsecure.backend.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
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

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuthTokenFilter authTokenFilter;

    private static final String VALID_TOKEN = "valid.jwt.token";
    private static final String INVALID_TOKEN = "invalid.jwt.token";
    private static final String USERNAME = "testuser";
    private static final String AUTHORIZATION_HEADER = "Bearer " + VALID_TOKEN;

    @BeforeEach
    void setUp() {
        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WithValidToken_ShouldAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(AUTHORIZATION_HEADER);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(USERNAME);
        
        UserDetails userDetails = new User(USERNAME, "password", 
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(userDetails);
        
        when(SecurityContextHolder.getContext()).thenReturn(securityContext);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(VALID_TOKEN);
        verify(jwtUtils).getUserNameFromJwtToken(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(USERNAME);
        verify(securityContext).setAuthentication(any(UsernamePasswordAuthenticationToken.class));
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithInvalidToken_ShouldNotAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer " + INVALID_TOKEN);
        when(jwtUtils.validateJwtToken(INVALID_TOKEN)).thenReturn(false);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(INVALID_TOKEN);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithNoToken_ShouldNotAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithMalformedHeader_ShouldNotAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("InvalidHeader " + VALID_TOKEN);

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithEmptyToken_ShouldNotAuthenticateUser() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer ");

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils, never()).validateJwtToken(anyString());
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WhenJwtUtilsThrowsException_ShouldContinueFilterChain() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(AUTHORIZATION_HEADER);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenThrow(new RuntimeException("JWT validation error"));

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(VALID_TOKEN);
        verify(jwtUtils, never()).getUserNameFromJwtToken(anyString());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WhenUserDetailsServiceThrowsException_ShouldContinueFilterChain() throws ServletException, IOException {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(AUTHORIZATION_HEADER);
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenThrow(new RuntimeException("User not found"));

        // Act
        authTokenFilter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(jwtUtils).validateJwtToken(VALID_TOKEN);
        verify(jwtUtils).getUserNameFromJwtToken(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(USERNAME);
        verify(securityContext, never()).setAuthentication(any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void extractJwtFromRequest_WithValidBearerToken_ShouldReturnToken() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(AUTHORIZATION_HEADER);

        // Act
        String result = authTokenFilter.extractJwtFromRequest(request);

        // Assert
        assertEquals(VALID_TOKEN, result);
    }

    @Test
    void extractJwtFromRequest_WithNoHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        String result = authTokenFilter.extractJwtFromRequest(request);

        // Assert
        assertNull(result);
    }

    @Test
    void extractJwtFromRequest_WithEmptyHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("");

        // Act
        String result = authTokenFilter.extractJwtFromRequest(request);

        // Assert
        assertNull(result);
    }

    @Test
    void extractJwtFromRequest_WithNonBearerToken_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Basic " + VALID_TOKEN);

        // Act
        String result = authTokenFilter.extractJwtFromRequest(request);

        // Assert
        assertNull(result);
    }

    @Test
    void isValidToken_WithValidToken_ShouldReturnTrue() {
        // Arrange
        when(jwtUtils.validateJwtToken(VALID_TOKEN)).thenReturn(true);

        // Act
        boolean result = authTokenFilter.isValidToken(VALID_TOKEN);

        // Assert
        assertTrue(result);
        verify(jwtUtils).validateJwtToken(VALID_TOKEN);
    }

    @Test
    void isValidToken_WithInvalidToken_ShouldReturnFalse() {
        // Arrange
        when(jwtUtils.validateJwtToken(INVALID_TOKEN)).thenReturn(false);

        // Act
        boolean result = authTokenFilter.isValidToken(INVALID_TOKEN);

        // Assert
        assertFalse(result);
        verify(jwtUtils).validateJwtToken(INVALID_TOKEN);
    }

    @Test
    void isValidToken_WithNullToken_ShouldReturnFalse() {
        // Act
        boolean result = authTokenFilter.isValidToken(null);

        // Assert
        assertFalse(result);
        verify(jwtUtils, never()).validateJwtToken(anyString());
    }

    @Test
    void authenticateUser_WithValidToken_ShouldSetAuthentication() {
        // Arrange
        UserDetails userDetails = new User(USERNAME, "password", 
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        when(jwtUtils.getUserNameFromJwtToken(VALID_TOKEN)).thenReturn(USERNAME);
        when(userDetailsService.loadUserByUsername(USERNAME)).thenReturn(userDetails);
        when(SecurityContextHolder.getContext()).thenReturn(securityContext);

        // Act
        authTokenFilter.authenticateUser(VALID_TOKEN, request);

        // Assert
        verify(jwtUtils).getUserNameFromJwtToken(VALID_TOKEN);
        verify(userDetailsService).loadUserByUsername(USERNAME);
        verify(securityContext).setAuthentication(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void parseJwt_WithValidBearerHeader_ShouldReturnToken() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(AUTHORIZATION_HEADER);

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertEquals(VALID_TOKEN, result);
    }

    @Test
    void parseJwt_WithNoHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn(null);

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithEmptyHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("");

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithWhitespaceOnlyHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("   ");

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithNonBearerHeader_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Basic " + VALID_TOKEN);

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithBearerButNoToken_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer ");

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithBearerAndWhitespaceToken_ShouldReturnNull() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer   ");

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertNull(result);
    }

    @Test
    void parseJwt_WithBearerAndValidToken_ShouldReturnToken() {
        // Arrange
        when(request.getHeader("Authorization")).thenReturn("Bearer " + VALID_TOKEN);

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertEquals(VALID_TOKEN, result);
    }

    @Test
    void parseJwt_WithBearerAndTokenWithSpaces_ShouldReturnToken() {
        // Arrange
        String tokenWithSpaces = "  " + VALID_TOKEN + "  ";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + tokenWithSpaces);

        // Act
        String result = authTokenFilter.parseJwt(request);

        // Assert
        assertEquals(tokenWithSpaces, result);
    }
}
