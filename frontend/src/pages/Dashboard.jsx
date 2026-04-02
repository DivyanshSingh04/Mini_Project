import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home, FileText, Bell, User } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                  eG
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">e-GramSAARTHI</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => alert("You have exactly 0 new notifications.")}
              >
                <Bell size={20} />
              </button>
              <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.role || 'Citizen'}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-100 border border-primary-200 flex flex-shrink-0 items-center justify-center text-primary-700 hover:bg-primary-200 transition-colors">
                  <User size={20} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, here is what's happening in your village today.
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* User Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Applicant Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{user?.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.village}, {user?.district}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/grievances/new" className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all block">
            <div className="absolute right-0 top-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
            <Home className="mb-4" size={32} />
            <h3 className="text-lg font-bold mb-1">New Grievance</h3>
            <p className="text-primary-100 text-sm">File a new issue related to your village.</p>
          </Link>

          <Link to="/grievances/my" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group block">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">My Applications</h3>
            <p className="text-gray-500 text-sm">Track the status of your reported issues.</p>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
