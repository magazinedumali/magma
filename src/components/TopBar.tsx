import React from 'react';
import Banner from './Banner';
import { motion } from 'framer-motion';

const TopBar = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-transparent border-b border-white/5 py-2"
    >
      <div className="container mx-auto px-4 flex justify-center">
        <div className="glass-panel overflow-hidden rounded-xl bg-black/40 w-full max-w-[1920px]">
          <Banner
            position="accueil"
            width={1920}
            height={128}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;
