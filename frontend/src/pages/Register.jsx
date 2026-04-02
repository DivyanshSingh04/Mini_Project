import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    village: '',
    district: '',
    state: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Convert age to number
    const dataToSubmit = {
      ...formData,
      age: Number(formData.age)
    };

    try {
      await register(dataToSubmit);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left panel - Decorative Branding */}
      <div className="hidden w-5/12 bg-primary-700 lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-800 to-primary-600 opacity-90"></div>
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-primary-400 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-yellow-400 opacity-20 blur-3xl transform"></div>

        <div className="relative z-10 flex h-full flex-col justify-center px-16 pb-20 text-white">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-tight">
            Join the movement.
            <br />
            Make your voice heard.
          </h1>
          <p className="text-lg font-medium text-primary-100 max-w-sm">
            E-GramSAARTHI connects rural communities directly with administration, ensuring timely resolution of every grievance.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full flex-col justify-center py-12 px-8 sm:px-12 lg:w-7/12 xl:px-20 overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="Ram Kumar"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="ram@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="••••••••"
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
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="age">Age</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <CalendarHeart size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="age" name="age" type="number" min="18" required value={formData.age} onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="25"
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
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="Enter village name"
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
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="Enter district"
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
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                    placeholder="Enter state"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full justify-center rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent pb-0.5"></div>
              ) : (
                <span className="flex items-center gap-2">
                  Complete Registration
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Quick fix for missing icon above (CalendarHeart doesn't exist out of the box or might have typo, use Calendar instead)
// Will fix inline below
import { Calendar } from 'lucide-react';
const CalendarHeart = Calendar; 


export default Register;
