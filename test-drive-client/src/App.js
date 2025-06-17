import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Applications from './components/Applications';
import ApplicationForm from './components/ApplicationForm';
import AdminPanel from './components/AdminPanel';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [adminAuthData, setAdminAuthData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();

  const handleLogin = (data, credentials) => {
    if (data.role === 'admin') {
      setAdminAuthData(credentials);
      setUser(null);
    } else {
      setUser(data);
      setAdminAuthData(null);
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setAdminAuthData(null);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const noSidebarPaths = ['/auth'];

  return (
    <div className="min-vh-100">
      {!noSidebarPaths.includes(location.pathname) && (
        <>
          <Header toggleSidebar={toggleSidebar} />
          <Sidebar
            user={user}
            isAdmin={!!adminAuthData}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </>
      )}
      <div className={`content ${isSidebarOpen && !noSidebarPaths.includes(location.pathname) ? '' : 'content-full'}`}>
        <Routes>
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route
            path="/applications"
            element={user ? <Applications user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />}
          />
          <Route
            path="/application-form"
            element={user ? <ApplicationForm user={user} /> : <Navigate to="/auth" />}
          />
          <Route
            path="/admin"
            element={adminAuthData ? <AdminPanel adminAuthData={adminAuthData} onLogout={handleLogout} /> : <Navigate to="/auth" />}
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </div>
  );
}

export default () => (
  <Router>
    <App />
  </Router>
);