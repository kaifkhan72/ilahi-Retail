import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
