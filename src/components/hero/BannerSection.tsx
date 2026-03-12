import React from 'react';
import Banner from '../Banner';

const BannerSection = () => {
  return (
    <section className="bg-transparent py-4 relative z-10">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="glass-panel w-full max-w-[1200px] border border-white/10 p-2 shadow-[0_5px_15px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
          <Banner position="accueil-sous-slider" width={1200} height={120} />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
