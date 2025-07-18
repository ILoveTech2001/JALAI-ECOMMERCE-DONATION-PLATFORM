package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Donation;
import com.example.jalai_backend.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DonationController {

    @Autowired
    private DonationService donationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDonations() {
        try {
            List<Donation> donations = donationService.getAllDonations();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> getDonationById(@PathVariable UUID id) {
        try {
            Donation donation = donationService.getDonationById(id)
                    .orElseThrow(() -> new RuntimeException("Donation not found"));
            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getDonationsByClient(@PathVariable UUID clientId) {
        try {
            List<Donation> donations = donationService.getDonationsByClient(clientId);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/orphanage/{orphanageId}")
    @PreAuthorize("hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> getDonationsByOrphanage(@PathVariable UUID orphanageId) {
        try {
            List<Donation> donations = donationService.getDonationsByOrphanage(orphanageId);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> createDonation(@Valid @RequestBody CreateDonationRequest request) {
        try {
            Donation donation = new Donation();
            donation.setDonationType(request.getDonationType());
            donation.setAppointmentDate(request.getAppointmentDate());
            donation.setCashAmount(request.getCashAmount());
            donation.setItemDescription(request.getItemDescription());

            Donation createdDonation = donationService.createDonation(
                    donation, request.getClientId(), request.getOrphanageId());
            return ResponseEntity.ok(createdDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateDonation(@PathVariable UUID id, @Valid @RequestBody Donation donationDetails) {
        try {
            Donation updatedDonation = donationService.updateDonation(id, donationDetails);
            return ResponseEntity.ok(updatedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> confirmDonation(@PathVariable UUID id) {
        try {
            Donation confirmedDonation = donationService.confirmDonation(id);
            return ResponseEntity.ok(confirmedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> completeDonation(@PathVariable UUID id) {
        try {
            Donation completedDonation = donationService.completeDonation(id);
            return ResponseEntity.ok(completedDonation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelDonation(@PathVariable UUID id) {
        try {
            donationService.cancelDonation(id);
            return ResponseEntity.ok(new MessageResponse("Donation cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDonation(@PathVariable UUID id) {
        try {
            donationService.deleteDonation(id);
            return ResponseEntity.ok(new MessageResponse("Donation deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDonationsByType(@PathVariable Donation.DonationType type) {
        try {
            List<Donation> donations = donationService.getDonationsByType(type);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDonationsByStatus(@PathVariable Donation.DonationStatus status) {
        try {
            List<Donation> donations = donationService.getDonationsByStatus(status);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/confirmed")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getConfirmedDonations() {
        try {
            List<Donation> donations = donationService.getConfirmedDonations();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingDonations() {
        try {
            List<Donation> donations = donationService.getPendingDonations();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/scheduled-today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDonationsScheduledForToday() {
        try {
            List<Donation> donations = donationService.getDonationsScheduledForToday();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOverdueDonations() {
        try {
            List<Donation> donations = donationService.getOverdueDonations();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/total-cash/orphanage/{orphanageId}")
    @PreAuthorize("hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> getTotalCashDonationsForOrphanage(@PathVariable UUID orphanageId) {
        try {
            BigDecimal total = donationService.calculateTotalCashDonationsForOrphanage(orphanageId);
            return ResponseEntity.ok(Map.of("totalCashDonations", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/total-cash/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getTotalCashDonationsByClient(@PathVariable UUID clientId) {
        try {
            BigDecimal total = donationService.calculateTotalCashDonationsByClient(clientId);
            return ResponseEntity.ok(Map.of("totalCashDonations", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/track/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ORPHANAGE') or hasRole('ADMIN')")
    public ResponseEntity<?> trackDonation(@PathVariable UUID id) {
        try {
            Donation donation = donationService.trackDonation(id);
            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/top-donors/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTopDonorsByCount() {
        try {
            List<Object[]> topDonors = donationService.getTopDonorsByCount();
            return ResponseEntity.ok(topDonors);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/top-donors/amount")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTopDonorsByCashAmount() {
        try {
            List<Object[]> topDonors = donationService.getTopDonorsByCashAmount();
            return ResponseEntity.ok(topDonors);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // DTOs
    public static class CreateDonationRequest {
        private UUID clientId;
        private UUID orphanageId;
        private Donation.DonationType donationType;
        private LocalDateTime appointmentDate;
        private BigDecimal cashAmount;
        private String itemDescription;

        // Getters and setters
        public UUID getClientId() {
            return clientId;
        }

        public void setClientId(UUID clientId) {
            this.clientId = clientId;
        }

        public UUID getOrphanageId() {
            return orphanageId;
        }

        public void setOrphanageId(UUID orphanageId) {
            this.orphanageId = orphanageId;
        }

        public Donation.DonationType getDonationType() {
            return donationType;
        }

        public void setDonationType(Donation.DonationType donationType) {
            this.donationType = donationType;
        }

        public LocalDateTime getAppointmentDate() {
            return appointmentDate;
        }

        public void setAppointmentDate(LocalDateTime appointmentDate) {
            this.appointmentDate = appointmentDate;
        }

        public BigDecimal getCashAmount() {
            return cashAmount;
        }

        public void setCashAmount(BigDecimal cashAmount) {
            this.cashAmount = cashAmount;
        }

        public String getItemDescription() {
            return itemDescription;
        }

        public void setItemDescription(String itemDescription) {
            this.itemDescription = itemDescription;
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
