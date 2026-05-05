import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();
  
  // Try to get email from navigation state if they came from login
  const initialEmail = location.state?.email || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setError(null);
    setMessage(null);
    setIsLoading(true);
    
    try {
      await resendOtp(email);
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-xl">
            <CheckCircle2 size={32} className="text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the email address you registered with and the 6-digit code we sent you.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 border border-red-100">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {message && (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800 border border-green-100">
                <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                <p>{message}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                  placeholder="ram@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="otp">Enter 6-Digit OTP</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <CheckCircle2 size={18} className="text-gray-400" />
                </div>
                <input
                  id="otp" name="otp" type="text" required maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-300 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 shadow-sm transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6 || !email}
              className="group flex w-full justify-center rounded-xl bg-primary-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent pb-0.5"></div>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Email
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
            
            <div className="mt-4 flex flex-col items-center gap-3">
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
              >
                Didn't receive code? Resend
              </button>
              
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                Back to Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
