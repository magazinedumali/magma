import React from 'react';
import HeroSlider from './HeroSlider';
import SidebarTabs from './SidebarTabs';
import BannerSection from './BannerSection';
import TrendingTopicsSection from './TrendingTopicsSection';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <>
      <section className="relative bg-transparent mt-4 mb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            <div className="lg:col-span-3 h-full">
              <HeroSlider />
            </div>
            
            <div className="hidden lg:block h-full">
              <div className="glass-panel border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full overflow-hidden rounded-2xl flex flex-col">
                <SidebarTabs />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Banner Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <BannerSection />
      </motion.div>

      {/* Trending Topics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <TrendingTopicsSection />
      </motion.div>
    </>
  );
};

export default HeroSection;
