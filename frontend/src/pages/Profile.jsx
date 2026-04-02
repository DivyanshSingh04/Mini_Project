import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Camera, User, Phone, MapPin, Mail, AlertCircle, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || ''
  });

  const [status, setStatus] = useState({ state: 'idle', message: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset status on typing
    if (status.state !== 'idle') {
      setStatus({ state: 'idle', message: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: null });

    try {
      const response = await api.put('/auth/update-profile', formData);
      if (response.data.success) {
        // Update global context seamlessly
        setUser(response.data.user);
        setStatus({ state: 'success', message: 'Profile updated successfully!' });
      }
    } catch (error) {
      setStatus({ 
        state: 'error', 
        message: error.response?.data?.message || error.message || 'Failed to update profile.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Profile Banner */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
          
          <div className="px-6 sm:px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white p-1 border border-gray-200 shadow-md">
                  <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl overflow-hidden">
                    <User fill="currentColor" size={40} className="mt-2 opacity-50" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  <Camera size={16} />
                </button>
              </div>
              <div className="mb-2 hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 uppercase tracking-widest">
                  {user?.role || 'Citizen'}
                </span>
              </div>
            </div>

            {status.state === 'error' && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100 mb-6">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p>{status.message}</p>
              </div>
            )}
            
            {status.state === 'success' && (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-100 mb-6 transition-all">
                <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                <p>{status.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
                      disabled={status.state === 'loading'}
                    />
                  </div>
                </div>

                {/* Email (Disabled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address <span className="text-gray-400 font-normal ml-1">(Cannot be changed)</span></label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="email" type="email" value={user?.email || ''} disabled
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-500 cursor-not-allowed shadow-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Phone Number</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
                      disabled={status.state === 'loading'}
                    />
                  </div>
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="village">Village/Town</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="village" name="village" type="text" required value={formData.village} onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
                      disabled={status.state === 'loading'}
                    />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="district">District</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="district" name="district" type="text" required value={formData.district} onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
                      disabled={status.state === 'loading'}
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="state">State</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="state" name="state" type="text" required value={formData.state} onChange={handleChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all"
                      disabled={status.state === 'loading'}
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={status.state === 'loading'}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {status.state === 'loading' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent pb-0.5"></div>
                  ) : (
                    <>
                      Save Changes
                      <Save size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
