import React from 'react';
import {  BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EcoEvents from './pages/EcoEvents';
import GreenBusiness from './pages/GreenBusiness';
import CitizenActionTracker from './pages/CitizenActionTracker';
import WasteManagement from './pages/WasteManagement';
import DiscussionForum from './pages/DiscussionForum';
import { AuthProvider } from './contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<EcoEvents />} />
              <Route path="/businesses" element={<GreenBusiness />} />
              <Route path="/tracker" element={<CitizenActionTracker />} />
              <Route path="/waste-hub" element={<WasteManagement />} />
              <Route path="/forum" element={<DiscussionForum />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
