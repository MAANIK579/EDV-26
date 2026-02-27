import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import NotifPanel from './components/NotifPanel';
import ChatWidget from './components/ChatWidget';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import RoomOccupancy from './pages/RoomOccupancy';
import CampusMap from './pages/CampusMap';
import Events from './pages/Events';
import Academics from './pages/Academics';
import Services from './pages/Services';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { isAuthenticated, isAdmin } = useAuth();

  // Not logged in → Login page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Admin → Fully separate admin dashboard
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        <ToastContainer />
      </>
    );
  }

  // Student → Student panel
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/rooms" element={<RoomOccupancy />} />
            <Route path="/map" element={<CampusMap />} />
            <Route path="/events" element={<Events />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/services" element={<Services />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      <ToastContainer />
      <NotifPanel />
      <ChatWidget />
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
