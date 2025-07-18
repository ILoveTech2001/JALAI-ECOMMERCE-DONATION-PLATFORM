package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public List<Client> getAllActiveClients() {
        return clientRepository.findByIsActiveTrue();
    }

    public Optional<Client> getClientById(UUID id) {
        return clientRepository.findById(id);
    }

    public Optional<Client> getClientByEmail(String email) {
        return clientRepository.findByEmail(email);
    }

    public Client createClient(Client client) {
        // Check if email already exists
        if (clientRepository.existsByEmail(client.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        client.setPassword(passwordEncoder.encode(client.getPassword()));
        client.setIsActive(true);

        return clientRepository.save(client);
    }

    public Client updateClient(UUID id, Client clientDetails) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        // Update fields
        client.setName(clientDetails.getName());
        client.setPhone(clientDetails.getPhone());
        client.setLocation(clientDetails.getLocation());

        // Only update email if it's different and doesn't exist
        if (!client.getEmail().equals(clientDetails.getEmail())) {
            if (clientRepository.existsByEmail(clientDetails.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            client.setEmail(clientDetails.getEmail());
        }

        return clientRepository.save(client);
    }

    public Client updateClientPassword(UUID id, String currentPassword, String newPassword) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, client.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        client.setPassword(passwordEncoder.encode(newPassword));
        return clientRepository.save(client);
    }

    public void deactivateClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        client.setIsActive(false);
        clientRepository.save(client);
    }

    public void activateClient(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));

        client.setIsActive(true);
        clientRepository.save(client);
    }

    public void deleteClient(UUID id) {
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }

    public List<Client> searchClientsByName(String name) {
        return clientRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Client> getClientsByLocation(String location) {
        return clientRepository.findByLocationContainingIgnoreCase(location);
    }

    public List<Client> getClientsWithOrders() {
        return clientRepository.findClientsWithOrders();
    }

    public List<Client> getClientsWithDonations() {
        return clientRepository.findClientsWithDonations();
    }

    public List<Client> getRecentClients(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return clientRepository.findByCreatedAtAfter(cutoffDate);
    }

    public long getActiveClientCount() {
        return clientRepository.countActiveClients();
    }

    public List<Client> getTopClientsByOrderCount() {
        return clientRepository.findTopClientsByOrderCount();
    }

    public boolean existsByEmail(String email) {
        return clientRepository.existsByEmail(email);
    }

    public boolean existsByPhone(String phone) {
        return clientRepository.findByPhone(phone).isPresent();
    }

    // Business methods implementation
    public void buyItems(UUID clientId) {
        // Implementation for buying items
        // This would typically involve cart processing and order creation
        getClientById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Business logic for buying items would go here
        // For now, just a placeholder
    }

    public void listItems(UUID clientId) {
        // Implementation for listing items for sale
        getClientById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Business logic for listing items would go here
    }

    public void donateItems(UUID clientId) {
        // Implementation for donating items
        getClientById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Business logic for donating items would go here
    }

    public void viewHistory(UUID clientId) {
        // Implementation for viewing purchase/donation history
        getClientById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Business logic for viewing history would go here
    }

    public void receivePayment(UUID clientId) {
        // Implementation for receiving payment
        getClientById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Business logic for receiving payment would go here
    }
}
