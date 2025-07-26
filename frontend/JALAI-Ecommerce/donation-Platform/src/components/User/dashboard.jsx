"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import apiService from "../../services/apiService"
import { Button } from "@/components/User/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/User/ui/card"
import { Badge } from "@/components/User/ui/badge"
import { Input } from "@/components/User/ui/input"
import { Label } from "@/components/User/ui/label"
import { Textarea } from "@/components/User/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/User/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/User/ui/select"
import { Alert, AlertDescription } from "@/components/User/ui/alert"
import PaymentModal from "../PaymentModal"
import {
  ShoppingBag,
  ShoppingCart,
  Settings,
  Home,
  Upload,
  CreditCard,
  Facebook,
  Twitter,
  Eye,
  Plus,
  Package,
  TrendingUp,
  Gift,
  Trash2,
  Smartphone,
  Wallet,
  MessageCircle,
  Phone,
  Edit,
  Check,
  X,
  AlertCircle,
  History,
  Heart,
  ShoppingBag as CartIcon,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Menu,
} from "lucide-react"

export default function Dashboard() {
  const { user, loading, error } = useAuth()
  const navigate = useNavigate()
  // Removed local loading and error state, use AuthContext

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔍 UserDashboard MOUNTED - auth check:', {
      loading,
      user: !!user,
      userType: user?.userType,
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    });

    // CRITICAL: Don't redirect if we're still loading or if user exists
    if (loading) {
      console.log('🟡 UserDashboard: Still loading, waiting...');
      return;
    }

    if (user) {
      console.log('🟢 UserDashboard: User authenticated successfully:', {
        userType: user.userType,
        email: user.email,
        name: user.name
      });
      return;
    }

    // Only redirect after a delay if no user and not loading
    const timeoutId = setTimeout(() => {
      // Check localStorage for user data as backup
      const storedUserData = localStorage.getItem('userData');
      const storedToken = localStorage.getItem('accessToken');

      console.log('🔍 Final auth check:', {
        loading,
        user: !!user,
        storedUserData: !!storedUserData,
        storedToken: !!storedToken
      });

      if (!loading && !user && !storedUserData) {
        console.log('🔴 UserDashboard: No user found after delay, redirecting to login');
        navigate('/login', { replace: true });
      } else if (storedUserData && !user) {
        console.log('🟡 UserDashboard: Found stored user data but no user in context');
        // Don't redirect, let AuthContext handle it
      }
    }, 3000); // Increased to 3 seconds for more stability

    // Cleanup timeout if component unmounts or dependencies change
    return () => clearTimeout(timeoutId);
  }, [loading, user, navigate])
  const [activeSection, setActiveSection] = useState("Dashboard")
  const [userName, setUserName] = useState("")
  const [userStats, setUserStats] = useState({
    totalSpent: 0,
    totalEarned: 0,
    itemsSold: 0,
    itemsBought: 0,
  })
  const [photos, setPhotos] = useState([])
  const [sellItems, setSellItems] = useState([])
  const [orders, setOrders] = useState([])
  const [purchasedItems, setPurchasedItems] = useState([])
  const [donations, setDonations] = useState([])
  const [cartItems, setCartItems] = useState([])
  // Removed duplicate loading and error state declarations
  const [categories, setCategories] = useState([])
  const [notifications, setNotifications] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [paymentDialog, setPaymentDialog] = useState({ open: false, type: "" })
  const [paymentConfirmation, setPaymentConfirmation] = useState({ show: false, message: "" })
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

  // Fetch user data from API and AuthContext
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        setUserName(user.name || "User")
        setOrders([])
        setDonations([])
        setSellItems([])
        setPurchasedItems([])

        const savedCart = localStorage.getItem('cartItems')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          setCartItems([])
        }

        try {
          const categoriesResponse = await apiService.getCategories()
          if (categoriesResponse && Array.isArray(categoriesResponse)) {
            setCategories(categoriesResponse)
          } else if (categoriesResponse && categoriesResponse.data) {
            setCategories(categoriesResponse.data)
          } else {
            setCategories([])
          }
        } catch {
          setCategories([])
        }

        try {
          const notificationsResponse = await apiService.getNotificationsByClient(user.id)
          if (notificationsResponse && Array.isArray(notificationsResponse)) {
            setNotifications(notificationsResponse)
          } else {
            setNotifications([])
          }
        } catch {
          setNotifications([])
        }

        try {
          const sellItemsResponse = await apiService.getProductsByClient(user.id)
          if (sellItemsResponse && Array.isArray(sellItemsResponse)) {
            const formattedItems = sellItemsResponse.map(item => ({
              ...item,
              status: item.isApproved ? "Active" : "Pending Approval",
              dateAdded: new Date(item.createdAt).toISOString().split("T")[0],
              images: item.imageUrl ? [item.imageUrl] : ["/placeholder.svg?height=200&width=200"]
            }))
            setSellItems(formattedItems)
          } else {
            setSellItems([])
          }
        } catch {
          setSellItems([])
        }

        try {
          const donationsResponse = await apiService.getDonationsByClient(user.id)
          if (donationsResponse && Array.isArray(donationsResponse)) {
            const formattedDonations = donationsResponse.map(donation => ({
              ...donation,
              date: new Date(donation.createdAt).toISOString().split("T")[0],
              status: donation.status || "Completed"
            }))
            setDonations(formattedDonations)
          } else {
            setDonations([])
          }
        } catch {
          setDonations([])
        }

        try {
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
          } else {
            setOrders([])
          }
        } catch {
          setOrders([])
        }

        // Calculate user stats from fetched data
        let totalSpent = 0
        let totalEarned = 0
        let itemsSold = 0
        let itemsBought = 0

        if (orders && orders.length > 0) {
          totalSpent = orders.reduce((sum, order) => {
            return sum + (order.totalAmount || 0)
          }, 0)
          itemsBought = orders.length
        }

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
      } catch (error) {
        // Only log error
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [user, orders, sellItems])

  const menuItems = [
    { icon: Home, label: "Dashboard", active: activeSection === "Dashboard" },
    { icon: ShoppingBag, label: "Sell Item", active: activeSection === "Sell Item" },
    { icon: CartIcon, label: "My Cart", active: activeSection === "My Cart" },
    { icon: Heart, label: "Donations", active: activeSection === "Donations" },
    { icon: ShoppingCart, label: "Orders", active: activeSection === "Orders" },
    { icon: History, label: "My Purchases", active: activeSection === "My Purchases" },
    { icon: Bell, label: "Notifications", active: activeSection === "Notifications" },
    { icon: Settings, label: "Settings", active: activeSection === "Settings" },
  ]

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
        }
        setPhotos((prev) => [...prev, newPhoto])
      }
      reader.readAsDataURL(file)
    })
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
    if (formData.name && formData.price && formData.description && user) {
      try {
        const selectedPhotoUrls = photos
          .filter((photo) => formData.selectedPhotos.includes(photo.id))
          .map((photo) => photo.url)

        const productData = {
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          imageUrl: selectedPhotoUrls.length > 0 ? selectedPhotoUrls[0] : null,
          // Note: condition field might need to be added to backend Product model
        }

        const response = await apiService.createProduct({
          ...productData,
          sellerId: user.id,
          categoryId: formData.category
        })

        if (response && response.id) {
          // Add to local state with "Pending Approval" status
          const newItem = {
            ...response,
            status: "Pending Approval", // Will be "Active" after admin approval
            dateAdded: new Date().toISOString().split("T")[0],
            images: selectedPhotoUrls.length > 0 ? selectedPhotoUrls : ["/placeholder.svg?height=200&width=200"],
          }

          setSellItems((prev) => [newItem, ...prev])
          setFormData({
            name: "",
            price: "",
            description: "",
            category: "",
            condition: "",
            selectedPhotos: [],
          })

          // Trigger global product refresh event for admin dashboard
          window.dispatchEvent(new CustomEvent('refreshProducts'));

          alert("Product submitted successfully! It will be reviewed by an admin before going live.")
        } else {
          alert("Failed to submit product: " + (response?.message || "Unknown error"))
        }
      } catch (error) {
        console.error('Error submitting product:', error)
        alert("Failed to submit product. Please try again.")
      }
    } else {
      alert("Please fill in all required fields and make sure you're logged in.")
    }
  }

  const updateItemStatus = (itemId, newStatus) => {
    setSellItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item)))
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const updatePurchaseStatus = (purchaseId, newStatus) => {
    setPurchasedItems((prev) =>
      prev.map((purchase) => (purchase.id === purchaseId ? { ...purchase, status: newStatus } : purchase)),
    )
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      condition: item.condition,
      selectedPhotos: [],
    })
  }

  const saveEditedItem = () => {
    if (editingItem && formData.name && formData.price && formData.description) {
      const updatedItem = {
        ...editingItem,
        name: formData.name,
        price: Number.parseInt(formData.price),
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
      }

      setSellItems((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)))
      setEditingItem(null)
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "",
        condition: "",
        selectedPhotos: [],
      })
    }
  }

  const handlePayment = (type) => {
    setPaymentDialog({ open: true, type })
    setPaymentData({ phoneNumber: "", amount: "", email: "", password: "" })
    setPaymentConfirmation({ show: false, message: "" })
  }

  const handlePhoneNumberChange = (value) => {
    setPaymentData((prev) => ({ ...prev, phoneNumber: value }))
    if (value.length >= 9) {
      // Show confirmation message when phone number is entered
      setPaymentConfirmation({
        show: true,
        message: `A confirmation code will be sent to ${value}. Please confirm to proceed with the payment.`,
      })
    } else {
      setPaymentConfirmation({ show: false, message: "" })
    }
  }

  const processPayment = () => {
    if (paymentDialog.type === "PayPal") {
      alert(`Payment of ${paymentData.amount} FCFA processed successfully via PayPal!`)
    } else {
      alert(`Payment of ${paymentData.amount} FCFA processed successfully via ${paymentDialog.type}!`)
    }
    setPaymentDialog({ open: false, type: "" })
    setPaymentData({ phoneNumber: "", amount: "", email: "", password: "" })
    setPaymentConfirmation({ show: false, message: "" })
  }

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
        await refreshAllUserData()

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

  // (removed misplaced import)

  const refreshNotifications = useCallback(async () => {
    if (!user) return
    try {
      const notificationsResponse = await apiService.getNotificationsByClient(user.id)
      console.log('Notifications response:', notificationsResponse)
      if (notificationsResponse && Array.isArray(notificationsResponse)) {
        setNotifications(notificationsResponse)
      } else {
        // If response is not an array, set empty array
        setNotifications([])
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error)
      // Set empty array on error instead of leaving undefined
      setNotifications([])
    }
  }, [user])

  const refreshAllUserData = useCallback(async () => {
    if (!user) return

    try {
      // Refresh sell items
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

      // Refresh donations
      const donationsResponse = await apiService.getDonationsByClient(user.id)
      if (donationsResponse && Array.isArray(donationsResponse)) {
        const formattedDonations = donationsResponse.map(donation => ({
          ...donation,
          date: new Date(donation.createdAt).toISOString().split("T")[0],
          status: donation.status || "Completed"
        }))
        setDonations(formattedDonations)
      }

      // Refresh orders
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

      // Refresh notifications
      await refreshNotifications()

    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }, [user, refreshNotifications])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, refreshNotifications])

  // Recalculate stats when data changes
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
  }, [orders, sellItems, donations]) // Recalculate when data changes

  // Auto-refresh user data every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshAllUserData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, refreshAllUserData])

  const renderSellItemDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Earned</p>
              <p className="text-2xl font-bold">{userStats.totalEarned.toLocaleString()} FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Items Sold</p>
              <p className="text-2xl font-bold">{userStats.itemsSold}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Active Listings</p>
              <p className="text-2xl font-bold">{sellItems.filter((item) => item.status === "Active").length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Photos</p>
              <p className="text-2xl font-bold">{photos.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSellItem = () => (
    <div className="space-y-6">
      {renderSellItemDashboard()}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Photo Upload Section */}
        <Card className="xl:col-span-1">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Photo Gallery
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-4 bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
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
                    }`}
                    onClick={() => togglePhotoSelection(photo.id)}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deletePhoto(photo.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  {formData.selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List/Edit Item Form */}
        <Card className="xl:col-span-2">
          <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              {editingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingItem ? "Edit Item" : "List New Item"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Item Name *</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="itemPrice">Price (FCFA) *</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-green-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-green-500">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="itemDescription">Description *</Label>
              <Textarea
                id="itemDescription"
                placeholder="Describe your item in detail"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="border-gray-300 focus:border-green-500"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              {editingItem ? (
                <>
                  <Button
                    onClick={saveEditedItem}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
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
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSubmitItem}
                  className="w-full bg-gradient-to-r from-gray-500 to-green-600 hover:from-gray-600 hover:to-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listed Items */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Your Listed Items ({sellItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellItems.map((item) => (
              <Card key={item.id} className="border-2 hover:border-green-300 transition-colors">
                <CardContent className="p-4">
                  <img
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">{item.price.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <Select value={item.status} onValueChange={(value) => updateItemStatus(item.id, value)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-gray-500">{item.dateAdded}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedItem?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedItem && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <img
                                src={selectedItem.images[0] || "/placeholder.svg"}
                                alt={selectedItem.name}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <div className="space-y-3">
                                <div>
                                  <Label>Price</Label>
                                  <p className="text-2xl font-bold text-green-600">
                                    {selectedItem.price.toLocaleString()} FCFA
                                  </p>
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <p className="capitalize">{selectedItem.category}</p>
                                </div>
                                <div>
                                  <Label>Condition</Label>
                                  <p className="capitalize">{selectedItem.condition}</p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge
                                    variant={
                                      selectedItem.status === "Active"
                                        ? "default"
                                        : selectedItem.status === "Sold"
                                          ? "secondary"
                                          : "outline"
                                    }
                                  >
                                    {selectedItem.status}
                                  </Badge>
                                </div>
                                <div>
                                  <Label>Date Added</Label>
                                  <p>{selectedItem.dateAdded}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label>Description</Label>
                              <p className="text-gray-700 mt-1">{selectedItem.description}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Payment Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6" onClick={() => handlePayment("Orange Money")}>
            <div className="flex items-center">
              <Smartphone className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm opacity-90">Orange Money</p>
                <p className="text-lg font-bold">Click to Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6" onClick={() => handlePayment("Mobile Money")}>
            <div className="flex items-center">
              <Wallet className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm opacity-90">Mobile Money</p>
                <p className="text-lg font-bold">Click to Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-400 to-green-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6" onClick={() => handlePayment("PayPal")}>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8" />
              <div className="ml-4">
                <p className="text-sm opacity-90">PayPal</p>
                <p className="text-lg font-bold">Click to Pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{paymentDialog.type} Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {(paymentDialog.type === "Orange Money" || paymentDialog.type === "Mobile Money") && (
              <>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+237 XXX XXX XXX"
                    value={paymentData.phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  />
                </div>
                {paymentConfirmation.show && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{paymentConfirmation.message}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="amount">Amount (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </>
            )}
            {paymentDialog.type === "PayPal" && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={paymentData.email}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter PayPal password"
                    value={paymentData.password}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              </>
            )}
            <Button onClick={processPayment} className="w-full bg-gradient-to-r from-gray-500 to-green-600">
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spending Summary */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Spending Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{userStats.totalSpent.toLocaleString()} FCFA</p>
              <p className="text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">3,000 FCFA</p>
              <p className="text-gray-600">Donations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              <p className="text-gray-600">Total Orders</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${order.type === "donation" ? "bg-red-500" : "bg-blue-500"}`}
                  ></div>
                  <div>
                    <h3 className="font-medium">{order.item}</h3>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-medium text-lg">{order.amount.toLocaleString()} FCFA</p>
                    <div className="flex items-center gap-2">
                      <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {order.type === "donation" && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          <Gift className="w-3 h-3 mr-1" />
                          Donation
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMyPurchases = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>My Purchased Items ({purchasedItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedItems.map((purchase) => (
              <Card key={purchase.id} className="border-2 hover:border-green-300 transition-colors">
                <CardContent className="p-4">
                  <img
                    src={purchase.image || "/placeholder.svg"}
                    alt={purchase.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{purchase.name}</h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">{purchase.price.toLocaleString()} FCFA</p>
                  <p className="text-sm text-gray-600 mb-2">Seller: {purchase.seller}</p>
                  <p className="text-sm text-gray-500 mb-3">Purchased: {purchase.purchaseDate}</p>
                  <div className="flex justify-between items-center">
                    <Select value={purchase.status} onValueChange={(value) => updatePurchaseStatus(purchase.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle>Welcome back, {userName}!</CardTitle>
            <Button
              onClick={refreshAllUserData}
              variant="outline"
              size="sm"
              className="bg-white text-gray-700 hover:bg-gray-100 border-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{userStats.totalSpent.toLocaleString()} FCFA</p>
              <p className="text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{userStats.totalEarned.toLocaleString()} FCFA</p>
              <p className="text-gray-600">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
              <p className="text-gray-600">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{donations.length}</p>
              <p className="text-gray-600">Donations Made</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                console.log('🔍 Quick Action: Sell an Item clicked');
                setActiveSection("Sell Item");
              }}
              className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <ShoppingBag className="w-6 h-6 mr-2" />
              Sell an Item
            </Button>
            <Button
              onClick={() => navigate('/bible-verse', { replace: true })}
              className="h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Heart className="w-6 h-6 mr-2" />
              Make a Donation
            </Button>
            <Button
              onClick={() => setActiveSection("My Cart")}
              className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <CartIcon className="w-6 h-6 mr-2" />
              View Cart ({cartItems.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Your orders and donations will appear here</p>
              </div>
            ) : (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${order.type === "donation" ? "bg-red-500" : "bg-blue-500"}`}></div>
                    <div>
                      <h3 className="font-medium">{order.item || order.name}</h3>
                      <p className="text-sm text-gray-500">{order.date || order.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(order.amount || order.totalAmount || 0).toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCart = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>My Shopping Cart ({cartItems.length} items)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <CartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <Button
                onClick={goToHomePage}
                className="mt-4 bg-gradient-to-r from-gray-500 to-green-600"
              >
                Continue Shopping
              </Button>
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
                    <Button variant="outline" size="sm" className="mt-2">Remove</Button>
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
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-gray-500 to-green-600"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderDonations = () => (
    <div className="space-y-6">
      {/* Make a Donation */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Make a Donation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Make a Difference?</h3>
            <p className="text-gray-600 mb-6">
              Your donation will help provide food, shelter, education, and care for orphaned children.
            </p>
            <Button
              onClick={() => navigate('/bible-verse')}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-3 text-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Donation Process
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donation History */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Donation History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                    <Badge variant={donation.status === "Completed" ? "default" : "outline"}>
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications ({notifications.filter(n => !n.isRead).length} unread)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-xs"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && notifications.some(n => !n.isRead) && (
            <div className="mt-6 text-center">
              <Button
                onClick={markAllNotificationsAsRead}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Mark All as Read
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-500 to-green-600 text-white rounded-t-lg">
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} readOnly />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" value={user?.phone || ""} placeholder="+237 XXX XXX XXX" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={user?.location || ""} placeholder="Your location" />
          </div>
          <Button className="bg-gradient-to-r from-gray-500 to-green-600">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    console.log('🔍 renderContent called with activeSection:', activeSection);

    switch (activeSection) {
      case "Dashboard":
        console.log('🔍 Rendering Dashboard');
        return renderDashboard()
      case "Sell Item":
        console.log('🔍 Rendering Sell Item');
        return renderSellItem()
      case "My Cart":
        console.log('🔍 Rendering My Cart');
        return renderCart()
      case "Donations":
        console.log('🔍 Rendering Donations');
        return renderDonations()
      case "Orders":
        console.log('🔍 Rendering Orders');
        return renderOrders()
      case "My Purchases":
        console.log('🔍 Rendering My Purchases');
        return renderMyPurchases()
      case "Notifications":
        console.log('🔍 Rendering Notifications');
        return renderNotifications()
      case "Settings":
        console.log('🔍 Rendering Settings');
        return renderSettings()
      default:
        console.log('🔍 Rendering Default (Dashboard)');
        return renderDashboard()
    }
  }

  // Debug component to show auth state and active section
  const DebugAuthState = () => (
    <div className="fixed top-0 right-0 bg-black text-white p-4 text-xs z-50 max-w-xs">
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'exists' : 'null'}</div>
      <div>UserType: {user?.userType || 'none'}</div>
      <div>Email: {user?.email || 'none'}</div>
      <div>Active Section: {activeSection}</div>
      <div>Sidebar Open: {sidebarOpen ? 'true' : 'false'}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
      <div style={{fontSize: '10px', marginTop: '8px', color: '#00ff00'}}>
        🔄 FORCE DEPLOY v2.0
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DebugAuthState />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Auth loading: {loading ? 'true' : 'false'}</p>
          <p className="text-sm text-gray-500">User: {user ? 'exists' : 'null'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DebugAuthState />

      {/* Emergency Mobile Notice */}
      <div className="lg:hidden bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-sm">
        📱 Mobile view detected. Hamburger menu: {sidebarOpen ? 'OPEN' : 'CLOSED'}
      </div>
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              {/* Mobile hamburger menu */}
              <Button
                variant="ghost"
                className="lg:hidden hover:bg-green-50 text-green-600"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6" />
              </Button>

              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-500 to-green-600 bg-clip-text text-transparent">
                JALAI
              </h1>
              <Button variant="ghost" className="hidden sm:flex hover:bg-green-50 text-green-600 font-medium" onClick={goToHomePage}>
                <Home className="w-5 h-5 mr-2" />
                Home
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="hover:bg-green-50">
                <Settings className="w-5 h-5 text-green-600" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`
          w-64 bg-white shadow-lg flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:transition-none
          ${sidebarOpen ? 'block' : 'hidden lg:flex'}
        `}>
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="p-6">
            <div className="mb-8 p-4 bg-gradient-to-r from-gray-500 to-green-600 rounded-lg text-white">
              <h2 className="text-lg font-semibold">Welcome back,</h2>
              <p className="text-xl font-bold">{userName}</p>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => {
                        console.log('🔍 Sidebar menu clicked:', item.label);
                        setActiveSection(item.label);
                        setSidebarOpen(false); // Close mobile menu after selection
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        item.active
                          ? "bg-gradient-to-r from-gray-500 to-green-600 text-white shadow-lg"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.label === "Notifications" && notifications.filter(n => !n.isRead).length > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {notifications.filter(n => !n.isRead).length}
                        </Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 lg:ml-0">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t shadow-lg mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => window.open("https://facebook.com", "_blank")}
            >
              <Facebook className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-500 hover:bg-blue-50"
              onClick={() => window.open("https://twitter.com", "_blank")}
            >
              <Twitter className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => window.open("https://wa.me/237XXXXXXXXX", "_blank")}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => window.open("tel:+237XXXXXXXXX", "_blank")}
            >
              <Phone className="w-5 h-5" />
            </Button>
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
