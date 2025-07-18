import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUserCircle, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const Header = ({ handleCartClick, cartItems, handleProfileClick, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper for active link
  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-blue-600 block px-3 py-2 rounded ${
        location.pathname === to
          ? "underline text-green-600 underline-offset-4 decoration-2 font-bold"
          : ""
      }`}
    >
      {label}
    </Link>
  );

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Example: navigate to a search results page with the query
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
      setSearch("");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="flex justify-between items-center p-4 shadow-md bg-white relative">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-green-600">JALAI</h1>
        </div>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLink("/", "Home")}
          {navLink("/trade", "Trade")}
          {navLink("/bible-verse", "Donate")}
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What are you looking for?"
              className="border px-4 py-1 rounded-full"
            />
          </form>
        </nav>
        {/* Hamburger Icon */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="text-blue-600 text-xl" />
        </button>
        {/* Cart & Profile */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Cart"
            className="hover:bg-gray-100 rounded-full p-2"
            onClick={handleCartClick}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-blue-600 text-xl" />
            {cartItems && cartItems.length > 0 && (
              <span className="ml-1 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                {cartItems.length}
              </span>
            )}
          </button>
          <div className="relative" ref={profileDropdownRef}>
            <button
              aria-label="Profile"
              className="hover:bg-gray-100 rounded-full p-2 flex items-center gap-2"
              onClick={() => {
                if (user) {
                  // If user is logged in, toggle dropdown
                  setProfileDropdownOpen(!profileDropdownOpen);
                } else {
                  // If user is not logged in, handle profile click (redirect to login/signup)
                  handleProfileClick();
                }
              }}
            >
              <FontAwesomeIcon icon={faUserCircle} className="text-blue-600 text-xl" />
              {user && (
                <span className="hidden md:block text-sm text-gray-700">
                  {user.name}
                </span>
              )}
            </button>
            {user && profileDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md z-50 min-w-[150px]">
                <button
                  onClick={() => {
                    navigate("/userDashboard");
                    setProfileDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Nav Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md z-50 md:hidden animate-fade-in">
            <div className="flex flex-col gap-2 p-4 border-b">
              {navLink("/", "Home")}
              {navLink("/trade", "Trade")}
              {navLink("/donate", "Donate")}
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="What are you looking for?"
                  className="border px-4 py-1 rounded-full mt-2"
                />
              </form>
            </div>
            <div className="flex flex-wrap justify-center gap-4 py-3">
              {navLink("/clothing", "Clothing")}
              {navLink("/footwear", "Footwear")}
              {navLink("/electronics", "Electronics")}
              {navLink("/utensils", "Utensils")}
              {navLink("/furniture", "Furniture")}
            </div>
          </div>
        )}
      </header>

      {/* CATEGORY LINKS (Desktop only) */}
      <div className="hidden md:flex justify-center gap-6 text-blue-700 font-medium py-4 flex-wrap">
        {navLink("/clothing", "Clothing")}
        {navLink("/footwear", "Footwear")}
        {navLink("/electronics", "Electronics")}
        {navLink("/utensils", "Utensils")}
        {navLink("/furniture", "Furniture")}
      </div>
    </>
  );
};

export default Header;
