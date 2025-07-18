package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Donation;
import com.example.jalai_backend.model.Orphanage;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.DonationRepository;
import com.example.jalai_backend.repository.OrphanageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private OrphanageRepository orphanageRepository;

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Optional<Donation> getDonationById(UUID id) {
        return donationRepository.findById(id);
    }

    public List<Donation> getDonationsByClient(UUID clientId) {
        return donationRepository.findByClientId(clientId);
    }

    public List<Donation> getDonationsByOrphanage(UUID orphanageId) {
        return donationRepository.findByOrphanageId(orphanageId);
    }

    public List<Donation> getDonationsByType(Donation.DonationType donationType) {
        return donationRepository.findByDonationType(donationType);
    }

    public List<Donation> getDonationsByStatus(Donation.DonationStatus status) {
        return donationRepository.findByStatus(status);
    }

    public Donation createDonation(Donation donation, UUID clientId, UUID orphanageId) {
        // Validate client
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        // Validate orphanage
        Orphanage orphanage = orphanageRepository.findById(orphanageId)
            .orElseThrow(() -> new RuntimeException("Orphanage not found with id: " + orphanageId));

        // Set relationships
        donation.setClient(client);
        donation.setOrphanage(orphanage);
        donation.setUserId(clientId);
        donation.setOrphanageId(orphanageId);

        // Set default values
        if (donation.getStatus() == null) {
            donation.setStatus(Donation.DonationStatus.PENDING);
        }
        donation.setIsConfirmed(false);

        // Validate donation based on type
        validateDonation(donation);

        return donationRepository.save(donation);
    }

    public Donation updateDonation(UUID id, Donation donationDetails) {
        Donation donation = donationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));

        // Update allowed fields
        donation.setDonationType(donationDetails.getDonationType());
        donation.setAppointmentDate(donationDetails.getAppointmentDate());
        donation.setCashAmount(donationDetails.getCashAmount());
        donation.setItemDescription(donationDetails.getItemDescription());

        // Validate updated donation
        validateDonation(donation);

        return donationRepository.save(donation);
    }

    public Donation confirmDonation(UUID id) {
        Donation donation = donationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));

        donation.confirmDonation();
        return donationRepository.save(donation);
    }

    public Donation updateDonationStatus(UUID id, Donation.DonationStatus status) {
        Donation donation = donationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));

        donation.setStatus(status);
        
        if (status == Donation.DonationStatus.CONFIRMED) {
            donation.setIsConfirmed(true);
        }

        return donationRepository.save(donation);
    }

    public void cancelDonation(UUID id) {
        Donation donation = donationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));

        if (donation.getStatus() == Donation.DonationStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed donation");
        }

        donation.setStatus(Donation.DonationStatus.CANCELLED);
        donationRepository.save(donation);
    }

    public void deleteDonation(UUID id) {
        if (!donationRepository.existsById(id)) {
            throw new RuntimeException("Donation not found with id: " + id);
        }
        donationRepository.deleteById(id);
    }

    public List<Donation> getConfirmedDonations() {
        return donationRepository.findByIsConfirmedTrue();
    }

    public List<Donation> getPendingDonations() {
        return donationRepository.findByIsConfirmedFalse();
    }

    public List<Donation> getDonationsByAppointmentDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return donationRepository.findByAppointmentDateRange(startDate, endDate);
    }

    public List<Donation> getCashDonations() {
        return donationRepository.findCashDonations();
    }

    public List<Donation> getKindDonations() {
        return donationRepository.findKindDonations();
    }

    public BigDecimal calculateTotalCashDonationsForOrphanage(UUID orphanageId) {
        BigDecimal total = donationRepository.calculateTotalCashDonationsForOrphanage(orphanageId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal calculateTotalCashDonationsByClient(UUID clientId) {
        BigDecimal total = donationRepository.calculateTotalCashDonationsByClient(clientId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public long countDonationsByTypeForOrphanage(UUID orphanageId, Donation.DonationType donationType) {
        return donationRepository.countDonationsByTypeForOrphanage(orphanageId, donationType);
    }

    public List<Donation> getDonationsScheduledForToday() {
        return donationRepository.findDonationsScheduledForToday(LocalDateTime.now());
    }

    public List<Donation> getOverdueDonations() {
        return donationRepository.findOverdueDonations(LocalDateTime.now());
    }

    public List<Donation> getRecentDonations() {
        return donationRepository.findRecentDonations();
    }

    public List<Object[]> getTopDonorsByCount() {
        return donationRepository.findTopDonorsByCount();
    }

    public List<Object[]> getTopDonorsByCashAmount() {
        return donationRepository.findTopDonorsByCashAmount();
    }

    // Business method implementation
    public Donation trackDonation(UUID id) {
        return getDonationById(id)
            .orElseThrow(() -> new RuntimeException("Donation not found"));
    }

    private void validateDonation(Donation donation) {
        if (donation.getDonationType() == null) {
            throw new RuntimeException("Donation type is required");
        }

        switch (donation.getDonationType()) {
            case CASH:
                if (donation.getCashAmount() == null || donation.getCashAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new RuntimeException("Cash amount is required for cash donations");
                }
                break;
            case KIND:
                if (donation.getItemDescription() == null || donation.getItemDescription().trim().isEmpty()) {
                    throw new RuntimeException("Item description is required for kind donations");
                }
                break;
            case BOTH:
                if ((donation.getCashAmount() == null || donation.getCashAmount().compareTo(BigDecimal.ZERO) <= 0) &&
                    (donation.getItemDescription() == null || donation.getItemDescription().trim().isEmpty())) {
                    throw new RuntimeException("Either cash amount or item description is required for combined donations");
                }
                break;
        }
    }

    public Donation scheduleDonation(UUID clientId, UUID orphanageId, Donation.DonationType donationType, 
                                   LocalDateTime appointmentDate, BigDecimal cashAmount, String itemDescription) {
        Donation donation = new Donation();
        donation.setDonationType(donationType);
        donation.setAppointmentDate(appointmentDate);
        donation.setCashAmount(cashAmount);
        donation.setItemDescription(itemDescription);

        return createDonation(donation, clientId, orphanageId);
    }

    public List<Donation> getDonationHistory(UUID clientId) {
        return getDonationsByClient(clientId);
    }

    public Donation completeDonation(UUID id) {
        return updateDonationStatus(id, Donation.DonationStatus.COMPLETED);
    }
}
