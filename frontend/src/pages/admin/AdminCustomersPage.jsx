import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/dashboard/customers?page=${page}&size=10`);
      if (res.data?.success) {
        setCustomers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load customers list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Accounts</h1>
        <p className="text-sm text-gray-500 mt-1">Directory of registered store accounts and their order engagement</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Joined Date</th>
                <th className="py-3.5 px-6 text-right">Orders Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-6 px-6 bg-gray-50/50" />
                  </tr>
                ))
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-sm block">{customer.name}</span>
                        <span className="text-[11px] text-gray-400">ID: #{customer.id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-gray-600 font-medium">
                      <span className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {customer.email}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-gray-600">
                      {customer.phone ? (
                        <span className="flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {customer.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not provided</span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        {customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No registered customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
