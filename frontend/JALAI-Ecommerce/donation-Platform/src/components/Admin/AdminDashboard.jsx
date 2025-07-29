import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Package,
  CreditCard,
  Star,
  Heart,
  Building2,
  Grid3X3,
  Settings,
  User,
  Moon,
  Sun,
  Menu,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Import mobile-specific styles
import './AdminMobile.css';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import cacheService from '../../services/cacheService';

// Import management components
import ClientsManagement from './ClientsManagement';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import OrphanagesManagement from './OrphanagesManagement';
import DonationsManagement from './DonationsManagement';
import ReviewsManagement from './ReviewsManagement';
import PaymentsManagement from './PaymentsManagement';
import CategoriesManagement from './CategoriesManagement';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
  // Use global auth context
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardStats, setDashboardStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [apiCallsDisabled, setApiCallsDisabled] = useState(false);
  const [lastApiCallTime, setLastApiCallTime] = useState(0);

  // Check admin authentication using global auth context
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      if (user.userType !== 'ADMIN') {
        // Not an admin user, redirect to appropriate dashboard
        if (user.userType === 'ORPHANAGE') {
          navigate('/orphanage-dashboard', { replace: true });
        } else {
          navigate('/user-dashboard', { replace: true });
        }
        return;
      }
    }
  }, [user, authLoading, navigate]);

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Fetch dashboard stats with caching and error handling
  useEffect(() => {
    const fetchDashboardStats = async () => {
      // First try to get cached data
      const cachedStats = cacheService.get('dashboardStats');
      if (cachedStats) {
        setDashboardStats(cachedStats);
        setLoading(false);
        return;
      }

      // Prevent API spam - only call once every 10 seconds
      const now = Date.now();
      if (now - lastApiCallTime < 10000) {
        return;
      }

      // Don't make calls if API is disabled due to errors
      if (apiCallsDisabled) {
        return;
      }

      try {
        setLoading(true);
        setLastApiCallTime(now);
        const stats = await apiService.getDashboardStats();

        // Transform API data to match the expected format
        const transformedStats = [
          {
            title: 'Total Clients',
            value: stats.totalClients || 0,
            change: '+12%',
            icon: Users,
            color: 'bg-blue-500'
          },
          {
            title: 'Total Products',
            value: stats.totalProducts || 0,
            change: '+8%',
            icon: Package,
            color: 'bg-green-500'
          },
          {
            title: 'Total Orders',
            value: stats.totalOrders || 0,
            change: '+15%',
            icon: ShoppingBag,
            color: 'bg-purple-500'
          },
          {
            title: 'Total Orphanages',
            value: stats.totalOrphanages || 0,
            change: '+5%',
            icon: Building2,
            color: 'bg-orange-500'
          },
          {
            title: 'Total Donations',
            value: stats.totalDonations || 0,
            change: '+20%',
            icon: Heart,
            color: 'bg-red-500'
          },
          {
            title: 'Total Revenue',
            value: `${(stats.totalRevenue || 0).toLocaleString()} XAF`,
            change: '+18%',
            icon: CreditCard,
            color: 'bg-indigo-500'
          }
        ];

        // Cache the transformed stats for 10 minutes
        cacheService.set('dashboardStats', transformedStats, 600000);
        setDashboardStats(transformedStats);
      } catch (error) {
        console.error('❌ Failed to fetch dashboard stats:', error);

        // Check if it's a resource error (backend overwhelmed)
        if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
            error.message?.includes('Network error')) {
          console.warn('🚫 Disabling API calls for 5 minutes due to backend issues');
          setApiCallsDisabled(true);
          setError('Backend server is temporarily unavailable. Using offline data.');

          // Re-enable API calls after 5 minutes
          setTimeout(() => {
            console.log('✅ Re-enabling API calls');
            setApiCallsDisabled(false);
          }, 300000); // 5 minutes
        } else {
          setError('Failed to load dashboard statistics');
        }

        // Try to use any cached data as fallback
        const fallbackStats = cacheService.get('dashboardStats');
        if (fallbackStats) {
          setDashboardStats(fallbackStats);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'ADMIN') {
      fetchDashboardStats();
      fetchNotifications();
    }
  }, [user, apiCallsDisabled, lastApiCallTime]);

  const fetchNotifications = async () => {
    // First try cached notifications
    const cachedNotifications = cacheService.get('adminNotifications');
    if (cachedNotifications) {
      setNotifications(cachedNotifications.notifications);
      setUnreadCount(cachedNotifications.unreadCount);
      return;
    }

    // Don't make calls if API is disabled due to errors
    if (apiCallsDisabled) {
      return;
    }

    try {
      // For admin, get system/admin notifications only (not client notifications)
      const allNotifications = await apiService.getAllNotifications();

      // Filter to show only admin-relevant notifications
      const adminNotifications = allNotifications.filter(notification => {
        return notification.type === 'SYSTEM_ALERT' ||
               notification.type === 'GENERAL_ANNOUNCEMENT' ||
               notification.recipientAdminId !== null;
      });

      setNotifications(adminNotifications);

      // Count unread notifications
      const unread = adminNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);

      // Cache notifications for 5 minutes
      cacheService.set('adminNotifications', {
        notifications: adminNotifications,
        unreadCount: unread
      }, 300000);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Make fetchNotifications available globally for child components
  useEffect(() => {
    window.refreshAdminNotifications = fetchNotifications;
    return () => {
      delete window.refreshAdminNotifications;
    };
  }, []);

  // Refresh notifications every 5 minutes to avoid overwhelming backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && user.userType === 'ADMIN' && !apiCallsDisabled) {
        fetchNotifications();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, apiCallsDisabled]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Sidebar navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'orphanages', label: 'Orphanages', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Grid3X3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Show loading while checking admin authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
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
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen relative">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          isMobile
            ? `admin-sidebar-mobile ${sidebarOpen ? 'open' : ''}`
            : `${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`
        } bg-white dark:bg-gray-800 shadow-lg flex flex-col`}>
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-green-600">JALAI</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {sidebarOpen && <span className="ml-3">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h2 className="ml-2 md:ml-4 text-lg md:text-xl font-semibold text-gray-800 dark:text-white capitalize">
                  {activeTab}
                </h2>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Search - Hidden on small screens */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent w-48 lg:w-64"
                  />
                </div>

                {/* Mobile Search Button */}
                <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center">
                            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {notification.type === 'PRODUCT_APPROVED' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                  {notification.type === 'PRODUCT_REJECTED' && <XCircle className="w-4 h-4 text-red-500" />}
                                  {notification.type === 'ORDER_STATUS_CHANGED' && <Clock className="w-4 h-4 text-blue-500" />}
                                  {notification.type === 'DONATION_CONFIRMED' && <Heart className="w-4 h-4 text-red-500" />}
                                  {!['PRODUCT_APPROVED', 'PRODUCT_REJECTED', 'ORDER_STATUS_CHANGED', 'DONATION_CONFIRMED'].includes(notification.type) &&
                                    <Bell className="w-4 h-4 text-gray-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="w-full text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            View All Notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {/* Admin Profile - Hidden on small screens */}
                <div className="hidden md:flex items-center">
                  <img
                    src="https://via.placeholder.com/32"
                    alt="Admin"
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'Admin User'}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await logout();
                        navigate('/login', { replace: true });
                      } catch (error) {
                        console.error('Logout error:', error);
                        navigate('/login', { replace: true });
                      }
                    }}
                    className="ml-3 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            {activeTab === 'overview' && (
              <div>
                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-red-600 text-sm">{error}</p>
                      <button
                        onClick={() => {
                          setError(null);
                          setApiCallsDisabled(false);
                          setLastApiCallTime(0);

                          // Clear all admin-related cache
                          cacheService.clear('dashboardStats');
                          cacheService.clear('adminOrders');
                          cacheService.clear('adminDonations');
                          cacheService.clear('adminReviews');
                          cacheService.clear('adminPayments');
                          cacheService.clear('adminNotifications');

                          if (user && user.userType === 'ADMIN') {
                            // Refetch data
                            const fetchDashboardStats = async () => {
                              try {
                                setLoading(true);
                                const stats = await apiService.getDashboardStats();
                                const transformedStats = [
                                  {
                                    title: 'Total Clients',
                                    value: stats.totalClients || 0,
                                    change: '+12%',
                                    icon: Users,
                                    color: 'bg-blue-500'
                                  },
                                  {
                                    title: 'Total Products',
                                    value: stats.totalProducts || 0,
                                    change: '+8%',
                                    icon: Package,
                                    color: 'bg-green-500'
                                  },
                                  {
                                    title: 'Total Orders',
                                    value: stats.totalOrders || 0,
                                    change: '+15%',
                                    icon: ShoppingBag,
                                    color: 'bg-purple-500'
                                  },
                                  {
                                    title: 'Total Orphanages',
                                    value: stats.totalOrphanages || 0,
                                    change: '+5%',
                                    icon: Building2,
                                    color: 'bg-orange-500'
                                  },
                                  {
                                    title: 'Total Donations',
                                    value: stats.totalDonations || 0,
                                    change: '+20%',
                                    icon: Heart,
                                    color: 'bg-red-500'
                                  },
                                  {
                                    title: 'Total Revenue',
                                    value: `${(stats.totalRevenue || 0).toLocaleString()} XAF`,
                                    change: '+18%',
                                    icon: CreditCard,
                                    color: 'bg-indigo-500'
                                  }
                                ];
                                cacheService.set('dashboardStats', transformedStats, 600000);
                                setDashboardStats(transformedStats);
                              } catch (error) {
                                console.error('Retry failed:', error);
                              } finally {
                                setLoading(false);
                              }
                            };
                            fetchDashboardStats();
                            fetchNotifications();
                          }
                        }}
                        className="ml-4 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}

                {/* API Status Indicator */}
                {apiCallsDisabled && (
                  <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <p className="text-yellow-700 text-sm">
                        Backend connection temporarily disabled. Using cached data.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className={`grid gap-4 md:gap-6 mb-6 md:mb-8 ${isMobile ? 'admin-grid-mobile-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg shadow ${isMobile ? 'p-4' : 'p-6'} animate-pulse`}>
                        <div className="flex items-center">
                          <div className="bg-gray-300 dark:bg-gray-600 p-2 md:p-3 rounded-lg">
                            <div className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} bg-gray-400 dark:bg-gray-500 rounded`}></div>
                          </div>
                          <div className="ml-3 md:ml-4 flex-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    dashboardStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg shadow ${isMobile ? 'admin-stats-mobile p-4' : 'p-6'}`}>
                        <div className="flex items-center">
                          <div className={`${stat.color} p-2 md:p-3 rounded-lg`}>
                            <Icon className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
                          </div>
                          <div className="ml-3 md:ml-4">
                            <p className={`text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 ${isMobile ? 'admin-mobile-text' : ''}`}>
                              {stat.title}
                            </p>
                            <div className="flex items-center">
                              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900 dark:text-white`}>
                                {stat.value}
                              </p>
                              <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'} ${
                                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stat.change}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Activity
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      Recent activity will be displayed here...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Render appropriate management component based on active tab */}
            {activeTab === 'clients' && <ClientsManagement />}
            {activeTab === 'products' && <ProductsManagement />}
            {activeTab === 'orders' && <OrdersManagement />}
            {activeTab === 'orphanages' && <OrphanagesManagement />}
            {activeTab === 'donations' && <DonationsManagement />}
            {activeTab === 'reviews' && <ReviewsManagement />}
            {activeTab === 'payments' && <PaymentsManagement />}
            {activeTab === 'categories' && <CategoriesManagement />}
            {activeTab === 'profile' && <AdminProfile />}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  System settings and configurations will be implemented here...
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
