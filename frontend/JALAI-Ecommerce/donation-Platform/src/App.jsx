import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import apiService from "./services/apiService";
import { normalizeProduct, calculateTotal } from "./utils/priceUtils";
import Home from "./pages/Home";
import Clothing from "./pages/Clothing";
import Furniture from "./pages/Funitures";
import Electronics from "./pages/Electronics";
import Footwear from "./pages/Footwear";
import Utensils from "./pages/Utensils";
import OrphanageDashboard from "./pages/OphanageDashboard";
import OrphanageMessages from "./pages/OrphanageMessages";
import OrphanageReviews from "./pages/orphanagePages/OrphanageReviews";
import OrphanageSettings from "./pages/orphanagePages/OrphanageSettings";
import Cart from "./components/Cart";
import UserDashboard from "./components/User/dashboard";

// New consolidated components
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import DonationForm from "./components/DonationForm";
import Dashboard from "./components/Dashboard";
import OrphanageDetails from "./components/OrphanageDetails";
import BibleVerseScreen from "./components/BibleVerseScreen";
import ApiTest from "./components/ApiTest";
import SimpleLogin from "./components/SimpleLogin";
import SimpleLoginForm from "./components/SimpleLoginForm";
import LoginPromptModal from "./components/LoginPromptModal";
import PaymentModal from "./components/PaymentModal";

// Admin Dashboard
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminLogin from "./components/Admin/AdminLogin";


import "./assets/globals.css"; // Import global styles

// Main App Content Component that uses AuthContext
function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cart state and handlers
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Modal states
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState(null);

  // Load cart from localStorage on app start
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Dummy users data - replace with real backend integration later
  const dummyUsers = [
    { id: 1, email: "john@example.com", name: "John Doe", hasAccount: true },
    { id: 2, email: "jane@example.com", name: "Jane Smith", hasAccount: true },
    { id: 3, email: "beiashelimofor@gmail.com", name: "Beia Shelimofor", hasAccount: true },
    // Add more dummy users as needed
  ];

  const handleAddToCart = async (product) => {
    // Debug: Log the product data to see what we're working with
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Raw product:', product);
    console.log('Product price raw:', product.price);
    console.log('Product price type:', typeof product.price);
    console.log('Product price JSON:', JSON.stringify(product.price));

    // Use utility function to normalize product data
    const normalizedProductData = normalizeProduct(product);

    console.log('Normalized product:', normalizedProductData);
    console.log('=== END DEBUG ===');

    // Add to local cart state immediately for better UX
    setCartItems((prev) => [...prev, normalizedProductData]);

    // If user is logged in, also add to backend cart
    if (user && user.id) {
      try {
        await apiService.addToCart(user.id, product.id, 1);
        console.log('Product added to backend cart successfully');
      } catch (error) {
        console.error('Failed to add to backend cart:', error);
        // Don't remove from local cart if backend fails - user can still checkout
      }
    }

    alert(`Added ${normalizedProductData.title || normalizedProductData.name} to cart!`);
  };

  const handleRemoveFromCart = (item) => {
    setCartItems((prev) => prev.filter((p) => p !== item));
  };

  const handleCartClick = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to cart first.");
    } else {
      setCartOpen(true);
    }
  };

  // Global profile handling function
  const handleProfileClick = () => {
    // Check if user is logged in
    if (user) {
      // User is logged in, navigate to appropriate dashboard based on user type
      if (user.userType === 'ADMIN') {
        navigate('/admin');
      } else if (user.userType === 'ORPHANAGE') {
        navigate('/orphanage-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      // User is not logged in, check if they have an account
      // For demo purposes, we'll simulate checking if user exists
      // In real implementation, this would be handled by your authentication system

      // For now, let's assume if there are dummy users, redirect to login
      // Otherwise redirect to signup
      if (dummyUsers.length > 0) {
        // User has an account, redirect to login
        navigate('/login');
      } else {
        // User doesn't have an account, redirect to signup
        navigate('/signup');
      }
    }
  };

  // Function to handle logout using AuthContext
  const handleLogout = () => {
    logout();
  };

  // Handle checkout - check if user is logged in
  const handleCheckout = (currentUser) => {
    if (!currentUser) {
      // User not logged in, show login prompt
      setPendingCheckoutData({
        cartItems,
        cartTotal: calculateTotal(cartItems)
      });
      setShowLoginPrompt(true);
      setCartOpen(false);
    } else {
      // User is logged in, proceed to payment
      setShowPaymentModal(true);
      setCartOpen(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (orderData) => {
    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      // Create order in the backend
      console.log('Creating order with data:', orderData);

      // Create order from cart items
      const orderResponse = await apiService.createOrderFromCart(
        user.id,
        new Date().toISOString().split('T')[0] // Today's date as delivery date
      );

      console.log('Order created successfully:', orderResponse);

      // Send notification to admin about new order
      try {
        await apiService.createNotification({
          type: 'NEW_ORDER',
          title: 'New Order Received',
          message: `New order #${orderResponse.orderId || 'N/A'} received from ${user.name}. Total: ${orderData.total?.toLocaleString()} XAF`,
          recipientAdminId: null, // Send to all admins
          senderClientId: user.id,
          isRead: false
        });
        console.log('Admin notification sent successfully');
      } catch (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
        // Don't fail the order creation if notification fails
      }

      // Clear cart after successful payment
      setCartItems([]);
      localStorage.removeItem('cartItems');

      // Close payment modal
      setShowPaymentModal(false);

      alert('Payment successful! Your order has been confirmed. The admin has been notified.');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Order creation failed: ${error.message}`);
      throw error;
    }
  };

  // Handle login prompt actions
  const handleLoginPromptSignup = () => {
    setShowLoginPrompt(false);
    window.location.href = "/signup";
  };

  const handleLoginPromptLogin = () => {
    setShowLoginPrompt(false);
    window.location.href = "/login";
  };

  return (
    <>
      {/* Cart is always available */}
      <Cart
        open={cartOpen}
        items={cartItems}
        onRemove={handleRemoveFromCart}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        user={user}
      />

      <Routes>
          <Route
            path="/"
            element={
              <Home
                cartItems={cartItems}
                setCartItems={setCartItems}
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                handleAddToCart={handleAddToCart}
                handleRemoveFromCart={handleRemoveFromCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/clothing"
            element={
              <Clothing
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/furniture"
            element={
              <Furniture
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/electronics"
            element={
              <Electronics
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/footwear"
            element={
              <Footwear
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/utensils"
            element={
              <Utensils
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleCartClick={handleCartClick}
                handleProfileClick={handleProfileClick}
                user={user}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          {/* Redirect from old path to new standardized path */}
          <Route path="/userDashboard" element={<Navigate to="/user-dashboard" replace />} />

          {/* Standardized orphanage routes */}
          <Route path="/orphanage-dashboard" element={<OrphanageDashboard />} />
          <Route path="/orphanage-messages" element={<OrphanageMessages />} />
          <Route path="/orphanage-reviews" element={<OrphanageReviews />} />
          <Route path="/orphanage-settings" element={<OrphanageSettings />} />

          {/* Redirects from old paths to new standardized paths */}
          <Route path="/OrphanageDashboard" element={<Navigate to="/orphanage-dashboard" replace />} />
          <Route path="/OrphanageMessages" element={<Navigate to="/orphanage-messages" replace />} />
          <Route path="/OrphanageReviews" element={<Navigate to="/orphanage-reviews" replace />} />
          <Route path="/OrphanageSettings" element={<Navigate to="/orphanage-settings" replace />} />

          {/* Authentication and other routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/donate" element={<DonationForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orphanage/:id" element={<OrphanageDetails />} />
          <Route path="/bible-verse" element={<BibleVerseScreen />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/simple-login" element={<SimpleLogin />} />
          <Route path="/simple-login-form" element={<SimpleLoginForm />} />

          {/* Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* Login Prompt Modal */}
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          onSignup={handleLoginPromptSignup}
          onLogin={handleLoginPromptLogin}
          cartTotal={pendingCheckoutData?.cartTotal || 0}
          cartItemsCount={pendingCheckoutData?.cartItems?.length || 0}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cartTotal={calculateTotal(cartItems)}
          cartItems={cartItems}
          onPaymentSuccess={handlePaymentSuccess}
          user={user}
        />


    </>
  );
}

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
