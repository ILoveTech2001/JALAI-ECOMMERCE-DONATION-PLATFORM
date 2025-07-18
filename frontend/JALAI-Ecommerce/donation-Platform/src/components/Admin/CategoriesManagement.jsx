import React, { useState, useEffect } from 'react';
import {
  Grid3X3,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  Tag
} from 'lucide-react';
import apiService from '../../services/apiService';

const CategoriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      console.log('Categories response:', response);

      // Transform backend data to match frontend expectations
      const transformedCategories = response.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || 'No description available',
        productCount: category.products ? category.products.length : 0,
        dateCreated: category.createdAt ? new Date(category.createdAt).toISOString().split('T')[0] : 'Unknown',
        status: category.isActive ? 'active' : 'inactive'
      }));

      setCategories(transformedCategories);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const categoryData = {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || `Category for ${newCategoryName.trim().toLowerCase()} products`,
          isActive: true
        };

        await apiService.createCategory(categoryData);
        await fetchCategories(); // Refresh the list
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowAddModal(false);
      } catch (error) {
        console.error('Error creating category:', error);
        alert('Failed to create category. Please try again.');
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description);
    setShowAddModal(true);
  };

  const handleUpdateCategory = async () => {
    if (newCategoryName.trim() && editingCategory) {
      try {
        const categoryData = {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          isActive: editingCategory.status === 'active'
        };

        await apiService.updateCategory(editingCategory.id, categoryData);
        await fetchCategories(); // Refresh the list
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setShowAddModal(false);
      } catch (error) {
        console.error('Error updating category:', error);
        alert('Failed to update category. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${category.productCount} products. Please move or delete the products first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(categoryId);
        await fetchCategories(); // Refresh the list
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      try {
        const updatedData = {
          name: category.name,
          description: category.description,
          isActive: category.status !== 'active'
        };

        await apiService.updateCategory(categoryId, updatedData);
        await fetchCategories(); // Refresh the list
      } catch (error) {
        console.error('Error toggling category status:', error);
        alert('Failed to update category status. Please try again.');
      }
    }
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.status === 'active').length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage product categories</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setNewCategoryDescription('');
              setShowAddModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Grid3X3 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Tag className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Categories</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{activeCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <Grid3X3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {category.status}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {category.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{category.productCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{category.dateCreated}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleToggleStatus(category.id)}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    category.status === 'active'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                  }`}
                >
                  {category.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Enter category description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setNewCategoryName('');
                  setNewCategoryDescription('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCategories.length}</span> of{' '}
            <span className="font-medium">{categories.length}</span> results
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
  );
};

export default CategoriesManagement;
