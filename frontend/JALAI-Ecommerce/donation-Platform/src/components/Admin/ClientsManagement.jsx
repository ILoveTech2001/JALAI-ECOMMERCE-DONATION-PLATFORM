import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import apiService from '../../services/apiService';

const ClientsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage] = useState(0);
  const [, setTotalPages] = useState(0);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllClients(currentPage, 10);

        if (response.content) {
          setClients(response.content);
          setTotalPages(response.totalPages);
        } else {
          setClients(response);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setError('Failed to load clients');

        // Fallback to dummy data if API fails
        setClients([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+237 123 456 789',
      location: 'Douala, Cameroon',
      password: '********',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 45000,
      status: 'active',
      lastLogin: '2024-01-20'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+237 987 654 321',
      location: 'Yaoundé, Cameroon',
      password: '********',
      joinDate: '2024-01-10',
      totalOrders: 8,
      totalSpent: 32000,
      status: 'active',
      lastLogin: '2024-01-19'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phone: '+237 555 123 456',
      location: 'Bamenda, Cameroon',
      password: '********',
      joinDate: '2024-01-05',
      totalOrders: 15,
      totalSpent: 67000,
      status: 'inactive',
      lastLogin: '2024-01-15'
    },
    {
      id: 4,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      phone: '+237 444 789 123',
      location: 'Garoua, Cameroon',
      password: '********',
      joinDate: '2023-12-20',
      totalOrders: 25,
      totalSpent: 89000,
      status: 'active',
      lastLogin: '2024-01-21'
    }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [currentPage]);

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectClient = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await apiService.deleteClient(clientId);
        setClients(prev => prev.filter(client => client.id !== clientId));
        setSelectedClients(prev => prev.filter(id => id !== clientId));
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) {
      try {
        // Delete clients one by one (could be optimized with bulk delete API)
        await Promise.all(selectedClients.map(id => apiService.deleteClient(id)));
        setClients(prev => prev.filter(client => !selectedClients.includes(client.id)));
        setSelectedClients([]);
      } catch (error) {
        console.error('Failed to delete clients:', error);
        alert('Failed to delete some clients. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Clients Management</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage all registered clients</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients..."
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
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedClients.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedClients.length} client(s) selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete Selected
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                Export Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading clients...</span>
          </div>
        </div>
      ) : (
        /* Clients Table/Cards */
        <>
          {isMobile ? (
            /* Mobile Card View */
            <div className="space-y-4">
              {filteredClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleSelectClient(client.id)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-3"
                  />
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {client.id}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {client.location}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Orders: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{client.totalOrders}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Spent: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{client.totalSpent.toLocaleString()} XAF</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-2">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-800 dark:text-green-400 p-2">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
            </div>
          ) : (
        /* Desktop Table View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleSelectClient(client.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                      </div>
                      <div className="ml-2 md:ml-4">
                        <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {client.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {client.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {client.totalOrders}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {client.totalSpent.toLocaleString()} XAF
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800 dark:text-green-400">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </>
      )}

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 sm:px-6">
          <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
            <div className={`text-xs md:text-sm text-gray-700 dark:text-gray-300 ${isMobile ? 'order-2' : ''}`}>
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredClients.length}</span> of{' '}
              <span className="font-medium">{clients.length}</span> results
            </div>
            <div className={`flex gap-2 ${isMobile ? 'order-1' : ''}`}>
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

export default ClientsManagement;
