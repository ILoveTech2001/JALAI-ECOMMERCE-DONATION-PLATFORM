// src/components/ReviewForm.jsx
import React, { useState } from "react";

const ReviewForm = ({ onSubmit, loading = false }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmit({ rating, comment });
    setRating(5);
    setComment("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow-md border border-gray-200 w-full max-w-md"
    >
      <h2 className="text-xl font-semibold text-green-700 mb-4">Leave a Review</h2>

      <label className="block mb-2 text-sm font-medium text-gray-700">Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(parseInt(e.target.value))}
        className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {[5, 4, 3, 2, 1].map((val) => (
          <option key={val} value={val}>{val} Star{val > 1 ? "s" : ""}</option>
        ))}
      </select>

      <label className="block mb-2 text-sm font-medium text-gray-700">Your Comment</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="4"
        placeholder="Write your experience..."
        className="w-full p-2 border rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
      ></textarea>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700 transition"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
