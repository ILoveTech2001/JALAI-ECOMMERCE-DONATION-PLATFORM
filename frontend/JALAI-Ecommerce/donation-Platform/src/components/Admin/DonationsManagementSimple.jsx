import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Gift
} from 'lucide-react';
import apiService from '../../services/apiService';
import cacheService from '../../services/cacheService';

const DonationsManagementSimple = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch donations from backend
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching donations from API...');
      const response = await apiService.getAllDonations();
      console.log('💝 Donations API response:', response);

      // Check if response is an array and has data
      if (!Array.isArray(response)) {
        console.warn('⚠️ Donations API returned non-array:', response);
        setDonations([]);
        setError('Invalid data format received from server');
        return;
      }

      if (response.length === 0) {
        console.log('📭 No donations found in database');
        setDonations([]);
        setError(null);
        return;
      }

      // Transform backend data to match frontend expectations
      const transformedDonations = response.map(donation => ({
        id: donation.id,
        donorName: donation.client?.name || 'Anonymous Donor',
        donorEmail: donation.client?.email || 'No email',
        orphanageName: donation.orphanage?.name || 'Unknown Orphanage',
        type: donation.donationType || 'CASH',
        amount: donation.cashAmount || 0,
        itemDescription: donation.itemDescription || '',
        status: donation.status?.toLowerCase() || 'pending',
        appointmentDate: donation.appointmentDate ? new Date(donation.appointmentDate).toISOString().split('T')[0] : null,
        createdDate: donation.createdAt ? new Date(donation.createdAt).toISOString().split('T')[0] : 'Unknown',
        completedDate: donation.completedAt ? new Date(donation.completedAt).toISOString().split('T')[0] : null
      }));

      console.log('✅ Transformed donations:', transformedDonations);

      // Cache donations for 5 minutes
      cacheService.set('adminDonations', transformedDonations, 300000);
      setDonations(transformedDonations);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching donations:', error);
      setError(`Failed to load donations: ${error.message}`);

      // Always show empty state on error to avoid dummy data
      setDonations([]);

      // Clear any cached dummy data
      cacheService.clear('adminDonations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all donations</p>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {donations.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No donations found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Donations will appear here when users make donations to orphanages.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400">Donations list will be displayed here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsManagementSimple;
