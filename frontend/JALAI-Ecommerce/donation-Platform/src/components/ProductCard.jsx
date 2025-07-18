const ProductCard = ({ image, title, price, onView, onAddToCart }) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <img
        src={image}
        alt={title}
        className="w-32 h-32 object-cover rounded mb-3"
        onError={(e) => {
          e.target.src = "/placeholder-product.jpg";
        }}
      />
      <h4 className="font-semibold mb-2 text-center">{title}</h4>
      {price && (
        <p className="text-green-600 font-bold mb-2">{Number(price).toLocaleString()} XAF</p>
      )}
      <div className="flex gap-2">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          onClick={onView}
        >
          View Product
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          onClick={onAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
  
  export default ProductCard;
