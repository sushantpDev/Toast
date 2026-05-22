import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const ForcePasswordChangePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If user is not logged in or is not flagged for first login, route away
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!user.isFirstLogin) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  // Password Validation Rules
  const checks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = checks.length && checks.number && checks.special;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      return setError('Password does not meet the complexity requirements.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/force-password-change', { newPassword: password });
      
      // Update token in sessionStorage and auth context
      sessionStorage.setItem('token', data.token);
      updateUser({ isFirstLogin: false });
      
      // Navigate to employee dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-sm text-purple-300">
        <div className="flex gap-2 items-start">
          <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">First-Time Login Secure Check</p>
            <p className="mt-1 text-xs">For security, you must update your temporary password before accessing your employee portal.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl glass-input py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl glass-input py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="rounded-xl border border-white/5 bg-[#0f121c]/50 p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Security Requirements</p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${checks.length ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={checks.length ? 'text-green-300' : 'text-gray-500'}>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${checks.number ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={checks.number ? 'text-green-300' : 'text-gray-500'}>Contains at least 1 number</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${checks.special ? 'text-green-400' : 'text-gray-600'}`} />
              <span className={checks.special ? 'text-green-300' : 'text-gray-500'}>Contains at least 1 special character</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:text-gray-400 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-purple-500/25 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating Credentials...
            </>
          ) : (
            'Change Password & Continue'
          )}
        </button>
      </form>
    </div>
  );
};

export default ForcePasswordChangePage;
