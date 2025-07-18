package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.service.ClientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping("/profile/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientProfile(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/profile/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateClientProfile(@PathVariable UUID id,
            @Valid @RequestBody Client clientDetails) {
        try {
            Client updatedClient = clientService.updateClient(id, clientDetails);
            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/password/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> updatePassword(@PathVariable UUID id,
            @Valid @RequestBody PasswordUpdateRequest request) {
        try {
            clientService.updateClientPassword(id, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientOrders(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client.getOrders());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/donations/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientDonations(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client.getDonations());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/cart/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientCart(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client.getCartItems());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/reviews/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientReviews(@PathVariable UUID id) {
        try {
            Client client = clientService.getClientById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client.getReviews());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deactivateClient(@PathVariable UUID id) {
        try {
            clientService.deactivateClient(id);
            return ResponseEntity.ok(new MessageResponse("Client account deactivated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchClients(@RequestParam String name) {
        try {
            List<Client> clients = clientService.searchClientsByName(name);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/location")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getClientsByLocation(@RequestParam String location) {
        try {
            List<Client> clients = clientService.getClientsByLocation(location);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/with-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getClientsWithOrders() {
        try {
            List<Client> clients = clientService.getClientsWithOrders();
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/with-donations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getClientsWithDonations() {
        try {
            List<Client> clients = clientService.getClientsWithDonations();
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRecentClients(@RequestParam(defaultValue = "30") int days) {
        try {
            List<Client> clients = clientService.getRecentClients(days);
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getActiveClientCount() {
        try {
            long count = clientService.getActiveClientCount();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // DTOs
    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
