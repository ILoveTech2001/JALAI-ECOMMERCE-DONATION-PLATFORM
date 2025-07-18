package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Cart;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Order;

import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private CartService cartService;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(UUID orderId) {
        return orderRepository.findById(orderId);
    }

    public List<Order> getOrdersByClient(UUID clientId) {
        return orderRepository.findByClientId(clientId);
    }

    public Page<Order> getOrdersByClientWithPagination(UUID clientId, Pageable pageable) {
        return orderRepository.findByClientIdWithPagination(clientId, pageable);
    }

    public List<Order> getOrdersBySeller(UUID sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order createOrderFromCart(UUID clientId, LocalDateTime deliveryDate) {
        // Validate client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        // Get cart items
        List<Cart> cartItems = cartService.getCartItemsByClient(clientId);
        System.out.println("DEBUG: Retrieved cart items count: " + cartItems.size());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Debug cart items
        for (int i = 0; i < cartItems.size(); i++) {
            Cart item = cartItems.get(i);
            System.out.println("DEBUG: Cart item " + i + ": " + item.getId() +
                    ", quantity: " + item.getQuantity() +
                    ", price: " + item.getProductPrice());
        }

        // Validate cart for checkout
        cartService.validateCartForCheckout(clientId);

        // Calculate total amount
        BigDecimal totalAmount = cartService.calculateCartTotal(clientId);

        // For simplicity, assuming single seller per order
        // In a real scenario, you might need to create multiple orders for different
        // sellers
        Cart firstItem = cartItems.get(0);

        // Add debugging and null checks
        System.out.println("DEBUG: First cart item: " + firstItem);
        System.out.println("DEBUG: First cart item product: " + firstItem.getProduct());

        if (firstItem.getProduct() == null) {
            throw new RuntimeException("Cart item has no associated product");
        }

        Client seller = firstItem.getProduct().getSeller();
        System.out.println("DEBUG: Product seller: " + seller);

        if (seller == null) {
            throw new RuntimeException("Product has no associated seller");
        }

        // Create order
        Order order = new Order();
        order.setClient(client);
        order.setSeller(seller);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryDate(deliveryDate);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful order creation
        cartService.clearCart(clientId);

        return savedOrder;
    }

    public Order createOrder(Order order) {
        // Validate client
        if (order.getClient() == null || !clientRepository.existsById(order.getClient().getId())) {
            throw new RuntimeException("Invalid client");
        }

        // Validate seller
        if (order.getSeller() == null || !clientRepository.existsById(order.getSeller().getId())) {
            throw new RuntimeException("Invalid seller");
        }

        // Set default status if not provided
        if (order.getStatus() == null) {
            order.setStatus(Order.OrderStatus.PENDING);
        }

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(UUID orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    public Order updateOrder(UUID orderId, Order orderDetails) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        // Update allowed fields
        order.setDeliveryDate(orderDetails.getDeliveryDate());
        order.setTotalAmount(orderDetails.getTotalAmount());

        return orderRepository.save(order);
    }

    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (order.getStatus() == Order.OrderStatus.DELIVERED ||
                order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public void deleteOrder(UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found with id: " + orderId);
        }
        orderRepository.deleteById(orderId);
    }

    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByDateRange(startDate, endDate);
    }

    public List<Order> getOrdersByDeliveryDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByDeliveryDateRange(startDate, endDate);
    }

    public List<Order> getOrdersByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return orderRepository.findByTotalAmountRange(minAmount, maxAmount);
    }

    public BigDecimal calculateTotalSalesForSeller(UUID sellerId) {
        BigDecimal total = orderRepository.calculateTotalSalesForSeller(sellerId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal calculateTotalPurchasesForClient(UUID clientId) {
        BigDecimal total = orderRepository.calculateTotalPurchasesForClient(clientId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public long getOrderCountByStatus(Order.OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

    public List<Order> getRecentOrders(Pageable pageable) {
        return orderRepository.findRecentOrders(pageable);
    }

    public List<Order> getPendingOrdersOlderThan(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        return orderRepository.findPendingOrdersOlderThan(cutoffDate);
    }

    public List<Order> getOrdersForDeliveryToday() {
        return orderRepository.findOrdersForDeliveryToday(LocalDateTime.now());
    }

    public List<Object[]> getTopClientsByOrderValue() {
        return orderRepository.findTopClientsByOrderValue();
    }

    // Business methods implementation
    public Order addOrder(Order order) {
        return createOrder(order);
    }

    public List<Order> viewOrders(UUID clientId) {
        return getOrdersByClient(clientId);
    }

    public void deleteOrder(UUID orderId, UUID clientId) {
        Order order = getOrderById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify the order belongs to the client
        if (!order.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Unauthorized to delete this order");
        }

        // Only allow deletion of pending or cancelled orders
        if (order.getStatus() != Order.OrderStatus.PENDING &&
                order.getStatus() != Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot delete order with status: " + order.getStatus());
        }

        deleteOrder(orderId);
    }

    public Order trackOrder(UUID orderId) {
        return getOrderById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order confirmOrder(UUID orderId) {
        return updateOrderStatus(orderId, Order.OrderStatus.CONFIRMED);
    }

    public Order processOrder(UUID orderId) {
        return updateOrderStatus(orderId, Order.OrderStatus.PROCESSING);
    }

    public Order shipOrder(UUID orderId) {
        return updateOrderStatus(orderId, Order.OrderStatus.SHIPPED);
    }

    public Order deliverOrder(UUID orderId) {
        return updateOrderStatus(orderId, Order.OrderStatus.DELIVERED);
    }
}
