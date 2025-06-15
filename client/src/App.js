import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import NavigationBar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import TravelerDashboard from './pages/TravelerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AdminPanel from './pages/AdminPanel';
import TripDetails from './pages/TripDetails';
import TripForm from './pages/TripForm';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import axios from './utils/axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');

      if (token) {
        try {
          // Verify token with backend
          await axios.get('/api/auth/verify');
          setIsAuthenticated(true);
          setUserRole(role);
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []); // Empty dependency array means this runs once on mount

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <NavigationBar 
          isAuthenticated={isAuthenticated} 
          userRole={userRole} 
          onLogout={handleLogout} 
        />
        <main className="flex-grow-1 py-4">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login 
                    setIsAuthenticated={setIsAuthenticated} 
                    setUserRole={setUserRole} 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Register 
                    setIsAuthenticated={setIsAuthenticated} 
                    setUserRole={setUserRole} 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === 'traveler' ? (
                    <TravelerDashboard />
                  ) : userRole === 'agent' ? (
                    <AgentDashboard />
                  ) : userRole === 'admin' ? (
                    <AdminPanel />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/trip/:id"
              element={
                isAuthenticated ? (
                  <TripDetails />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/post-trip"
              element={
                isAuthenticated && userRole === 'traveler' ? (
                  <TripForm />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <Profile />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/inbox"
              element={
                isAuthenticated ? (
                  <Inbox />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
