export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const getProductFallbackImage = (categoryName = '', productName = '') => {
  const text = `${categoryName || ''} ${productName || ''}`.toLowerCase();
  if (text.includes('car') || text.includes('drift') || text.includes('race')) {
    return 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('block') || text.includes('toy') || text.includes('game') || text.includes('kid')) {
    return 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('knife') || text.includes('knives')) {
    return 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('pan') || text.includes('cook') || text.includes('kitchen') || text.includes('skillet')) {
    return 'https://images.unsplash.com/photo-1584990347449-3990479b1df0?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('jean') || text.includes('denim') || text.includes('pant')) {
    return 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80';
  }
  if (text.includes('shirt') || text.includes('tee') || text.includes('cloth') || text.includes('apparel') || text.includes('wear')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
};

export const getImageUrl = (url, categoryName = '', productName = '') => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return getProductFallbackImage(categoryName, productName);
  }
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendUrl.replace(/\/$/, '')}${cleanPath}`;
};
