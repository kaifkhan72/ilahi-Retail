import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn, KeyRound, X, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const from = location.state?.from?.pathname || '/';

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = request OTP, 2 = enter OTP & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      await fetchCart();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(res.data?.message || 'Verification code sent! Check console / server log.');
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        otpCode,
        newPassword,
      });
      toast.success(res.data?.message || 'Password reset successfully! Please log in.');
      setShowForgotModal(false);
      setForgotStep(1);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP or reset failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mt-1">Access your saved cart, orders, and profile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                }}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-emerald-600 hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Reset Password</h3>
                <p className="text-xs text-gray-500">
                  {forgotStep === 1 ? 'Step 1: Receive Verification OTP' : 'Step 2: Enter OTP & New Password'}
                </p>
              </div>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    We'll dispatch a 6-digit verification code to this address.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center space-x-2"
                >
                  <span>{forgotLoading ? 'Sending OTP...' : 'Send Verification Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm tracking-widest text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-2.5 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition"
                  >
                    {forgotLoading ? 'Resetting Password...' : 'Reset & Save Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
