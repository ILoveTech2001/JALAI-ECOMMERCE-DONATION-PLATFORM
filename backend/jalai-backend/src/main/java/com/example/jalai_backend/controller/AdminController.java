package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Order;
import com.example.jalai_backend.model.Donation;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.ProductRepository;
import com.example.jalai_backend.repository.OrderRepository;
import com.example.jalai_backend.repository.OrphanageRepository;
import com.example.jalai_backend.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrphanageRepository orphanageRepository;

    @Autowired
    private DonationRepository donationRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Get counts
            long totalClients = clientRepository.count();
            long totalProducts = productRepository.count();
            long totalOrders = orderRepository.count();
            long totalOrphanages = orphanageRepository.count();
            long totalDonations = donationRepository.count();

            // Calculate total revenue (sum of all order totals)
            BigDecimal totalRevenue = orderRepository.findAll().stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            stats.put("totalClients", totalClients);
            stats.put("totalProducts", totalProducts);
            stats.put("totalOrders", totalOrders);
            stats.put("totalOrphanages", totalOrphanages);
            stats.put("totalDonations", totalDonations);
            stats.put("totalRevenue", totalRevenue);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch dashboard stats");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/clients")
    public ResponseEntity<?> getAllClients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Client> clients = clientRepository.findAll(pageable);

            // Transform clients to include calculated fields
            List<Map<String, Object>> enrichedClients = clients.getContent().stream()
                    .map(client -> {
                        Map<String, Object> clientData = new HashMap<>();
                        clientData.put("id", client.getId());
                        clientData.put("name", client.getName());
                        clientData.put("email", client.getEmail());
                        clientData.put("phone", client.getPhone());
                        clientData.put("location", client.getLocation());
                        clientData.put("isActive", client.getIsActive());
                        clientData.put("createdAt", client.getCreatedAt());
                        clientData.put("updatedAt", client.getUpdatedAt());

                        // Calculate total orders for this client
                        long totalOrders = orderRepository.countByClientId(client.getId());
                        clientData.put("totalOrders", totalOrders);

                        // Calculate total spent by this client
                        BigDecimal totalSpent = orderRepository.findByClientId(client.getId()).stream()
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        clientData.put("totalSpent", totalSpent);

                        return clientData;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", enrichedClients);
            response.put("totalElements", clients.getTotalElements());
            response.put("totalPages", clients.getTotalPages());
            response.put("currentPage", clients.getNumber());
            response.put("size", clients.getSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch clients");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<?> getClient(@PathVariable String id) {
        try {
            UUID clientId = UUID.fromString(id);
            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch client");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(404).body(errorResponse);
        }
    }

    @PutMapping("/clients/{id}/status")
    public ResponseEntity<?> updateClientStatus(
            @PathVariable String id,
            @RequestParam Boolean status) {
        try {
            UUID clientId = UUID.fromString(id);
            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found"));

            client.setIsActive(status);
            Client updatedClient = clientRepository.save(client);

            return ResponseEntity.ok(updatedClient);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update client status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable String id) {
        try {
            UUID clientId = UUID.fromString(id);
            if (!clientRepository.existsById(clientId)) {
                throw new RuntimeException("Client not found");
            }

            clientRepository.deleteById(clientId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Client deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete client");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/dashboard/recent-activity")
    public ResponseEntity<?> getRecentActivity() {
        try {
            Map<String, Object> activity = new HashMap<>();

            // Get recent orders (last 5)
            Pageable recentPageable = PageRequest.of(0, 5);
            Page<Order> recentOrders = orderRepository.findAll(recentPageable);

            // Get recent clients (last 5)
            Page<Client> recentClients = clientRepository.findAll(recentPageable);

            // Get recent donations (last 5)
            Page<Donation> recentDonations = donationRepository.findAll(recentPageable);

            activity.put("recentOrders", recentOrders.getContent());
            activity.put("recentClients", recentClients.getContent());
            activity.put("recentDonations", recentDonations.getContent());

            return ResponseEntity.ok(activity);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch recent activity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
