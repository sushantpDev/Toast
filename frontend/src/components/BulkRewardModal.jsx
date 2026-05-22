import React, { useState } from 'react';
import { bulkAssignReward } from '../services/rewardService';
import { X, UsersRound } from 'lucide-react';

const BulkRewardModal = ({ isOpen, onClose, employeeCount, onSuccess }) => {
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState('festival');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await bulkAssignReward({
        points: Number(points),
        category,
        reason
      });
      onSuccess();
      onClose();
      // Reset form
      setPoints('');
      setCategory('festival');
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign bulk reward');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'festival', label: 'Festival Bonus' },
    { value: 'company_anniversary', label: 'Company Anniversary' },
    { value: 'team_achievement', label: 'Team Achievement' },
    { value: 'bonus', label: 'Company Wide Bonus' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f121c] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-pink-400" />
            Bulk Reward Distribution
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-pink-500/10 bg-pink-500/5 p-4 text-center">
          <p className="text-sm text-gray-300">You are about to distribute points to</p>
          <p className="text-2xl font-bold text-pink-400">{employeeCount} Active Employees</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Points per User</label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Reason / Event Name</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="E.g., Diwali Bonus 2026"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || employeeCount === 0}
              className="rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Distribute Points'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkRewardModal;
