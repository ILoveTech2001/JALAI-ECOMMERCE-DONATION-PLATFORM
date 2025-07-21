package com.example.jalai_backend.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@TestConfiguration
public class TestConfig {

    @Bean
    @Primary
    @Profile("test") // Only active in test profile
    public PasswordEncoder testPasswordEncoder() {
        // Use a faster encoder for tests
        return new BCryptPasswordEncoder(4); // Lower strength for faster tests
    }
}
