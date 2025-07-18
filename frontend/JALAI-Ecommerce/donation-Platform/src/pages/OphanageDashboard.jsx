import React, { useEffect, useState } from "react";
import Sidebar from "../components/Orphanage/sidebar";
// import axios from "axios"; // Uncomment when connecting to backend

const OrphanageDashboard = () => {
  // Example state for summary stats
  const [stats, setStats] = useState({
    totalCashDonations: 0,
    totalKindDonations: 0,
    totalRequests: 0,
    pendingMessages: 0,
  });

  // State for donation requests
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch stats and requests from backend
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual API calls when backend is ready
      // const statsResponse = await apiService.getOrphanageStats()
      // const requestsResponse = await apiService.getOrphanageRequests()

      // For now, set empty/zero values (no dummy data)
      setStats({
        totalCashDonations: 0,
        totalKindDonations: 0,
        totalRequests: 0,
        pendingMessages: 0,
      })
      setRequests([])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-64 transition-all">
        {/* Topbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-40 md:w-72 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600 hover:text-green-600 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              HO
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-green-600 font-bold text-lg mb-1">
              Cash Donations
            </span>
            <span className="text-3xl font-extrabold">
              {stats.totalCashDonations}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-green-600 font-bold text-lg mb-1">
              Kind Donations
            </span>
            <span className="text-3xl font-extrabold">
              {stats.totalKindDonations}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-green-600 font-bold text-lg mb-1">Requests</span>
            <span className="text-3xl font-extrabold">
              {stats.totalRequests}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-green-600 font-bold text-lg mb-1">
              Pending Messages
            </span>
            <span className="text-3xl font-extrabold">
              {stats.pendingMessages}
            </span>
          </div>
        </div>

        {/* Pending requests */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow border border-gray-200 mb-6 overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Pending Requests
          </h3>
          <ul className="space-y-4 min-w-[300px]">
            {requests.map((req, index) => (
              <li
                key={index}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-2 border-gray-100 gap-2"
              >
                <div>
                  <p className="font-semibold text-gray-800">{req.name}</p>
                  <p className="text-sm text-gray-500">{req.details}</p>
                </div>
                <div className="space-x-2 flex">
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    Accept
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-right mt-4">
            <a
              href="#"
              className="text-green-600 text-sm hover:underline"
            >
              See more
            </a>
          </div>
        </div>

        {/* Donation charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Cash Donation Rate
            </h4>
            <div className="h-32 bg-green-100 flex items-end gap-2 p-2">
              <div className="w-6 h-12 bg-green-600 rounded-sm"></div>
              <div className="w-6 h-20 bg-green-500 rounded-sm"></div>
              <div className="w-6 h-16 bg-green-400 rounded-sm"></div>
              <div className="w-6 h-10 bg-green-300 rounded-sm"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Kind Donation Rate
            </h4>
            <div className="h-32 bg-green-100 flex items-end gap-2 p-2">
              <div className="w-6 h-10 bg-green-600 rounded-sm"></div>
              <div className="w-6 h-16 bg-green-500 rounded-sm"></div>
              <div className="w-6 h-20 bg-green-400 rounded-sm"></div>
              <div className="w-6 h-12 bg-green-300 rounded-sm"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrphanageDashboard;
