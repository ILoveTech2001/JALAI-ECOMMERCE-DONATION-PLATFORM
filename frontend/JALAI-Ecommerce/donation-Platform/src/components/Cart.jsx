import React from "react";
import { normalizePrice, calculateTotal, formatPrice } from "../utils/priceUtils";

const Cart = ({ open, items, onRemove, onClose, onCheckout, user }) => {
  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-lg w-80 max-h-[80vh] overflow-y-auto border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-bold">Your Cart</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No items in cart.</div>
      ) : (
        <>
          <ul className="divide-y">
            {items.map((item, idx) => {
              // Handle both frontend and backend product data formats
              const itemImage = item.image || item.imageUrlThumbnail || "/placeholder.jpg";
              const itemTitle = item.title || item.name || "Unknown Product";
              // Use utility function to normalize price
              const itemPrice = normalizePrice(item.price);

              return (
                <li key={idx} className="flex items-center gap-3 p-4">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{itemTitle}</div>
                    <div className="text-green-700 font-bold">{formatPrice(itemPrice)}</div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={() => onRemove(item)}
                    title="Remove"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-600">
                {formatPrice(calculateTotal(items))}
              </span>
            </div>
            <button
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
              onClick={() => onCheckout(user)}
            >
              Proceed to Checkout
            </button>
            {!user && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                You'll be asked to create an account to complete your purchase
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;