package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Payment;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Order;
import com.example.jalai_backend.repository.PaymentRepository;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Page<Payment> getAllPaymentsWithPagination(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }

    public Optional<Payment> getPaymentById(UUID id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByClient(UUID clientId) {
        return paymentRepository.findByClientId(clientId);
    }

    public Optional<Payment> getPaymentByOrder(UUID orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    public List<Payment> getPaymentsByStatus(Payment.PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    public Payment createPayment(UUID clientId, UUID orderId, BigDecimal amount, 
                               Payment.PaymentMethod paymentMethod, String phoneNumber, String description) {
        
        // Validate client exists
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Validate order exists if provided
        Order order = null;
        if (orderId != null) {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
        }

        // Create payment
        Payment payment = new Payment();
        payment.setCustomerId(clientId);
        payment.setClient(client);
        payment.setOrder(order);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setDescription(description);
        payment.setPhoneNumber(phoneNumber);

        // Generate transaction ID
        payment.setTransactionId(generateTransactionId());

        Payment savedPayment = paymentRepository.save(payment);

        // Send notification to admin
        try {
            notificationService.createNotification(
                "NEW_PAYMENT",
                "New Payment Initiated",
                String.format("Payment of %s XAF initiated by %s", amount, client.getName()),
                null, // Send to all admins
                clientId,
                false
            );
        } catch (Exception e) {
            // Log error but don't fail payment creation
            System.err.println("Failed to send payment notification: " + e.getMessage());
        }

        return savedPayment;
    }

    public Payment processMobileMoneyPayment(UUID clientId, UUID orderId, BigDecimal amount, 
                                           String phoneNumber, String provider) {
        
        // Determine payment method based on provider
        Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.MOBILE_PAYMENT;
        
        String description = String.format("%s Mobile Money payment from %s", provider, phoneNumber);
        
        Payment payment = createPayment(clientId, orderId, amount, paymentMethod, phoneNumber, description);
        payment.setProvider(provider);
        paymentRepository.save(payment);

        // Simulate mobile money processing
        // In a real implementation, this would integrate with MTN/Orange APIs
        try {
            // Simulate processing delay
            Thread.sleep(2000);
            
            // For demo purposes, randomly succeed or fail
            boolean success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setTransactionId(generateMobileMoneyTransactionId(provider));
                
                // Update order status if payment is for an order
                if (payment.getOrder() != null) {
                    Order order = payment.getOrder();
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                }
                
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setDescription(payment.getDescription() + " - Payment failed");
            }
            
            paymentRepository.save(payment);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
        
        return payment;
    }

    public Payment confirmPayment(UUID paymentId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Payment cannot be confirmed in current status: " + payment.getStatus());
        }

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        
        // Update order status if payment is for an order
        if (payment.getOrder() != null) {
            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return paymentRepository.save(payment);
    }

    public Payment cancelPayment(UUID paymentId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed payment");
        }

        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        return paymentRepository.save(payment);
    }

    public Map<String, Object> getPaymentStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total payments
        long totalPayments = paymentRepository.count();
        stats.put("totalPayments", totalPayments);
        
        // Payments by status
        Map<String, Long> paymentsByStatus = new HashMap<>();
        for (Payment.PaymentStatus status : Payment.PaymentStatus.values()) {
            long count = paymentRepository.findByStatus(status).size();
            paymentsByStatus.put(status.name(), count);
        }
        stats.put("paymentsByStatus", paymentsByStatus);
        
        // Total revenue (completed payments only)
        List<Payment> completedPayments = paymentRepository.findByStatus(Payment.PaymentStatus.COMPLETED);
        BigDecimal totalRevenue = completedPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", totalRevenue);
        
        // Recent payments
        List<Payment> recentPayments = paymentRepository.findRecentSuccessfulPayments();
        stats.put("recentPayments", recentPayments.size() > 10 ? recentPayments.subList(0, 10) : recentPayments);
        
        return stats;
    }

    private String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateMobileMoneyTransactionId(String provider) {
        String prefix = provider.equals("MTN") ? "MTN_" : "ORG_";
        return prefix + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    // Business methods
    public void processPayment(UUID paymentId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in pending status");
        }

        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        // Simulate payment processing
        // In real implementation, this would integrate with payment gateways
    }

    public void refundPayment(UUID paymentId) {
        Payment payment = getPaymentById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Only completed payments can be refunded");
        }

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);
    }
}
