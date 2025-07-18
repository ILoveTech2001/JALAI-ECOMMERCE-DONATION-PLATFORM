import React from "react";

const ViewProductDetails = ({ open, onClose, product }) => {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left: Product Image */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-100 p-6">
          <img
            src={product.image}
            alt={product.title}
            className="w-48 h-60 object-cover rounded"
          />
        </div>
        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
            <p className="text-green-700 font-semibold mb-2">{product.price?.toLocaleString()} XAF</p>
            <p className="text-gray-600 mb-4">{product.description || "No description available."}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-green-700"
              onClick={() => alert("Added to cart!")}
            >
              Add to Cart
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-5 py-2 rounded shadow hover:bg-gray-400"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductDetails;