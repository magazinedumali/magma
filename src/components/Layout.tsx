import React from 'react';
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import BannerSection from '@/components/hero/BannerSection';
import Footer from '@/components/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <BannerSection />
    <TopBar />
    <Header />
    {/* Spacer for fixed header */}
    <div className="h-20 md:h-24"></div>
    <main>
      {children}
    </main>
    <Footer />
  </>
);

export default Layout; 