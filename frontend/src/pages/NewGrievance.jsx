import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { value: "water_supply", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "road", label: "Roads & Transport" },
  { value: "sanitation", label: "Sanitation & Waste" },
  { value: "welfare_scheme", label: "Welfare Scheme" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" }
];

const NewGrievance = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0].value,
    priority: 'medium'
  });
  
  const [status, setStatus] = useState({ state: 'idle', message: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: null });

    try {
      const response = await api.post('/grievances', formData);
      if (response.data.success) {
        setStatus({ state: 'success', message: 'Grievance submitted successfully! Redirecting...' });
        setTimeout(() => {
          navigate('/grievances/my');
        }, 2000);
      }
    } catch (error) {
      setStatus({ 
        state: 'error', 
        message: error.response?.data?.message || error.message || 'Failed to submit grievance.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-4">
        <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Submit New Grievance</h1>
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Provide clear and detailed information to help officers resolve your issue faster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {status.state === 'error' && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100 mb-6">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p>{status.message}</p>
              </div>
            )}
            
            {status.state === 'success' && (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-100 mb-6">
                <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                <p>{status.message}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="title">Issue Title</label>
                <input
                  id="title" name="title" type="text" required value={formData.title} onChange={handleChange}
                  className="mt-2 block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                  placeholder="e.g. Broken water pipe near main square"
                  disabled={status.state === 'loading' || status.state === 'success'}
                />
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="category">Category</label>
                  <select
                    id="category" name="category" value={formData.category} onChange={handleChange}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm"
                    disabled={status.state === 'loading' || status.state === 'success'}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="priority">Priority</label>
                  <select
                    id="priority" name="priority" value={formData.priority} onChange={handleChange}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm"
                    disabled={status.state === 'loading' || status.state === 'success'}
                  >
                    <option value="low">Low (Minor issue)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Urgent/Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="description">Detailed Description</label>
                <textarea
                  id="description" name="description" rows="4" required value={formData.description} onChange={handleChange}
                  className="mt-2 block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all resize-none"
                  placeholder="Describe the exact location, when it started, and any other helpful details..."
                  disabled={status.state === 'loading' || status.state === 'success'}
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={status.state === 'loading' || status.state === 'success'}
                className="group flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {status.state === 'loading' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent pb-0.5"></div>
                ) : (
                  <>
                    Submit Application
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewGrievance;
