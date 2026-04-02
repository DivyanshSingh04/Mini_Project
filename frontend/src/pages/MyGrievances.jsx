import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Calendar } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <Clock size={16} className="mr-1.5" />;
    case 'in_progress': return <AlertCircle size={16} className="mr-1.5" />;
    case 'resolved': return <CheckCircle2 size={16} className="mr-1.5" />;
    case 'rejected': return <XCircle size={16} className="mr-1.5" />;
    default: return null;
  }
};

const formatStatus = (status) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const MyGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await api.get('/grievances/my');
        if (response.data.success) {
          setGrievances(response.data.grievances);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch grievances');
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 flex-shrink-0 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Applications</h1>
        </div>
        <Link 
          to="/grievances/new" 
          className="text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors border border-primary-200"
        >
          + New Application
        </Link>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
            <p className="font-medium text-lg">{error}</p>
            <p className="text-sm mt-1 text-red-600">Please try refreshing the page.</p>
          </div>
        ) : grievances.length === 0 ? (
          <div className="bg-white text-center py-16 px-6 rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You haven't submitted any grievances. If there is an issue in your village, let us know!
            </p>
            <Link 
              to="/grievances/new" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors"
            >
              Submit First Application
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {grievances.map((complaint) => (
              <div 
                key={complaint._id} 
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {formatStatus(complaint.status)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    #{complaint.ticketId}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{complaint.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{complaint.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded-md">
                    {complaint.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyGrievances;
