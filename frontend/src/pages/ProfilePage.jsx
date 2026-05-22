import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  User, 
  Mail, 
  Building2, 
  ShieldAlert, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Check 
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  // Password Validation Rules
  const checks = {
    length: newPassword.length >= 8,
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPasswordValid = checks.length && checks.number && checks.special;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      return setError('All fields are required.');
    }
    if (!isPasswordValid) {
      return setError('New password does not meet complexity requirements.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Confirm password does not match.');
    }

    setLoading(true);

    try {
      await API.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please check your old password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg space-y-6 h-fit">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 font-bold border border-purple-500/10 text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">{user.name}</h2>
          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
            isAdmin 
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/15' 
              : 'bg-green-500/10 text-green-400 border-green-500/15'
          }`}>
            {isAdmin ? 'System Admin' : 'Employee'}
          </span>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4 text-sm">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="h-4.5 w-4.5 text-gray-500 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
              <p className="truncate text-gray-300 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Department */}
          {user.department && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4.5 w-4.5 text-gray-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                <p className="text-gray-300 font-medium">{user.department}</p>
              </div>
            </div>
          )}

          {/* User ID */}
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-4.5 w-4.5 text-gray-500 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Identity Reference</p>
              <p className="text-xs text-gray-400 font-mono">{user._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Form Card */}
      <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg md:col-span-2 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-400" />
            Update Security Credentials
          </h3>
          <p className="text-xs text-gray-400 mt-1">Change your portal login password. Ensure it uses strong entropy characteristics.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">
            <Check className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Old Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl glass-input py-2.5 px-3 text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 px-3 text-sm text-white"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-2.5 px-3 text-sm text-white"
              />
            </div>
          </div>

          {/* Checklist */}
          {newPassword && (
            <div className="rounded-xl border border-white/5 bg-[#0a0c12]/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password Complexity Checklist</p>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${checks.length ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={checks.length ? 'text-green-300' : 'text-gray-500'}>8+ characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${checks.number ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={checks.number ? 'text-green-300' : 'text-gray-500'}>1+ number</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${checks.special ? 'text-green-400' : 'text-gray-600'}`} />
                  <span className={checks.special ? 'text-green-300' : 'text-gray-500'}>1+ special char</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (newPassword ? !isPasswordValid : false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 py-2.5 px-6 text-sm font-semibold text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
