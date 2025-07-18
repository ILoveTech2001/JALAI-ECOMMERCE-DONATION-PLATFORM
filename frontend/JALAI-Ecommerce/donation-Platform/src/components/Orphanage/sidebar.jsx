import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faEnvelope,
  faStar,
  faPlusCircle,
  faCog,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const navLinks = [
  { to: "/OrphanageDashboard", label: "Dashboard", icon: faTachometerAlt },
  { to: "/OrphanageMessages", label: "Messages", icon: faEnvelope },
  { to: "/OrphanageReviews", label: "Reviews", icon: faStar },
  { to: "/OrphangePostNeeds", label: "Post Needs", icon: faPlusCircle },
  { to: "/OrphanageSettings", label: "Settings", icon: faCog },
  { to: "/logout", label: "Logout", icon: faSignOutAlt },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  // Sidebar content
  const sidebarContent = (
    <aside className="h-full w-64 bg-white shadow-lg flex flex-col py-8 px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-3xl font-extrabold text-green-600 tracking-widest">
          JALAI
        </div>
        <div className="text-xs text-gray-500 mt-1 italic">
          putting smiles on faces
        </div>
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
              ${
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-700 hover:text-green-600 hover:bg-green-50"
              }`
            }
          >
            <FontAwesomeIcon
              icon={icon}
              className="text-lg transition-colors"
            />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <FontAwesomeIcon icon={faBars} className="text-green-600 text-2xl" />
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden md:block fixed top-0 left-0 h-full z-40">
        {sidebarContent}
      </div>

      {/* Sidebar overlay for mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="relative z-50 h-full">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-green-600 text-2xl"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;