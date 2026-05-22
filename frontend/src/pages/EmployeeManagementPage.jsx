import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  UserX, 
  UserCheck, 
  RefreshCw, 
  Clipboard, 
  Check, 
  AlertCircle, 
  Loader2, 
  X,
  ShieldCheck,
  Building
} from 'lucide-react';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null); // stores { employee, tempPassword } after creation
  const [resetSuccessPassword, setResetSuccessPassword] = useState(''); // stores tempPassword after password reset
  const [resetSuccessEmployee, setResetSuccessEmployee] = useState(null);

  // Form input state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [empDepartment, setEmpDepartment] = useState('Engineering');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Clipboard copies
  const [copied, setCopied] = useState(false);

  const departments = ['Engineering', 'Marketing', 'Sales', 'Product', 'HR', 'Finance', 'Security'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department !== 'All') params.append('department', department);
      if (status !== 'All') params.append('isActive', status);
      
      const { data } = await API.get(`/employees?${params.toString()}`);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search input
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, department, status]);

  // Handle employee creation
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const { data } = await API.post('/employees', {
        name,
        email,
        department: empDepartment,
      });

      setSuccessData(data); // data is { employee, tempPassword }
      setName('');
      setEmail('');
      setEmpDepartment('Engineering');
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred during employee creation.');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Active/Inactive status
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/employees/${id}/toggle-status`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  // Reset employee password
  const handleResetPassword = async (employee) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${employee.name}?`)) {
      return;
    }
    
    try {
      const { data } = await API.post(`/employees/${employee._id}/reset-password`);
      setResetSuccessEmployee(employee);
      setResetSuccessPassword(data.tempPassword);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`WARNING: Are you sure you want to permanently DELETE ${employee.name}?\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      await API.delete(`/employees/${employee._id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setSuccessData(null);
    setFormError('');
  };

  const closeResetModal = () => {
    setResetSuccessPassword('');
    setResetSuccessEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white m-0">Employee Directory</h1>
          <p className="text-sm text-gray-400">View and manage central employee credentials and account states.</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-all cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl glass-input py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 rounded-xl bg-[#0f121c]/50 border border-white/5 px-3 py-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Dept:</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-transparent py-1.5 text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0f121c] text-white">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept} className="bg-[#0f121c] text-white">{dept}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 rounded-xl bg-[#0f121c]/50 border border-white/5 px-3 py-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-transparent py-1.5 text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0f121c] text-white">All Statuses</option>
            <option value="true" className="bg-[#0f121c] text-white">Active</option>
            <option value="false" className="bg-[#0f121c] text-white">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0f121c]/50 shadow-xl overflow-hidden">
        {loading && employees.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400 gap-2">
            <AlertCircle className="h-8 w-8 text-gray-600" />
            <p className="text-sm">No employees found matching filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0a0c12]/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Portal Status</th>
                  <th className="px-6 py-4">Pass State</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-white/5 transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 font-bold border border-purple-500/10">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{employee.name}</h4>
                          <span className="text-xs text-gray-400">{employee.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-gray-500" />
                        {employee.department}
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        employee.isActive 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${employee.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                        {employee.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* First Login Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        employee.isFirstLogin 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' 
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                      }`}>
                        {employee.isFirstLogin ? 'Pending Change' : 'Established'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Active status */}
                        <button
                          onClick={() => handleToggleStatus(employee._id)}
                          title={employee.isActive ? 'Deactivate Account' : 'Activate Account'}
                          className={`rounded-lg p-2 transition-colors cursor-pointer ${
                            employee.isActive 
                              ? 'text-gray-400 hover:bg-red-500/10 hover:text-red-400' 
                              : 'text-gray-500 hover:bg-green-500/10 hover:text-green-400'
                          }`}
                        >
                          {employee.isActive ? <UserX className="h-4.5 w-4.5" /> : <UserCheck className="h-4.5 w-4.5" />}
                        </button>

                        {/* Reset password */}
                        <button
                          onClick={() => handleResetPassword(employee)}
                          title="Reset Password"
                          className="rounded-lg p-2 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-4.5 w-4.5" />
                        </button>

                        {/* Delete Employee */}
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          title="Delete Employee"
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-500/15 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-sm" onClick={closeCreateModal} />

          {/* Modal content */}
          <div className="relative w-full max-w-md rounded-2xl glass p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Add New Employee
              </h3>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-white rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success View */}
            {successData ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-300">
                  <div className="flex gap-2">
                    <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Employee Account Created!</p>
                      <p className="mt-1 text-xs">Share these temporary credentials with the employee. They will be forced to change their password upon their first login.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#0f121c]/80 p-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-medium text-white">{successData.employee.email}</span>
                      <button 
                        onClick={() => copyToClipboard(successData.employee.email)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Temporary Password</label>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm font-mono font-bold text-purple-300">{successData.tempPassword}</span>
                      <button 
                        onClick={() => copyToClipboard(successData.tempPassword)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-1 text-xs font-semibold"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? <span className="text-green-400">Copied</span> : null}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeCreateModal}
                  className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Input Form View */
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                {formError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl glass-input py-2.5 px-3 text-sm text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Company Email</label>
                  <input
                    type="email"
                    required
                    placeholder="johndoe@toast.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl glass-input py-2.5 px-3 text-sm text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Department</label>
                  <select
                    value={empDepartment}
                    onChange={(e) => setEmpDepartment(e.target.value)}
                    className="w-full rounded-xl bg-[#0a0c12] border border-white/10 py-2.5 px-3 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept} className="bg-[#0a0c12] text-white">{dept}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RESET PASSWORD SUCCESS MODAL */}
      {resetSuccessPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-sm" onClick={closeResetModal} />

          <div className="relative w-full max-w-md rounded-2xl glass p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-400" />
                Password Reset Successful
              </h3>
              <button onClick={closeResetModal} className="text-gray-400 hover:text-white rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-sm text-purple-300">
              <p className="font-semibold text-white">Temporary Password Generated</p>
              <p className="mt-1 text-xs">The password for <strong>{resetSuccessEmployee?.name}</strong> has been reset. Copy the new temporary password. They will be forced to change it on their next login.</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0f121c]/80 p-4">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">New Temporary Password</label>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-mono font-bold text-purple-300">{resetSuccessPassword}</span>
                <button 
                  onClick={() => copyToClipboard(resetSuccessPassword)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white flex items-center gap-1 text-xs font-semibold"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? <span className="text-green-400">Copied</span> : null}
                </button>
              </div>
            </div>

            <button
              onClick={closeResetModal}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
