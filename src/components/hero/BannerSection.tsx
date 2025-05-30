import React from 'react';
import Banner from '../Banner';

const BannerSection = () => {
  return (
    <section className="bg-white py-4">
      <div className="container mx-auto px-4">
        <Banner position="accueil-sous-slider" width={1200} height={120} />
      </div>
    </section>
  );
};

export default BannerSection;
