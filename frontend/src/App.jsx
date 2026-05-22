import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import ForcePasswordChangePage from './pages/ForcePasswordChangePage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProfilePage from './pages/ProfilePage';
import RewardManagementPage from './pages/RewardManagementPage';

// Auth Route Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0f]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'employee') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Root index routing handler
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0f]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isFirstLogin) {
    return <Navigate to="/force-password-change" replace />;
  }

  return user.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* First Login Change Password (Protected, but before normal dashboards) */}
          <Route
            path="/force-password-change"
            element={
              <ProtectedRoute>
                <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
                  <div className="bg-gradient-glow" />
                  <div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl">
                    <ForcePasswordChangePage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboards (with Sidebar/Topbar Layout) */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Admin specific */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <AdminRoute>
                  <EmployeeManagementPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/rewards"
              element={
                <AdminRoute>
                  <RewardManagementPage />
                </AdminRoute>
              }
            />

            {/* Employee specific */}
            <Route
              path="/dashboard"
              element={
                <EmployeeRoute>
                  <EmployeeDashboard />
                </EmployeeRoute>
              }
            />

            {/* Shared Profile */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Root and Fallback redirects */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
