import React, { useState, useEffect } from 'react';
import { getRewardHistory } from '../services/rewardService';
import API from '../services/api';
import AssignRewardModal from '../components/AssignRewardModal';
import BulkRewardModal from '../components/BulkRewardModal';
import { Gift, Users, Search, History, ArrowDownToLine, UsersRound } from 'lucide-react';

const RewardManagementPage = () => {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, empRes] = await Promise.all([
        getRewardHistory(),
        API.get('/employees')
      ]);
      setHistory(histRes);
      // Only keep active employees for rewards
      setEmployees(empRes.data.filter(e => e.isActive));
    } catch (error) {
      console.error('Failed to fetch reward data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRewardAssigned = () => {
    fetchData(); // Refresh data
  };

  const filteredHistory = history.filter(tx => 
    tx.employeeId?.name.toLowerCase().includes(search.toLowerCase()) ||
    tx.employeeId?.email.toLowerCase().includes(search.toLowerCase()) ||
    tx.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-pink-500" />
            Reward Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Assign points, bonuses, and recognize employees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAssignOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Assign Reward
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-pink-500/50 bg-pink-500/10 px-4 py-2 text-sm font-semibold text-pink-400 transition-all hover:bg-pink-500/20"
          >
            <UsersRound className="h-4 w-4" />
            Bulk Reward
          </button>
        </div>
      </div>

      {/* History Section */}
      <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 shadow-lg overflow-hidden flex flex-col h-[600px]">
        <div className="border-b border-white/5 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            Reward Transaction History
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0c12]/60 p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                      {tx.employeeId?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.employeeId?.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {tx.reason} • <span className="text-purple-400 capitalize">{tx.category.replace('_', ' ')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${tx.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'debit' ? '-' : '+'}{tx.points} pts
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()}{tx.assignedBy?.name ? ` by ${tx.assignedBy.name}` : ' (SSO Checkout)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p>No reward transactions found.</p>
            </div>
          )}
        </div>
      </div>

      <AssignRewardModal 
        isOpen={isAssignOpen} 
        onClose={() => setIsAssignOpen(false)} 
        employees={employees}
        onSuccess={handleRewardAssigned} 
      />
      
      <BulkRewardModal 
        isOpen={isBulkOpen} 
        onClose={() => setIsBulkOpen(false)} 
        employeeCount={employees.length}
        onSuccess={handleRewardAssigned} 
      />
    </div>
  );
};

export default RewardManagementPage;
