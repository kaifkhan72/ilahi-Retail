import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChefHat, Shirt, Gamepad2, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import { ProductCard } from '../../components/ProductCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products?page=0&size=6&sort=createdAt,desc');
        if (res.data?.success) {
          setFeaturedProducts(res.data.data.content || []);
        }
      } catch (err) {
        console.error('Error fetching featured products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const categories = [
    {
      id: 1,
      name: 'Toys',
      description: 'Educational games, racing cars, blocks, and creative play for kids of all ages.',
      icon: Gamepad2,
      badgeColor: 'bg-amber-100 text-amber-700',
      bgColor: 'hover:border-amber-400',
      link: '/products?categoryId=1',
    },
    {
      id: 2,
      name: 'Kitchen',
      description: 'Durable cookware, chef knife sets, skillets, and premium kitchen essentials.',
      icon: ChefHat,
      badgeColor: 'bg-emerald-100 text-emerald-700',
      bgColor: 'hover:border-emerald-400',
      link: '/products?categoryId=2',
    },
    {
      id: 3,
      name: 'Clothes',
      description: 'Comfortable cotton tees, premium denim jeans, and stylish everyday fashion.',
      icon: Shirt,
      badgeColor: 'bg-blue-100 text-blue-700',
      bgColor: 'hover:border-blue-400',
      link: '/products?categoryId=3',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 to-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Everyday Essentials</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Toys, Kitchen & Clothes at <span className="text-emerald-400">Ilahi Retail</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
              Discover our carefully curated collection for your family and home. Enjoy honest prices and safe Cash on Delivery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center"
              >
                Explore Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/products?categoryId=1"
                className="w-full sm:w-auto px-6 py-3.5 bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-white font-semibold rounded-xl text-sm transition text-center"
              >
                Shop Toys
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:max-w-none">
            <div className="bg-gray-800/70 border border-gray-700/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between h-48">
              <Gamepad2 className="w-10 h-10 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Fun Toys</h3>
                <p className="text-xs text-gray-400">Safe, engaging & durable</p>
              </div>
            </div>
            <div className="bg-gray-800/70 border border-gray-700/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between h-48 translate-y-4">
              <ChefHat className="w-10 h-10 text-emerald-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Kitchen Essentials</h3>
                <p className="text-xs text-gray-400">Cookware & chef tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
          <p className="text-sm text-gray-500 mt-2">
            Browse our three specialized collections for home, play, and style
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={cat.link}
                className={`group bg-white rounded-3xl p-8 border border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md ${cat.bgColor} flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${cat.badgeColor}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  Browse {cat.name}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Handpicked best-sellers ready to ship</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No products available at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
