import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { getRewardAnalytics } from '../services/rewardService';
import { Users, UserCheck, UserMinus, ShieldAlert, Award, ArrowRight, Activity, Calendar, Gift, Trophy, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    disabled: 0,
    departments: 0,
  });
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, analyticsRes] = await Promise.all([
          API.get('/employees'),
          getRewardAnalytics().catch(() => null)
        ]);
        
        const data = empRes.data;
        const total = data.length;
        const active = data.filter(emp => emp.isActive).length;
        const disabled = total - active;
        const depts = new Set(data.map(emp => emp.department));
        
        setStats({
          total,
          active,
          disabled,
          departments: depts.size,
        });

        if (analyticsRes) {
          setAnalytics(analyticsRes);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Date */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Admin Center</h1>
          <p className="text-sm text-gray-400">Toast Identity Access Management and Employee Directory controls.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0f121c]/50 px-4 py-2 text-xs font-semibold text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Total Directory</span>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/10">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
            <p className="mt-1 text-xs text-gray-400">Active identities registered</p>
          </div>
        </div>

        {/* Reward Analytics: Total Distributed */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Points Distributed</span>
            <div className="rounded-xl bg-pink-500/10 p-2 text-pink-400 border border-pink-500/10">
              <Gift className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{analytics?.totalPointsDistributed?.toLocaleString() || 0}</h3>
            <p className="mt-1 text-xs text-gray-400">Total rewards given</p>
          </div>
        </div>

        {/* Disabled Employees */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Deactivated</span>
            <div className="rounded-xl bg-red-500/10 p-2 text-red-400 border border-red-500/10">
              <UserMinus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.disabled}</h3>
            <p className="mt-1 text-xs text-gray-400">Access suspended by Admin</p>
          </div>
        </div>

        {/* Departments */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Departments</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/10">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{stats.departments}</h3>
            <p className="mt-1 text-xs text-gray-400">Distinct business units</p>
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Operations */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Workspace Applications
          </h3>
          <p className="text-sm text-gray-400">Centralized control center for employee directories and rewards management.</p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <Link 
              to="/admin/employees" 
              className="group flex flex-col justify-between rounded-xl border border-white/5 bg-[#0a0c12]/40 hover:bg-white/5 p-4 transition-all duration-200 h-32"
            >
              <div>
                <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Employee Directory</h4>
                <p className="mt-1 text-xs text-gray-400">Add, view, disable, or delete employee credentials.</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>Manage Users</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/admin/rewards" 
              className="group flex flex-col justify-between rounded-xl border border-pink-500/20 bg-pink-950/10 hover:bg-pink-900/20 p-4 transition-all duration-200 h-32 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -z-10 h-24 w-24 rounded-full bg-pink-500/10 blur-[40px]"></div>
              <div>
                <h4 className="font-semibold text-white group-hover:text-pink-400 transition-colors flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-pink-400" />
                  Rewards Engine
                </h4>
                <p className="mt-1 text-xs text-gray-400">Distribute points, assign bonuses, and track employee recognition.</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-pink-400">
                <span>Manage Rewards</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Top Earners / Future SSO */}
        <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 p-6 shadow-lg flex flex-col">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Top Earners
          </h3>
          
          <div className="space-y-3 flex-1 overflow-auto">
            {analytics?.topEmployees && analytics.topEmployees.length > 0 ? (
              analytics.topEmployees.map((emp, idx) => (
                <div key={emp._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#0a0c12]/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-gray-400/20 text-gray-300' : idx === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-white/5 text-gray-400'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{emp.name}</p>
                      <p className="text-[10px] text-gray-400">{emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right font-bold text-pink-400 text-sm">
                    {emp.totalPoints}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-500">
                No rewards distributed yet.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> SSO Status</span>
              <span className="text-purple-400 font-semibold">100% Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
