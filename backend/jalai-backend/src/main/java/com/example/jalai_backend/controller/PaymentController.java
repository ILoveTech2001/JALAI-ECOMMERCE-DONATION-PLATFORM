package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Payment;
import com.example.jalai_backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Payment> payments = paymentService.getAllPaymentsWithPagination(pageable);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentById(@PathVariable UUID id) {
        try {
            Payment payment = paymentService.getPaymentById(id)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            Payment payment = paymentService.createPayment(
                    request.getClientId(),
                    request.getOrderId(),
                    request.getAmount(),
                    request.getPaymentMethod(),
                    request.getPhoneNumber(),
                    request.getDescription()
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/mobile-money")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> processMobileMoneyPayment(@Valid @RequestBody MobileMoneyPaymentRequest request) {
        try {
            Payment payment = paymentService.processMobileMoneyPayment(
                    request.getClientId(),
                    request.getOrderId(),
                    request.getAmount(),
                    request.getPhoneNumber(),
                    request.getProvider() // MTN or Orange
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> confirmPayment(@PathVariable UUID id) {
        try {
            Payment payment = paymentService.confirmPayment(id);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelPayment(@PathVariable UUID id) {
        try {
            Payment payment = paymentService.cancelPayment(id);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentsByClient(@PathVariable UUID clientId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByClient(clientId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentByOrder(@PathVariable UUID orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrder(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for order"));
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentStats() {
        try {
            Map<String, Object> stats = paymentService.getPaymentStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // DTOs
    public static class CreatePaymentRequest {
        private UUID clientId;
        private UUID orderId;
        private BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        private String phoneNumber;
        private String description;

        // Getters and setters
        public UUID getClientId() { return clientId; }
        public void setClientId(UUID clientId) { this.clientId = clientId; }

        public UUID getOrderId() { return orderId; }
        public void setOrderId(UUID orderId) { this.orderId = orderId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class MobileMoneyPaymentRequest {
        private UUID clientId;
        private UUID orderId;
        private BigDecimal amount;
        private String phoneNumber;
        private String provider; // "MTN" or "ORANGE"

        // Getters and setters
        public UUID getClientId() { return clientId; }
        public void setClientId(UUID clientId) { this.clientId = clientId; }

        public UUID getOrderId() { return orderId; }
        public void setOrderId(UUID orderId) { this.orderId = orderId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
