import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Image as ImageIcon,
  Tag,
  DollarSign
} from 'lucide-react';
import apiService from '../../services/apiService';

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts(currentPage, 12);

        if (response.content) {
          setProducts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setProducts(response);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products');

        // Set empty array instead of dummy data
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  // Auto-refresh products every 30 seconds to show new submissions
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await apiService.getProducts(currentPage, 12);
        if (response.content) {
          setProducts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setProducts(response);
        }
      } catch (error) {
        console.error('Failed to auto-refresh products:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentPage]);

  // Listen for global product refresh events
  useEffect(() => {
    const handleProductRefresh = async () => {
      try {
        const response = await apiService.getProducts(currentPage, 12);
        if (response.content) {
          setProducts(response.content);
          setTotalPages(response.totalPages);
        } else {
          setProducts(response);
        }
      } catch (error) {
        console.error('Failed to refresh products:', error);
      }
    };

    window.addEventListener('refreshProducts', handleProductRefresh);
    return () => window.removeEventListener('refreshProducts', handleProductRefresh);
  }, [currentPage]);

  const categories = ['all', 'Clothing', 'Furniture', 'Utensils', 'Electronics', 'Footwear'];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product.id));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        setProducts(prev => prev.filter(product => product.id !== productId));
        setSelectedProducts(prev => prev.filter(id => id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await Promise.all(selectedProducts.map(id => apiService.deleteProduct(id)));
        setProducts(prev => prev.filter(product => !selectedProducts.includes(product.id)));
        setSelectedProducts([]);
      } catch (error) {
        console.error('Failed to delete products:', error);
        alert('Failed to delete some products. Please try again.');
      }
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      // Get full product details including image
      const product = await apiService.getProductById(productId);
      setSelectedProduct(product);
      setShowProductModal(true);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      alert('Failed to load product details. Please try again.');
    }
  };

  const handleApproveProduct = async (productId, reason = '') => {
    try {
      await apiService.approveProduct(productId, reason);
      // Refresh products list
      const response = await apiService.getProducts(currentPage, 12);
      if (response.content) {
        setProducts(response.content);
      }
      setShowProductModal(false);
      setApprovalReason('');
      alert('Product approved successfully! Notification sent to seller.');

      // Trigger a notification refresh in parent component if available
      if (window.refreshAdminNotifications) {
        setTimeout(() => {
          window.refreshAdminNotifications();
        }, 1000); // Wait 1 second for backend to process notification
      }
    } catch (error) {
      console.error('Failed to approve product:', error);
      alert('Failed to approve product. Please try again.');
    }
  };

  const handleRejectProduct = async (productId, reason) => {
    if (!reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    try {
      await apiService.rejectProduct(productId, reason);
      // Refresh products list
      const response = await apiService.getProducts(currentPage, 12);
      if (response.content) {
        setProducts(response.content);
      }
      setShowProductModal(false);
      setApprovalReason('');
      alert('Product rejected successfully! Notification sent to seller.');

      // Trigger a notification refresh in parent component if available
      if (window.refreshAdminNotifications) {
        setTimeout(() => {
          window.refreshAdminNotifications();
        }, 1000); // Wait 1 second for backend to process notification
      }
    } catch (error) {
      console.error('Failed to reject product:', error);
      alert('Failed to reject product. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Products Management</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage all products in the platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <Tag className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <ImageIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {categories.length - 1}
              </p>
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${isMobile ? 'w-full' : ''} px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base`}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <button className={`${isMobile ? 'w-full justify-center' : ''} px-3 md:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm md:text-base`}>
              <Filter className="h-4 w-4" />
              <span className={isMobile ? '' : 'hidden sm:inline'}>More Filters</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedProducts.length} product(s) selected
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleSelectProduct(product.id)}
                className="absolute top-2 left-2 rounded border-gray-300 text-green-600 focus:ring-green-500 z-10"
              />
              <div className="h-40 md:h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {product.imageUrlThumbnail ? (
                  <img
                    src={product.imageUrlThumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${product.imageUrlThumbnail ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                </div>
              </div>
              <span className={`absolute top-2 right-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                {product.status.replace('_', ' ')}
              </span>
            </div>

            <div className="p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{product.categoryName || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                <span className="text-lg font-bold text-green-600">{Number(product.price).toLocaleString()} XAF</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Stock:</span>
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock} units
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProduct(product.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    title="View Product Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800 dark:text-green-400">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {product.sales} sold
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProducts.length}</span> of{' '}
            <span className="font-medium">{products.length}</span> results
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

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{selectedProduct.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <p className="text-lg font-bold text-green-600">{Number(selectedProduct.price).toLocaleString()} XAF</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.categoryName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Seller:</span>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.sellerName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.isApproved ? 'active' : 'pending')}`}>
                        {selectedProduct.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  {!selectedProduct.isApproved && (
                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reason (optional for approval, required for rejection):
                        </label>
                        <textarea
                          value={approvalReason}
                          onChange={(e) => setApprovalReason(e.target.value)}
                          placeholder="Enter reason for approval/rejection..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApproveProduct(selectedProduct.id, approvalReason)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Approve Product
                        </button>
                        <button
                          onClick={() => handleRejectProduct(selectedProduct.id, approvalReason)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Reject Product
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
