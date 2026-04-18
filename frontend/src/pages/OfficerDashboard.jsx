import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Search, Clock, CheckCircle, AlertCircle, Maximize2, User, Filter, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const OfficerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_progress, resolved

  // Modal State
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateRemark, setUpdateRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch both stats and all grievances
      const [statsRes, listRes] = await Promise.all([
        api.get('/grievances/stats'),
        api.get('/grievances/all?limit=50')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (listRes.data.success) {
        setGrievances(listRes.data.grievances);
      }
    } catch (error) {
      console.error("Failed to load officer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updateStatus) return;
    
    setUpdating(true);
    try {
      await api.put(`/grievances/${selectedGrievance._id}/status`, {
        status: updateStatus,
        remark: updateRemark,
      });
      // Refresh local state without full reload
      setGrievances(grievances.map(g => 
        g._id === selectedGrievance._id 
        ? { ...g, status: updateStatus, adminRemarks: updateRemark || g.adminRemarks } 
        : g
      ));
      fetchData(); // Sync stats
      closeModal();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (grievance) => {
    setSelectedGrievance(grievance);
    setUpdateStatus(grievance.status);
    setUpdateRemark('');
  };

  const closeModal = () => {
    setSelectedGrievance(null);
    setUpdateStatus('');
    setUpdateRemark('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle size={12}/> Resolved</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Clock size={12}/> In Progress</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><AlertCircle size={12}/> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"><AlertTriangle size={12}/> Pending</span>;
    }
  };

  const filteredGrievances = filter === 'all' ? grievances : grievances.filter(g => g.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar segment */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                  eG
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">e-GramSAARTHI</span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">Officer Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-red-600 font-medium">Duty Officer</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 hover:bg-red-200 transition-colors">
                  <User size={20} />
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="ml-2 text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Officer Area Command</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and process grievances submitted by citizens in your jurisdiction.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex gap-4 items-center mb-2">
              <div className="p-3 rounded-full bg-gray-100 text-gray-600"><Maximize2 size={20}/></div>
              <p className="text-sm font-medium text-gray-500">Total Cases</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="flex gap-4 items-center mb-2 relative z-10">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><AlertTriangle size={20}/></div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 relative z-10">{stats.pending}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="flex gap-4 items-center mb-2 relative z-10">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Clock size={20}/></div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 relative z-10">{stats.inProgress}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden">
             <div className="absolute right-0 top-0 w-24 h-24 bg-green-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="flex gap-4 items-center mb-2 relative z-10">
              <div className="p-3 rounded-full bg-green-100 text-green-600"><CheckCircle size={20}/></div>
              <p className="text-sm font-medium text-gray-500">Resolved</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 relative z-10">{stats.resolved}</h3>
          </div>
        </div>

        {/* Data section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Grievances</h2>
            <div className="flex gap-2">
              {['all', 'pending', 'in_progress', 'resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Grievance Info</th>
                  <th className="px-6 py-4 font-semibold">Citizen Details</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                      </div>
                      Loading records...
                    </td>
                  </tr>
                ) : filteredGrievances.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No grievances found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredGrievances.map((g) => (
                    <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 mb-0.5">{g.title}</div>
                        <div className="text-xs text-gray-500 block truncate max-w-xs">{g.category} &bull; ID: {g.ticketId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{g.citizen?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{g.citizen?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">{g.location?.village}</div>
                        <div className="text-xs text-gray-500">{g.location?.district}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(g.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(g)}
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300 transition-colors"
                        >
                          Review & Update
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Process Grievance {selectedGrievance.ticketId}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
               <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedGrievance.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedGrievance.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-gray-500 text-xs uppercase mb-1">Citizen Info</span>
                      <strong className="text-gray-800">{selectedGrievance.citizen?.name}</strong><br/>
                      {selectedGrievance.citizen?.phone}
                    </div>
                     <div>
                      <span className="block text-gray-500 text-xs uppercase mb-1">Location</span>
                      <strong className="text-gray-800">{selectedGrievance.location?.village}</strong><br/>
                      {selectedGrievance.location?.district}
                    </div>
                  </div>
               </div>

               <form onSubmit={handleUpdateStatus}>
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Set New Status</label>
                   <select 
                     value={updateStatus}
                     onChange={(e) => setUpdateStatus(e.target.value)}
                     className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 border"
                   >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                   </select>
                 </div>
                 <div className="mb-6">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Official Remarks (Optional)</label>
                   <textarea 
                     rows="3"
                     placeholder="Feedback to the citizen..."
                     value={updateRemark}
                     onChange={(e) => setUpdateRemark(e.target.value)}
                     className="w-full border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-red-500 focus:border-red-500 border resize-none"
                   ></textarea>
                 </div>
                 
                 <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={updating}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Apply Update'}
                    </button>
                 </div>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
