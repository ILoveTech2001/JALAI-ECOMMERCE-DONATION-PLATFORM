package com.example.jalai_backend.controller;

import com.example.jalai_backend.BaseTest;
import com.example.jalai_backend.dto.AuthDTOs;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureWebMvc
class AuthControllerTest extends BaseTest {

    @Test
    void login_WithValidCredentials_ShouldReturnTokens() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setEmail(testClient.getEmail());
        loginRequest.setPassword("TestPass123!");

        // When & Then
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value(testClient.getEmail()))
                .andExpect(jsonPath("$.user.userType").value("CLIENT"))
                .andReturn();

        String responseContent = result.getResponse().getContentAsString();
        assertNotNull(responseContent);
        assertTrue(responseContent.contains("accessToken"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setEmail(testClient.getEmail());
        loginRequest.setPassword("WrongPassword");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.errorCode").value("AUTHENTICATION_FAILED"));
    }

    @Test
    void login_WithMissingEmail_ShouldReturnBadRequest() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setPassword("TestPass123!");
        // Email is missing

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Input validation failed"))
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    void login_WithInvalidEmailFormat_ShouldReturnBadRequest() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setEmail("invalid-email");
        loginRequest.setPassword("TestPass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.email").exists());
    }

    @Test
    void registerClient_WithValidData_ShouldCreateClientAndReturnTokens() throws Exception {
        // Given
        AuthDTOs.ClientRegistrationRequest registrationRequest = new AuthDTOs.ClientRegistrationRequest();
        registrationRequest.setName("New Test Client");
        registrationRequest.setEmail("newclient@test.com");
        registrationRequest.setPassword("NewPass123!");
        registrationRequest.setPhone("+1234567899");
        registrationRequest.setLocation("Test City");

        // When & Then
        mockMvc.perform(post("/api/auth/register/client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("newclient@test.com"))
                .andExpect(jsonPath("$.user.userType").value("CLIENT"));

        // Verify client was created in database
        assertTrue(clientRepository.existsByEmail("newclient@test.com"));
    }

    @Test
    void registerClient_WithExistingEmail_ShouldReturnConflict() throws Exception {
        // Given
        AuthDTOs.ClientRegistrationRequest registrationRequest = new AuthDTOs.ClientRegistrationRequest();
        registrationRequest.setName("Duplicate Client");
        registrationRequest.setEmail(testClient.getEmail()); // Use existing email
        registrationRequest.setPassword("NewPass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/register/client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_ALREADY_EXISTS"));
    }

    @Test
    void registerClient_WithInvalidPassword_ShouldReturnBadRequest() throws Exception {
        // Given
        AuthDTOs.ClientRegistrationRequest registrationRequest = new AuthDTOs.ClientRegistrationRequest();
        registrationRequest.setName("Test Client");
        registrationRequest.setEmail("testclient2@test.com");
        registrationRequest.setPassword("weak"); // Weak password

        // When & Then
        mockMvc.perform(post("/api/auth/register/client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    void registerOrphanage_WithValidData_ShouldCreateOrphanageAndReturnTokens() throws Exception {
        // Given
        AuthDTOs.OrphanageRegistrationRequest registrationRequest = new AuthDTOs.OrphanageRegistrationRequest();
        registrationRequest.setName("New Test Orphanage");
        registrationRequest.setEmail("neworphanage@test.com");
        registrationRequest.setPassword("NewPass123!");
        registrationRequest.setPhoneNumber("+1234567899");
        registrationRequest.setLocation("Test City");

        // When & Then
        mockMvc.perform(post("/api/auth/register/orphanage")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("neworphanage@test.com"))
                .andExpect(jsonPath("$.user.userType").value("ORPHANAGE"));

        // Verify orphanage was created in database
        assertTrue(orphanageRepository.existsByEmail("neworphanage@test.com"));
    }

    @Test
    void registerOrphanage_WithExistingEmail_ShouldReturnConflict() throws Exception {
        // Given
        AuthDTOs.OrphanageRegistrationRequest registrationRequest = new AuthDTOs.OrphanageRegistrationRequest();
        registrationRequest.setName("Duplicate Orphanage");
        registrationRequest.setEmail(testOrphanage.getEmail()); // Use existing email
        registrationRequest.setPassword("NewPass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/register/orphanage")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_ALREADY_EXISTS"));
    }

    @Test
    void logout_ShouldReturnSuccessMessage() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User logged out successfully!"));
    }

    @Test
    void login_WithAdminCredentials_ShouldReturnAdminTokens() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setEmail(testAdmin.getEmail());
        loginRequest.setPassword("TestPass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(testAdmin.getEmail()))
                .andExpect(jsonPath("$.user.userType").value("ADMIN"));
    }

    @Test
    void login_WithOrphanageCredentials_ShouldReturnOrphanageTokens() throws Exception {
        // Given
        AuthDTOs.LoginRequest loginRequest = new AuthDTOs.LoginRequest();
        loginRequest.setEmail(testOrphanage.getEmail());
        loginRequest.setPassword("TestPass123!");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value(testOrphanage.getEmail()))
                .andExpect(jsonPath("$.user.userType").value("ORPHANAGE"));
    }

    @Test
    void registerClient_WithMissingRequiredFields_ShouldReturnBadRequest() throws Exception {
        // Given
        AuthDTOs.ClientRegistrationRequest registrationRequest = new AuthDTOs.ClientRegistrationRequest();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/api/auth/register/client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registrationRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }
}
