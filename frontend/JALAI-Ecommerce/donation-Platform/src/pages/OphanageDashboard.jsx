import React, { useEffect, useState } from "react";
import Sidebar from "../components/Orphanage/sidebar";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/apiService";
import { CheckCircle, XCircle, Clock, DollarSign, Gift, Users, MessageSquare } from "lucide-react";

const OrphanageDashboard = () => {
  const { user, isOrphanage } = useAuth();

  // State for summary stats
  const [stats, setStats] = useState({
    totalCashDonations: 0,
    totalKindDonations: 0,
    totalRequests: 0,
    pendingMessages: 0,
  });

  // State for donations
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  // Fetch stats and donations from backend
  useEffect(() => {
    if (user && isOrphanage()) {
      fetchDashboardData()
    }
  }, [user, isOrphanage])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('fetchDashboardData - Starting with user:', user);

      if (!user?.id) {
        console.log('fetchDashboardData - No user ID found, throwing error');
        throw new Error('User ID not found')
      }

      console.log('fetchDashboardData - Fetching donations for orphanage:', user.id);
      // Fetch donations for this orphanage
      const donationsResponse = await apiService.getOrphanageDonations(user.id)
      console.log('fetchDashboardData - Donations response:', donationsResponse);
      setDonations(donationsResponse || [])

      console.log('fetchDashboardData - Fetching total cash donations');
      // Fetch total cash donations
      const totalCashResponse = await apiService.getTotalCashDonationsForOrphanage(user.id)
      console.log('fetchDashboardData - Total cash response:', totalCashResponse);

      // Calculate stats from donations
      const pendingDonations = donationsResponse?.filter(d => d.status === 'PENDING') || []
      const confirmedDonations = donationsResponse?.filter(d => d.status === 'CONFIRMED') || []
      const cashDonations = donationsResponse?.filter(d => d.donationType === 'CASH') || []
      const kindDonations = donationsResponse?.filter(d => d.donationType === 'KIND') || []

      setStats({
        totalCashDonations: totalCashResponse?.totalCashDonations || 0,
        totalKindDonations: kindDonations.length,
        totalRequests: pendingDonations.length,
        pendingMessages: 0, // This would come from a messages API
      })
    } catch (error) {
      console.error('fetchDashboardData - Error occurred:', error)
      console.log('fetchDashboardData - Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });

      // Check if this is an authentication error
      if (error.status === 401 || error.status === 403) {
        console.log('fetchDashboardData - Authentication/Authorization error detected');
        setError(`Access denied: ${error.message}. Please ensure your account is approved.`)
      } else {
        setError('Failed to load dashboard data')
      }
      setDonations([])
    } finally {
      console.log('fetchDashboardData - Completed, setting loading to false');
      setLoading(false)
    }
  }

  // Handle donation actions
  const handleDonationAction = async (donationId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [donationId]: true }))

      let response
      switch (action) {
        case 'confirm':
          response = await apiService.confirmDonation(donationId)
          break
        case 'reject':
          response = await apiService.rejectDonation(donationId)
          break
        case 'complete':
          response = await apiService.completeDonation(donationId)
          break
        default:
          throw new Error('Invalid action')
      }

      // Refresh the donations list
      await fetchDashboardData()

    } catch (error) {
      console.error(`Error ${action}ing donation:`, error)
      setError(`Failed to ${action} donation`)
    } finally {
      setActionLoading(prev => ({ ...prev, [donationId]: false }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Debug logging
  console.log('OrphanageDashboard - user:', user);
  console.log('OrphanageDashboard - isOrphanage():', isOrphanage());
  console.log('OrphanageDashboard - user?.userType:', user?.userType);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isOrphanage()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to orphanages.</p>
          <p className="text-sm text-gray-500 mt-2">Current user type: {user?.userType || 'None'}</p>
        </div>
      </div>
    )
  }

  // Check if orphanage is active/approved
  if (user && user.isActive === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your orphanage account has been created successfully but is currently pending approval from our administrators.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive access to the dashboard once your account is approved. This usually takes 1-2 business days.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 md:ml-64 transition-all">
        {/* Topbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'O'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <span className="text-green-600 font-bold text-sm">Cash Donations</span>
              <div className="text-2xl font-extrabold">
                ${stats.totalCashDonations}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span className="text-blue-600 font-bold text-sm">Kind Donations</span>
              <div className="text-2xl font-extrabold">
                {stats.totalKindDonations}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <span className="text-yellow-600 font-bold text-sm">Pending Requests</span>
              <div className="text-2xl font-extrabold">
                {stats.totalRequests}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <span className="text-purple-600 font-bold text-sm">Messages</span>
              <div className="text-2xl font-extrabold">
                {stats.pendingMessages}
              </div>
            </div>
          </div>
        </div>

        {/* Donations Management */}
        <div className="bg-white p-2 sm:p-4 rounded-lg shadow border border-gray-200 mb-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              Donation Requests
            </h3>
            <span className="text-sm text-gray-500">
              {donations.length} total donations
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No donations received yet</p>
            </div>
          ) : (
            <div className="space-y-4 min-w-[600px]">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4 border-gray-100 gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                        {getStatusIcon(donation.status)}
                        {donation.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {donation.donationType}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Amount:</span>
                        {donation.donationType === 'CASH'
                          ? ` $${donation.cashAmount || 0}`
                          : ` ${donation.itemDescription || 'N/A'}`
                        }
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        {donation.appointmentDate
                          ? new Date(donation.appointmentDate).toLocaleDateString()
                          : new Date(donation.createdAt).toLocaleDateString()
                        }
                      </div>
                    </div>
                  </div>

                  {donation.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDonationAction(donation.id, 'confirm')}
                        disabled={actionLoading[donation.id]}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[donation.id] ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleDonationAction(donation.id, 'reject')}
                        disabled={actionLoading[donation.id]}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[donation.id] ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}

                  {donation.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleDonationAction(donation.id, 'complete')}
                      disabled={actionLoading[donation.id]}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[donation.id] ? 'Processing...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-4">
              Donation Status Overview
            </h4>
            <div className="space-y-3">
              {[
                { status: 'PENDING', count: donations.filter(d => d.status === 'PENDING').length, color: 'bg-yellow-500' },
                { status: 'CONFIRMED', count: donations.filter(d => d.status === 'CONFIRMED').length, color: 'bg-blue-500' },
                { status: 'COMPLETED', count: donations.filter(d => d.status === 'COMPLETED').length, color: 'bg-green-500' },
                { status: 'REJECTED', count: donations.filter(d => d.status === 'REJECTED').length, color: 'bg-red-500' },
              ].map(({ status, count, color }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-sm text-gray-600">{status}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-4">
              Donation Types
            </h4>
            <div className="space-y-3">
              {[
                { type: 'CASH', count: donations.filter(d => d.donationType === 'CASH').length, color: 'bg-green-500' },
                { type: 'KIND', count: donations.filter(d => d.donationType === 'KIND').length, color: 'bg-blue-500' },
                { type: 'BOTH', count: donations.filter(d => d.donationType === 'BOTH').length, color: 'bg-purple-500' },
              ].map(({ type, count, color }) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`}></div>
                    <span className="text-sm text-gray-600">{type}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrphanageDashboard;
