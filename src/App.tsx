import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Locator from './pages/Locator';
import Upload from './pages/Upload';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Store from './pages/Store';
import Awareness from './pages/Awareness';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'user' | 'admin' }> = ({ children, role }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Home />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} 
        />
        
        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><Dashboard /></ProtectedRoute>} />
        <Route path="/locator" element={<ProtectedRoute role="user"><Locator /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute role="user"><Upload /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute role="user"><History /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute role="user"><Leaderboard /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute role="user"><Store /></ProtectedRoute>} />
        <Route path="/awareness" element={<ProtectedRoute role="user"><Awareness /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
