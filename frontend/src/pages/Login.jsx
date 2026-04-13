import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('citizen');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel - Decorative Branding */}
      <div className="hidden w-1/2 bg-primary-600 lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-500 opacity-90"></div>
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-400 opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-yellow-300 opacity-20 blur-3xl transform -translate-x-1/2"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-800 opacity-40 blur-3xl"></div>

        <div className="relative z-10 flex h-full flex-col justify-center px-20 pb-20 text-white">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight leading-tight">
            Empowering Rural India
            <br />
            Through Digital Redressal.
          </h1>
          <p className="text-lg font-medium text-primary-50 max-w-md">
            Welcome to e-GramSAARTHI. A centralized platform dedicated to listening, resolving, and empowering villagers everywhere.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {loginType === 'officer' ? 'Official Portal' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {loginType === 'citizen' ? (
                <>
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                    Register for free
                  </Link>
                </>
              ) : (
                'Authorized personnel only. Please sign in.'
              )}
            </p>
          </div>

          <div className="flex p-1 space-x-1 bg-gray-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setLoginType('citizen')}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
                loginType === 'citizen' ? 'bg-white text-gray-900 shadow shadow-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => setLoginType('officer')}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
                loginType === 'officer' ? 'bg-white text-red-600 shadow shadow-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Official
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                <AlertCircle size={20} className="text-red-500" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="font-semibold text-sm text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all ${
                loginType === 'officer' 
                  ? 'bg-red-600 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'
                  : 'bg-primary-600 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent pb-0.5"></div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
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

export default Login;
