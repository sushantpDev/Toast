import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRewardHistory } from '../services/rewardService';
import { ShieldCheck, Sparkles, ShoppingBag, Radio, ArrowUpRight, HelpCircle, Award, Gift, Star, Clock } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getRewardHistory();
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch reward history', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchHistory();
    }
  }, [user]);

  if (!user) return null;

  // Determine badges based on points
  const points = user.totalPoints || 0;
  const badges = [];
  if (points >= 500) badges.push({ name: 'Rising Star', icon: <Star className="h-4 w-4 text-yellow-400" />, color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' });
  if (points >= 2000) badges.push({ name: 'High Achiever', icon: <Award className="h-4 w-4 text-purple-400" />, color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' });
  if (points >= 5000) badges.push({ name: 'Toast Champion', icon: <Gift className="h-4 w-4 text-pink-400" />, color: 'bg-pink-500/10 border-pink-500/20 text-pink-400' });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/10 bg-gradient-to-r from-purple-950/20 to-blue-950/10 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-purple-500/5 blur-[80px]"></div>
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/10 shadow-sm">
              <Sparkles className="h-3 w-3" />
              Active SSO Session Established
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Welcome back, {user.name}!</h1>
            <p className="text-sm text-gray-300 max-w-xl">
              Your Toast Identity credentials are fully validated. You can manage your security settings, view your rewards, and soon log in to partner applications using SSO.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex flex-col items-end rounded-2xl bg-white/5 border border-white/5 p-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Reward Points</p>
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Content (History & Badges) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Badges Section */}
          <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-yellow-400" />
              Achievement Badges
            </h3>
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${badge.color}`}>
                    {badge.icon}
                    <span className="text-sm font-semibold">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Earn more points to unlock achievement badges!</p>
            )}
          </div>

          {/* Reward History */}
          <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-400" />
              Recent Reward History
            </h3>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-white/5 rounded-xl"></div>
                <div className="h-12 bg-white/5 rounded-xl"></div>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0c12]/40 p-4">
                    <div>
                      <p className="font-semibold text-white">{tx.reason}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <span className="capitalize text-purple-400">{tx.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{tx.type === 'debit' ? 'Redeemed via SSO' : `From: ${tx.assignedBy?.name || 'Admin'}`}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'debit' ? '-' : '+'}{tx.points}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-xl border border-dashed border-white/10">
                <Gift className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No rewards received yet.</p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* SSO Applications Card (Future Phase Showcase) */}
          <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="h-5 w-5 text-purple-400" />
                SSO Apps
              </h3>
              <p className="text-xs text-gray-400 mt-1">Use points in partner applications.</p>
            </div>

            <div className="group relative rounded-xl border border-purple-500/10 bg-[#0a0c12]/40 hover:bg-purple-950/5 p-5 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/15">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                    Coming Soon
                  </span>
                </div>
                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">ShelfMerch</h4>
                <p className="text-[11px] text-gray-400 leading-snug">Redeem your reward points for company merchandise.</p>
              </div>
            </div>
          </div>

          {/* Security Checklist card */}
          <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              Security Health
            </h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400 font-bold border border-green-500/20">✓</span>
                <div>
                  <p className="font-semibold text-white">Temporary password changed</p>
                  <p className="text-[10px] text-gray-400">Validated on first sign-in.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400 font-bold border border-green-500/20">✓</span>
                <div>
                  <p className="font-semibold text-white">Session JWT encryption</p>
                  <p className="text-[10px] text-gray-400">Secured with HS256 algorithm.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
