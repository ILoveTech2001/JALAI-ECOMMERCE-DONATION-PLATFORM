import React, { useState } from "react";
import Sidebar from "../../components/Orphanage/sidebar";

const OrphanageReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiService.getOrphanageReviews(orphanageId)
      // setReviews(response || [])

      // For now, set empty array (no dummy data)
      setReviews([])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-64 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Donator Reviews</h2>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Reviews</h3>
          <ul className="space-y-6">
            {reviews.length === 0 && (
              <li className="text-gray-500">No reviews yet.</li>
            )}
            {reviews.map((review) => (
              <li key={review.id} className="border-b pb-4 border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <p className="font-semibold text-green-700">{review.name}</p>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-xs text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default OrphanageReviews;