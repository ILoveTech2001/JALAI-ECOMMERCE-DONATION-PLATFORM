package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Donation;
import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.OrphanageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OrphanageService {

    @Autowired
    private OrphanageRepository orphanageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Orphanage> getAllOrphanages() {
        return orphanageRepository.findAll();
    }

    public List<Orphanage> getAllActiveOrphanages() {
        return orphanageRepository.findByIsActiveTrue();
    }

    public Optional<Orphanage> getOrphanageById(UUID id) {
        return orphanageRepository.findById(id);
    }

    public Optional<Orphanage> getOrphanageByEmail(String email) {
        return orphanageRepository.findByEmail(email);
    }

    public Orphanage createOrphanage(Orphanage orphanage) {
        // Check if email already exists
        if (orphanageRepository.existsByEmail(orphanage.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Encode password
        orphanage.setPassword(passwordEncoder.encode(orphanage.getPassword()));
        orphanage.setIsActive(true);

        return orphanageRepository.save(orphanage);
    }

    public Orphanage updateOrphanage(UUID id, Orphanage orphanageDetails) {
        Orphanage orphanage = orphanageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orphanage not found with id: " + id));

        // Update fields
        orphanage.setName(orphanageDetails.getName());
        orphanage.setPhoneNumber(orphanageDetails.getPhoneNumber());
        orphanage.setLocation(orphanageDetails.getLocation());

        // Only update email if it's different and doesn't exist
        if (!orphanage.getEmail().equals(orphanageDetails.getEmail())) {
            if (orphanageRepository.existsByEmail(orphanageDetails.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            orphanage.setEmail(orphanageDetails.getEmail());
        }

        return orphanageRepository.save(orphanage);
    }

    public Orphanage updateOrphanagePassword(UUID id, String currentPassword, String newPassword) {
        Orphanage orphanage = orphanageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orphanage not found with id: " + id));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, orphanage.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        orphanage.setPassword(passwordEncoder.encode(newPassword));
        return orphanageRepository.save(orphanage);
    }

    public void deactivateOrphanage(UUID id) {
        Orphanage orphanage = orphanageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orphanage not found with id: " + id));

        orphanage.setIsActive(false);
        orphanageRepository.save(orphanage);
    }

    public void activateOrphanage(UUID id) {
        Orphanage orphanage = orphanageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orphanage not found with id: " + id));

        orphanage.setIsActive(true);
        orphanageRepository.save(orphanage);
    }

    public void deleteOrphanage(UUID id) {
        if (!orphanageRepository.existsById(id)) {
            throw new RuntimeException("Orphanage not found with id: " + id);
        }
        orphanageRepository.deleteById(id);
    }

    public List<Orphanage> searchOrphanagesByName(String name) {
        return orphanageRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Orphanage> getOrphanagesByLocation(String location) {
        return orphanageRepository.findByLocationContainingIgnoreCase(location);
    }

    public Optional<Orphanage> getOrphanageByPhoneNumber(String phoneNumber) {
        return orphanageRepository.findByPhoneNumber(phoneNumber);
    }

    public List<Orphanage> getOrphanagesManagedByAdmin(UUID adminId) {
        return orphanageRepository.findByManagedByAdminId(adminId);
    }

    public List<Orphanage> getOrphanagesWithDonations() {
        return orphanageRepository.findOrphanagesWithDonations();
    }

    public BigDecimal calculateTotalDonationsReceived(UUID orphanageId) {
        BigDecimal total = orphanageRepository.calculateTotalDonationsReceived(orphanageId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public long countTotalDonationsForOrphanage(UUID orphanageId) {
        return orphanageRepository.countTotalDonationsForOrphanage(orphanageId);
    }

    public List<Object[]> getOrphanagesOrderedByDonationCount() {
        return orphanageRepository.findOrphanagesOrderedByDonationCount();
    }

    public List<Object[]> getOrphanagesOrderedByDonationAmount() {
        return orphanageRepository.findOrphanagesOrderedByDonationAmount();
    }

    public List<Orphanage> getOrphanagesNeedingUrgentDonations(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return orphanageRepository.findOrphanagesNeedingUrgentDonations(cutoffDate);
    }

    public long getActiveOrphanageCount() {
        return orphanageRepository.countActiveOrphanages();
    }

    public boolean existsByEmail(String email) {
        return orphanageRepository.existsByEmail(email);
    }

    public boolean existsByPhoneNumber(String phoneNumber) {
        return orphanageRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    // Business methods implementation
    public void approveDonation(UUID orphanageId, UUID donationId) {
        getOrphanageById(orphanageId)
                .orElseThrow(() -> new RuntimeException("Orphanage not found"));

        // Find the donation and approve it
        // This would typically involve calling the DonationService
        // For now, just a placeholder
    }

    public Orphanage updateProfile(UUID orphanageId, Orphanage profileDetails) {
        return updateOrphanage(orphanageId, profileDetails);
    }

    public List<Donation> viewDonations(UUID orphanageId) {
        Orphanage orphanage = getOrphanageById(orphanageId)
                .orElseThrow(() -> new RuntimeException("Orphanage not found"));

        return orphanage.getDonations();
    }

    public void contactUsers(UUID orphanageId) {
        getOrphanageById(orphanageId)
                .orElseThrow(() -> new RuntimeException("Orphanage not found"));

        // Business logic for contacting users would go here
        // This might involve sending notifications or emails
    }

    public List<Orphanage> getTopOrphanagesByDonations() {
        List<Object[]> results = getOrphanagesOrderedByDonationCount();
        // Convert Object[] to Orphanage list
        return results.stream()
                .map(result -> (Orphanage) result[0])
                .toList();
    }

    public List<Orphanage> getOrphanagesNeedingHelp() {
        return getOrphanagesNeedingUrgentDonations(30); // 30 days
    }

    public Orphanage getOrphanageProfile(UUID orphanageId) {
        return getOrphanageById(orphanageId)
                .orElseThrow(() -> new RuntimeException("Orphanage not found"));
    }

    public boolean validateOrphanageCredentials(String email, String password) {
        Optional<Orphanage> orphanage = orphanageRepository.findByEmail(email);
        if (orphanage.isPresent()) {
            return passwordEncoder.matches(password, orphanage.get().getPassword());
        }
        return false;
    }
}
