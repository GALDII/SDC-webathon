import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkStyle = "bg-green-700 text-white";
  const inactiveLinkStyle = "text-green-100 hover:bg-green-600 hover:text-white";

  const navLinkClass = ({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`;

  return (
    <nav className="bg-green-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-white font-bold text-xl flex items-center">
              <span role="img" aria-label="leaf" className="mr-2 text-2xl">🌿</span>
              Green City Connect
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/events" className={navLinkClass}>Events</NavLink>
              <NavLink to="/businesses" className={navLinkClass}>Businesses</NavLink>
              <NavLink to="/tracker" className={navLinkClass}>Tracker</NavLink>
              <NavLink to="/waste-hub" className={navLinkClass}>Waste Hub</NavLink>
              <NavLink to="/forum" className={navLinkClass}>Forum</NavLink>
              
              {/* --- CHANGE HERE: Conditional Rendering for Admin Link --- */}
              {isAuthenticated && user?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
              )}
              {/* --- END OF CHANGE --- */}

            </div>
          </div>
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-200 text-sm">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
              </div>
            ) : (
              <div className="space-x-2">
                <NavLink to="/login" className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium">Login</NavLink>
                <NavLink to="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Sign Up</NavLink>
              </div>
            )}
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="bg-green-800 inline-flex items-center justify-center p-2 rounded-md text-green-200 hover:text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white">
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <NavLink to="/" className={navLinkClass + " block"}>Home</NavLink>
              <NavLink to="/events" className={navLinkClass + " block"}>Events</NavLink>
              <NavLink to="/businesses" className={navLinkClass + " block"}>Businesses</NavLink>
              <NavLink to="/tracker" className={navLinkClass + " block"}>Tracker</NavLink>
              <NavLink to="/waste-hub" className={navLinkClass + " block"}>Waste Hub</NavLink>
              <NavLink to="/forum" className={navLinkClass + " block"}>Forum</NavLink>

              {/* --- CHANGE HERE: Conditional Rendering for Mobile Admin Link --- */}
              {isAuthenticated && user?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass + " block"}>Admin</NavLink>
              )}
              {/* --- END OF CHANGE --- */}

          </div>
           <div className="pt-4 pb-3 border-t border-green-700">
             {isAuthenticated ? (
                <div className="px-5">
                  <p className="text-base font-medium text-white">{user.name}</p>
                  <p className="text-sm font-medium text-green-300">{user.email}</p>
                  <button onClick={handleLogout} className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
                </div>
              ) : (
                <div className="px-2 space-y-2">
                  <NavLink to="/login" className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-base font-medium">Login</NavLink>
                  <NavLink to="/register" className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md text-base font-medium">Sign Up</NavLink>
                </div>
              )}
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
