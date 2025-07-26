import { Link } from 'react-router-dom'

function Home({ user, onLogout }) {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-jalai-green">JALAI</h1>
              <span className="ml-2 text-gray-600">E-commerce & Donation Platform</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.name || user.email}</span>
                  <Link 
                    to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="btn-primary"
                  >
                    Dashboard
                  </Link>
                  <button onClick={onLogout} className="btn-secondary">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-jalai-green to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to JALAI
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Buy, sell, or donate used items with ease and help those in need!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-jalai-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse Products
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-jalai-green transition-colors">
              Donate Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How JALAI Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-jalai-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy & Sell</h3>
              <p className="text-gray-600">
                Browse and purchase quality used items at affordable prices, or sell your own items to the community.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-jalai-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Donate</h3>
              <p className="text-gray-600">
                Make a difference by donating items or money directly to orphanages and those in need.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-jalai-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Impact</h3>
              <p className="text-gray-600">
                Track your impact and see how your contributions are helping communities and the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Clothing', 'Electronics', 'Furniture', 'Footwear', 'Utensils'].map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-4xl mb-4">
                  {category === 'Clothing' && '👕'}
                  {category === 'Electronics' && '📱'}
                  {category === 'Furniture' && '🪑'}
                  {category === 'Footwear' && '👟'}
                  {category === 'Utensils' && '🍽️'}
                </div>
                <h3 className="font-semibold text-gray-900">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-jalai-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">JALAI</h3>
            <p className="text-gray-300 mb-4">
              Building a sustainable future through community-driven commerce and giving.
            </p>
            <p className="text-gray-400 text-sm">
              © 2024 JALAI Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
