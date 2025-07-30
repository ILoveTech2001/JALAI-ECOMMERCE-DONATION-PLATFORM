import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import apiService from "../../services/apiService"
import { limitedConsole } from "../../utils/logLimiter"
import { validateImage } from "../../utils/imageUtils"
import { smartImageHandler } from "../../utils/imageStorage"
import PaymentModal from "../PaymentModal"
import {
  ShoppingBag,
  ShoppingCart,
  Settings,
  Home,
  Upload,
  Facebook,
  Twitter,
  Eye,
  Plus,
  Package,
  TrendingUp,
  Trash2,
  MessageCircle,
  Phone,
  Edit,
  Check,
  X,
  Heart,
  ShoppingBag as CartIcon,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Menu,
  X as CloseIcon,
} from "lucide-react"

export default function UserDashboard() {
  const { user, logout, loading, error } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("Dashboard")
  const [userName, setUserName] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    totalEarned: 0,
    itemsSold: 0,
    itemsBought: 0,
  })
  const [debugMode, setDebugMode] = useState(localStorage.getItem('debugAPI') === 'true')
  const [isInitializing, setIsInitializing] = useState(false)
  const [photos, setPhotos] = useState([])
  const [sellItems, setSellItems] = useState([])
  const [orders, setOrders] = useState([])
  const [purchasedItems, setPurchasedItems] = useState([])
  const [donations, setDonations] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [categories, setCategories] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState({
    phoneNumber: "",
    amount: "",
    email: "",
    password: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    condition: "",
    selectedPhotos: [],
  })
  const fileInputRef = useRef(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  const refreshNotifications = useCallback(async () => {
    if (!user) return
    try {
      const notificationsResponse = await apiService.getNotificationsByClient(user.id)
      if (notificationsResponse && Array.isArray(notificationsResponse)) {
        setNotifications(notificationsResponse)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error)
      setNotifications([])
    }
  }, [user])

  const refreshUserData = useCallback(async () => {
    if (!user) return

    // Prevent excessive refresh calls
    const lastRefresh = sessionStorage.getItem('lastUserDataRefresh');
    const now = Date.now();
    if (lastRefresh && (now - parseInt(lastRefresh)) < 10000) { // 10 seconds cooldown
      return;
    }

    try {
      // Fetch sell items
      const sellItemsResponse = await apiService.getProductsByClient(user.id)
      if (sellItemsResponse && Array.isArray(sellItemsResponse)) {
        const formattedItems = sellItemsResponse.map(item => ({
          ...item,
          status: item.isApproved ? "Active" : "Pending Approval",
          dateAdded: new Date(item.createdAt).toISOString().split("T")[0],
          images: item.imageUrl ? [item.imageUrl] : ["/placeholder.svg?height=200&width=200"]
        }))
        setSellItems(formattedItems)
      }

      // Fetch donations
      const donationsResponse = await apiService.getDonationsByClient(user.id)
      if (donationsResponse && Array.isArray(donationsResponse)) {
        const formattedDonations = donationsResponse.map(donation => ({
          ...donation,
          date: new Date(donation.createdAt).toISOString().split("T")[0],
          status: donation.status || "Completed"
        }))
        setDonations(formattedDonations)
      }

      // Fetch orders
      const ordersResponse = await apiService.getOrdersByClient(user.id, 0, 100)
      let ordersArray = []
      if (ordersResponse && ordersResponse.content && Array.isArray(ordersResponse.content)) {
        ordersArray = ordersResponse.content
      } else if (ordersResponse && Array.isArray(ordersResponse)) {
        ordersArray = ordersResponse
      }

      if (ordersArray.length > 0) {
        const formattedOrders = ordersArray.map(order => ({
          ...order,
          date: new Date(order.createdAt).toISOString().split("T")[0],
          status: order.status || "Processing"
        }))
        setOrders(formattedOrders)
      }

      // Mark successful refresh
      sessionStorage.setItem('lastUserDataRefresh', now.toString());
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }, [user])

  const fetchInitialData = useCallback(async () => {
    if (!user || isInitializing) return

    // Prevent excessive API calls - only fetch if not fetched recently
    const lastFetch = sessionStorage.getItem('lastDataFetch');
    const now = Date.now();
    if (lastFetch && (now - parseInt(lastFetch)) < 30000) { // 30 seconds cooldown
      return;
    }

    setIsInitializing(true);
    try {
      // Fetch categories
      const categoriesResponse = await apiService.getCategories()
      if (categoriesResponse && Array.isArray(categoriesResponse)) {
        // Only log in debug mode with limiting to reduce console spam
        if (localStorage.getItem('debugAPI') === 'true') {
          limitedConsole.log('📋 Categories loaded:', categoriesResponse.map(c => ({ id: c.id, name: c.name })))
        }
        setCategories(categoriesResponse)
      } else {
        console.warn('⚠️ No categories received from API')
      }

      // Fetch user data
      await refreshUserData()

      // Fetch notifications separately to avoid circular dependencies
      await refreshNotifications()

      // Mark successful fetch
      sessionStorage.setItem('lastDataFetch', now.toString());
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setIsInitializing(false);
    }
  }, [user, isInitializing])

  // Initialize user data
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.email || "User")
      fetchInitialData()
    }
  }, [user, fetchInitialData]) // Add fetchInitialData as dependency

  // Calculate stats when data changes
  useEffect(() => {
    const calculateStats = () => {
      let totalSpent = 0
      let totalEarned = 0
      let itemsSold = 0
      let itemsBought = 0

      // Calculate from orders (total spent)
      if (orders && orders.length > 0) {
        totalSpent = orders.reduce((sum, order) => {
          return sum + (order.totalAmount || 0)
        }, 0)
        itemsBought = orders.length
      }

      // Calculate from sell items (total earned)
      if (sellItems && sellItems.length > 0) {
        const soldItems = sellItems.filter(item => item.status === "Sold")
        totalEarned = soldItems.reduce((sum, item) => {
          return sum + (item.price || 0)
        }, 0)
        itemsSold = soldItems.length
      }

      setUserStats({
        totalSpent,
        totalEarned,
        itemsSold,
        itemsBought,
      })
    }

    calculateStats()
  }, [orders, sellItems, donations])

  // Menu items configuration
  const menuItems = [
    { label: "Dashboard", icon: Home, active: activeSection === "Dashboard" },
    { label: "Sell Item", icon: ShoppingBag, active: activeSection === "Sell Item" },
    { label: "My Cart", icon: ShoppingCart, active: activeSection === "My Cart" },
    { label: "Donations", icon: Heart, active: activeSection === "Donations" },
    { label: "Orders", icon: Package, active: activeSection === "Orders" },
    { label: "My Purchases", icon: ShoppingBag, active: activeSection === "My Purchases" },
    { label: "Notifications", icon: Bell, active: activeSection === "Notifications" },
    { label: "Settings", icon: Settings, active: activeSection === "Settings" },
  ]

  // Handler functions
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files)

    // Process files one by one to avoid overwhelming the browser
    for (const file of files) {
      try {
        // Validate the image file
        const validation = validateImage(file);
        if (!validation.isValid) {
          alert(`${file.name}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Show processing indicator
        const processingPhoto = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: '/placeholder.svg?height=200&width=200',
          file: file,
          size: file.size,
          type: file.type,
          processing: true
        };
        setPhotos((prev) => [...prev, processingPhoto]);

        // Use smart image handler to choose the best approach
        const imageResult = await smartImageHandler(file);

        // Calculate compression ratio if applicable
        const originalSizeKB = file.size / 1024;
        const processedSizeKB = imageResult.size / 1024;
        const compressionRatio = imageResult.type.includes('base64')
          ? ((originalSizeKB - processedSizeKB) / originalSizeKB * 100).toFixed(1)
          : 'N/A';

        const newPhoto = {
          id: processingPhoto.id,
          name: file.name,
          url: imageResult.data,
          file: file,
          size: file.size,
          compressedSize: imageResult.size,
          type: file.type,
          processing: false,
          strategy: imageResult.strategy,
          needsUpload: imageResult.needsUpload || false
        };

        // Only log in debug mode with limiting
        if (localStorage.getItem('debugAPI') === 'true') {
          limitedConsole.log('📸 Photo processed successfully:', {
            name: newPhoto.name,
            originalSize: `${originalSizeKB.toFixed(1)}KB`,
            processedSize: `${processedSizeKB.toFixed(1)}KB`,
            compressionRatio: compressionRatio !== 'N/A' ? `${compressionRatio}% smaller` : compressionRatio,
            strategy: imageResult.strategy,
            type: newPhoto.type
          });
        }

        // Update the photo in the list
        setPhotos((prev) => prev.map(photo =>
          photo.id === processingPhoto.id ? newPhoto : photo
        ));

      } catch (error) {
        limitedConsole.error('❌ Error processing image:', error);
        alert(`Failed to process image: ${file.name}. ${error.message}`);

        // Remove the processing photo on error
        setPhotos((prev) => prev.filter(photo =>
          !(photo.name === file.name && photo.processing)
        ));
      }
    }

    // Clear the input so the same file can be uploaded again if needed
    event.target.value = '';
  }

  const deletePhoto = (photoId) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId))
    setFormData((prev) => ({
      ...prev,
      selectedPhotos: prev.selectedPhotos.filter((id) => id !== photoId),
    }))
  }

  const togglePhotoSelection = (photoId) => {
    setFormData((prev) => ({
      ...prev,
      selectedPhotos: prev.selectedPhotos.includes(photoId)
        ? prev.selectedPhotos.filter((id) => id !== photoId)
        : [...prev.selectedPhotos, photoId],
    }))
  }

  const handleSubmitItem = async () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      alert("Please enter an item name");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }
    if (!formData.description?.trim()) {
      alert("Please enter an item description");
      return;
    }
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    if (formData.selectedPhotos.length === 0) {
      alert("Please select at least one photo");
      return;
    }

    try {
      const selectedPhoto = photos.find((photo) => photo.id === formData.selectedPhotos[0]);
      if (!selectedPhoto || !selectedPhoto.file) {
        alert("Please select a valid photo");
        return;
      }

      // Step 1: Upload image using apiService
      const uploadData = await apiService.uploadImage(selectedPhoto.file);
      const imageId = uploadData.imageId;
      if (!imageId) {
        throw new Error('Image upload did not return an imageId');
      }

      // Step 2: Create product with imageId
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        categoryId: formData.category,
        sellerId: user.id, // Backend expects sellerId
        imageId, // Use imageId, not imageUrl
      };

      if (localStorage.getItem('debugAPI') === 'true') {
        limitedConsole.log('🚀 Submitting item data:', { ...itemData });
      }

      const response = await apiService.createProduct(itemData);

      if (response) {
        alert('Item listed successfully!');
        apiService.clearCache();
        sessionStorage.removeItem('lastUserDataRefresh');
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          condition: '',
          selectedPhotos: [],
        });
        setPhotos([]);
        await refreshUserData();
      }
    } catch (error) {
      console.error('❌ Error creating product:', error);
      if (error.message?.includes('Image upload failed')) {
        alert('Image upload failed. Please try uploading a different image or check your internet connection.');
      } else if (error.message?.includes('Network')) {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert(`Failed to list item: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.categoryId || "",
      condition: item.condition || "",
      selectedPhotos: [],
    })
  }

  const saveEditedItem = async () => {
    if (!editingItem) return

    try {
      const updatedData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        categoryId: formData.category,
      }

      await apiService.updateProduct(editingItem.id, updatedData)

      alert("Item updated successfully!")
      setEditingItem(null)
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        condition: "",
        selectedPhotos: [],
      })
      await refreshUserData()
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Failed to update item. Please try again.")
    }
  }

  const updateItemStatus = (itemId, newStatus) => {
    setSellItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    )
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    )
  }

  const updatePurchaseStatus = (purchaseId, newStatus) => {
    setPurchasedItems((prev) =>
      prev.map((purchase) => (purchase.id === purchaseId ? { ...purchase, status: newStatus } : purchase))
    )
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      alert('Failed to mark notification as read.')
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead(user.id)
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      alert('Failed to mark all notifications as read.')
    }
  }

  // Payment and checkout handlers
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!")
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (orderData) => {
    try {
      // Create order in backend
      const response = await apiService.createOrderFromCart(user.id, new Date())

      if (response) {
        // Add order to local state
        const newOrder = {
          id: response.id || Date.now(),
          items: cartItems,
          totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          date: new Date().toISOString().split("T")[0],
          status: "Confirmed",
          paymentMethod: orderData.paymentMethod,
          phoneNumber: orderData.phoneNumber
        }

        setOrders(prev => [newOrder, ...prev])

        // Clear cart after successful order
        setCartItems([])

        // Refresh user data to get updated stats
        await refreshUserData()

        console.log("Order created successfully:", newOrder)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      throw error // Re-throw to show error in payment modal
    }
  }

  const goToHomePage = () => {
    // Navigate to home page while preserving cart state
    navigate('/')
  }

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    if (newDebugMode) {
      localStorage.setItem('debugAPI', 'true');
      limitedConsole.log('🐛 Debug mode enabled - API calls will be logged with limiting');
    } else {
      localStorage.removeItem('debugAPI');
      limitedConsole.log('🔇 Debug mode disabled - API logging reduced');

      // Show log limiter stats when disabling debug mode
      import('../../utils/logLimiter').then(({ globalLogLimiter }) => {
        const stats = globalLogLimiter.getStats();
        if (stats.totalSuppressed > 0) {
          console.log('📊 Log Limiter prevented', stats.totalSuppressed, 'excessive log messages');
        }
      });
    }
  }

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Render functions for different sections
  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {userName}!</h2>
              <p className="text-green-100 text-sm sm:text-base">Here's what's happening with your account</p>
            </div>
            <button
              onClick={refreshUserData}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm sm:text-base">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{userStats.totalSpent.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">FCFA Spent</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{userStats.totalEarned.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">FCFA Earned</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{orders.length}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">{donations.length}</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Donations Made</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setActiveSection("Sell Item")}
            className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">Sell an Item</span>
          </button>
          <button
            onClick={() => navigate('/bible-verse', { replace: true })}
            className="h-16 sm:h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">Make a Donation</span>
          </button>
          <button
            onClick={() => setActiveSection("My Cart")}
            className="h-16 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <CartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">View Cart ({cartItems.length})</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 sm:space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">No recent activity</p>
              <p className="text-xs sm:text-sm text-gray-400">Your orders and donations will appear here</p>
            </div>
          ) : (
            orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${order.type === "donation" ? "bg-red-500" : "bg-blue-500"}`}></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base truncate">{order.item || order.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{order.date || order.createdAt}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-medium text-sm sm:text-base">{(order.amount || order.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">FCFA</p>
                  <p className="text-xs sm:text-sm text-gray-500">{order.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderSellItem = () => (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-400 to-green-500 text-white rounded-lg p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Earned</p>
              <p className="text-2xl font-bold">{userStats.totalEarned.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-green-500 text-white rounded-lg p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Items Sold</p>
              <p className="text-2xl font-bold">{userStats.itemsSold}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-green-500 text-white rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Active Listings</p>
              <p className="text-2xl font-bold">{sellItems.filter((item) => item.status === "Active").length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-400 to-green-500 text-white rounded-lg p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Photos</p>
              <p className="text-2xl font-bold">{photos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload and Item Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Photo Upload Section */}
        <div className="xl:col-span-1 bg-white rounded-lg shadow">
          <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Photo Gallery
            </h3>
          </div>
          <div className="p-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-2 bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photos
            </button>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">📸 Smart Compression:</span> Images are automatically compressed to reduce server load while maintaining quality. File sizes shown below each image.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.name}
                    className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                      formData.selectedPhotos.includes(photo.id)
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-green-300"
                    } ${photo.processing ? "opacity-50" : ""}`}
                    onClick={() => !photo.processing && togglePhotoSelection(photo.id)}
                  />

                  {/* Processing indicator */}
                  {photo.processing && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {/* Compression indicator */}
                  {photo.compressedSize && !photo.processing && (
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                      {((photo.compressedSize / 1024).toFixed(0))}KB
                    </div>
                  )}

                  <button
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full flex items-center justify-center"
                    onClick={() => deletePhoto(photo.id)}
                    disabled={photo.processing}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {formData.selectedPhotos.includes(photo.id) && !photo.processing && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List/Edit Item Form */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow">
          <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {editingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingItem ? "Edit Item" : "List New Item"}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (FCFA) *</label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                placeholder="Describe your item in detail"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              {editingItem ? (
                <>
                  <button
                    onClick={saveEditedItem}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null)
                      setFormData({
                        name: "",
                        price: "",
                        description: "",
                        category: "",
                        condition: "",
                        selectedPhotos: [],
                      })
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSubmitItem}
                  className="w-full bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  List Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listed Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold">Your Listed Items ({sellItems.length})</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellItems.map((item) => (
              <div key={item.id} className="border-2 hover:border-green-300 transition-colors rounded-lg p-4">
                <img
                  src={item.images[0] || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">{item.price.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <select
                    value={item.status}
                    onChange={(e) => updateItemStatus(item.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <span className="text-xs text-gray-500">{item.dateAdded}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 border border-green-500 text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 rounded text-sm"
                    onClick={() => handleEditItem(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderCart = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold">My Shopping Cart ({cartItems.length} items)</h3>
        </div>
        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <CartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={goToHomePage}
                className="mt-4 bg-gradient-to-r from-gray-500 to-green-600 text-white px-6 py-2 rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    <button className="mt-2 border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm">Remove</button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()} FCFA
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-gray-500 to-green-600 text-white px-6 py-3 rounded-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderDonations = () => (
    <div className="space-y-6">
      {/* Make a Donation */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Make a Donation
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Make a Difference?</h3>
            <p className="text-gray-600 mb-6">
              Your donation will help provide food, shelter, education, and care for orphaned children.
            </p>
            <button
              onClick={() => navigate('/bible-verse')}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-lg flex items-center gap-2 mx-auto"
            >
              <Heart className="w-5 h-5" />
              Start Donation Process
            </button>
          </div>
        </div>
      </div>

      {/* Donation History */}
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold">Donation History</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {donations.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No donations yet</p>
              </div>
            ) : (
              donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                      <h3 className="font-medium">{donation.orphanage}</h3>
                      <p className="text-sm text-gray-500">{donation.date}</p>
                      {donation.message && <p className="text-sm text-gray-600 italic">"{donation.message}"</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{donation.amount.toLocaleString()} FCFA</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${donation.status === "Completed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications ({notifications.filter(n => !n.isRead).length} unread)
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400">You'll receive updates about your products and orders here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.type === 'PRODUCT_APPROVED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {notification.type === 'PRODUCT_REJECTED' && <XCircle className="w-5 h-5 text-red-500" />}
                        {notification.type === 'ORDER_STATUS_CHANGED' && <Clock className="w-5 h-5 text-blue-500" />}
                        {notification.type === 'DONATION_CONFIRMED' && <Heart className="w-5 h-5 text-red-500" />}
                        {!['PRODUCT_APPROVED', 'PRODUCT_REJECTED', 'ORDER_STATUS_CHANGED', 'DONATION_CONFIRMED'].includes(notification.type) &&
                          <Bell className="w-5 h-5 text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-xs hover:bg-gray-50"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <div className="mt-6 text-center">
              <button
                onClick={markAllNotificationsAsRead}
                className="border border-green-500 text-green-600 hover:bg-green-50 px-4 py-2 rounded"
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg p-4">
          <h3 className="text-lg font-semibold">Account Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={user?.phone || ""}
              placeholder="+237 XXX XXX XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={user?.location || ""}
              placeholder="Your location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Debug Mode Toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Debug Mode</label>
                <p className="text-xs text-gray-500">Enable detailed API logging for troubleshooting</p>
              </div>
              <button
                onClick={toggleDebugMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  debugMode ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    debugMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <button className="bg-gradient-to-r from-gray-500 to-green-600 text-white px-6 py-2 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return renderDashboard()
      case "Sell Item":
        return renderSellItem()
      case "My Cart":
        return renderCart()
      case "Donations":
        return renderDonations()
      case "Orders":
        return renderDashboard() // For now, show dashboard
      case "My Purchases":
        return renderDashboard() // For now, show dashboard
      case "Notifications":
        return renderNotifications()
      case "Settings":
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Mobile menu button */}
              <button
                className="lg:hidden hover:bg-green-50 p-2 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6 text-green-600" />
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-500 to-green-600 bg-clip-text text-transparent">
                JALAI
              </h1>

              <button
                className="hidden sm:flex hover:bg-green-50 text-green-600 font-medium px-4 py-2 rounded-lg items-center gap-2"
                onClick={goToHomePage}
              >
                <Home className="w-5 h-5" />
                <span className="hidden md:inline">Home</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile home button */}
              <button
                className="sm:hidden hover:bg-green-50 p-2 rounded-lg"
                onClick={goToHomePage}
              >
                <Home className="w-5 h-5 text-green-600" />
              </button>

              <button
                className="hover:bg-green-50 p-2 rounded-lg"
                onClick={() => setActiveSection("Settings")}
              >
                <Settings className="w-5 h-5 text-green-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="hover:bg-gray-100 p-2 rounded-lg"
            >
              <CloseIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="px-6 pb-6">
            <div className="mb-8 p-4 bg-gradient-to-r from-gray-500 to-green-600 rounded-lg text-white">
              <h2 className="text-lg font-semibold">Welcome back,</h2>
              <p className="text-xl font-bold truncate">{userName}</p>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => {
                        setActiveSection(item.label)
                        setSidebarOpen(false) // Close mobile sidebar on selection
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        item.active
                          ? "bg-gradient-to-r from-gray-500 to-green-600 text-white shadow-lg"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.label === "Notifications" && notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                          {notifications.filter(n => !n.isRead).length}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 lg:ml-0 overflow-x-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t shadow-lg mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-center items-center gap-4 sm:gap-6">
            <button
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              onClick={() => window.open("https://facebook.com", "_blank")}
              title="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            <button
              className="text-blue-400 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
              onClick={() => window.open("https://twitter.com", "_blank")}
              title="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-colors"
              onClick={() => window.open("https://wa.me/237XXXXXXXXX", "_blank")}
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => window.open("tel:+237XXXXXXXXX", "_blank")}
              title="Phone"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartTotal={cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
        cartItems={cartItems}
        onPaymentSuccess={handlePaymentSuccess}
        user={user}
      />
    </div>
  )
}
