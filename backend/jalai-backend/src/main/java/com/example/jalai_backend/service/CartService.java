package com.example.jalai_backend.service;

import com.example.jalai_backend.model.Cart;
import com.example.jalai_backend.model.Client;
import com.example.jalai_backend.model.Product;
import com.example.jalai_backend.repository.CartRepository;
import com.example.jalai_backend.repository.ClientRepository;
import com.example.jalai_backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Cart> getCartItemsByClient(UUID clientId) {
        return cartRepository.findByClientId(clientId);
    }

    public Cart addToCart(UUID clientId, UUID productId, Integer quantity) {
        // Validate client
        Client client = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found with id: " + clientId));

        // Validate product
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Check if product is available
        if (!product.getIsAvailable() || !product.getIsApproved()) {
            throw new RuntimeException("Product is not available for purchase");
        }

        // Check if item already exists in cart
        Optional<Cart> existingCartItem = cartRepository.findByClientIdAndProductId(clientId, productId);
        
        if (existingCartItem.isPresent()) {
            // Update quantity
            Cart cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartRepository.save(cartItem);
        } else {
            // Create new cart item
            Cart cartItem = new Cart();
            cartItem.setClient(client);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setProductPrice(product.getPrice());
            return cartRepository.save(cartItem);
        }
    }

    public Cart updateCartItemQuantity(UUID clientId, UUID productId, Integer quantity) {
        Cart cartItem = cartRepository.findByClientIdAndProductId(clientId, productId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }

    public void removeFromCart(UUID clientId, UUID productId) {
        if (!cartRepository.existsByClientIdAndProductId(clientId, productId)) {
            throw new RuntimeException("Cart item not found");
        }
        cartRepository.deleteByClientIdAndProductId(clientId, productId);
    }

    public void clearCart(UUID clientId) {
        cartRepository.deleteByClientId(clientId);
    }

    public BigDecimal calculateCartTotal(UUID clientId) {
        BigDecimal total = cartRepository.calculateTotalCartValue(clientId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Long getCartItemCount(UUID clientId) {
        Long count = cartRepository.countTotalItemsInCart(clientId);
        return count != null ? count : 0L;
    }

    public boolean isProductInCart(UUID clientId, UUID productId) {
        return cartRepository.existsByClientIdAndProductId(clientId, productId);
    }

    public List<Cart> getCartItemsByProduct(UUID productId) {
        return cartRepository.findByProductId(productId);
    }

    public List<Cart> getCartItemsWithHighQuantity(Integer minQuantity) {
        return cartRepository.findByQuantityGreaterThan(minQuantity);
    }

    public void updateCartItemQuantityDirect(UUID clientId, UUID productId, Integer quantity) {
        cartRepository.updateQuantity(clientId, productId, quantity);
    }

    // Business methods implementation
    public void addCart(UUID clientId, UUID productId, Integer quantity) {
        addToCart(clientId, productId, quantity);
    }

    public void removeFromCart(UUID cartItemId) {
        Cart cartItem = cartRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));
        
        cartRepository.delete(cartItem);
    }

    public List<Cart> viewCart(UUID clientId) {
        return getCartItemsByClient(clientId);
    }

    public void checkOut(UUID clientId) {
        List<Cart> cartItems = getCartItemsByClient(clientId);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Validate all products are still available
        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (!product.getIsAvailable() || !product.getIsApproved()) {
                throw new RuntimeException("Product " + product.getName() + " is no longer available");
            }
        }

        // Business logic for checkout would go here
        // This would typically create an order and clear the cart
        // For now, just clear the cart
        clearCart(clientId);
    }

    public Cart getCartItem(UUID cartItemId) {
        return cartRepository.findById(cartItemId)
            .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));
    }

    public boolean hasCartItems(UUID clientId) {
        return !getCartItemsByClient(clientId).isEmpty();
    }

    public void validateCartForCheckout(UUID clientId) {
        List<Cart> cartItems = getCartItemsByClient(clientId);
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (!product.getIsAvailable() || !product.getIsApproved()) {
                throw new RuntimeException("Product " + product.getName() + " is no longer available");
            }
        }
    }
}
