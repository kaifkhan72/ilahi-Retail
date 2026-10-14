import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export const Footer = () => {
  const settings = useSettingsStore((state) => state.settings) || {};

  return (
    <footer className="bg-gray-950 text-gray-300 mt-20 border-t border-gray-800">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <Truck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-white">Cash on Delivery</h4>
            <p className="text-xs text-gray-400">Pay safely when order arrives at your door</p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-white">100% Quality Guaranteed</h4>
            <p className="text-xs text-gray-400">Verified toys, cookware, and apparel</p>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-start space-x-3">
          <RotateCcw className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h4 className="font-semibold text-white">Easy Cancellation</h4>
            <p className="text-xs text-gray-400">Cancel any placed order directly online</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <span className="font-bold text-xl text-white block">
            {settings.storeName || 'Ilahi Retail'}
          </span>
          <p className="text-xs text-gray-400 leading-relaxed">
            {settings.storeTagline || 'Your trusted neighborhood one-stop shop for fun toys, essential kitchen items, and comfortable everyday clothing.'}
          </p>
          <div className="flex items-center space-x-3 pt-2">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-400 transition">
                <Twitter className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Shop Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products?categoryId=1" className="hover:text-emerald-400 transition">Toys & Games</Link></li>
            <li><Link to="/products?categoryId=2" className="hover:text-emerald-400 transition">Kitchen & Dining</Link></li>
            <li><Link to="/products?categoryId=3" className="hover:text-emerald-400 transition">Clothes & Apparel</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/cart" className="hover:text-emerald-400 transition">Shopping Cart</Link></li>
            <li><Link to="/orders" className="hover:text-emerald-400 transition">Track Orders</Link></li>
            <li><Link to="/profile" className="hover:text-emerald-400 transition">My Account</Link></li>
          </ul>
        </div>

        <div className="space-y-2 text-xs text-gray-400">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">Store & Contact</h4>
          <p className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{settings.storeAddress || 'Main Market, Ilahi Retail Center'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{settings.supportPhone || '+91 98765 43210'}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{settings.supportEmail || 'support@ilahiretail.com'}</span>
          </p>
          {settings.businessHours && (
            <p className="flex items-center space-x-2 text-[11px] text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{settings.businessHours}</span>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-900 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} {settings.storeName || 'Ilahi Retail'}. All rights reserved. Payment: Cash on Delivery (COD).
      </div>
    </footer>
  );
};

export default Footer;
