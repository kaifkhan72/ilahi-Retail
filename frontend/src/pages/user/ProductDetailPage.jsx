import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw, Plus, Minus, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { ProductCard } from '../../components/ProductCard';
import { ProductReviews } from '../../components/ProductReviews';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`${product.name} saved to wishlist!`, { icon: '❤️' });
    } else {
      toast('Removed from wishlist', { icon: '🤍' });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data?.success) {
          const prod = res.data.data;
          setProduct(prod);

          // Fetch related products from same category
          if (prod.category?.id) {
            try {
              const relRes = await api.get(`/products?categoryId=${prod.category.id}&size=5`);
              if (relRes.data?.success) {
                const list = (relRes.data.data.content || []).filter((p) => p.id !== prod.id).slice(0, 4);
                setRelatedProducts(list);
              }
            } catch (e) {
              console.error('Failed to load related products', e);
            }
          }
        }
      } catch (err) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (!product || product.stock < quantity) {
      toast.error('Selected quantity exceeds available stock');
      return;
    }

    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} ${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to all products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-sm">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=700&auto=format&fit=crop&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingBag className="w-20 h-20 stroke-1" />
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/95 backdrop-blur-sm rounded-full text-emerald-700 shadow-sm border border-gray-200">
              {product.category?.name}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price & Discount */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {(product.discountPercentage || (product.originalPrice && product.originalPrice > product.price)) && (
                  <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wide bg-rose-600 text-white rounded-full shadow-xs">
                    {product.discountPercentage || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs font-semibold text-emerald-600">
                  You save {formatPrice(product.originalPrice - product.price)} on this order!
                </p>
              )}

              <div>
                {product.stock > 0 ? (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-50 rounded-full border border-red-200">
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Clothing Size Selector (When category is Clothes) */}
            {(product.category?.name?.toLowerCase().includes('cloth') || product.category?.id === 3) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Size</span>
                  <span className="text-xs text-emerald-600 font-medium">Standard Fit</span>
                </div>
                <div className="flex items-center space-x-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`w-11 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                        selectedSize === sz
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'No description provided for this product.'}
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {product.stock > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2 text-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{product.stock > 0 ? 'Add to Shopping Cart' : 'Currently Unavailable'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-gray-500 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Quality Inspected</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>7-Day Easy Return</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Shipping over ₹999</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <ProductReviews productId={product.id} productName={product.name} />

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">You May Also Like</h2>
              <p className="text-xs text-gray-500 mt-0.5">Explore similar items in {product.category?.name}</p>
            </div>
            <Link
              to={`/products?categoryId=${product.category?.id}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View More &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
