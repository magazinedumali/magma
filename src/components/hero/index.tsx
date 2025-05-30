
import React from 'react';
import HeroSlider from './HeroSlider';
import SidebarTabs from './SidebarTabs';
import BannerSection from './BannerSection';
import TrendingTopicsSection from './TrendingTopicsSection';

const HeroSection = () => {
  return (
    <>
      <section className="relative bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <HeroSlider />
            </div>
            
            <div className="hidden md:block bg-white rounded-lg shadow p-6">
              <SidebarTabs />
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <BannerSection />

      {/* Trending Topics Section */}
      <TrendingTopicsSection />
    </>
  );
};

export default HeroSection;
