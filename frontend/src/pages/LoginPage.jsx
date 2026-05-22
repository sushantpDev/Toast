import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // AuthLayout will catch the state change and redirect automatically.
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
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
  );
};

export default LoginPage;
