import React from 'react';
import { Outlet, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound } from 'lucide-react';

const AuthLayout = () => {
  const { user, token, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#090a0f]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // If already logged in, redirect based on first login flag and role
  if (user) {
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');

    if (clientId && redirectUri) {
      // Redirect to the backend authorize endpoint dynamically resolved from VITE_API_URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const apiBase = apiUrl.replace(/\/api$/, '');
      const backendUrl = `${apiBase}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&token=${token}`;
      window.location.href = backendUrl;
      return null;
    }

    if (user.isFirstLogin) {
      return <Navigate to="/force-password-change" replace />;
    }
    return user.role === 'admin' ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {/* Background glow effects */}
      <div className="bg-gradient-glow" />

      {/* Decorative floating blurred lights */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] animate-pulse delay-700"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl transition-all duration-300">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Toast <span className="text-purple-400">Identity</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Centralized SSO Authentication Provider</p>
        </div>

        <Outlet />
      </div>

      {/* Footer info */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Toast Corp. All rights reserved. Secured by JWT & bcrypt.
      </footer>
    </div>
  );
};

export default AuthLayout;
