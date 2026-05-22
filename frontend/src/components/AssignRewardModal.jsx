import React, { useState } from 'react';
import { assignReward } from '../services/rewardService';
import { X, Gift } from 'lucide-react';

const AssignRewardModal = ({ isOpen, onClose, employees, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [points, setPoints] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await assignReward({
        employeeId,
        points: Number(points),
        category,
        reason
      });
      onSuccess();
      onClose();
      // Reset form
      setEmployeeId('');
      setPoints('');
      setCategory('');
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign reward');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'birthday', label: 'Birthday' },
    { value: 'work_anniversary', label: 'Work Anniversary' },
    { value: 'task_completion', label: 'Task Completion' },
    { value: 'milestone', label: 'Project Milestone' },
    { value: 'employee_of_month', label: 'Employee of the Month' },
    { value: 'referral_bonus', label: 'Referral Bonus' },
    { value: 'manual_reward', label: 'Manual Reward' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f121c] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-400" />
            Assign Reward
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select</option>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Points</label>
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
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Reason / Message</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="E.g., Great work on the recent project!"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
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
              disabled={loading}
              className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Points'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRewardModal;
