import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AuthMiddleware, AdminMiddleware } from './middleware/auth';
import InstallPrompt from './components/InstallPrompt';
import AuthCallback from './pages/AuthCallback';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/auth/callback" element={<AuthCallbackWrapper />} />
          <Route 
            path="/admin/dashboard/*" 
            element={
              <AdminMiddleware>
                <AdminDashboard />
              </AdminMiddleware>
            } 
          />
          <Route 
            path="/platform/*" 
            element={
              <AuthMiddleware>
                <Dashboard />
              </AuthMiddleware>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <InstallPrompt />
    </>
  );
}

// Wrapper component to handle auth callback with location
function AuthCallbackWrapper() {
  const location = useLocation();
  return <AuthCallback />;
}

export default App;