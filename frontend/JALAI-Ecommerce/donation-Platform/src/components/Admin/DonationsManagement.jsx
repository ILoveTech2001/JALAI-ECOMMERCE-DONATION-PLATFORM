import React, { useState } from 'react';
import { 
  Heart, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Calendar,
  User,
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const DonationsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDonations, setSelectedDonations] = useState([]);

  // Dummy donations data based on the class diagram
  const [donations, setDonations] = useState([
    {
      id: 1,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      donationType: 'monetary',
      status: 'confirmed',
      appointmentDate: '2024-01-25',
      orphanageId: 1,
      orphanageName: 'Hope Children Home',
      amount: 50000,
      donationDate: '2024-01-20',
      description: 'Monthly donation for children education',
      paymentMethod: 'Mobile Money'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      donationType: 'items',
      status: 'pending',
      appointmentDate: '2024-01-28',
      orphanageId: 2,
      orphanageName: 'Sunshine Orphanage',
      amount: 0,
      donationDate: '2024-01-22',
      description: 'Clothing and toys donation',
      paymentMethod: 'N/A'
    },
    {
      id: 3,
      userId: 3,
      userName: 'Alice Johnson',
      userEmail: 'alice.johnson@example.com',
      donationType: 'monetary',
      status: 'confirmed',
      appointmentDate: '2024-01-30',
      orphanageId: 3,
      orphanageName: 'Little Angels Home',
      amount: 75000,
      donationDate: '2024-01-18',
      description: 'Food and medical supplies funding',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 4,
      userId: 4,
      userName: 'Bob Wilson',
      userEmail: 'bob.wilson@example.com',
      donationType: 'items',
      status: 'cancelled',
      appointmentDate: null,
      orphanageId: 1,
      orphanageName: 'Hope Children Home',
      amount: 0,
      donationDate: '2024-01-15',
      description: 'Books and educational materials',
      paymentMethod: 'N/A'
    },
    {
      id: 5,
      userId: 1,
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      donationType: 'monetary',
      status: 'pending',
      appointmentDate: '2024-02-01',
      orphanageId: 2,
      orphanageName: 'Sunshine Orphanage',
      amount: 30000,
      donationDate: '2024-01-23',
      description: 'Emergency medical fund',
      paymentMethod: 'Mobile Money'
    }
  ]);

  const statusOptions = ['all', 'pending', 'confirmed', 'cancelled'];
  const typeOptions = ['all', 'monetary', 'items'];

  // Filter donations based on search, status, and type
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.orphanageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesType = filterType === 'all' || donation.donationType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectDonation = (donationId) => {
    setSelectedDonations(prev => 
      prev.includes(donationId) 
        ? prev.filter(id => id !== donationId)
        : [...prev, donationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonations.length === filteredDonations.length) {
      setSelectedDonations([]);
    } else {
      setSelectedDonations(filteredDonations.map(donation => donation.id));
    }
  };

  const handleUpdateStatus = (donationId, newStatus) => {
    setDonations(prev => prev.map(donation => 
      donation.id === donationId 
        ? { ...donation, status: newStatus }
        : donation
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    return type === 'monetary' 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  };

  // Calculate stats
  const totalDonations = donations.length;
  const totalMonetaryAmount = donations
    .filter(d => d.donationType === 'monetary' && d.status === 'confirmed')
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const confirmedDonations = donations.filter(d => d.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all donations to orphanages</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalDonations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalMonetaryAmount.toLocaleString()} XAF
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingDonations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{confirmedDonations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDonations.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedDonations.length} donation(s) selected
            </span>
            <div className="flex gap-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                Confirm Selected
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                Export Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Donations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDonations.length === filteredDonations.length && filteredDonations.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Orphanage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDonations.includes(donation.id)}
                      onChange={() => handleSelectDonation(donation.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {donation.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {donation.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-blue-500 mr-2" />
                      <div className="text-sm text-gray-900 dark:text-white">
                        {donation.orphanageName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(donation.donationType)}`}>
                        {donation.donationType}
                      </span>
                      {donation.donationType === 'monetary' && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {donation.amount.toLocaleString()} XAF
                        </div>
                      )}
                      {donation.paymentMethod !== 'N/A' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {donation.paymentMethod}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {donation.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                      {getStatusIcon(donation.status)}
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {donation.donationDate}
                    </div>
                    {donation.appointmentDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Appointment: {donation.appointmentDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </button>
                      {donation.status === 'pending' && (
                        <select
                          value={donation.status}
                          onChange={(e) => handleUpdateStatus(donation.id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredDonations.length}</span> of{' '}
              <span className="font-medium">{donations.length}</span> results
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsManagement;
