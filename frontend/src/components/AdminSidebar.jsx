import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  ShoppingCart, 
  Users, 
  Store, 
  LogOut,
  Sliders,
  Ticket
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Website Settings', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 min-h-screen flex flex-col shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 space-x-3">
        <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
          IR
        </span>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">Ilahi Retail</h1>
          <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Admin Panel</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Footer Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="px-3 py-2 bg-gray-800/60 rounded-xl">
          <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
          <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
        </div>

        <NavLink
          to="/"
          className="flex items-center px-3.5 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        >
          <Store className="w-4 h-4 mr-2.5" />
          Customer Storefront
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3.5 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
