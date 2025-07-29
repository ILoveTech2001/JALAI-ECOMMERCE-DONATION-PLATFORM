import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin access required</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-green-600">JALAI Admin</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'overview' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`w-full text-left px-3 py-2 rounded ${
                    activeTab === 'donations' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  💝 Donations
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeTab}</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="p-6">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Dashboard Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Total Users</h4>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Total Donations</h4>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'donations' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Donations Management</h3>
                <p className="text-gray-600 mb-4">Manage and track all donations</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">💝 No donations found</p>
                  <p className="text-sm text-gray-400 mt-2">Donations will appear here when users make donations to orphanages.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
