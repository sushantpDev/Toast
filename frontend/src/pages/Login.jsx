import React, { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  // Read query parameters
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const emailParam = params.get('email');

  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, token, logout } = useAuth();

  useEffect(() => {
    // Console log them for debugging
    console.log('client_id:', clientId);
    console.log('redirect_uri:', redirectUri);
    console.log('emailParam:', emailParam);

    // If logged in user is an admin and we are in an SSO flow, prevent redirect, log out, and show error
    if (user && user.role === 'admin' && clientId && redirectUri) {
      setError('Admin accounts cannot be used to access partner applications. Please use an employee account.');
      logout();
      return;
    }

    // If logged in user email doesn't match requested emailParam, log out to switch user
    if (user && emailParam && user.email.toLowerCase() !== emailParam.toLowerCase()) {
      console.log(`Email mismatch. Logged in: ${user.email}, requested: ${emailParam}. Logging out.`);
      logout();
      return;
    }

    // Auto-redirect if already logged in (excluding admin)
    if (user && token && clientId && redirectUri && user.role !== 'admin') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const apiBase = apiUrl.replace(/\/api$/, '');
      const backendUrl = `${apiBase}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&token=${token}&email=${encodeURIComponent(user.email)}`;
      window.location.href = backendUrl;
    }
  }, [clientId, redirectUri, user, token, emailParam, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // If the logged in user is an admin and trying to login via SSO flow
      if (data.role === 'admin' && clientId && redirectUri) {
        setError('Admin accounts cannot be used to access partner applications. Please use an employee account.');
        setLoading(false);
        logout();
        return;
      }

      // After login: redirect employee to backend /authorize route again
      if (clientId && redirectUri) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const apiBase = apiUrl.replace(/\/api$/, '');
        const backendUrl = `${apiBase}/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&token=${data.token || sessionStorage.getItem('token')}&email=${encodeURIComponent(email)}`;
        window.location.href = backendUrl;
      } else {
        // Fallback for direct login
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.toString());
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-[#090a0f]">
      {/* Background glow effects */}
      <div className="bg-gradient-glow" />

      {/* Decorative floating blurred lights */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] animate-pulse delay-700"></div>

      {/* Auth Card */}
      <div className="w-full max-w-md rounded-2xl glass p-8 shadow-2xl transition-all duration-300">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Toast <span className="text-purple-400">Identity</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">Sign in to continue to SSO</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Company Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="name@toast.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/25 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
