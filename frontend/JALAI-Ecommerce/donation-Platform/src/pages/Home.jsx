import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cart from "../components/Cart";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PaymentModal from "../components/PaymentModal";
// Import your card components
import CategoryCard from "../components/ProductCard";
import ReviewCard from "../components/ReviewCard";
import ViewProductDetails from "../components/ViewProductDetails";
import apiService from "../services/apiService";
import { normalizePrice } from "../utils/priceUtils";
import SEOHead, { SEOConfigs } from "../components/SEO/SEOHead";
// You can use Lucide, Heroicons, or SVGs for icons. Here are SVGs for simplicity:
const CartIcon = () => (
  <svg
    className="w-7 h-7 text-blue-600"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6" />
  </svg>
);
const UserIcon = () => (
  <svg
    className="w-7 h-7 text-blue-600"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
  </svg>
);

const categoryProducts = [
  { image: "green-gown.jpeg", title: "Green Gown", stars: 5 },
  { image: "green-gown.jpeg", title: "Classic Dress", stars: 4 },
  { image: "green-gown.jpeg", title: "Summer Wear", stars: 5 },
  { image: "green-gown.jpeg", title: "Summer Wear", stars: 5 }
];

const furnitureProducts = [
  { image: "/sofa-image.jpg", title: "Modern Sofa", stars: 5 },
  { image: "/sofa-image.jpg", title: "Classic Couch", stars: 4 },
  { image: "/sofa-image.jpg", title: "Luxury Sofa", stars: 5 },
  { image: "/sofa-image.jpg", title: "Comfy Seat", stars: 4 },
];

const reviewData = [
  {
    name: "Jane Doe",
    image: "/man1.avif",
    review: "Great platform! I found exactly what I needed.",
    stars: 5,
  },
  {
    name: "John Smith",
    image: "/lady2.jpg",
    review: "Easy to use and very helpful for donations.",
    stars: 4,
  },
  {
    name: "Mary Lee",
    image: "/lady1.webp",
    review: "Fast delivery and friendly sellers!",
    stars: 5,
  },
  {
    name: "Ahmed Musa",
    image: "/man2.jpg",
    review: "Highly recommend JALAI for everyone.",
    stars: 5,
  },
];

const heroSlides = [
  {
    bg: "bg-gradient-to-r from-green-100 via-blue-50 to-white",
    image: "/hand-shake.jpg",
    title: "Buy & Sell Pre-owned Items in Cameroon | Quality Electronics, Clothing & Furniture",
    subtitle: "Connect with buyers and sellers across Cameroon. Secure Mobile Money payments, quality products, and trusted transactions on JALAI marketplace.",
    buttons: [
      {
        label: "Start Selling",
        style: "bg-green-600 hover:bg-green-700",
        onClick: () => alert("Sell Now clicked!"),
      },
      {
        label: "Shop Now",
        style: "bg-blue-600 hover:bg-blue-700",
        onClick: () => alert("Buy Now clicked!"),
      },
    ],
  },
  {
    bg: "bg-gradient-to-r from-blue-100 via-green-50 to-white",
    image: "/kids-smiling.jpeg",
    title: "Support Orphanages in Cameroon | Make a Difference with Your Donations",
    subtitle: "Help children in need by donating to verified orphanages across Cameroon. Cash donations, item donations, and direct support - all with secure Mobile Money payments.",
    buttons: [
      {
        label: "Donate Now",
        style: "bg-yellow-500 hover:bg-yellow-600",
        onClick: () => alert("Donate Now clicked!"),
      },
      {
        label: "View Orphanages",
        style: "bg-purple-600 hover:bg-purple-700",
        onClick: () => alert("View Orphanages clicked!"),
      },
    ],
  },
];

function useReviewsPerSlide() {
  const [reviewsPerSlide, setReviewsPerSlide] = useState(getReviewsPerSlide());

  function getReviewsPerSlide() {
    if (window.innerWidth < 640) return 1; // mobile
    if (window.innerWidth < 1024) return 2; // tablet
    return 3; // desktop
  }

  useEffect(() => {
    function handleResize() {
      setReviewsPerSlide(getReviewsPerSlide());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return reviewsPerSlide;
}

const Home = ({
  cartItems,
  setCartItems,
  cartOpen,
  setCartOpen,
  handleAddToCart,
  handleRemoveFromCart,
  handleCartClick,
  handleProfileClick,
  user,
  onLogout,
}) => {

  // Example handlers for product actions
  const handleViewProduct = (product) => {
    // Product is already passed as an object, no need to search
    setSelectedProduct(product);
    setShowDetails(true);
  };

  // Payment handlers
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!user) {
      alert("Please log in to proceed with checkout");
      return;
    }

    // Debug cart items and total
    console.log("Cart items for checkout:", cartItems);
    console.log("Cart items count:", cartItems.length);

    cartItems.forEach((item, index) => {
      console.log(`Cart item ${index}:`, {
        id: item.id,
        name: item.name || item.title,
        price: item.price,
        priceType: typeof item.price,
        quantity: item.quantity,
        normalizedPrice: normalizePrice(item.price)
      });
    });

    const total = cartItems.reduce((sum, item) => {
      const price = normalizePrice(item.price);
      const quantity = item.quantity || 1;
      console.log(`Item: ${item.name || item.title}, Price: ${price}, Quantity: ${quantity}, Subtotal: ${price * quantity}`);
      return sum + (price * quantity);
    }, 0);
    console.log("Calculated total:", total);

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (orderData) => {
    try {
      if (!user) {
        throw new Error('User not logged in');
      }

      console.log('Starting payment success flow...');
      console.log('Cart items before order creation:', cartItems);

      // First, ensure all cart items are in the backend cart
      console.log('Syncing cart items to backend...');
      for (const item of cartItems) {
        try {
          await apiService.addToCart(user.id, item.id, item.quantity || 1);
          console.log(`Added item ${item.id} to backend cart`);
        } catch (error) {
          console.warn(`Failed to add item ${item.id} to backend cart:`, error);
        }
      }

      // Create order in backend
      console.log('Creating order from backend cart...');
      // Format date as ISO string for LocalDateTime compatibility
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 1); // Set delivery for tomorrow
      const formattedDate = deliveryDate.toISOString().slice(0, 19); // Remove 'Z' and milliseconds

      console.log('Delivery date formatted:', formattedDate);
      console.log('User ID:', user.id);
      console.log('User ID type:', typeof user.id);

      const response = await apiService.createOrderFromCart(user.id, formattedDate);

      if (response) {
        // Add order to local state (if needed)
        const newOrder = {
          id: response.id || Date.now(),
          items: cartItems,
          totalAmount: cartItems.reduce((sum, item) => sum + (normalizePrice(item.price) * item.quantity), 0),
          date: new Date().toISOString().split("T")[0],
          status: "Confirmed",
          paymentMethod: orderData.paymentMethod,
          phoneNumber: orderData.phoneNumber
        };

        // Clear cart after successful order
        setCartItems([]);

        console.log("Order created successfully:", newOrder);
        alert("Order placed successfully! You will receive updates via notifications.");
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error.message}. Please try again.`);
    } finally {
      setShowPaymentModal(false);
    }
  };

  const [slide, setSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Real product data from API
  const [clothingProducts, setClothingProducts] = useState([]);
  const [footwearProducts, setFootwearProducts] = useState([]);
  const [utensilsProducts, setUtensilsProducts] = useState([]);
  const [electronicsProducts, setElectronicsProducts] = useState([]);
  const [furnitureProducts, setFurnitureProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewSlide, setReviewSlide] = useState(0);
  const reviewsPerSlide = useReviewsPerSlide();
  const totalSlides = Math.ceil(reviewData.length / reviewsPerSlide);
  const currentReviews = reviewData.slice(
    reviewSlide * reviewsPerSlide,
    reviewSlide * reviewsPerSlide + reviewsPerSlide
  );

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [slide]);

  // Fetch products by categories
  useEffect(() => {
    const fetchProductsByCategories = async () => {
      // Prevent excessive API calls - only fetch if not fetched recently
      const lastHomeFetch = sessionStorage.getItem('lastHomeFetch');
      const now = Date.now();
      if (lastHomeFetch && (now - parseInt(lastHomeFetch)) < 60000) { // 1 minute cooldown
        return;
      }

      setLoading(true);
      try {
        const categories = ['Clothing', 'Footwear', 'Utensils', 'Electronics', 'Furniture'];

        const [clothing, footwear, utensils, electronics, furniture] = await Promise.all([
          apiService.getApprovedProductsByCategory('Clothing', 0, 4),
          apiService.getApprovedProductsByCategory('Footwear', 0, 4),
          apiService.getApprovedProductsByCategory('Utensils', 0, 4),
          apiService.getApprovedProductsByCategory('Electronics', 0, 4),
          apiService.getApprovedProductsByCategory('Furniture', 0, 4)
        ]);

        setClothingProducts(clothing.content || []);
        setFootwearProducts(footwear.content || []);
        setUtensilsProducts(utensils.content || []);
        setElectronicsProducts(electronics.content || []);
        setFurnitureProducts(furniture.content || []);

        // Mark successful fetch
        sessionStorage.setItem('lastHomeFetch', now.toString());
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Keep empty arrays as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategories();
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      <SEOHead {...SEOConfigs.home} />

      {/* NAVBAR */}
      <Header
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        handleAddToCart={handleAddToCart}
        handleRemoveFromCart={handleRemoveFromCart}
        handleCartClick={handleCartClick}
        handleProfileClick={handleProfileClick}
        user={user}
        onLogout={onLogout}
      />

      {/* PAGE CONTENT WITH MARGIN */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">

        {/* HERO SLIDER SECTION */}
        <section
          className={`relative rounded-xl overflow-hidden mb-8 ${heroSlides[slide].bg} transition-colors duration-700`}
        >
          <div className="flex flex-col md:flex-row items-center min-h-[400px]">
            {/* Left: Text */}
            <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-snug drop-shadow-lg">
                {heroSlides[slide].title}
              </h1>
              {heroSlides[slide].subtitle && (
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {heroSlides[slide].subtitle}
                </p>
              )}
              <div className="flex gap-4 mb-4 flex-wrap">
                {heroSlides[slide].buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    className={`text-white px-7 py-3 rounded shadow-lg font-semibold transition ${btn.style}`}
                    onClick={btn.onClick}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Right: Image */}
            <div className="flex-1 flex justify-center items-center p-4">
              <div className="relative w-[300px] h-[320px] md:w-[350px] md:h-[380px]">
                {/* The image with blend mode */}
                <img
                  src={heroSlides[slide].image}
                  alt={slide === 0 ? "People buying and selling pre-owned items in Cameroon marketplace" : "Children smiling at orphanage in Cameroon receiving donations"}
                  className="w-full h-full object-cover rounded-xl mix-blend-multiply opacity-90 transition-all duration-700"
                  style={{ background: "transparent" }}
                  loading="eager"
                />
                {/* Optional: a subtle overlay for extra blending */}
                <div className="absolute inset-0 rounded-xl bg-white/30 pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Slider Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                className={`w-4 h-4 rounded-full border-2 border-green-600 ${
                  slide === idx ? "bg-green-600" : "bg-white"
                } transition`}
                onClick={() => setSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="text-center py-10 px-6 bg-white rounded-xl mt-8">
          <p className="max-w-xl mx-auto text-gray-600 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua...
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-green-700">
              Explore Now
            </button>
          </div>
        </section>

        {/* CATEGORY PREVIEW SECTIONS */}
        <section className="px-0 py-10">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Clothing Section */}
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Clothing
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {clothingProducts.length > 0 ? (
                  clothingProducts.map((prod) => (
                    <CategoryCard
                      key={prod.id}
                      image={prod.imageUrlThumbnail || "/placeholder-product.jpg"}
                      title={prod.name}
                      price={prod.price}
                      onView={() => handleViewProduct(prod)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No clothing products available yet
                  </div>
                )}
              </div>

              {/* Footwear Section */}
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Footwear
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {footwearProducts.length > 0 ? (
                  footwearProducts.map((prod) => (
                    <CategoryCard
                      key={prod.id}
                      image={prod.imageUrlThumbnail || "/placeholder-product.jpg"}
                      title={prod.name}
                      price={prod.price}
                      onView={() => handleViewProduct(prod)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No footwear products available yet
                  </div>
                )}
              </div>

              {/* Utensils Section */}
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Utensils
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {utensilsProducts.length > 0 ? (
                  utensilsProducts.map((prod) => (
                    <CategoryCard
                      key={prod.id}
                      image={prod.imageUrlThumbnail || "/placeholder-product.jpg"}
                      title={prod.name}
                      price={prod.price}
                      onView={() => handleViewProduct(prod)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No utensils products available yet
                  </div>
                )}
              </div>

              {/* Electronics Section */}
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Electronics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {electronicsProducts.length > 0 ? (
                  electronicsProducts.map((prod) => (
                    <CategoryCard
                      key={prod.id}
                      image={prod.imageUrlThumbnail || "/placeholder-product.jpg"}
                      title={prod.name}
                      price={prod.price}
                      onView={() => handleViewProduct(prod)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No electronics products available yet
                  </div>
                )}
              </div>

              {/* Furniture Section */}
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Furniture
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {furnitureProducts.length > 0 ? (
                  furnitureProducts.map((prod) => (
                    <CategoryCard
                      key={prod.id}
                      image={prod.imageUrlThumbnail || "/placeholder-product.jpg"}
                      title={prod.name}
                      price={prod.price}
                      onView={() => handleViewProduct(prod)}
                      onAddToCart={() => handleAddToCart(prod)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No furniture products available yet
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {/* CUSTOMER REVIEWS */}
        <section className="bg-gray-100 px-6 py-10 rounded-xl">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">
            Customer Reviews
          </h3>
          <div className="relative flex items-center justify-center">
            {/* Prev Button */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-green-100"
              onClick={() => setReviewSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
              aria-label="Previous review"
            >
              &#8592;
            </button>
            {/* Reviews */}
            <div className="flex gap-6 w-full justify-center">
              {currentReviews.map((review, idx) => (
                <ReviewCard key={idx} {...review} />
              ))}
            </div>
            {/* Next Button */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full shadow p-2 hover:bg-green-100"
              onClick={() => setReviewSlide((prev) => (prev + 1) % totalSlides)}
              aria-label="Next review"
            >
              &#8594;
            </button>
          </div>
          {/* Dots */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${reviewSlide === idx ? "bg-green-600" : "bg-gray-300"}`}
                onClick={() => setReviewSlide(idx)}
                aria-label={`Go to review slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Product Details Popup */}
      <ViewProductDetails
        open={showDetails}
        onClose={() => setShowDetails(false)}
        product={selectedProduct}
      />
      {/* Cart Popup */}
      <Cart
        open={cartOpen}
        items={cartItems}
        onRemove={handleRemoveFromCart}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartTotal={cartItems.reduce((total, item) => {
          const price = normalizePrice(item.price);
          const quantity = item.quantity || 1;
          const subtotal = price * quantity;
          console.log(`PaymentModal calc - Item: ${item.name}, Price: ${price}, Quantity: ${quantity}, Subtotal: ${subtotal}`);
          return total + subtotal;
        }, 0)}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        user={user}
      />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
