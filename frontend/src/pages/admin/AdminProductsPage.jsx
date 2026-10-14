import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  Boxes,
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice, getImageUrl, getProductFallbackImage } from '../../utils/formatters';

const IMAGE_PRESETS = {
  Toys: [
    { label: 'RC Drift Car', url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&auto=format&fit=crop&q=80' },
    { label: 'Wooden Blocks', url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Kids Learning Toy', url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80' },
    { label: 'Plush Teddy Bear', url: 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=800&auto=format&fit=crop&q=80' },
  ],
  Kitchen: [
    { label: 'Chef Knife Set', url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80' },
    { label: 'Ceramic Skillet', url: 'https://images.unsplash.com/photo-1584990347449-3990479b1df0?w=800&auto=format&fit=crop&q=80' },
    { label: 'Steel Cookware', url: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80' },
    { label: 'Kitchen Utensils', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80' },
  ],
  Clothes: [
    { label: 'Cotton T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
    { label: 'Slim Fit Jeans', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80' },
    { label: 'Denim Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80' },
    { label: 'Casual Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
  ],
};

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [selectedImageProduct, setSelectedImageProduct] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [savingImage, setSavingImage] = useState(false);
  const [newStockValue, setNewStockValue] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
    active: true,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', 10);
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      const res = await api.get(`/admin/products?${params.toString()}`);
      if (res.data?.success) {
        setProducts(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      originalPrice: '',
      stock: 10,
      description: '',
      imageUrl: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.category?.id || '',
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      active: product.active,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        const fileUrl = res.data.data.imageUrl;
        setFormData((prev) => ({ ...prev, imageUrl: fileUrl }));
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenImageModal = (product) => {
    setSelectedImageProduct(product);
    setCustomImageUrl(product.imageUrl || '');
    setIsImageModalOpen(true);
  };

  const handleQuickImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        const fileUrl = res.data.data.imageUrl;
        setCustomImageUrl(fileUrl);
        toast.success('Image uploaded! Click "Apply & Save Image" to save.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveQuickImage = async () => {
    if (!selectedImageProduct) return;
    try {
      setSavingImage(true);
      const trimmedUrl = customImageUrl.trim();
      const res = await api.patch(`/admin/products/${selectedImageProduct.id}/image`, {
        imageUrl: trimmedUrl,
      });
      if (res.data?.success) {
        toast.success(`Image updated for "${selectedImageProduct.name}"!`);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedImageProduct.id ? { ...p, imageUrl: trimmedUrl } : p
          )
        );
        setIsImageModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update image');
    } finally {
      setSavingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      categoryId: Number(formData.categoryId),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock),
      description: formData.description,
      imageUrl: formData.imageUrl || null,
      active: Boolean(formData.active),
    };

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleSoftDelete = async (productId, name) => {
    if (window.confirm(`Mark product "${name}" as inactive (soft delete)?`)) {
      try {
        await api.delete(`/admin/products/${productId}`);
        toast.success(`"${name}" is now inactive`);
        fetchProducts();
      } catch (err) {
        toast.error('Failed to deactivate product');
      }
    }
  };

  const handleOpenStockModal = (product) => {
    setSelectedStockProduct(product);
    setNewStockValue(product.stock);
    setIsStockModalOpen(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/admin/products/${selectedStockProduct.id}/stock`, {
        stock: Number(newStockValue),
      });
      toast.success('Inventory stock updated');
      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update stock');
    }
  };

  const handleQuickStockAdjust = async (productId, currentStock, delta) => {
    const updated = Math.max(0, currentStock + delta);
    try {
      await api.patch(`/admin/products/${productId}/stock`, { stock: updated });
      toast.success(`Stock updated to ${updated}`);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: updated } : p))
      );
    } catch (err) {
      toast.error('Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage catalog items, upload images, and update stock</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="py-6 px-4 bg-gray-50/50" />
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4 flex items-center space-x-3">
                      <div 
                        onClick={() => handleOpenImageModal(product)}
                        className="relative group/thumb cursor-pointer shrink-0 rounded-xl overflow-hidden border border-gray-200"
                        title="Click to change or upload product photo"
                      >
                        <img
                          src={getImageUrl(product.imageUrl, product.category?.name, product.name)}
                          alt={product.name}
                          className="w-12 h-12 object-cover bg-gray-100 transition group-hover/thumb:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductFallbackImage(product.category?.name, product.name);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition text-white">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() => handleOpenImageModal(product)}
                            className="inline-flex items-center text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                          >
                            <Camera className="w-3 h-3 mr-1" />
                            <span>Edit Photo</span>
                          </button>
                          <span className="text-gray-300">•</span>
                          <p className="text-gray-400 text-[11px] line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                        {product.category?.name || 'None'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 text-sm">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            {product.discountPercentage || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenStockModal(product)}
                          className={`inline-flex items-center px-2 py-1 rounded-lg border font-bold text-xs transition cursor-pointer ${
                            product.stock <= 5
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-600'
                          }`}
                          title="Click to edit stock"
                        >
                          <Boxes className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>{product.stock}</span>
                        </button>

                        <button
                          onClick={() => handleQuickStockAdjust(product.id, product.stock, 5)}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition cursor-pointer"
                          title="Quick add +5 stock"
                        >
                          +5
                        </button>
                      </div>
                      {product.stock <= 5 && (
                        <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Low Stock</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {product.active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenImageModal(product)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Change product image"
                      >
                        <Camera className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {product.active && (
                        <button
                          onClick={() => handleSoftDelete(product.id, product.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Deactivate product (soft delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No products found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Remote Control Drift Car"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none bg-white cursor-pointer text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="799.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="1199.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Soft Deleted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, dimensions, materials..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-3">
                <label className="block font-bold text-gray-700">Product Photo</label>
                
                {/* Live Preview & Upload Row */}
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                    <img
                      src={getImageUrl(formData.imageUrl, categories.find(c => String(c.id) === String(formData.categoryId))?.name, formData.name)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getProductFallbackImage(categories.find(c => String(c.id) === String(formData.categoryId))?.name, formData.name);
                      }}
                    />
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center px-3 py-1.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white text-gray-700 text-xs font-semibold transition">
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400">JPG, PNG, WebP supported. File is saved to local server.</p>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or enter direct image URL (https://... or /uploads/...)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[11px] text-gray-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Quick Presets for current category */}
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Quick Presets for this category:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(IMAGE_PRESETS[categories.find(c => String(c.id) === String(formData.categoryId))?.name] || IMAGE_PRESETS.Toys).map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                        className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer ${
                          formData.imageUrl === preset.url
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-emerald-50/50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Update Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              Update Stock: {selectedStockProduct?.name}
            </h3>
            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Available Units</label>
                <input
                  type="number"
                  min="0"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Quick Product Image Modal */}
      {isImageModalOpen && selectedImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <span>Update Product Image</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium truncate max-w-sm">
                  {selectedImageProduct.name} ({selectedImageProduct.category?.name || 'General'})
                </p>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Preview */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm shrink-0 relative flex items-center justify-center">
                <img
                  src={getImageUrl(customImageUrl, selectedImageProduct.category?.name, selectedImageProduct.name)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getProductFallbackImage(selectedImageProduct.category?.name, selectedImageProduct.name);
                  }}
                />
                {customImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition cursor-pointer"
                    title="Remove image (use category default)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  Live Preview
                </span>
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {customImageUrl ? 'Custom Image Active' : 'Category Default Fallback Active'}
                </p>
                <p className="text-[11px] text-gray-500 break-all line-clamp-2">
                  {customImageUrl || 'No custom image URL set. Fallback image will be shown to users.'}
                </p>
              </div>
            </div>

            {/* Method 1: Upload from Computer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                1. Upload From Computer
              </label>
              <label className="flex items-center justify-center space-x-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl bg-gray-50 hover:bg-emerald-50/50 cursor-pointer transition text-gray-600 text-xs font-semibold">
                <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadingImage ? 'Uploading Image to Server...' : 'Click or Drag Image to Upload (JPG, PNG, WebP)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={handleQuickImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Method 2: Direct URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Or Paste Image Web URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:outline-none text-xs text-gray-800 pr-16"
                />
                {customImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomImageUrl('')}
                    className="absolute right-2.5 top-2.5 text-[11px] text-gray-400 hover:text-red-500 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Method 3: Category Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Or Pick 1-Click Curated Photo</span>
                </label>
                <span className="text-[10px] text-gray-400">Click to apply instantly</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(IMAGE_PRESETS[selectedImageProduct.category?.name] || IMAGE_PRESETS.Toys).map((preset, idx) => {
                  const isSelected = customImageUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCustomImageUrl(preset.url)}
                      className={`group/preset p-1.5 rounded-xl border text-left transition cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-16 object-cover rounded-lg mb-1.5"
                      />
                      <span className="text-[10px] font-bold text-gray-700 group-hover/preset:text-emerald-700 truncate w-full text-center">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCustomImageUrl('')}
                className="text-xs text-gray-500 hover:text-red-600 transition"
              >
                Reset to Default
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingImage || uploadingImage}
                  onClick={handleSaveQuickImage}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-1.5"
                >
                  {savingImage ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Apply Image</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
