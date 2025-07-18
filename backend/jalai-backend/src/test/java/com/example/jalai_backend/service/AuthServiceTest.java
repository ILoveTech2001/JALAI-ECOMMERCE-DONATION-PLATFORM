package com.example.jalai_backend.service;

import com.example.jalai_backend.BaseTest;
import com.example.jalai_backend.exception.AuthenticationException;
import com.example.jalai_backend.exception.ResourceAlreadyExistsException;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Orphanage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest extends BaseTest {

    @Autowired
    private AuthService authService;

    @Test
    void authenticateUser_WithValidCredentials_ShouldReturnTokens() {
        // Given
        String email = testClient.getEmail();
        String password = "TestPass123!";

        // When
        Map<String, Object> response = authService.authenticateUser(email, password);

        // Then
        assertNotNull(response);
        assertTrue(response.containsKey("accessToken"));
        assertTrue(response.containsKey("refreshToken"));
        assertTrue(response.containsKey("user"));
        assertEquals("Bearer", response.get("tokenType"));
        assertEquals(86400L, response.get("expiresIn"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = (Map<String, Object>) response.get("user");
        assertEquals(testClient.getEmail(), userInfo.get("email"));
        assertEquals("CLIENT", userInfo.get("userType"));
    }

    @Test
    void authenticateUser_WithInvalidCredentials_ShouldThrowException() {
        // Given
        String email = testClient.getEmail();
        String wrongPassword = "WrongPassword";

        // When & Then
        assertThrows(AuthenticationException.class, () -> {
            authService.authenticateUser(email, wrongPassword);
        });
    }

    @Test
    void authenticateUser_WithNonExistentUser_ShouldThrowException() {
        // Given
        String nonExistentEmail = "nonexistent@test.com";
        String password = "TestPass123!";

        // When & Then
        assertThrows(AuthenticationException.class, () -> {
            authService.authenticateUser(nonExistentEmail, password);
        });
    }

    @Test
    void registerClient_WithValidData_ShouldCreateClientAndReturnTokens() {
        // Given
        Client newClient = new Client();
        newClient.setName("New Client");
        newClient.setEmail("newclient@test.com");
        newClient.setPassword("NewPass123!");
        newClient.setPhone("+1234567899");
        newClient.setLocation("New City");

        // When
        Map<String, Object> response = authService.registerClient(newClient);

        // Then
        assertNotNull(response);
        assertTrue(response.containsKey("accessToken"));
        assertTrue(response.containsKey("refreshToken"));
        assertTrue(response.containsKey("user"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = (Map<String, Object>) response.get("user");
        assertEquals("newclient@test.com", userInfo.get("email"));
        assertEquals("CLIENT", userInfo.get("userType"));

        // Verify client was saved to database
        assertTrue(clientRepository.existsByEmail("newclient@test.com"));
    }

    @Test
    void registerClient_WithExistingEmail_ShouldThrowException() {
        // Given
        Client newClient = new Client();
        newClient.setName("Duplicate Client");
        newClient.setEmail(testClient.getEmail()); // Use existing email
        newClient.setPassword("NewPass123!");

        // When & Then
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            authService.registerClient(newClient);
        });
    }

    @Test
    void registerOrphanage_WithValidData_ShouldCreateOrphanageAndReturnTokens() {
        // Given
        Orphanage newOrphanage = new Orphanage();
        newOrphanage.setName("New Orphanage");
        newOrphanage.setEmail("neworphanage@test.com");
        newOrphanage.setPassword("NewPass123!");
        newOrphanage.setPhoneNumber("+1234567899");
        newOrphanage.setLocation("New City");

        // When
        Map<String, Object> response = authService.registerOrphanage(newOrphanage);

        // Then
        assertNotNull(response);
        assertTrue(response.containsKey("accessToken"));
        assertTrue(response.containsKey("refreshToken"));
        assertTrue(response.containsKey("user"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = (Map<String, Object>) response.get("user");
        assertEquals("neworphanage@test.com", userInfo.get("email"));
        assertEquals("ORPHANAGE", userInfo.get("userType"));

        // Verify orphanage was saved to database
        assertTrue(orphanageRepository.existsByEmail("neworphanage@test.com"));
    }

    @Test
    void registerOrphanage_WithExistingEmail_ShouldThrowException() {
        // Given
        Orphanage newOrphanage = new Orphanage();
        newOrphanage.setName("Duplicate Orphanage");
        newOrphanage.setEmail(testOrphanage.getEmail()); // Use existing email
        newOrphanage.setPassword("NewPass123!");

        // When & Then
        assertThrows(ResourceAlreadyExistsException.class, () -> {
            authService.registerOrphanage(newOrphanage);
        });
    }

    @Test
    void authenticateAdmin_WithValidCredentials_ShouldReturnTokens() {
        // Given
        String email = testAdmin.getEmail();
        String password = "TestPass123!";

        // When
        Map<String, Object> response = authService.authenticateUser(email, password);

        // Then
        assertNotNull(response);
        assertTrue(response.containsKey("accessToken"));
        assertTrue(response.containsKey("refreshToken"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = (Map<String, Object>) response.get("user");
        assertEquals(testAdmin.getEmail(), userInfo.get("email"));
        assertEquals("ADMIN", userInfo.get("userType"));
    }

    @Test
    void authenticateOrphanage_WithValidCredentials_ShouldReturnTokens() {
        // Given
        String email = testOrphanage.getEmail();
        String password = "TestPass123!";

        // When
        Map<String, Object> response = authService.authenticateUser(email, password);

        // Then
        assertNotNull(response);
        assertTrue(response.containsKey("accessToken"));
        assertTrue(response.containsKey("refreshToken"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userInfo = (Map<String, Object>) response.get("user");
        assertEquals(testOrphanage.getEmail(), userInfo.get("email"));
        assertEquals("ORPHANAGE", userInfo.get("userType"));
    }

    @Test
    void registerClient_ShouldEncodePassword() {
        // Given
        Client newClient = new Client();
        newClient.setName("Password Test Client");
        newClient.setEmail("passwordtest@test.com");
        newClient.setPassword("PlainPassword123!");

        // When
        authService.registerClient(newClient);

        // Then
        Client savedClient = clientRepository.findByEmail("passwordtest@test.com").orElse(null);
        assertNotNull(savedClient);
        assertNotEquals("PlainPassword123!", savedClient.getPassword());
        assertTrue(passwordEncoder.matches("PlainPassword123!", savedClient.getPassword()));
    }

    @Test
    void registerOrphanage_ShouldEncodePassword() {
        // Given
        Orphanage newOrphanage = new Orphanage();
        newOrphanage.setName("Password Test Orphanage");
        newOrphanage.setEmail("passwordtestorphanage@test.com");
        newOrphanage.setPassword("PlainPassword123!");

        // When
        authService.registerOrphanage(newOrphanage);

        // Then
        Orphanage savedOrphanage = orphanageRepository.findByEmail("passwordtestorphanage@test.com").orElse(null);
        assertNotNull(savedOrphanage);
        assertNotEquals("PlainPassword123!", savedOrphanage.getPassword());
        assertTrue(passwordEncoder.matches("PlainPassword123!", savedOrphanage.getPassword()));
    }
}
