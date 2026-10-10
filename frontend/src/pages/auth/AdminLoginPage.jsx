import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter valid admin email'),
  password: z.string().min(1, 'Password is required'),
});

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (!user.roles?.includes('ROLE_ADMIN')) {
        await logout();
        toast.error('Access denied. Administrator privileges required.');
        return;
      }
      toast.success('Welcome to Admin Portal');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid administrator credentials';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8 text-white">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Portal Login</h2>
          <p className="text-sm text-gray-400 mt-1">Management dashboard for Ilahi Retail</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="admin@ilahiretail.com"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border text-sm text-white focus:outline-none focus:ring-2 transition ${
                errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/30'
              }`}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border text-sm text-white focus:outline-none focus:ring-2 transition ${
                errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/30'
              }`}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Verifying admin...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
