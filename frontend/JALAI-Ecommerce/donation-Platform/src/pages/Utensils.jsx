import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ViewProductDetails from "../components/ViewProductDetails";

const utensils = [
  { image: "green-gown.jpeg", title: "Green Gown", price: 8000 },
  { image: "classic-dress.jpg", title: "Classic Dress", price: 12000 },
  { image: "summer-wear.jpg", title: "Summer Wear", price: 6500 },
  { image: "elegant-outfit.jpg", title: "Elegant Outfit", price: 15000 },
  // Add more as needed
];

const Utensil = ({
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleAddProductToCart = (product) => {
    handleAddToCart(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Get all your home utensils
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {utensils.map((prod, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
            >
              <img
                src={prod.image}
                alt={prod.title}
                className="w-32 h-40 object-cover rounded mb-3"
              />
              <h3 className="font-semibold text-lg mb-1">{prod.title}</h3>
              <p className="text-green-700 font-bold mb-2">
                {prod.price.toLocaleString()} XAF
              </p>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                  onClick={() => handleViewProduct(prod)}
                >
                  View More
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                  onClick={() => handleAddProductToCart(prod)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* Product Details Modal */}
      <ViewProductDetails
        open={showDetails}
        onClose={() => setShowDetails(false)}
        product={selectedProduct}
      />
      <Footer />
    </div>
  );
};

export default Utensil;