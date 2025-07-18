package com.example.jalai_backend.controller;

import com.example.jalai_backend.model.Cart;
import com.example.jalai_backend.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('CLIENT')")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{clientId}")
    public ResponseEntity<?> getCartItems(@PathVariable UUID clientId) {
        try {
            List<Cart> cartItems = cartService.getCartItemsByClient(clientId);
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        try {
            Cart cartItem = cartService.addToCart(
                request.getClientId(), 
                request.getProductId(), 
                request.getQuantity()
            );
            return ResponseEntity.ok(cartItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@Valid @RequestBody UpdateCartRequest request) {
        try {
            Cart cartItem = cartService.updateCartItemQuantity(
                request.getClientId(), 
                request.getProductId(), 
                request.getQuantity()
            );
            return ResponseEntity.ok(cartItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(@RequestParam UUID clientId, @RequestParam UUID productId) {
        try {
            cartService.removeFromCart(clientId, productId);
            return ResponseEntity.ok(new MessageResponse("Item removed from cart successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear/{clientId}")
    public ResponseEntity<?> clearCart(@PathVariable UUID clientId) {
        try {
            cartService.clearCart(clientId);
            return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/total/{clientId}")
    public ResponseEntity<?> getCartTotal(@PathVariable UUID clientId) {
        try {
            BigDecimal total = cartService.calculateCartTotal(clientId);
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/count/{clientId}")
    public ResponseEntity<?> getCartItemCount(@PathVariable UUID clientId) {
        try {
            Long count = cartService.getCartItemCount(clientId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkProductInCart(@RequestParam UUID clientId, @RequestParam UUID productId) {
        try {
            boolean inCart = cartService.isProductInCart(clientId, productId);
            return ResponseEntity.ok(Map.of("inCart", inCart));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout/{clientId}")
    public ResponseEntity<?> checkout(@PathVariable UUID clientId) {
        try {
            cartService.checkOut(clientId);
            return ResponseEntity.ok(new MessageResponse("Checkout completed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/validate/{clientId}")
    public ResponseEntity<?> validateCart(@PathVariable UUID clientId) {
        try {
            cartService.validateCartForCheckout(clientId);
            return ResponseEntity.ok(new MessageResponse("Cart is valid for checkout"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // DTOs
    public static class AddToCartRequest {
        private UUID clientId;
        private UUID productId;
        private Integer quantity;

        public UUID getClientId() { return clientId; }
        public void setClientId(UUID clientId) { this.clientId = clientId; }
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartRequest {
        private UUID clientId;
        private UUID productId;
        private Integer quantity;

        public UUID getClientId() { return clientId; }
        public void setClientId(UUID clientId) { this.clientId = clientId; }
        public UUID getProductId() { return productId; }
        public void setProductId(UUID productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
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
