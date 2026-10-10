import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowRight, 
  Plus, 
  Tag, 
  CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      subtitle: 'From non-cancelled orders',
      icon: TrendingUp,
      color: 'bg-emerald-500 text-white',
      trendColor: 'text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: 'All-time customer orders',
      icon: ShoppingCart,
      color: 'bg-blue-500 text-white',
      trendColor: 'text-blue-600',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts,
      subtitle: 'Catalog items in store',
      icon: Package,
      color: 'bg-indigo-500 text-white',
      trendColor: 'text-indigo-600',
    },
    {
      title: 'Registered Customers',
      value: stats.totalCustomers,
      subtitle: 'Customer accounts created',
      icon: Users,
      color: 'bg-amber-500 text-white',
      trendColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Store Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time business summary and analytics for Ilahi Retail
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4 mr-1.5 text-gray-500" />
            View Orders
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 h-36 border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {card.title}
                  </span>
                  <div className={`p-2.5 rounded-2xl ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                    {card.value}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/orders"
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:border-emerald-500 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition">
              Process Orders
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Review customer deliveries, update order statuses (Placed, Confirmed, Shipped, Delivered), and manage cancellations.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-emerald-600">
            Open Orders Panel <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </Link>

        <Link
          to="/admin/products"
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:border-emerald-500 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition">
              Catalog & Inventory
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add new products with photo uploads, modify pricing, adjust inventory stock levels, and soft-delete items.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-emerald-600">
            Open Inventory <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:border-emerald-500 transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition">
              Categories
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manage Toys, Kitchen, Clothes, and custom product categories with description and active flags.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-bold text-emerald-600">
            Manage Categories <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
