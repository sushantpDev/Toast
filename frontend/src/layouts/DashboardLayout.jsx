import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  User, 
  LogOut, 
  Menu, 
  X, 
  KeyRound, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0f]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if unauthorized
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to force change password if it's first login
  if (user.isFirstLogin) {
    return <Navigate to="/force-password-change" replace />;
  }

  const isAdmin = user.role === 'admin';

  // Navigation configuration
  const navigation = isAdmin 
    ? [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Employee Directory', path: '/admin/employees', icon: Users },
        { name: 'My Profile', path: '/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', path: '/profile', icon: User },
      ];

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-gray-100">
      <div className="bg-gradient-glow" />

      {/* Sidebar for desktop */}
      <aside className="hidden w-64 border-r border-white/5 bg-[#0f121c]/80 backdrop-blur-xl md:flex md:flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
          <KeyRound className="h-6 w-6 text-purple-400" />
          <span className="font-bold text-white tracking-wider">TOAST IDENTITY</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-md shadow-purple-500/5'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile details at bottom */}
        <div className="border-t border-white/5 p-4 bg-[#0a0c12]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 font-bold border border-purple-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-semibold text-white">{user.name}</h4>
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-[#0f121c] border-r border-white/5 p-6 animate-slide-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-purple-400" />
                <span className="font-bold tracking-wider text-white">TOAST</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="rounded-md text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="truncate text-sm font-semibold text-white">{user.name}</h4>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 px-4 py-2..5 text-sm font-semibold text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Panel */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0f121c]/40 backdrop-blur-md px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {navigation.find((n) => n.path === location.pathname)?.name || 'Account'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Department Badge */}
            {user.department && (
              <span className="hidden items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 sm:flex">
                <Building2 className="h-3 w-3" />
                {user.department}
              </span>
            )}
            
            {/* Role Badge */}
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${
              isAdmin 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                : 'bg-green-500/10 text-green-400 border-green-500/20'
            }`}>
              <ShieldCheck className="h-3 w-3" />
              {isAdmin ? 'System Admin' : 'Employee'}
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
