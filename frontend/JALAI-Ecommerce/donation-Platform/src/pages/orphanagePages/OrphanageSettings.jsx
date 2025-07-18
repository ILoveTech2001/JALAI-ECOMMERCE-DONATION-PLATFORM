// src/pages/OrphanageSettings.jsx
import React, { useState } from 'react';
import Sidebar from "../../components/Orphanage/sidebar";

const OrphanageSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect this to backend to update orphanage info
    console.log('Updated details:', formData);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Orphanage Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter orphanage name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Contact Number</label>
              <input
                type="text"
                name="contact"
                placeholder="Enter phone number"
                value={formData.contact}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition duration-300"
            >
              Update Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrphanageSettings;
