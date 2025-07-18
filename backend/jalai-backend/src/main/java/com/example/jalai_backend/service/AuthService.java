package com.example.jalai_backend.service;

import com.example.jalai_backend.exception.AuthenticationException;
import com.example.jalai_backend.exception.InvalidTokenException;
import com.example.jalai_backend.exception.ResourceAlreadyExistsException;
import com.example.jalai_backend.model.Admin;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.AdminRepository;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.OrphanageRepository;
import com.example.jalai_backend.security.CustomUserDetailsService;
import com.example.jalai_backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private OrphanageRepository orphanageRepository;

    public Map<String, Object> authenticateUser(String email, String password) {
        try {
            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));

            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Generate tokens
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);

            // Get user info
            Map<String, Object> userInfo = getUserInfo(email);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", 86400); // 24 hours
            response.put("user", userInfo);

            return response;

        } catch (BadCredentialsException e) {
            throw new AuthenticationException("Invalid email or password");
        }
    }

    public Map<String, Object> registerClient(Client client) {
        // Check if email already exists
        if (clientRepository.existsByEmail(client.getEmail()) ||
                adminRepository.existsByEmail(client.getEmail()) ||
                orphanageRepository.existsByEmail(client.getEmail())) {
            throw new ResourceAlreadyExistsException("User", "email", client.getEmail());
        }

        // Encode password
        client.setPassword(passwordEncoder.encode(client.getPassword()));
        client.setIsActive(true);

        // Save client
        Client savedClient = clientRepository.save(client);

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedClient.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 86400);
        response.put("user", convertClientToUserInfo(savedClient));

        return response;
    }

    public Map<String, Object> registerOrphanage(Orphanage orphanage) {
        System.out.println("=== AUTHSERVICE: REGISTER ORPHANAGE ===");
        System.out.println("Orphanage details before processing:");
        System.out.println("Name: " + orphanage.getName());
        System.out.println("Email: " + orphanage.getEmail());
        System.out.println("Location: " + orphanage.getLocation());

        // Check if email already exists
        if (clientRepository.existsByEmail(orphanage.getEmail()) ||
                adminRepository.existsByEmail(orphanage.getEmail()) ||
                orphanageRepository.existsByEmail(orphanage.getEmail())) {
            System.out.println("ERROR: Email already exists: " + orphanage.getEmail());
            throw new ResourceAlreadyExistsException("User", "email", orphanage.getEmail());
        }

        // Encode password
        orphanage.setPassword(passwordEncoder.encode(orphanage.getPassword()));
        orphanage.setIsActive(true);

        System.out.println("Setting orphanage as active: " + orphanage.getIsActive());

        // Save orphanage
        System.out.println("Saving orphanage to database...");
        Orphanage savedOrphanage = orphanageRepository.save(orphanage);
        System.out.println("Orphanage saved with ID: " + savedOrphanage.getId());
        System.out.println("Saved orphanage active status: " + savedOrphanage.getIsActive());

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedOrphanage.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 86400);
        response.put("user", convertOrphanageToUserInfo(savedOrphanage));

        return response;
    }

    public Map<String, Object> refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        String newAccessToken = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", newRefreshToken);
        response.put("tokenType", "Bearer");
        response.put("expiresIn", 86400);

        return response;
    }

    private Map<String, Object> getUserInfo(String email) {
        Optional<Client> client = clientRepository.findByEmail(email);
        if (client.isPresent()) {
            return convertClientToUserInfo(client.get());
        }

        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return convertAdminToUserInfo(admin.get());
        }

        Optional<Orphanage> orphanage = orphanageRepository.findByEmail(email);
        if (orphanage.isPresent()) {
            return convertOrphanageToUserInfo(orphanage.get());
        }

        throw new RuntimeException("User not found");
    }

    private Map<String, Object> convertClientToUserInfo(Client client) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", client.getId());
        userInfo.put("name", client.getName());
        userInfo.put("email", client.getEmail());
        userInfo.put("phone", client.getPhone());
        userInfo.put("location", client.getLocation());
        userInfo.put("userType", "CLIENT");
        userInfo.put("isActive", client.getIsActive());
        return userInfo;
    }

    private Map<String, Object> convertAdminToUserInfo(Admin admin) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", admin.getId());
        userInfo.put("name", admin.getName());
        userInfo.put("email", admin.getEmail());
        userInfo.put("userType", "ADMIN");
        userInfo.put("isActive", admin.getIsActive());
        return userInfo;
    }

    private Map<String, Object> convertOrphanageToUserInfo(Orphanage orphanage) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", orphanage.getId());
        userInfo.put("name", orphanage.getName());
        userInfo.put("email", orphanage.getEmail());
        userInfo.put("phoneNumber", orphanage.getPhoneNumber());
        userInfo.put("location", orphanage.getLocation());
        userInfo.put("userType", "ORPHANAGE");
        userInfo.put("isActive", orphanage.getIsActive());
        return userInfo;
    }
}
