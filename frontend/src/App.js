import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Ideas from './pages/Ideas';
import Alerts from './pages/Alerts';
import Issues from './pages/Issues';
import Marketplace from './pages/Marketplace';
import Budgeting from './pages/Budgeting';
import Profile from './pages/Profile';
import './i18n/i18n';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={(t) => ({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: t.vars.palette.custom.shellGradient,
        })}
      >
        <Box
          className="loading-spinner"
          sx={(t) => ({
            width: 40,
            height: 40,
            border: `4px solid ${t.vars.palette.divider}`,
            borderTop: `4px solid ${t.vars.palette.primary.main}`,
            borderRadius: '50%',
          })}
        />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Box
      sx={(t) => ({
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: user ? t.vars.palette.custom.shellGradient : 'transparent',
      })}
    >
      {user && <Navbar />}
      <Box
        component="main"
        key={location.pathname}
        className="page-enter"
        sx={{
          flexGrow: 1,
        }}
      >
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
          <Route path="/reset-password" element={user ? <Navigate to="/dashboard" /> : <ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/budgeting" element={<ProtectedRoute allowedRoles={['Admin', 'Delegated Admin']}><Budgeting /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/expenses" element={<Navigate to="/budgeting" />} />
          <Route path="/maintenance" element={<Navigate to="/budgeting" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
